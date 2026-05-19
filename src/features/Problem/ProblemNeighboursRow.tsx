import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import type { components } from '../../@types/buldreinfo/swagger';
import { problemOverviewFactClass } from './ProblemAscentOverview';
import { problemSurroundingsLeadClass, problemSurroundingsRowClass } from './problemSurroundingsLayout';

type Neighbour = components['schemas']['Neighbour'];

type Props = {
  neighbours?: Neighbour[];
};

/** Same typography as neighbour links — also used for boulder “on rock” inline list. */
export function SectorProblemLink({
  problem,
  relation,
  currentProblemId,
}: {
  problem: Neighbour;
  relation: 'neighbour' | 'rock';
  currentProblemId?: number;
}) {
  const id = problem.id;
  if (id == null) return null;
  const nr = problem.nr ?? '';
  const name = problem.name ?? '';
  const grade = problem.grade ?? '';
  const label = `#${nr} ${name} · ${grade}`;
  const title = relation === 'rock' ? `Same rock: ${label}` : label;
  const ariaLabel =
    relation === 'rock'
      ? `Route on same rock: number ${nr}, ${name}, grade ${grade}`
      : `Neighbour: number ${nr}, ${name}, grade ${grade}`;
  const isCurrent = currentProblemId != null && id === currentProblemId;
  const routeTicked = !!problem.ticked;
  const routeTodo = !!problem.todo && !routeTicked;

  return (
    <Link
      to={`/problem/${id}`}
      title={title}
      aria-label={ariaLabel}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        problemOverviewFactClass,
        'inline-flex max-w-[min(100%,15rem)] min-w-0 items-baseline gap-1 transition-colors sm:max-w-[18rem]',
        routeTicked || routeTodo ? 'hover:opacity-90' : 'hover:text-brand',
      )}
    >
      {/*
        Match First Ascent / overview fact row (`problemOverviewFactClass`). Do not use {@link designContract.typography.listLink}
        or `tickWhenGrade` here — they skew cooler/darker than the FA line.
      */}
      <span className={cn(problemOverviewFactClass, 'shrink-0 font-mono tabular-nums')}>#{nr}</span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate leading-snug font-normal antialiased',
          routeTicked
            ? designContract.ascentStatus.ticked
            : routeTodo
              ? designContract.ascentStatus.todo
              : problemOverviewFactClass,
        )}
      >
        {name}
      </span>
      <span className={cn(problemOverviewFactClass, 'shrink-0 font-mono font-normal tabular-nums')}>{grade}</span>
    </Link>
  );
}

/** Adjacent routes in the sector — matches Problem ascent metadata row typography. */
export function ProblemNeighboursRow({ neighbours }: Props) {
  if (!neighbours?.length) return null;

  return (
    <p className={problemSurroundingsRowClass}>
      <span className={problemSurroundingsLeadClass}>Neighbours:</span>
      <span className='inline-flex w-full min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1 sm:flex-1'>
        {neighbours.map((n) => (
          <SectorProblemLink key={n.id} problem={n} relation='neighbour' />
        ))}
      </span>
    </p>
  );
}
