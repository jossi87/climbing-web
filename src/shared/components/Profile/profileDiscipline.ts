import { disciplineRank, type DisciplineFlags } from '../../../utils/discipline';

/** Profile-list facet: the row’s discipline name plus its flags (`ProfileAscent` / `ProfileTodoProblem`). */
type DisciplineFacet = DisciplineFlags & { discipline?: string };

/** Ordered distinct disciplines found on the given rows: bouldering → rope climbing → ice climbing, ties by name. */
export const distinctDisciplines = (rows: DisciplineFacet[]): string[] => {
  const rankByName = new Map<string, number>();
  for (const row of rows) {
    if (row.discipline && !rankByName.has(row.discipline)) rankByName.set(row.discipline, disciplineRank(row));
  }
  return [...rankByName.entries()]
    .sort(([nameA, rankA], [nameB, rankB]) => rankA - rankB || nameA.localeCompare(nameB))
    .map(([name]) => name);
};
