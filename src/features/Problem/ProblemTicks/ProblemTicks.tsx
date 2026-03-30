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

/** Compact list rows for long tick histories. */
const rowShell = 'group px-3 py-2 transition-colors hover:bg-white/[0.015] sm:px-4 sm:py-2.5';

const quoteBlock = cn(tickCommentSmall, 'mt-1 border-l border-white/10 pl-3 leading-relaxed text-pretty break-words');

export const ProblemTicks = ({ ticks }: Props) => {
  const safeTicks = ticks ?? [];

  if (safeTicks.length === 0) return null;

  return (
    <div className='flex flex-col gap-0.5'>
      {safeTicks.map((t, index) => {
        const repeats = t.repeats ?? [];
        const isSelf = !!t.writable;
        const displayDate = joinDates([t.date, ...repeats.map((r) => r.date)]);
        let commentContent: ReactNode = null;

        if (repeats.length > 0) {
          commentContent = (
            <div className={cn(quoteBlock, 'space-y-1')}>
              <div className='flex flex-wrap gap-x-2 gap-y-0.5'>
                {nonEmptyDate(t.date) ? (
                  <span className={cn(tickFlags, 'font-mono tabular-nums')}>{t.date}</span>
                ) : null}
                {t.comment ? (
                  <span className={cn(tickCommentSmall, 'min-w-0 flex-1')}>
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
                    <span className={cn(tickCommentSmall, 'min-w-0 flex-1')}>
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
            <div className='flex items-start gap-2.5 sm:gap-3'>
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
                  <span className='ml-1 inline-flex origin-left align-middle opacity-90'>
                    <Stars numStars={t.stars ?? 0} includeStarOutlines size={11} />
                  </span>
                  {displayDate ? (
                    <span
                      className={cn(
                        tickFlags,
                        'ml-1.5 inline tabular-nums transition-colors group-hover:text-slate-300',
                      )}
                    >
                      {displayDate}
                    </span>
                  ) : null}
                </div>

                {commentContent}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
