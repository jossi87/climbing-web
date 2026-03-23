import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ClickableAvatar } from '../../ui/Avatar/Avatar';
import { Stars } from '../../common/widgets/widgets';
import Linkify from 'linkify-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';

type Props = {
  ticks: components['schemas']['ProblemTick'][];
};

export const ProblemTicks = ({ ticks }: Props) => {
  const safeTicks = ticks ?? [];

  if (safeTicks.length === 0) return null;

  return (
    <div className='bg-surface-card border border-surface-border rounded-xl overflow-hidden text-left'>
      <div className='px-5 py-4 border-b border-surface-border flex items-center justify-between bg-surface-nav/30'>
        <h3 className='text-sm font-bold text-white uppercase tracking-widest'>Ticks</h3>
        <span className='px-2 py-0.5 rounded-full bg-surface-nav border border-surface-border text-[10px] font-black text-slate-400'>
          {safeTicks.length}
        </span>
      </div>

      <div className='divide-y divide-surface-border/50'>
        {safeTicks.map((t) => {
          const repeats = t.repeats ?? [];
          let displayDate = t.date || 'no-date';
          let commentContent: ReactNode = null;

          if (repeats.length > 0) {
            displayDate = [displayDate, ...repeats.map((r) => r.date || 'no-date')].join(', ');

            commentContent = (
              <div className='mt-3 overflow-x-auto'>
                <table className='w-full text-[11px] border-collapse'>
                  <tbody className='divide-y divide-surface-border/30'>
                    <tr>
                      <td className='py-1.5 pr-4 whitespace-nowrap font-mono text-slate-500 align-top'>
                        {t.date || 'no-date'}
                      </td>
                      <td className='py-1.5 text-slate-300 align-top italic'>{t.comment}</td>
                    </tr>
                    {repeats.map((r, idx) => (
                      <tr key={idx}>
                        <td className='py-1.5 pr-4 whitespace-nowrap font-mono text-slate-500 align-top'>
                          {r.date || 'no-date'}
                        </td>
                        <td className='py-1.5 text-slate-300 align-top italic'>{r.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          } else if (t.comment) {
            commentContent = (
              <div className='mt-2 text-slate-400 text-sm italic border-l-2 border-surface-border/50 pl-3'>
                <Linkify>{t.comment}</Linkify>
              </div>
            );
          }

          return (
            <div
              key={`${t.idUser}-${t.date}`}
              className={cn(
                'p-4 flex gap-4 items-start transition-colors',
                t.writable ? 'bg-brand/5 shadow-[inset_4px_0_0_0_#f97316]' : 'bg-transparent',
              )}
            >
              <div className='shrink-0 mt-1'>
                <ClickableAvatar
                  name={t.name}
                  mediaId={t.mediaId}
                  mediaVersionStamp={t.mediaVersionStamp}
                  size='tiny'
                />
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-baseline justify-between gap-4'>
                  <Link
                    to={`/user/${t.idUser}`}
                    className='text-sm font-bold text-white hover:text-brand transition-colors'
                  >
                    {t.name}
                  </Link>
                  <span className='text-[10px] text-slate-500 font-bold uppercase tracking-tight'>
                    {displayDate}
                  </span>
                </div>

                <div className='flex items-center gap-3 mt-1.5'>
                  {t.noPersonalGrade ? (
                    <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-500 uppercase'>
                      <X size={10} /> No personal grade
                    </span>
                  ) : (
                    <span className='text-xs font-black text-slate-200'>{t.suggestedGrade}</span>
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
