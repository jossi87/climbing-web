import { useSector } from '../../../api';
import { LockSymbol, Stars } from '../../../shared/ui/Indicators';
import { Link } from 'react-router-dom';
import { MapPin, Pencil, Camera, Film, Check, Bookmark } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

const useProblemsOnRock = ({ sectorId, rock }: { sectorId: number | undefined; rock: string | undefined }) => {
  const { data } = useSector(sectorId);
  return data?.problems
    ?.filter((problem) => problem.rock && problem.rock === rock)
    .sort((a, b) => (a.nr ?? 0) - (b.nr ?? 0));
};

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
              ? 'border-brand/80 bg-brand/25 shadow-brand/15 text-slate-100 shadow-sm'
              : 'opacity-90 hover:opacity-100',
          )}
        >
          <span className='flex min-w-0 flex-wrap items-baseline gap-x-1'>
            <span
              className={cn(
                'font-medium',
                problemId === p.id ? 'text-slate-200' : 'text-slate-500',
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
            <Stars numStars={p.stars} includeStarOutlines={false} />
            {p.coordinates && <MapPin size={10} className={problemId === p.id ? '' : 'opacity-70'} />}
            {p.hasTopo && <Pencil size={10} className={problemId === p.id ? '' : 'opacity-70'} />}
            {p.hasImages && <Camera size={10} className={problemId === p.id ? '' : 'opacity-70'} />}
            {p.hasMovies && <Film size={10} className={problemId === p.id ? '' : 'opacity-70'} />}
            <LockSymbol lockedAdmin={p.lockedAdmin} lockedSuperadmin={p.lockedSuperadmin} />
            {p.ticked && <Check size={10} className={problemId === p.id ? '' : 'text-green-500'} />}
            {p.todo && <Bookmark size={10} className={problemId === p.id ? '' : 'text-blue-400'} />}
          </div>
        </Link>
      ))}
    </div>
  );
};
