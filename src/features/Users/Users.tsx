import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  Ban,
  Calendar,
  Check,
  GitMerge,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  RotateCcw,
  UserCog,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { Avatar, Card, ClickableAvatar, Loading, SearchInput, SectionHeader } from '../../shared/ui';
import { useUsers } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';

type AdminUser = components['schemas']['AdminUser'];
type AdminRegion = components['schemas']['AdminRegion'];
type MergeDismissal = components['schemas']['MergeDismissal'];

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

/** Canonical key for an unordered pair of user ids (smallest id first), matching how the backend stores a dismissal. */
const pairKey = (a: number, b: number) => (a <= b ? `${a}:${b}` : `${b}:${a}`);

/**
 * Identity carried by an email address: the part before "@", lowercased and stripped of any "+tag" suffix, so
 * "Jostein.Oygarden+brattelinjer@gmail.com" and "jostein.oygarden@esmartsystems.com" both yield "jostein.oygarden".
 * Placeholder addresses generated for accounts without an email are ignored (they would group complete strangers).
 */
const emailLocalPart = (email?: string) => {
  if (!email) return '';
  const at = email.indexOf('@');
  if (at <= 0) return '';
  if (email.slice(at + 1).toLowerCase() === 'missing-email.com') return '';
  return email.slice(0, at).toLowerCase().split('+')[0].trim();
};

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

/** Split a full name into normalized single-word tokens ("Håkon M. Hansen" -> ["haakon", "m", "hansen"]). */
const nameTokens = (value?: string) => (value ?? '').split(/\s+/).map(normalizeName).filter(Boolean);

/** Two tokens agree when they are equal, or when one is a single-letter initial of the other ("h" ~ "håkon"). */
const initialsCompatible = (a: string, b: string) =>
  a === b || (a.length === 1 && b.startsWith(a)) || (b.length === 1 && a.startsWith(b));

/** Middle-name words must not contradict: an initial may stand for a full middle name and extra words are allowed. */
function middlesConsistent(a: string[], b: string[]): boolean {
  const [fewer, more] = a.length <= b.length ? [a, b] : [b, a];
  if (fewer.length === 0) return true;
  const used = more.map(() => false);
  for (const token of fewer) {
    const index = more.findIndex((candidate, i) => !used[i] && initialsCompatible(token, candidate));
    if (index === -1) return false;
    used[index] = true;
  }
  return true;
}

/**
 * Initials may stand for missing words, but a match still needs at least one full (multi-letter) word in common.
 * Without this, a name like "A. B." would "bridge" every A* B* name together (Axel Von Bergen + Audun Bratrud).
 */
const sharesFullWord = (a: string[], b: string[]) => a.some((token) => token.length > 1 && b.includes(token));

/**
 * Same-person name variants: "Håkon Hansen" vs "Håkon Middlename Hansen" vs "Håkon M. Hansen" vs "Håkon H." vs
 * "H. Hansen" (first-name initials and one-word names like "Håkon" are also accepted).
 */
function isNameVariant(a: string[], b: string[]): boolean {
  const aSingle = a.length === 1 ? a[0] : null;
  const bSingle = b.length === 1 ? b[0] : null;
  if (aSingle || bSingle) {
    // One-word name (e.g. "Håkon") must literally be the other account's first or last name. A lone initial is too vague.
    const single = aSingle ?? bSingle ?? '';
    const other = aSingle ? b : a;
    return single.length > 1 && (other[0] === single || other[other.length - 1] === single);
  }
  if (!sharesFullWord(a, b)) return false;
  if (!initialsCompatible(a[0], b[0])) return false;
  if (!initialsCompatible(a[a.length - 1], b[b.length - 1])) return false;
  return middlesConsistent(a.slice(1, -1), b.slice(1, -1));
}

/**
 * Merge suggestions = users whose names are the same person's name written in different ways (see {@link isNameVariant}),
 * or whose email addresses share the same local part (see {@link emailLocalPart} - a much stronger identity signal, so
 * the region guard is skipped for those). Accounts with no region associations (e.g. users added manually when tagging
 * photos) are always candidates. When both accounts have region(s) they must share at least one region to be suggested
 * together. Connected components are used so a chain A-B (share R1) + B-C (share R2) is suggested as one group. Pairs
 * the superadmin marked as "not merge candidates" (`dismissedPairs`) are never connected.
 */
function buildGroups(data: AdminUser[], dismissedPairs: ReadonlySet<string>): UserGroup[] {
  const tokenLists = data.map((user) => nameTokens(user.name));
  const regionIds = data.map(
    (user) => new Set((user.regions ?? []).map((r) => r.id).filter((id): id is number => !!id)),
  );

  const isDismissed = (a: number, b: number) => dismissedPairs.has(pairKey(data[a].userId ?? 0, data[b].userId ?? 0));

  // Bucket by the first-name initial so we never compare names that cannot be the same person.
  const byInitial = new Map<string, number[]>();
  // Bucket by email local part so duplicate sign-ups are found even when the written names differ completely.
  const byEmailLocalPart = new Map<string, number[]>();
  data.forEach((user, index) => {
    const initial = tokenLists[index][0]?.[0];
    if (initial) {
      const arr = byInitial.get(initial) ?? [];
      arr.push(index);
      byInitial.set(initial, arr);
    }
    for (const localPart of new Set((user.emails ?? []).map(emailLocalPart))) {
      if (!localPart) continue;
      const arr = byEmailLocalPart.get(localPart) ?? [];
      arr.push(index);
      byEmailLocalPart.set(localPart, arr);
    }
  });

  const parent = data.map((_, i) => i);
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

  for (const bucket of byInitial.values()) {
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i];
        const b = bucket[j];
        if (!isNameVariant(tokenLists[a], tokenLists[b])) continue;
        if (isDismissed(a, b)) continue;
        // Region guard: both accounts with regions must share one; region-less accounts are always candidates.
        const sharesRegion = [...regionIds[a]].some((id) => regionIds[b].has(id));
        if (regionIds[a].size === 0 || regionIds[b].size === 0 || sharesRegion) {
          union(a, b);
        }
      }
    }
  }

  // Same email local part means the same person, no matter how the name is spelled or which region they signed up in.
  for (const bucket of byEmailLocalPart.values()) {
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i];
        const b = bucket[j];
        if (isDismissed(a, b)) continue;
        union(a, b);
      }
    }
  }

  const components = new Map<number, number[]>();
  data.forEach((_, index) => {
    const root = find(index);
    const arr = components.get(root) ?? [];
    arr.push(index);
    components.set(root, arr);
  });

  const groups: UserGroup[] = [];
  for (const memberIndexes of components.values()) {
    if (memberIndexes.length < 2) continue;
    const members = memberIndexes.map((index) => data[index]).sort((x, y) => (x.userId ?? 0) - (y.userId ?? 0));
    // Label the group with the fullest written name so the "real" account reads as the representative.
    const labelUser = [...members].sort((x, y) => {
      const tokensDelta = nameTokens(y.name).length - nameTokens(x.name).length;
      return tokensDelta || (x.userId ?? 0) - (y.userId ?? 0);
    })[0];
    groups.push({ label: labelUser?.name ?? 'Unknown', users: members });
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
  const [showDismissed, setShowDismissed] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const { data = [], isLoading: loading, merge, rename, mergeDismissals, dismiss, restore } = useUsers();

  const dismissals = useMemo(() => mergeDismissals.data ?? [], [mergeDismissals.data]);
  const dismissedPairs = useMemo(
    () => new Set(dismissals.map((pair) => pairKey(pair.userId1 ?? 0, pair.userId2 ?? 0))),
    [dismissals],
  );
  const usersById = useMemo(() => new Map(data.map((user) => [user.userId ?? 0, user])), [data]);

  const groups = useMemo(() => buildGroups(data, dismissedPairs), [data, dismissedPairs]);

  const matches = (user: AdminUser) => {
    // Not clever - just a plain substring check against the user id, the name (first + last name) or any email.
    const q = normalize(query);
    if (!q) return true;
    if (String(user.userId ?? 0).includes(q)) return true;
    if ((user.name ?? '').toLowerCase().includes(q)) return true;
    return (user.emails ?? []).some((email) => email.toLowerCase().includes(q));
  };

  const filteredUsers = query ? data.filter(matches) : data;
  const filteredGroups = query ? groups.filter((group) => group.users.some(matches)) : groups;

  const keeper = data.find((item) => item.userId === keepUserId) ?? null;
  const mergees = data.filter((item) => mergeUserIds.has(item.userId ?? -1));
  const canMerge = !!keeper && mergees.length > 0 && !isMerging;
  const showMergeBar = !!keeper || mergees.length > 0;
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

  /**
   * Persist "these two accounts are NOT duplicates" so the pair stops being suggested. Reversible via
   * {@link restore} (the dismissed-pairs dialog), which is why no confirmation is asked for.
   */
  const dismissPairs = async (pairs: Array<[number, number]>) => {
    const pending = pairs.filter(([a, b]) => a > 0 && b > 0 && a !== b && !dismissedPairs.has(pairKey(a, b)));
    if (pending.length === 0 || isDismissing) return;
    setIsDismissing(true);
    try {
      await Promise.all(pending.map(([a, b]) => dismiss(a, b)));
      // Drop any account involved from the merge selection - its partners are gone from the suggestions.
      setMergeUserIds((prev) => {
        if (pending.every(([a, b]) => !prev.has(a) && !prev.has(b))) return prev;
        const next = new Set(prev);
        for (const [a, b] of pending) {
          next.delete(a);
          next.delete(b);
        }
        return next;
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setIsDismissing(false);
    }
  };

  /** Mark one account as not a duplicate of the other accounts in its group (the group may survive without it). */
  const dismissUser = (user: AdminUser, group: UserGroup) => {
    const userId = user.userId ?? 0;
    const pairs = group.users
      .map((other) => other.userId ?? 0)
      .filter((otherId) => otherId > 0 && otherId !== userId)
      .map((otherId) => [userId, otherId] as [number, number]);
    void dismissPairs(pairs);
  };

  const renderUser = (user: AdminUser, group?: UserGroup) => {
    const userId = user.userId ?? 0;
    const isKeep = userId === keepUserId;
    const isMergee = mergeUserIds.has(userId);
    const isSelf = userId === ownUserId;
    const canEditName = user.canEditName === true;
    const emails = user.emails ?? [];
    const regions = user.regions ?? [];
    const profile = profileUrl(user, regions[0]);
    const linkProps = { href: profile, target: '_blank', rel: 'noopener noreferrer' };
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
          <ClickableAvatar
            name={user.name}
            mediaIdentity={user.mediaIdentity}
            userId={userId}
            size='tiny'
            className='shrink-0 rounded-full'
          />
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
          {group && (
            <button
              type='button'
              disabled={isDismissing}
              title={`Mark ${user.name ?? 'this account'} as NOT a duplicate of the other account(s) here`}
              onClick={() => dismissUser(user, group)}
              className='border-surface-border/60 bg-surface-card inline-flex w-full items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[10px] font-semibold text-slate-500 transition-colors hover:border-slate-500 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Ban size={10} aria-hidden />
              Not dupe
            </button>
          )}
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
                placeholder='Search users (name, email or id)...'
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                onClear={() => setQuery('')}
                className='bg-surface-raised border-surface-border focus:border-surface-border placeholder:text-slate-500'
              />
              <button
                type='button'
                onClick={() => setShowDismissed(true)}
                title='Browse accounts you have marked as NOT merge candidates, and undo mistakes'
                className='border-surface-border/60 bg-surface-raised hover:border-surface-border mt-2 inline-flex w-full items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-100'
              >
                <span className='inline-flex items-center gap-1.5'>
                  <Ban size={12} aria-hidden />
                  Not merge candidates
                </span>
                <span className='text-[10px] font-medium text-slate-500'>{dismissals.length}</span>
              </button>
            </div>
          </div>
        </div>
        <div className='border-surface-border/60 border-t'>
          {mode === 'suggestions' ? (
            filteredGroups.length === 0 ? (
              <div className='px-4 py-16 text-center sm:px-5 sm:py-20'>
                <p className={designContract.typography.label}>No merge suggestions found</p>
                <p className='mt-2 text-[11px] text-slate-500'>
                  Accounts with the same name that share a region, or the same email address, are suggested here. Switch
                  to &quot;All users&quot; to browse everything.
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
                      {group.users.map((user) => renderUser(user, group))}
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
              {filteredUsers.map((user) => renderUser(user))}
            </div>
          )}
        </div>
      </Card>
      {showMergeBar &&
        createPortal(
          <div className='pointer-events-none fixed inset-x-0 bottom-3 z-[300] flex justify-center px-3 sm:bottom-5'>
            <div
              role='status'
              aria-label='Merge selection'
              title={
                keeper || mergees.length > 0
                  ? [
                      keeper ? `Keep: ${keeper.name ?? 'Unknown'} (#${keeper.userId})` : null,
                      ...mergees.map((m) => `Merge: ${m.name ?? 'Unknown'} (#${m.userId})`),
                    ]
                      .filter(Boolean)
                      .join(' | ')
                  : undefined
              }
              className='animate-in fade-in slide-in-from-bottom-3 border-brand-border/70 bg-surface-nav ring-brand/25 pointer-events-auto flex w-full max-w-[min(58rem,calc(100vw-1.5rem))] items-center gap-1.5 rounded-full border py-1.5 pr-1.5 pl-2 shadow-[0_12px_44px_-10px_rgba(0,0,0,0.75)] ring-2 duration-200 sm:gap-2 sm:py-2 sm:pl-2.5'
            >
              <span className='bg-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-50 shadow-sm sm:h-8 sm:w-8'>
                <GitMerge size={14} strokeWidth={2.25} aria-hidden />
              </span>

              <div
                className='flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto sm:gap-2 [&::-webkit-scrollbar]:hidden'
                style={{ scrollbarWidth: 'none' }}
              >
                <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
                  {mergees.length > 0 ? (
                    mergees.map((mergee) => (
                      <span
                        key={mergee.userId}
                        className='border-surface-border/70 bg-surface-card inline-flex shrink-0 items-center gap-1 rounded-full border py-0.5 pr-2 pl-0.5'
                        title={mergee.name ?? 'Unknown'}
                      >
                        <Avatar name={mergee.name} mediaIdentity={mergee.mediaIdentity} size='micro' />
                        <span className='max-w-[10rem] truncate text-[11px] font-medium text-slate-200'>
                          {mergee.name}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className='border-surface-border/70 inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-[11px] font-medium text-slate-400'>
                      Mark accounts to merge
                    </span>
                  )}
                </div>

                {mergees.length > 0 && <ArrowRight size={14} className='text-brand shrink-0' aria-hidden />}

                {keeper ? (
                  <span
                    className='border-brand-border/80 bg-surface-card ring-brand-border/60 inline-flex shrink-0 items-center gap-1 rounded-full border py-0.5 pr-2 pl-0.5 ring-1'
                    title={keeper.name ?? 'Unknown'}
                  >
                    <Avatar name={keeper.name} mediaIdentity={keeper.mediaIdentity} size='micro' />
                    <span className='max-w-[10rem] truncate text-[11px] font-bold text-slate-50'>{keeper.name}</span>
                    <span className='shrink-0 text-[10px] font-medium text-slate-400'>#{keeper.userId}</span>
                  </span>
                ) : (
                  <span className='border-brand-border/60 inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-[11px] font-medium text-slate-400'>
                    Pick keeper
                  </span>
                )}
              </div>

              <button
                type='button'
                onClick={clearSelection}
                disabled={isMerging}
                className='hover:bg-surface-raised-hover border-surface-border/70 shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5'
              >
                Clear
              </button>
              <button
                type='button'
                onClick={runMerge}
                disabled={!canMerge}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5 sm:py-1.5',
                  canMerge
                    ? 'bg-brand text-slate-50 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.6)] hover:brightness-110'
                    : 'bg-surface-raised-hover text-slate-500',
                )}
              >
                {isMerging ? (
                  <span className='inline-flex items-center gap-1'>
                    <Loader2 size={12} className='animate-spin' aria-hidden />
                    Merging…
                  </span>
                ) : (
                  'Merge'
                )}
              </button>
            </div>
          </div>,
          document.body,
        )}
      {renameUser && (
        <RenameUserDialog
          key={renameUser.userId ?? 0}
          user={renameUser}
          onRename={(firstname, lastname) => rename(renameUser.userId ?? 0, firstname, lastname)}
          onClose={() => setRenameUser(null)}
        />
      )}
      {showDismissed && (
        <DismissedPairsDialog
          dismissals={dismissals}
          usersById={usersById}
          onRestore={restore}
          onClose={() => setShowDismissed(false)}
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
            <Mail size={10} className='mt-px shrink-0' aria-hidden />
            <span className='min-w-0 break-words'>
              {user.emails && user.emails.length > 0 ? `Emails: ${user.emails.join(', ')}` : 'No email registered.'}
            </span>
          </p>

          <p className='border-surface-border/50 flex items-start gap-1.5 rounded-lg border border-dashed px-2.5 py-2 text-[10px] leading-snug text-slate-500'>
            <MapPin size={10} className='mt-px shrink-0' aria-hidden />
            <span className='min-w-0 break-words'>
              {user.regions && user.regions.length > 0
                ? `Associated regions: ${user.regions.map((r) => r.url || r.name).join(', ')}.`
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

type DismissedPairsDialogProps = {
  dismissals: MergeDismissal[];
  usersById: Map<number, AdminUser>;
  onRestore: (userId1: number, userId2: number) => Promise<void>;
  onClose: () => void;
};

/**
 * Modal listing every pair of accounts the superadmin has marked as "not merge candidates", each with an undo action so
 * a mistake can be reversed without touching the database. Pairs whose accounts no longer exist are simply not listed.
 */
const DismissedPairsDialog = ({ dismissals, usersById, onRestore, onClose }: DismissedPairsDialogProps) => {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  /** Backdrop closes only when the press itself started on the backdrop - never when a drag began inside the dialog. */
  const pointerDownOnBackdrop = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleRestore = async (pair: MergeDismissal) => {
    setBusyKey(pairKey(pair.userId1 ?? 0, pair.userId2 ?? 0));
    try {
      await onRestore(pair.userId1 ?? 0, pair.userId2 ?? 0);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyKey(null);
    }
  };

  const renderAccount = (account?: AdminUser) => (
    <div className='flex min-w-0 flex-1 items-center gap-2'>
      <Avatar name={account?.name} mediaIdentity={account?.mediaIdentity} size='micro' />
      <div className='min-w-0'>
        <p className='truncate text-[11px] font-semibold text-slate-200'>{account?.name ?? 'Unknown user'}</p>
        <p className='truncate text-[10px] font-medium text-slate-500'>
          #{account?.userId ?? '?'}
          {account?.emails?.[0] ? ` · ${account.emails[0]}` : ''}
        </p>
      </div>
    </div>
  );

  return createPortal(
    <div
      className='animate-in fade-in fixed inset-0 z-200 flex h-dvh min-h-dvh w-full items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200'
      role='dialog'
      aria-modal='true'
      aria-labelledby='dismissed-pairs-modal-title'
      onMouseDown={(e) => {
        pointerDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={() => {
        if (!pointerDownOnBackdrop.current) return;
        pointerDownOnBackdrop.current = false;
        onClose();
      }}
    >
      <div className='bg-surface-card border-surface-border flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl'>
        <div className='border-surface-border bg-surface-raised flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5'>
          <h3 id='dismissed-pairs-modal-title' className='type-label flex min-w-0 items-center gap-2 text-slate-200'>
            <Ban size={16} className='shrink-0 text-slate-400' />
            <span className='truncate'>Not merge candidates</span>
            <span className='shrink-0 text-[10px] font-medium text-slate-500'>{dismissals.length}</span>
          </h3>
          <button
            type='button'
            onClick={onClose}
            disabled={busyKey !== null}
            className='hover:bg-surface-raised-hover -mr-1 shrink-0 rounded-lg p-1.5 opacity-70 transition-colors hover:opacity-100 disabled:pointer-events-none disabled:opacity-40'
            aria-label='Close'
          >
            <X size={18} />
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto'>
          {dismissals.length === 0 ? (
            <p className='px-4 py-10 text-center text-[11px] text-slate-500'>
              No account pairs have been marked as &quot;not merge candidates&quot;.
            </p>
          ) : (
            <ul className='divide-surface-border/40 divide-y'>
              {dismissals.map((pair) => {
                const key = pairKey(pair.userId1 ?? 0, pair.userId2 ?? 0);
                const busy = busyKey === key;
                return (
                  <li key={key} className='flex items-center gap-2 px-4 py-2.5 sm:px-5'>
                    {renderAccount(usersById.get(pair.userId1 ?? 0))}
                    <ArrowRight size={12} className='shrink-0 text-slate-500' aria-hidden />
                    {renderAccount(usersById.get(pair.userId2 ?? 0))}
                    <button
                      type='button'
                      disabled={busyKey !== null}
                      onClick={() => handleRestore(pair)}
                      title='Undo: let these two accounts be suggested for merging again'
                      className='border-surface-border/60 bg-surface-raised hover:border-surface-border inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold text-slate-400 transition-colors hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {busy ? (
                        <Loader2 size={11} className='animate-spin' aria-hidden />
                      ) : (
                        <RotateCcw size={11} aria-hidden />
                      )}
                      Undo
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className='border-surface-border bg-surface-raised flex shrink-0 justify-end gap-2 border-t px-3 py-3 sm:px-5'>
          <button type='button' onClick={onClose} className='modal-action-cancel'>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Users;
