import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ClickableAvatar } from '../../../shared/ui/Avatar/Avatar';
import { Stars } from '../../../shared/components/Widgets/Widgets';
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
    <div className='bg-surface-card border-surface-border overflow-hidden rounded-xl border text-left'>
      <div className='border-surface-border bg-surface-nav/30 flex items-center justify-between border-b px-5 py-4'>
        <h3 className='type-label'>Ticks</h3>
        <span className='bg-surface-nav border-surface-border rounded-full border px-2 py-0.5 text-[10px] font-black text-slate-400'>
          {safeTicks.length}
        </span>
      </div>

      <div className='divide-surface-border/50 divide-y'>
        {safeTicks.map((t) => {
          const repeats = t.repeats ?? [];
          let displayDate = t.date || 'no-date';
          let commentContent: ReactNode = null;

          if (repeats.length > 0) {
            displayDate = [displayDate, ...repeats.map((r) => r.date || 'no-date')].join(', ');

            commentContent = (
              <div className='mt-3 overflow-x-auto'>
                <table className='w-full border-collapse text-[11px]'>
                  <tbody className='divide-surface-border/30 divide-y'>
                    <tr>
                      <td className='py-1.5 pr-4 align-top font-mono whitespace-nowrap text-slate-500'>
                        {t.date || 'no-date'}
                      </td>
                      <td className='py-1.5 align-top text-slate-300 italic'>{t.comment}</td>
                    </tr>
                    {repeats.map((r, idx) => (
                      <tr key={idx}>
                        <td className='py-1.5 pr-4 align-top font-mono whitespace-nowrap text-slate-500'>
                          {r.date || 'no-date'}
                        </td>
                        <td className='py-1.5 align-top text-slate-300 italic'>{r.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          } else if (t.comment) {
            commentContent = (
              <div className='border-surface-border/50 mt-2 border-l-2 pl-3 text-sm text-slate-400 italic'>
                <Linkify>{t.comment}</Linkify>
              </div>
            );
          }

          return (
            <div
              key={`${t.idUser}-${t.date}`}
              className={cn(
                'flex items-start gap-4 p-4 transition-colors',
                t.writable ? 'bg-brand/5 shadow-[inset_4px_0_0_0_#f97316]' : 'bg-transparent',
              )}
            >
              <div className='mt-1 shrink-0'>
                <ClickableAvatar
                  name={t.name}
                  mediaId={t.mediaId}
                  mediaVersionStamp={t.mediaVersionStamp}
                  size='tiny'
                />
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex items-baseline justify-between gap-4'>
                  <Link to={`/user/${t.idUser}`} className='type-body hover:text-brand font-semibold transition-colors'>
                    {t.name}
                  </Link>
                  <span className='text-[10px] font-bold tracking-tight text-slate-500 uppercase'>{displayDate}</span>
                </div>

                <div className='mt-1.5 flex items-center gap-3'>
                  {t.noPersonalGrade ? (
                    <span className='bg-surface-nav border-surface-border inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase'>
                      <X size={10} /> No personal grade
                    </span>
                  ) : (
                    <span className={designContract.typography.label}>{t.suggestedGrade}</span>
                  )}
                  <Stars numStars={t.stars ?? 0} includeStarOutlines={true} />
                </div>

                {commentContent}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
