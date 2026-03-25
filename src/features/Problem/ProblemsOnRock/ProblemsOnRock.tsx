import { useSector } from '../../../api';
import { LockSymbol, Stars } from '../../../shared/components/Widgets/Widgets';
import { Link } from 'react-router-dom';
import { MapPin, Pencil, Camera, Film, Check, Bookmark } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
            'type-label inline-flex items-center gap-2 rounded-md border px-2.5 py-1 transition-all',
            problemId === p.id
              ? 'bg-brand border-brand shadow-brand/20 shadow-sm'
              : 'bg-surface-nav border-surface-border hover:border-brand/50 opacity-85 hover:opacity-100',
          )}
        >
          <span>
            <span className={cn('mr-1 font-medium', problemId === p.id ? 'opacity-80' : 'text-slate-500')}>
              #{p.nr}
            </span>
            {p.name} <span className='ml-1 font-mono'>{p.grade}</span>
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
