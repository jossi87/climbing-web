import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import type { components } from '../../@types/buldreinfo/swagger';

type SectorProblem = components['schemas']['SectorProblem'];

type Props = {
  neighbourPrev?: SectorProblem;
  neighbourNext?: SectorProblem;
};

const rowClass = cn(
  designContract.typography.body,
  'flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] leading-normal text-slate-300 sm:text-sm',
);

const leadClass = cn(designContract.typography.meta, 'inline-flex shrink-0 items-baseline text-slate-500');

const factClass = 'text-[13px] font-normal leading-normal text-slate-300 sm:text-sm';

function NeighbourLink({ direction, problem }: { direction: 'prev' | 'next'; problem: SectorProblem }) {
  const id = problem.id;
  if (id == null) return null;
  const nr = problem.nr ?? '';
  const name = problem.name ?? '';
  const grade = problem.grade ?? '';
  const label = `#${nr} ${name} · ${grade}`;
  const title = direction === 'prev' ? `Previous: ${label}` : `Next: ${label}`;
  const ariaLabel =
    direction === 'prev'
      ? `Previous route: number ${nr}, ${name}, grade ${grade}`
      : `Next route: number ${nr}, ${name}, grade ${grade}`;

  return (
    <Link
      to={`/problem/${id}`}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        factClass,
        'inline-flex max-w-[min(100%,15rem)] min-w-0 items-baseline gap-1 transition-colors hover:text-slate-100 sm:max-w-[18rem]',
      )}
    >
      <span className={cn(designContract.typography.meta, 'shrink-0 font-mono text-slate-400 tabular-nums')}>
        #{nr}
      </span>
      <span className='min-w-0 flex-1 truncate'>{name}</span>
      <span className={cn(designContract.typography.grade, 'shrink-0 font-medium')}>{grade}</span>
    </Link>
  );
}

/** Adjacent routes in the sector — matches Problem ascent metadata row typography. */
export function ProblemNeighboursRow({ neighbourPrev, neighbourNext }: Props) {
  if (!neighbourPrev?.id && !neighbourNext?.id) return null;

  return (
    <p className={rowClass}>
      <span className={leadClass}>Neighbours</span>
      <span className='inline-flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-1'>
        {neighbourPrev?.id != null ? <NeighbourLink direction='prev' problem={neighbourPrev} /> : null}
        {neighbourNext?.id != null ? <NeighbourLink direction='next' problem={neighbourNext} /> : null}
      </span>
    </p>
  );
}
