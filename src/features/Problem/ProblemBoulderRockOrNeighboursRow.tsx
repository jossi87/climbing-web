import { useProblemsOnRock } from './ProblemsOnRock';
import { ProblemNeighboursRow, SectorProblemLink } from './ProblemNeighboursRow';
import { problemSurroundingsLeadClass, problemSurroundingsRowClass } from './problemSurroundingsLayout';
import type { components } from '../../@types/buldreinfo/swagger';

type SectorProblem = components['schemas']['SectorProblem'];

type Props = {
  sectorId: number | undefined;
  problemId: number;
  rock: string | undefined;
  neighbourPrev?: SectorProblem;
  neighbourNext?: SectorProblem;
};

/** Boulder: same-rock list replaces the neighbours row when `rock` has sector matches; otherwise prev/next neighbours. */
export function ProblemBoulderRockOrNeighboursRow({ sectorId, problemId, rock, neighbourPrev, neighbourNext }: Props) {
  const problemsOnRock = useProblemsOnRock({ sectorId, rock });
  const showOnRock = Boolean(rock && problemsOnRock && problemsOnRock.length > 0);

  if (showOnRock) {
    return (
      <p className={problemSurroundingsRowClass} aria-label={`Problems on rock «${rock}»`}>
        <span className={problemSurroundingsLeadClass}>{rock}:</span>
        <span className='inline-flex w-full min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1 sm:flex-1'>
          {(problemsOnRock ?? []).map((p) => (
            <SectorProblemLink key={p.id} problem={p} relation='rock' currentProblemId={problemId} />
          ))}
        </span>
      </p>
    );
  }

  return <ProblemNeighboursRow neighbourPrev={neighbourPrev} neighbourNext={neighbourNext} />;
}
