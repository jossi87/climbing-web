import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ClickableAvatar } from '../../../shared/ui/Avatar/Avatar';
import { Stars } from '../../../shared/ui/Indicators';
import Linkify from 'linkify-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickFlags,
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

/** Room between rows; light vertical padding so body + note + stars read as one unit. */
const rowShell = 'group px-3 py-1.5 transition-colors hover:bg-white/[0.015] sm:px-4 sm:py-2';

const quoteBlock = cn(
  tickCommentSmall,
  'mt-0.5 leading-snug text-pretty break-words text-slate-50 not-italic sm:leading-relaxed',
);

export const ProblemTicks = ({ ticks }: Props) => {
  const safeTicks = ticks ?? [];

  if (safeTicks.length === 0) return null;

  return (
    <div className='flex flex-col gap-3 sm:gap-3.5'>
      {safeTicks.map((t, index) => {
        const repeats = t.repeats ?? [];
        const isSelf = !!t.writable;
        const displayDate = joinDates([t.date, ...repeats.map((r) => r.date)]);
        let commentContent: ReactNode = null;

        if (repeats.length > 0) {
          commentContent = (
            <div className={cn(quoteBlock, 'space-y-0.5')}>
              <div className='flex flex-wrap gap-x-2 gap-y-0.5'>
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
                <div key={idx} className='flex flex-wrap gap-x-2 gap-y-0.5'>
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
          <div key={t.id != null ? `tick-${t.id}` : `tick-${t.idUser}-${index}`} className={rowShell}>
            <div className='flex items-start gap-2 sm:gap-2.5'>
              <div className='shrink-0'>
                <ClickableAvatar
                  name={t.name}
                  mediaId={t.mediaId}
                  mediaVersionStamp={t.mediaVersionStamp}
                  size='tiny'
                  className={cn(isSelf && 'border-emerald-400/30 ring-1 ring-emerald-400/20')}
                />
              </div>

              <div className='min-w-0 flex-1'>
                <div className={cn(profileRowRootClass, 'min-w-0 leading-snug text-pretty [overflow-wrap:anywhere]')}>
                  <Link
                    to={`/user/${t.idUser}`}
                    className={cn(tickProblemLink, isSelf && 'text-emerald-400 hover:text-emerald-300')}
                  >
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
                    <span
                      className={cn(
                        tickFlags,
                        'ml-1.5 inline text-slate-500 tabular-nums transition-colors group-hover:text-slate-400',
                      )}
                    >
                      {displayDate}
                    </span>
                  ) : null}
                </div>

                {t.stars !== -1 && (
                  <div className='mt-0.5 self-start'>
                    <Stars numStars={t.stars ?? 0} includeStarOutlines size={11} />
                  </div>
                )}

                {commentContent}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
