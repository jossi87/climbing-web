import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ClickableAvatar } from '../../../shared/ui/Avatar/Avatar';
import { Stars } from '../../../shared/ui/Indicators';
import Linkify from 'linkify-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { X } from 'lucide-react';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickFlags,
  tickOwnUserLink,
  tickProblemLink,
  tickWhenGrade,
} from '../../../shared/components/Profile/profileRowTypography';

type Props = {
  ticks: components['schemas']['ProblemTick'][];
};

function nonEmptyDate(d: string | undefined | null): d is string {
  return typeof d === 'string' && d.trim().length > 0;
}

function joinDates(dates: (string | undefined | null)[]) {
  return dates.filter(nonEmptyDate).join(' · ');
}

/** Tighter vertical padding than frontpage {@link Activity} rows so stacked entries don’t read as overly airy. */
const activityRowPad = 'px-4 py-2.5 md:px-5 md:py-2.5';
const activityAvatarGap = 'gap-3 md:gap-3';

const quoteBlock = cn(
  tickCommentSmall,
  'leading-snug text-pretty break-words text-slate-50 not-italic sm:leading-relaxed',
);

export const ProblemTicks = ({ ticks }: Props) => {
  const safeTicks = ticks ?? [];

  if (safeTicks.length === 0) return null;

  return (
    <div className='flex flex-col'>
      {safeTicks.map((t, index) => {
        const repeats = t.repeats ?? [];
        const isSelf = !!t.writable;
        const displayDate = joinDates([t.date, ...repeats.map((r) => r.date)]);
        let commentContent: ReactNode = null;

        if (repeats.length > 0) {
          commentContent = (
            <div className={cn(quoteBlock, 'space-y-0')}>
              <div className='flex flex-wrap gap-x-2 gap-y-0'>
                {nonEmptyDate(t.date) ? (
                  <span className={cn(tickFlags, 'font-mono tabular-nums')}>{t.date}</span>
                ) : null}
                {t.comment ? (
                  <span className={cn(tickCommentSmall, 'min-w-0 flex-1 text-slate-50 not-italic')}>
                    <Linkify>{t.comment}</Linkify>
                  </span>
                ) : null}
              </div>
              {repeats.map((r, idx) => (
                <div key={idx} className='flex flex-wrap gap-x-2 gap-y-0'>
                  {nonEmptyDate(r.date) ? (
                    <span className={cn(tickFlags, 'font-mono tabular-nums')}>{r.date}</span>
                  ) : null}
                  {r.comment ? (
                    <span className={cn(tickCommentSmall, 'min-w-0 flex-1 text-slate-50 not-italic')}>
                      <Linkify>{r.comment}</Linkify>
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
                  mediaId={t.mediaId}
                  mediaVersionStamp={t.mediaVersionStamp}
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
                      <span className={cn(tickFlags, 'inline-flex items-center gap-1')}>
                        <X size={10} className='inline shrink-0 opacity-70' strokeWidth={2.5} />
                        No personal grade
                      </span>
                    </>
                  ) : (
                    <>
                      {' '}
                      <span className={cn(tickWhenGrade, 'tabular-nums')}>{t.suggestedGrade}</span>
                    </>
                  )}
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
