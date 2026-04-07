import { LockSymbol, Stars } from '../../../shared/ui/Indicators';
import { Link } from 'react-router-dom';
import { MapPin, Spline, Camera, Film, Check, Bookmark } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { useProblemsOnRock } from './useProblemsOnRock';

export const ProblemsOnRock = ({
  sectorId,
  rock,
  problemId,
}: {
  problemId: number;
  sectorId: number | undefined;
  rock: string | undefined;
}) => {
  const problemsOnRock = useProblemsOnRock({ sectorId, rock });

  if (!problemsOnRock?.length || !rock) {
    return null;
  }

  return (
    <div className='flex flex-wrap gap-2 text-left'>
      {problemsOnRock.map((p) => (
        <Link
          key={p.id}
          to={`/problem/${p.id}`}
          className={cn(
            designContract.surfaces.inlineChipInteractive,
            'type-label max-w-[min(100%,20rem)] transition-all',
            problemId === p.id
              ? 'border-brand-border bg-surface-hover ring-brand-border/30 text-slate-100 shadow-sm ring-1'
              : 'opacity-90 hover:opacity-100',
          )}
        >
          <span className='flex min-w-0 flex-wrap items-baseline gap-x-1'>
            <span
              className={cn(
                'font-medium',
                problemId === p.id ? 'text-slate-200' : 'text-slate-400',
                designContract.typography.meta,
                'font-mono tabular-nums',
              )}
            >
              #{p.nr}
            </span>
            <span className='min-w-0 font-medium text-slate-200'>{p.name}</span>
            <span className={cn(designContract.typography.grade, problemId === p.id && 'text-slate-300')}>
              {p.grade}
            </span>
          </span>

          <div className='ml-0.5 flex items-center gap-1.5 border-l border-white/10 pl-1.5'>
            <Stars numStars={p.stars} size={12} />
            {p.coordinates && <MapPin size={10} className={problemId === p.id ? '' : 'opacity-70'} />}
            {p.hasTopo && (
              <span title='Topo line' className='inline-flex'>
                <Spline size={10} className={problemId === p.id ? '' : 'opacity-70'} aria-hidden />
              </span>
            )}
            {p.hasImages && <Camera size={10} className={problemId === p.id ? '' : 'opacity-70'} />}
            {p.hasMovies && <Film size={10} className={problemId === p.id ? '' : 'opacity-70'} />}
            <LockSymbol lockedAdmin={p.lockedAdmin} lockedSuperadmin={p.lockedSuperadmin} />
            {p.ticked && <Check size={10} className={designContract.ascentStatus.ticked} />}
            {p.todo && <Bookmark size={10} className={designContract.ascentStatus.todo} />}
          </div>
        </Link>
      ))}
    </div>
  );
};
