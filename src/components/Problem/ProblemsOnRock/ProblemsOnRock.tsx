import { useSector } from '../../../api';
import { LockSymbol, Stars } from '../../common/widgets/widgets';
import { Link } from 'react-router-dom';
import { MapPin, Pencil, Camera, Film, Check, Bookmark } from 'lucide-react';
import { cn } from '../../../lib/utils';

const useProblemsOnRock = ({
  sectorId,
  rock,
}: {
  sectorId: number | undefined;
  rock: string | undefined;
}) => {
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
            'inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] font-bold transition-all',
            problemId === p.id
              ? 'bg-brand border-brand text-white shadow-sm shadow-brand/20'
              : 'bg-surface-nav border-surface-border text-slate-300 hover:border-brand/50 hover:text-white',
          )}
        >
          <span>
            <span
              className={cn(
                'mr-1 font-medium',
                problemId === p.id ? 'text-white/80' : 'text-slate-500',
              )}
            >
              #{p.nr}
            </span>
            {p.name} <span className='font-mono ml-1'>{p.grade}</span>
          </span>

          <div className='flex items-center gap-1.5 pl-1.5 border-l border-white/10 ml-0.5'>
            <Stars numStars={p.stars} includeStarOutlines={false} />
            {p.coordinates && (
              <MapPin size={10} className={problemId === p.id ? 'text-white' : 'text-slate-400'} />
            )}
            {p.hasTopo && (
              <Pencil size={10} className={problemId === p.id ? 'text-white' : 'text-slate-400'} />
            )}
            {p.hasImages && (
              <Camera size={10} className={problemId === p.id ? 'text-white' : 'text-slate-400'} />
            )}
            {p.hasMovies && (
              <Film size={10} className={problemId === p.id ? 'text-white' : 'text-slate-400'} />
            )}
            <LockSymbol lockedAdmin={p.lockedAdmin} lockedSuperadmin={p.lockedSuperadmin} />
            {p.ticked && (
              <Check size={10} className={problemId === p.id ? 'text-white' : 'text-green-500'} />
            )}
            {p.todo && (
              <Bookmark size={10} className={problemId === p.id ? 'text-white' : 'text-blue-400'} />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
