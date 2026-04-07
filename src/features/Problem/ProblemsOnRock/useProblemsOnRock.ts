import { useSector } from '../../../api';

/** Problems on the same rock label, sector order by `nr`. */
export function useProblemsOnRock({ sectorId, rock }: { sectorId: number | undefined; rock: string | undefined }) {
  const { data } = useSector(sectorId);
  return data?.problems
    ?.filter((problem) => problem.rock && problem.rock === rock)
    .sort((a, b) => (a.nr ?? 0) - (b.nr ?? 0));
}
