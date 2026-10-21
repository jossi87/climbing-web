import type { components } from '../../@types/buldreinfo/swagger';
import {
  type GradeFilter,
  type GradeRange,
  buildGradeFilter,
} from '../../shared/components/FilterForm/GradeSelect/gradeFilter';
import type { GradeSystem } from '../../shared/components/Meta/context';

export type { GradeFilter, GradeRange };

/** Every area of the table of contents, across all regions it covers. */
const areasOf = (data: components['schemas']['Toc'] | undefined) =>
  data?.regions?.flatMap((region) => region.areas ?? []) ?? [];

/**
 * One grade filter per grade system that has graded rows in `data`, in catalogue order.
 *
 * The problems page can span several regions — a table of contents includes every region a logged-in user can read,
 * and regions do not have to share a grade system — so the list can hold grades of systems the active region does not
 * declare. Weights are only comparable within one system, which is why every system gets its own filter instead of one
 * range over a merged list of labels: a range set for one system must never hide rows of another.
 *
 * The grade system is taken from the problem's **area** (`TocArea.gradeSystemId`), which is what the backend grades
 * every problem of that area in — a problem does not carry a system of its own.
 *
 * Only grades a range can narrow count as present: the placeholder `n/a` carries weight 0 and marks an ungraded
 * problem, so a system whose rows are all ungraded has no control (see {@link GradeFilter.labels}).
 *
 * A stored bound that is not a grade of its system (e.g. left over from another region) is ignored; the entry itself
 * is kept for when that system comes back.
 */
export const buildGradeFilters = (
  data: components['schemas']['Toc'] | undefined,
  gradeSystems: GradeSystem[],
  gradeRanges: Record<string, GradeRange>,
): GradeFilter[] => {
  /** Grade system id → grade labels the list holds for it. */
  const presentGrades = new Map<number, Set<string>>();
  for (const area of areasOf(data)) {
    const gradeSystemId = area.gradeSystemId ?? 0;
    if (gradeSystemId <= 0) continue;
    for (const sector of area.sectors ?? []) {
      for (const problem of sector.problems ?? []) {
        if (!problem.grade) continue;
        const grades = presentGrades.get(gradeSystemId) ?? new Set<string>();
        grades.add(problem.grade);
        presentGrades.set(gradeSystemId, grades);
      }
    }
  }

  return gradeSystems.flatMap((system) => {
    const present = presentGrades.get(system.id);
    if (!present) return [];

    return [buildGradeFilter(system, present, gradeRanges[String(system.id)] ?? {})];
  });
};
