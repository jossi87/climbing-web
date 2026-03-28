import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ClickableAvatar } from '../../../shared/ui/Avatar/Avatar';
import { Stars } from '../../../shared/ui/Indicators';
import Linkify from 'linkify-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';
import { designContract } from '../../../design/contract';

type Props = {
  ticks: components['schemas']['ProblemTick'][];
};

export const ProblemTicks = ({ ticks }: Props) => {
  const safeTicks = ticks ?? [];

  if (safeTicks.length === 0) return null;

  return (
    <div className='divide-surface-border/35 divide-y'>
      {safeTicks.map((t) => {
        const repeats = t.repeats ?? [];
        let displayDate = t.date || '—';
        let commentContent: ReactNode = null;

        if (repeats.length > 0) {
          displayDate = [displayDate, ...repeats.map((r) => r.date || '—')].join(' · ');

          commentContent = (
            <div className='mt-2 space-y-1.5 border-l border-white/10 pl-3'>
              <div className={cn(designContract.typography.meta, 'flex gap-2 text-slate-500')}>
                <span className='font-mono tabular-nums'>{t.date || '—'}</span>
                {t.comment ? (
                  <span className='min-w-0 flex-1 text-slate-400 italic'>
                    <Linkify>{t.comment}</Linkify>
                  </span>
                ) : null}
              </div>
              {repeats.map((r, idx) => (
                <div key={idx} className={cn(designContract.typography.meta, 'flex gap-2 text-slate-500')}>
                  <span className='font-mono tabular-nums'>{r.date || '—'}</span>
                  {r.comment ? (
                    <span className='min-w-0 flex-1 text-slate-400 italic'>
                      <Linkify>{r.comment}</Linkify>
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          );
        } else if (t.comment) {
          commentContent = (
            <p
              className={cn(
                designContract.typography.meta,
                'mt-1.5 border-l border-white/10 pl-3 text-slate-400 italic',
              )}
            >
              <Linkify>{t.comment}</Linkify>
            </p>
          );
        }

        return (
          <div
            key={`${t.idUser}-${t.date}`}
            className={cn(
              'py-3 first:pt-0 last:pb-0',
              t.writable && 'rounded-md bg-orange-500/[0.06] ring-1 ring-orange-500/25',
            )}
          >
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 shrink-0'>
                <ClickableAvatar
                  name={t.name}
                  mediaId={t.mediaId}
                  mediaVersionStamp={t.mediaVersionStamp}
                  size='tiny'
                />
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5'>
                  <Link
                    to={`/user/${t.idUser}`}
                    className={cn(designContract.typography.body, 'font-semibold text-slate-200 hover:text-slate-100')}
                  >
                    {t.name}
                  </Link>
                  <span className={cn(designContract.typography.meta, 'shrink-0 text-slate-500 tabular-nums')}>
                    {displayDate}
                  </span>
                </div>

                <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1'>
                  {t.noPersonalGrade ? (
                    <span
                      className={cn(
                        designContract.surfaces.inlineChip,
                        'py-0.5 text-[10px] font-medium text-slate-500',
                      )}
                    >
                      <X size={10} className='inline shrink-0' /> No personal grade
                    </span>
                  ) : (
                    <span className={cn(designContract.typography.grade, 'text-slate-300')}>{t.suggestedGrade}</span>
                  )}
                  <Stars numStars={t.stars ?? 0} includeStarOutlines />
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
