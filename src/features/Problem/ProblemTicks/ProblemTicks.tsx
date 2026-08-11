import { useMemo, type ReactNode } from 'react';

import { Link } from 'react-router-dom';
import { ClickableAvatar } from '../../../shared/ui/Avatar/Avatar';
import { Stars } from '../../../shared/ui/Indicators';
import Linkify from 'linkify-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { NoPersonalGradeBadge } from '../../../shared/ui/NoPersonalGradeBadge';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickFa,
  tickFlags,
  tickOwnUserLink,
  tickProblemLink,
  tickWhenGrade,
} from '../../../shared/components/Profile/profileRowTypography';

type User = components['schemas']['User'];

type Props = {
  ticks: components['schemas']['ProblemTick'][];
  /** First-ascent users (FA) — used to show "FA" badge on matching tick users. */
  faUsers?: User[];
  /** First-aid-ascent users (FA Aid) — used to show "FA" badge on matching tick users. */
  faAidUsers?: User[];
};

function nonEmptyDate(d: string | undefined | null): d is string {
  return typeof d === 'string' && d.trim().length > 0;
}

function joinDates(dates: (string | undefined | null)[]) {
  return dates.filter(nonEmptyDate).join(' · ');
}

/** A single ascent entry (the original tick or one of its repeats) with an optional date and comment. */
type AscentEntry = { date?: string | null; comment?: string | null };

/**
 * Combine the original tick with its repeats into a single list of ascent entries,
 * sorted newest-first (descending by date). Entries without a date are kept at the end.
 */
function combineAscents(t: components['schemas']['ProblemTick']): AscentEntry[] {
  const entries: AscentEntry[] = [{ date: t.date, comment: t.comment }];
  for (const r of t.repeats ?? []) {
    entries.push({ date: r.date, comment: r.comment });
  }
  return entries.sort((a, b) => {
    const da = a.date ?? '';
    const db = b.date ?? '';
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
}

/** The newest date across a tick and all its repeats (used to position the tick block among other users). */
function newestDate(t: components['schemas']['ProblemTick']): string | undefined {
  const dates = [t.date, ...(t.repeats ?? []).map((r) => r.date)].filter(nonEmptyDate);
  if (dates.length === 0) return undefined;
  return dates.sort((a, b) => b.localeCompare(a))[0];
}

/** Tighter vertical padding than frontpage {@link Activity} rows so stacked entries don’t read as overly airy. */
const activityRowPad = 'px-4 py-2.5 md:px-5 md:py-2.5';
const activityAvatarGap = 'gap-3 md:gap-3';

const quoteBlock = cn(
  tickCommentSmall,
  'leading-snug text-pretty break-words text-slate-50 not-italic sm:leading-relaxed',
);

export const ProblemTicks = ({ ticks, faUsers, faAidUsers }: Props) => {
  const safeTicks = useMemo(() => ticks ?? [], [ticks]);

  /** Set of user IDs that are either FA or FA Aid — used to show "FA" badge on matching tick users. */
  const faUserIdSet = useMemo(() => {
    const ids = new Set<number>();
    for (const u of faUsers ?? []) {
      if (u.id != null) ids.add(u.id);
    }
    for (const u of faAidUsers ?? []) {
      if (u.id != null) ids.add(u.id);
    }
    return ids;
  }, [faUsers, faAidUsers]);

  /** Order tick blocks by the newest ascent date (tick + repeats combined), newest first. */
  const sortedTicks = useMemo(() => {
    return [...safeTicks].sort((a, b) => {
      const na = newestDate(a);
      const nb = newestDate(b);
      if (na && nb) return nb.localeCompare(na);
      if (na) return -1;
      if (nb) return 1;
      return 0;
    });
  }, [safeTicks]);

  if (safeTicks.length === 0) return null;

  return (
    <div className='flex flex-col'>
      {sortedTicks.map((t, index) => {
        const repeats = t.repeats ?? [];
        const isSelf = !!t.writable;
        const isFaUser = t.idUser != null && faUserIdSet.has(t.idUser);
        const ascents = combineAscents(t);
        const displayDate = joinDates(ascents.map((a) => a.date));
        const hasRepeats = repeats.length > 0;
        let commentContent: ReactNode = null;

        if (hasRepeats) {
          commentContent = (
            <div className={cn(quoteBlock, 'space-y-0')}>
              {ascents.map((a, idx) => (
                <div key={idx} className='flex flex-wrap gap-x-2 gap-y-0'>
                  {nonEmptyDate(a.date) ? (
                    <span className={cn(tickFlags, 'font-mono tabular-nums')}>{a.date}</span>
                  ) : null}
                  {a.comment ? (
                    <span className={cn(tickCommentSmall, 'min-w-0 flex-1 text-slate-50 not-italic')}>
                      <Linkify>{a.comment}</Linkify>
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          );
        } else if (t.comment) {
          commentContent = (
            <div className={quoteBlock}>
              <Linkify>{t.comment}</Linkify>
            </div>
          );
        }

        return (
          <div
            key={t.id != null ? `tick-${t.id}` : `tick-${t.idUser}-${index}`}
            className={cn('group', designContract.surfaces.panelRow, activityRowPad)}
          >
            <div className={cn('flex items-start', activityAvatarGap)}>
              <div className='shrink-0 pt-0.5'>
                <ClickableAvatar
                  name={t.name}
                  mediaIdentity={t.mediaIdentity}
                  userId={t.idUser}
                  size='tiny'
                  className={cn(isSelf && 'border-status-ticked/40 ring-status-ticked/25 ring-1')}
                />
              </div>

              <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                <div className={cn(profileRowRootClass, 'min-w-0 leading-snug text-pretty [overflow-wrap:anywhere]')}>
                  <Link to={`/user/${t.idUser}`} className={isSelf ? tickOwnUserLink : tickProblemLink}>
                    {t.name}
                  </Link>
                  {t.noPersonalGrade ? (
                    <>
                      {' '}
                      <NoPersonalGradeBadge />
                    </>
                  ) : (
                    <>
                      {' '}
                      <span className={cn(tickWhenGrade, 'tabular-nums')}>{t.suggestedGrade}</span>
                    </>
                  )}
                  {isFaUser ? (
                    <>
                      {' '}
                      <span className={tickFa}>FA</span>
                    </>
                  ) : null}
                  {displayDate ? (
                    <span className={cn(tickFlags, 'ml-1.5 inline text-slate-400 tabular-nums')}>{displayDate}</span>
                  ) : null}
                </div>

                {t.stars !== -1 ? (
                  <div className='flex items-center'>
                    <Stars numStars={t.stars ?? 0} size={12} />
                  </div>
                ) : null}

                {commentContent}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
