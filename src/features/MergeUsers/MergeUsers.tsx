import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  GitMerge,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { Avatar, Card, Loading, SearchInput, SectionHeader } from '../../shared/ui';
import { useMergeUsers } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';

type MergeUser = components['schemas']['MergeUser'];
type MergeRegion = components['schemas']['MergeRegion'];

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Normalize a name so merge candidates match across case and Norwegian special characters:
 * "Håkon Hansen", "haakon-hansen" and "HAKON HANSEN" all become "haakonhansen".
 */
const normalizeName = (value?: string) =>
  (value ?? '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]/g, '');

/** Region url may or may not carry a protocol. */
const withScheme = (url?: string) => (!url ? '' : /^https?:\/\//i.test(url) ? url : `https://${url}`);

/** Profile link on the region's own web page (fallback to the current site when the user has no region). */
const profileUrl = (user: MergeUser, region?: MergeRegion): string => {
  const base = region?.url ? withScheme(region.url) : '';
  return base ? `${base}/user/${user.userId}` : `/user/${user.userId}`;
};

type MergeGroup = {
  label: string;
  users: MergeUser[];
};

/**
 * Merge suggestions = users that have the same normalized name. Accounts with no region associations (e.g. users
 * added manually when tagging photos) are always candidates. When both accounts have region(s) they must share at
 * least one region to be suggested together. Connected components are used so a chain A-B (share R1) + B-C (share R2)
 * is suggested as one group.
 */
function buildGroups(data: MergeUser[]): MergeGroup[] {
  const byName = new Map<string, MergeUser[]>();
  for (const user of data) {
    const key = normalizeName(user.name);
    if (!key) continue;
    const arr = byName.get(key) ?? [];
    arr.push(user);
    byName.set(key, arr);
  }

  const groups: MergeGroup[] = [];
  for (const [key, members] of byName) {
    if (members.length < 2) continue;
    const regionIds = members.map(
      (u) => new Set((u.regions ?? []).map((r) => r.id).filter((id): id is number => !!id)),
    );
    const parent = members.map((_, i) => i);
    const find = (index: number): number => {
      let i = index;
      while (parent[i] !== i) {
        parent[i] = parent[parent[i]];
        i = parent[i];
      }
      return i;
    };
    const union = (a: number, b: number) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[rb] = ra;
    };
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        // Accounts without any region are always suggested together with same-name users.
        if (regionIds[i].size === 0 || regionIds[j].size === 0) {
          union(i, j);
          continue;
        }
        let shares = false;
        for (const id of regionIds[i]) {
          if (regionIds[j].has(id)) {
            shares = true;
            break;
          }
        }
        if (shares) union(i, j);
      }
    }
    const components = new Map<number, MergeUser[]>();
    members.forEach((m, i) => {
      const root = find(i);
      const arr = components.get(root) ?? [];
      arr.push(m);
      components.set(root, arr);
    });
    for (const comp of components.values()) {
      if (comp.length < 2) continue;
      comp.sort((a, b) => (a.userId ?? 0) - (b.userId ?? 0));
      groups.push({ label: comp[0]?.name ?? key, users: comp });
    }
  }

  groups.sort((a, b) => a.label.localeCompare(b.label));
  return groups;
}

const MergeUsers = () => {
  const meta = useMeta();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'suggestions' | 'all'>('suggestions');
  const [keepUserId, setKeepUserId] = useState<number | null>(null);
  const [mergeUserIds, setMergeUserIds] = useState<ReadonlySet<number>>(new Set());
  const [isMerging, setIsMerging] = useState(false);
  const { data = [], isLoading: loading, merge } = useMergeUsers();

  const groups = useMemo(() => buildGroups(data), [data]);

  const matches = (user: MergeUser) => {
    const q = normalize(query);
    const qn = normalizeName(query);
    if (!q) return true;
    if (normalizeName(user.name).includes(qn)) return true;
    if (String(user.userId ?? 0).includes(q)) return true;
    if ((user.emails ?? []).some((email) => email.toLowerCase().includes(q))) return true;
    return (user.regions ?? []).some((region) => {
      const value = `${region.name ?? ''} ${region.url ?? ''}`.toLowerCase();
      return value.includes(q) || normalizeName(value).includes(qn);
    });
  };

  const filteredUsers = query ? data.filter(matches) : data;
  const filteredGroups = query ? groups.filter((group) => group.users.some(matches)) : groups;

  const keeper = data.find((item) => item.userId === keepUserId) ?? null;
  const mergees = data.filter((item) => mergeUserIds.has(item.userId ?? -1));
  const canMerge = !!keeper && mergees.length > 0 && !isMerging;
  const ownUserId = meta?.userId ?? -1;

  const toggleKeep = (userId: number) => {
    setKeepUserId((prev) => (prev === userId ? null : userId));
    // An account cannot be both keeper and merged away.
    setMergeUserIds((prev) => {
      if (!prev.has(userId)) return prev;
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const toggleMerge = (userId: number) => {
    setMergeUserIds((prev) => {
      // The kept account cannot also be merged away.
      if (userId === keepUserId) return prev;
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setKeepUserId(null);
    setMergeUserIds(new Set());
  };

  const runMerge = async () => {
    if (!keeper || mergees.length === 0 || isMerging) return;
    const summary = mergees
      .slice(0, 10)
      .map((m) => `${m.name ?? 'Unknown'} (#${m.userId})`)
      .join(', ');
    const rest = mergees.length > 10 ? ` +${mergees.length - 10} more` : '';
    const ok = window.confirm(
      `Merge ${mergees.length} account(s) into ${keeper.name ?? 'Unknown'} (#${keeper.userId})?\n\n` +
        `All ascents, comments, media, emails and logins from the merged account(s) are moved to the kept account ` +
        `and the merged account(s) are deleted. This cannot be undone.\n\nAccounts to merge: ${summary}${rest}`,
    );
    if (!ok) return;

    setIsMerging(true);
    try {
      for (const mergee of mergees) {
        await merge(keeper.userId ?? 0, mergee.userId ?? 0);
      }
      clearSelection();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setIsMerging(false);
    }
  };

  const renderUser = (user: MergeUser) => {
    const userId = user.userId ?? 0;
    const isKeep = userId === keepUserId;
    const isMergee = mergeUserIds.has(userId);
    const isSelf = userId === ownUserId;
    const emails = user.emails ?? [];
    const regions = user.regions ?? [];
    const profile = profileUrl(user, regions[0]);
    const external = profile.startsWith('http');
    const linkProps = external ? { href: profile, target: '_blank', rel: 'noopener noreferrer' } : { href: profile };
    return (
      <div
        key={userId}
        className={cn(
          'flex min-w-0 items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors sm:gap-3 sm:px-3 sm:py-2.5',
          isKeep
            ? 'border-brand-border/70 bg-surface-hover ring-brand-border/60 ring-1'
            : isMergee
              ? 'bg-surface-hover border-slate-500/60 ring-1 ring-slate-400/40'
              : 'border-surface-border/50 bg-surface-card hover:bg-surface-raised-hover',
        )}
      >
        <div className='flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3'>
          <a
            {...linkProps}
            title={`Open profile of ${user.name ?? 'user'} (#${userId})`}
            className='shrink-0 rounded-full transition-opacity hover:opacity-80'
          >
            <Avatar name={user.name} mediaIdentity={user.mediaIdentity} size='tiny' />
          </a>
          <div className='min-w-0 flex-1'>
            <a
              {...linkProps}
              className={cn(
                'block truncate text-sm font-semibold text-slate-100 transition-colors hover:text-slate-300',
                twInk.lightTextSlate900,
              )}
            >
              {user.name || 'Unknown'}
            </a>
            <p className={cn('mt-0.5 text-[10px] font-medium text-slate-500', twInk.lightTextSlate700)}>
              #{userId}
              {isSelf ? ' (you)' : ''}
            </p>
            {user.lastLogin && (
              <p
                className={cn(
                  'mt-0.5 flex min-w-0 items-center gap-1 text-[10px] leading-snug text-slate-500',
                  twInk.lightTextSlate700,
                )}
              >
                <Calendar size={9} className='shrink-0' aria-hidden />
                <span className='min-w-0 truncate'>Seen {user.lastLogin}</span>
              </p>
            )}
            {emails.length > 0 && (
              <p
                className={cn(
                  'mt-0.5 flex min-w-0 items-start gap-1 text-[10px] leading-snug text-slate-500',
                  twInk.lightTextSlate700,
                )}
              >
                <Mail size={9} className='mt-px shrink-0' aria-hidden />
                <span className='min-w-0 break-words'>
                  {emails.map((email, index) => (
                    <span key={email}>
                      {index > 0 && ', '}
                      <a href={`mailto:${email}`} className='transition-colors hover:text-slate-300'>
                        {email}
                      </a>
                    </span>
                  ))}
                </span>
              </p>
            )}
            {regions.length > 0 && (
              <p
                className={cn(
                  'mt-0.5 flex min-w-0 items-start gap-1 text-[10px] leading-snug text-slate-500',
                  twInk.lightTextSlate700,
                )}
              >
                <MapPin size={9} className='mt-px shrink-0' aria-hidden />
                <span className='min-w-0 break-words'>{regions.map((region) => region.url).join(', ')}</span>
              </p>
            )}
          </div>
        </div>
        <div className='flex shrink-0 flex-col gap-1'>
          <button
            type='button'
            aria-pressed={isKeep}
            title='Keep this account (the merge target)'
            onClick={() => toggleKeep(userId)}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors',
              isKeep
                ? 'border-brand-border/70 bg-surface-card text-slate-100'
                : 'border-surface-border/60 bg-surface-card text-slate-500 hover:border-slate-500 hover:text-slate-200',
            )}
          >
            {isKeep ? (
              <Check size={10} aria-hidden />
            ) : (
              <span className='inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60' />
            )}
            Keep
          </button>
          <button
            type='button'
            aria-pressed={isMergee}
            disabled={isSelf || isKeep}
            title={
              isSelf
                ? 'You cannot merge away your own account'
                : isKeep
                  ? 'The kept account cannot also be merged away'
                  : 'Merge this account into the kept account'
            }
            onClick={() => toggleMerge(userId)}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors',
              isMergee
                ? 'bg-surface-card border-slate-400/70 text-slate-100'
                : 'border-surface-border/60 bg-surface-card text-slate-500 hover:border-slate-500 hover:text-slate-200',
              (isSelf || isKeep) && 'cursor-not-allowed opacity-40',
            )}
          >
            {isMergee ? (
              <Check size={10} aria-hidden />
            ) : (
              <span className='inline-block h-1.5 w-1.5 rounded-full border border-current opacity-60' />
            )}
            Merge
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  const MODES = [
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'all', label: 'All users', icon: UsersIcon },
  ] as const;

  const suggestionUserCount = groups.reduce((sum, group) => sum + group.users.length, 0);
  const visibleSuggestionUsers = filteredGroups.reduce((sum, group) => sum + group.users.length, 0);
  const subheader =
    mode === 'suggestions'
      ? query
        ? `${visibleSuggestionUsers}/${suggestionUserCount} suggested users`
        : `${suggestionUserCount} suggested users in ${groups.length} group${groups.length === 1 ? '' : 's'}`
      : query
        ? `${filteredUsers.length}/${data.length} users`
        : `${data.length} users`;

  return (
    <div className='w-full min-w-0'>
      <title>{`Merge users | ${meta?.title}`}</title>
      <meta name='description' content='Merge duplicate user accounts' />
      <Card flush className='min-w-0 overflow-visible border-0'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
            <SectionHeader
              className='mb-0 min-w-0 lg:flex-1'
              title='Merge users'
              icon={GitMerge}
              subheader={subheader}
            />
            <div className='w-full shrink-0 lg:w-80 lg:max-w-[52vw]'>
              <div
                role='tablist'
                aria-label='Merge view'
                className='bg-surface-raised border-surface-border mb-2 grid grid-cols-2 gap-1 rounded-lg border p-1'
              >
                {MODES.map((tab) => (
                  <button
                    key={tab.id}
                    type='button'
                    role='tab'
                    aria-selected={mode === tab.id}
                    onClick={() => setMode(tab.id)}
                    className={cn(
                      'inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors',
                      mode === tab.id
                        ? 'bg-surface-card ring-brand-border/70 text-slate-100 ring-1'
                        : 'hover:bg-surface-hover text-slate-500 hover:text-slate-200',
                    )}
                  >
                    <tab.icon size={12} aria-hidden />
                    {tab.label}
                  </button>
                ))}
              </div>
              <SearchInput
                type='text'
                placeholder='Search users (name, id, email or region)...'
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                onClear={() => setQuery('')}
                className='bg-surface-raised border-surface-border focus:border-surface-border placeholder:text-slate-500'
              />
            </div>
          </div>
          {(keeper || mergees.length > 0) && (
            <div className='bg-surface-raised border-surface-border mt-4 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2.5'>
              <span className={cn(designContract.typography.label, 'text-slate-500')}>Merge</span>
              {keeper && (
                <div className='border-brand-border/70 bg-surface-card ring-brand-border/70 flex min-w-0 items-center gap-2 rounded-md border py-1 pr-2 pl-1 ring-1'>
                  <Avatar name={keeper.name} mediaIdentity={keeper.mediaIdentity} size='mini' />
                  <span className='truncate text-[11px] font-semibold text-slate-100'>{keeper.name}</span>
                  <span className='shrink-0 text-[10px] text-slate-500'>#{keeper.userId}</span>
                </div>
              )}
              <ArrowRight size={14} className='shrink-0 text-slate-500' aria-hidden />
              {mergees.length === 0 ? (
                <span className='min-w-0 text-[11px] text-slate-500'>
                  into the kept account{keeper ? '' : ' (pick one account to keep first)'}
                </span>
              ) : (
                mergees.slice(0, 4).map((mergee) => (
                  <div
                    key={mergee.userId}
                    className='border-surface-border/60 bg-surface-card flex min-w-0 items-center gap-2 rounded-md border py-1 pr-2 pl-1'
                  >
                    <Avatar name={mergee.name} mediaIdentity={mergee.mediaIdentity} size='mini' />
                    <span className='truncate text-[11px] font-semibold text-slate-200'>{mergee.name}</span>
                    <span className='shrink-0 text-[10px] text-slate-500'>#{mergee.userId}</span>
                  </div>
                ))
              )}
              {mergees.length > 4 && <span className='text-[11px] text-slate-500'>+{mergees.length - 4} more</span>}
              <div className='ml-auto flex shrink-0 items-center gap-2'>
                <button
                  type='button'
                  onClick={clearSelection}
                  disabled={isMerging}
                  className='border-surface-border/60 hover:bg-surface-hover inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <X size={12} aria-hidden />
                  Clear
                </button>
                <button
                  type='button'
                  onClick={runMerge}
                  disabled={!canMerge}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    canMerge ? 'bg-brand text-slate-50 hover:opacity-90' : 'bg-surface-raised-hover text-slate-500',
                  )}
                >
                  {isMerging ? (
                    <Loader2 size={12} className='animate-spin' aria-hidden />
                  ) : (
                    <GitMerge size={12} aria-hidden />
                  )}
                  {isMerging ? 'Merging…' : `Merge ${mergees.length} account${mergees.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className='border-surface-border/60 border-t'>
          {mode === 'suggestions' ? (
            filteredGroups.length === 0 ? (
              <div className='px-4 py-16 text-center sm:px-5 sm:py-20'>
                <p className={designContract.typography.label}>No merge suggestions found</p>
                <p className='mt-2 text-[11px] text-slate-500'>
                  Accounts with the same name that share a region are suggested here. Switch to &quot;All users&quot; to
                  browse everything.
                </p>
              </div>
            ) : (
              <div className='divide-surface-border/40 divide-y'>
                {filteredGroups.map((group) => (
                  <section key={group.users.map((u) => u.userId ?? 0).join('-')}>
                    <div className='flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 px-4 pt-3.5 pb-1 sm:px-5'>
                      <h4 className={cn('truncate text-sm font-bold text-slate-100', twInk.lightTextSlate900)}>
                        {group.label}
                      </h4>
                      <span className='text-[10px] font-medium text-slate-500'>{group.users.length} accounts</span>
                    </div>
                    <div className='grid grid-cols-1 gap-2 p-3 pt-1 sm:grid-cols-2 sm:p-4 sm:pt-1 lg:grid-cols-3'>
                      {group.users.map(renderUser)}
                    </div>
                  </section>
                ))}
              </div>
            )
          ) : filteredUsers.length === 0 ? (
            <div className='px-4 py-16 text-center sm:px-5 sm:py-20'>
              <p className={designContract.typography.label}>No users found</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3'>
              {filteredUsers.map(renderUser)}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MergeUsers;
