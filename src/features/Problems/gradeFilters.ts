import type { components } from '../../@types/buldreinfo/swagger';
import { type GradeSystem, buildGradeDomain } from '../../shared/components/Meta/context';

/** Grade range of one grade system; a system without an entry (or without bounds) is not filtered. */
export type GradeRange = { low?: string; high?: string };

/**
 * One grade filter of the problems list: the grade domain of a system that has rows, the labels the list holds, and
 * the range currently selected for that system.
 */
export type GradeFilter = {
  gradeSystemId: number;
  /** Grade system name (`Scandinavian/French`, `UIAA`, …), used to label the control while the list spans several. */
  name: string;
  /** Grades of this system ordered easy → hard. */
  easyToHard: string[];
  /** Grade label → index in {@link easyToHard}. */
  mapping: Record<string, number>;
  /**
   * Grade labels of this system that the list holds and that a range can narrow, ordered easy → hard. The placeholder
   * `n/a` (weight 0) is left out: it marks an ungraded problem, which no range can select.
   */
  labels: string[];
  /** Active range, with bounds the system's own domain does not know dropped (see {@link buildGradeFilters}). */
  low?: string;
  high?: string;
};

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

    const { easyToHard, mapping, weight } = buildGradeDomain([system], false);
    /** A system may repeat a label; the list shows it once. */
    const grades = [...new Set(easyToHard)];
    const stored = gradeRanges[String(system.id)] ?? {};

    return [
      {
        gradeSystemId: system.id,
        name: system.name,
        easyToHard: grades,
        mapping,
        labels: grades.filter((grade) => present.has(grade) && (weight[grade] ?? 0) > 0),
        low: stored.low !== undefined && mapping[stored.low] !== undefined ? stored.low : undefined,
        high: stored.high !== undefined && mapping[stored.high] !== undefined ? stored.high : undefined,
      },
    ];
  });
};
