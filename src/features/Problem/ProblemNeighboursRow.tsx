import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import type { components } from '../../@types/buldreinfo/swagger';
import { problemSurroundingsLeadClass, problemSurroundingsRowClass } from './problemSurroundingsLayout';

type SectorProblem = components['schemas']['SectorProblem'];

type Props = {
  neighbourPrev?: SectorProblem;
  neighbourNext?: SectorProblem;
};

const factClass = 'text-[13px] font-normal leading-normal text-slate-300 sm:text-sm';

/** Same typography as neighbour links — also used for boulder “on rock” inline list. */
export function SectorProblemLink({
  problem,
  relation,
  currentProblemId,
}: {
  problem: SectorProblem;
  relation: 'prev' | 'next' | 'rock';
  currentProblemId?: number;
}) {
  const id = problem.id;
  if (id == null) return null;
  const nr = problem.nr ?? '';
  const name = problem.name ?? '';
  const grade = problem.grade ?? '';
  const label = `#${nr} ${name} · ${grade}`;
  const title =
    relation === 'prev' ? `Previous: ${label}` : relation === 'next' ? `Next: ${label}` : `Same rock: ${label}`;
  const ariaLabel =
    relation === 'prev'
      ? `Previous route: number ${nr}, ${name}, grade ${grade}`
      : relation === 'next'
        ? `Next route: number ${nr}, ${name}, grade ${grade}`
        : `Route on same rock: number ${nr}, ${name}, grade ${grade}`;
  const isCurrent = currentProblemId != null && id === currentProblemId;

  return (
    <Link
      to={`/problem/${id}`}
      title={title}
      aria-label={ariaLabel}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        factClass,
        designContract.typography.listLink,
        'inline-flex max-w-[min(100%,15rem)] min-w-0 items-baseline gap-1 sm:max-w-[18rem]',
        isCurrent && 'text-slate-100',
      )}
    >
      <span
        className={cn(
          designContract.typography.meta,
          'shrink-0 font-mono tabular-nums',
          isCurrent ? 'text-slate-200' : 'text-slate-400',
        )}
      >
        #{nr}
      </span>
      <span className={cn('min-w-0 flex-1 truncate', isCurrent && 'font-medium text-slate-50')}>{name}</span>
      <span className={cn(designContract.typography.grade, 'shrink-0 font-medium')}>{grade}</span>
    </Link>
  );
}

function NeighbourLink({ direction, problem }: { direction: 'prev' | 'next'; problem: SectorProblem }) {
  return <SectorProblemLink problem={problem} relation={direction} />;
}

/** Adjacent routes in the sector — matches Problem ascent metadata row typography. */
export function ProblemNeighboursRow({ neighbourPrev, neighbourNext }: Props) {
  if (!neighbourPrev?.id && !neighbourNext?.id) return null;

  return (
    <p className={problemSurroundingsRowClass}>
      <span className={problemSurroundingsLeadClass}>Neighbours:</span>
      <span className='inline-flex w-full min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1 sm:flex-1'>
        {neighbourPrev?.id != null ? <NeighbourLink direction='prev' problem={neighbourPrev} /> : null}
        {neighbourNext?.id != null ? <NeighbourLink direction='next' problem={neighbourNext} /> : null}
      </span>
    </p>
  );
}
