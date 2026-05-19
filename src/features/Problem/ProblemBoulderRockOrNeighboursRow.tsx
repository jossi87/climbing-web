import { ProblemNeighboursRow, SectorProblemLink } from './ProblemNeighboursRow';
import { problemSurroundingsLeadClass, problemSurroundingsRowClass } from './problemSurroundingsLayout';
import type { components } from '../../@types/buldreinfo/swagger';

type Neighbour = components['schemas']['Neighbour'];

type Props = {
  problemId: number;
  rock: string | undefined;
  neighbours?: Neighbour[];
};

/** Boulder: same-rock list replaces the neighbours row when `rock` is set; otherwise plain neighbours. */
export function ProblemBoulderRockOrNeighboursRow({ problemId, rock, neighbours }: Props) {
  if (rock) {
    return (
      <p className={problemSurroundingsRowClass} aria-label={`Problems on rock «${rock}»`}>
        <span className={problemSurroundingsLeadClass}>{rock}:</span>
        <span className='inline-flex w-full min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1 sm:flex-1'>
          {(neighbours ?? []).map((n) => (
            <SectorProblemLink key={n.id} problem={n} relation='rock' currentProblemId={problemId} />
          ))}
        </span>
      </p>
    );
  }

  return <ProblemNeighboursRow neighbours={neighbours} />;
}
