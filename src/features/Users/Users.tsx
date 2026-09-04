import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  Calendar,
  Check,
  GitMerge,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  UserCog,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { Avatar, Card, Loading, SearchInput, SectionHeader } from '../../shared/ui';
import { useUsers } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';

type AdminUser = components['schemas']['AdminUser'];
type AdminRegion = components['schemas']['AdminRegion'];

/** Form field captions — readable on `surface-card`. */
const fieldLabelClass = cn(designContract.typography.label, 'text-slate-300');

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
const profileUrl = (user: AdminUser, region?: AdminRegion): string => {
  const base = region?.url ? withScheme(region.url) : '';
  return base ? `${base}/user/${user.userId}` : `/user/${user.userId}`;
};

type UserGroup = {
  label: string;
  users: AdminUser[];
};

/**
 * Merge suggestions = users that have the same normalized name. Accounts with no region associations (e.g. users
 * added manually when tagging photos) are always candidates. When both accounts have region(s) they must share at
 * least one region to be suggested together. Connected components are used so a chain A-B (share R1) + B-C (share R2)
 * is suggested as one group.
 */
function buildGroups(data: AdminUser[]): UserGroup[] {
  const byName = new Map<string, AdminUser[]>();
  for (const user of data) {
    const key = normalizeName(user.name);
    if (!key) continue;
    const arr = byName.get(key) ?? [];
    arr.push(user);
    byName.set(key, arr);
  }

  const groups: UserGroup[] = [];
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
    const components = new Map<number, AdminUser[]>();
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

const Users = () => {
  const meta = useMeta();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'suggestions' | 'all'>('suggestions');
  const [keepUserId, setKeepUserId] = useState<number | null>(null);
  const [mergeUserIds, setMergeUserIds] = useState<ReadonlySet<number>>(new Set());
  const [renameUser, setRenameUser] = useState<AdminUser | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const { data = [], isLoading: loading, merge, rename } = useUsers();

  const groups = useMemo(() => buildGroups(data), [data]);

  const matches = (user: AdminUser) => {
    // Not clever - just a plain substring check against the user id or the name (first + last name). Names that are
    // actually emails (e.g. stored in firstname) are matched too, so searching "@" works.
    const q = normalize(query);
    if (!q) return true;
    if (String(user.userId ?? 0).includes(q)) return true;
    return (user.name ?? '').toLowerCase().includes(q);
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

  const renderUser = (user: AdminUser) => {
    const userId = user.userId ?? 0;
    const isKeep = userId === keepUserId;
    const isMergee = mergeUserIds.has(userId);
    const isSelf = userId === ownUserId;
    const canEditName = user.canEditName === true;
    const emails = user.emails ?? [];
    const regions = user.regions ?? [];
    const profile = profileUrl(user, regions[0]);
    const external = profile.startsWith('http');
    const linkProps = external ? { href: profile, target: '_blank', rel: 'noopener noreferrer' } : { href: profile };
    return (
      <div
        key={userId}
        className={cn(
          'flex min-w-0 items-start gap-2.5 rounded-lg border px-2.5 py-2 transition-colors sm:gap-3 sm:px-3 sm:py-2.5',
          isKeep
            ? 'border-brand-border/70 bg-surface-hover ring-brand-border/60 ring-1'
            : isMergee
              ? 'bg-surface-hover border-slate-500/60 ring-1 ring-slate-400/40'
              : 'border-surface-border/50 bg-surface-card hover:bg-surface-raised-hover',
        )}
      >
        <div className='flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3'>
          <a
            {...linkProps}
            title={`Open profile of ${user.name ?? 'user'} (#${userId})`}
            className='shrink-0 rounded-full transition-opacity hover:opacity-80'
          >
            <Avatar name={user.name} mediaIdentity={user.mediaIdentity} size='tiny' />
          </a>
          <div className='min-w-0 flex-1'>
            <div className='flex min-w-0 items-baseline gap-x-1.5'>
              <a
                {...linkProps}
                className={cn(
                  'min-w-0 flex-1 truncate text-sm font-bold text-slate-100 transition-colors hover:text-slate-300',
                  twInk.lightTextSlate900,
                )}
              >
                {user.name || 'Unknown'}
              </a>
              <span className={cn('shrink-0 text-[10px] font-medium text-slate-500', twInk.lightTextSlate700)}>
                #{userId}
                {isSelf ? ' (you)' : ''}
              </span>
            </div>
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
        <div className='flex w-[5.75rem] shrink-0 flex-col gap-1'>
          <button
            type='button'
            disabled={!canEditName}
            title={
              canEditName
                ? 'Edit the name of this user'
                : 'Not allowed - this user is only associated with regions where you are not a superadmin'
            }
            onClick={() => setRenameUser(user)}
            className={cn(
              'inline-flex w-full items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[10px] font-semibold transition-colors',
              canEditName
                ? 'border-surface-border/60 bg-surface-card text-slate-500 hover:border-slate-500 hover:text-slate-200'
                : 'border-surface-border/40 bg-surface-card cursor-not-allowed text-slate-600 opacity-50',
            )}
          >
            <Pencil size={10} aria-hidden />
            Edit name
          </button>
          <button
            type='button'
            aria-pressed={isKeep}
            title='Keep this account (the merge target)'
            onClick={() => toggleKeep(userId)}
            className={cn(
              'inline-flex w-full items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[10px] font-semibold transition-colors',
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
              'inline-flex w-full items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[10px] font-semibold transition-colors',
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
    { id: 'suggestions', label: 'Merge suggestions', icon: Lightbulb },
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
      <title>{`Users | ${meta?.title}`}</title>
      <meta name='description' content='Browse users, merge duplicate accounts and edit names (superadmin only)' />
      <Card flush className='min-w-0 overflow-visible border-0'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
            <SectionHeader className='mb-0 min-w-0 lg:flex-1' title='Users' icon={UserCog} subheader={subheader} />
            <div className='w-full shrink-0 lg:w-80 lg:max-w-[52vw]'>
              <div
                role='tablist'
                aria-label='Users view'
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
              {mergees.length > 0 &&
                mergees.slice(0, 4).map((mergee) => (
                  <div
                    key={mergee.userId}
                    className='border-surface-border/60 bg-surface-card flex min-w-0 items-center gap-2 rounded-md border py-1 pr-2 pl-1'
                  >
                    <Avatar name={mergee.name} mediaIdentity={mergee.mediaIdentity} size='mini' />
                    <span className='truncate text-[11px] font-semibold text-slate-200'>{mergee.name}</span>
                    <span className='shrink-0 text-[10px] text-slate-500'>#{mergee.userId}</span>
                  </div>
                ))}
              {mergees.length > 4 && <span className='text-[11px] text-slate-500'>+{mergees.length - 4} more</span>}
              <ArrowRight size={14} className='shrink-0 text-slate-500' aria-hidden />
              {keeper ? (
                <>
                  <div className='border-brand-border/70 bg-surface-card ring-brand-border/70 flex min-w-0 items-center gap-2 rounded-md border py-1 pr-2 pl-1 ring-1'>
                    <Avatar name={keeper.name} mediaIdentity={keeper.mediaIdentity} size='mini' />
                    <span className='truncate text-[11px] font-semibold text-slate-100'>{keeper.name}</span>
                    <span className='shrink-0 text-[10px] text-slate-500'>#{keeper.userId} · kept</span>
                  </div>
                  {mergees.length === 0 && (
                    <span className='min-w-0 text-[11px] text-slate-500'>(pick the account(s) to merge into it)</span>
                  )}
                </>
              ) : (
                <span className='min-w-0 text-[11px] text-slate-500'>kept account (pick which one to keep first)</span>
              )}
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
      {renameUser && (
        <RenameUserDialog
          key={renameUser.userId ?? 0}
          user={renameUser}
          onRename={(firstname, lastname) => rename(renameUser.userId ?? 0, firstname, lastname)}
          onClose={() => setRenameUser(null)}
        />
      )}
    </div>
  );
};

type RenameUserDialogProps = {
  user: AdminUser;
  onRename: (firstname: string, lastname: string) => Promise<void>;
  onClose: () => void;
};

/**
 * Modal for renaming an existing user (superadmin only, and only when the caller is superadmin in at least one of the
 * user's regions - or the user has no region association).
 */
const RenameUserDialog = ({ user, onRename, onClose }: RenameUserDialogProps) => {
  const [firstname, setFirstname] = useState(user.firstname ?? '');
  const [lastname, setLastname] = useState(user.lastname ?? '');
  const [isSaving, setIsSaving] = useState(false);
  /** Backdrop closes only when the press itself started on the backdrop - never when a drag began inside the dialog. */
  const pointerDownOnBackdrop = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || isSaving) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, isSaving]);

  const trimmedFirstname = firstname.trim();
  const trimmedLastname = lastname.trim();
  const canSave = trimmedFirstname.length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onRename(trimmedFirstname, trimmedLastname);
      onClose();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      className='animate-in fade-in fixed inset-0 z-200 flex h-dvh min-h-dvh w-full items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200'
      role='dialog'
      aria-modal='true'
      aria-labelledby='rename-user-modal-title'
      onMouseDown={(e) => {
        pointerDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={() => {
        if (isSaving || !pointerDownOnBackdrop.current) return;
        pointerDownOnBackdrop.current = false;
        onClose();
      }}
    >
      <div className='bg-surface-card border-surface-border w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl'>
        <div className='border-surface-border bg-surface-raised flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5'>
          <h3 id='rename-user-modal-title' className='type-label flex min-w-0 items-center gap-2 text-slate-200'>
            <Pencil size={16} className='shrink-0 text-slate-400' />
            <span className='truncate'>Edit name</span>
          </h3>
          <button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            className='hover:bg-surface-raised-hover -mr-1 shrink-0 rounded-lg p-1.5 opacity-70 transition-colors hover:opacity-100 disabled:pointer-events-none disabled:opacity-40'
            aria-label='Close'
          >
            <X size={18} />
          </button>
        </div>

        <div className='space-y-4 px-4 py-4 sm:px-5'>
          <div className='flex min-w-0 items-center gap-2.5'>
            <Avatar name={user.name} mediaIdentity={user.mediaIdentity} size='tiny' />
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-slate-100'>{user.name || 'Unknown'}</p>
              <p className='mt-0.5 text-[10px] font-medium text-slate-500'>#{user.userId}</p>
            </div>
          </div>

          <div className='space-y-1.5'>
            <label htmlFor='rename-user-firstname' className={cn('ml-1', fieldLabelClass)}>
              First name{' '}
              <span className='text-red-500' aria-hidden>
                *
              </span>
              <span className='sr-only'> (required)</span>
            </label>
            <input
              id='rename-user-firstname'
              type='text'
              autoFocus
              placeholder='First name'
              className='bg-surface-nav border-surface-border type-body focus:border-brand w-full rounded-lg border px-3 py-2 transition-colors focus:outline-none'
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>

          <div className='space-y-1.5'>
            <label htmlFor='rename-user-lastname' className={cn('ml-1', fieldLabelClass)}>
              Last name
            </label>
            <input
              id='rename-user-lastname'
              type='text'
              placeholder='Last name'
              className='bg-surface-nav border-surface-border type-body focus:border-brand w-full rounded-lg border px-3 py-2 transition-colors focus:outline-none'
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>

          <p className='border-surface-border/50 flex items-start gap-1.5 rounded-lg border border-dashed px-2.5 py-2 text-[10px] leading-snug text-slate-500'>
            <MapPin size={10} className='mt-px shrink-0' aria-hidden />
            <span>
              {user.regions && user.regions.length > 0
                ? `Associated regions: ${user.regions.map((r) => r.name).join(', ')}.`
                : 'This user is not associated with any region.'}
            </span>
          </p>
        </div>

        <div className='border-surface-border bg-surface-raised flex shrink-0 justify-end gap-2 border-t px-3 py-3 sm:px-5'>
          <button type='button' onClick={onClose} disabled={isSaving} className='modal-action-cancel'>
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              designContract.controls.savePrimaryModal,
              'disabled:bg-surface-nav px-5 py-2 text-[10px] shadow-sm disabled:opacity-50',
            )}
          >
            {isSaving ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
            {isSaving ? 'Saving…' : 'Save name'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Users;
