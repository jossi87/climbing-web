import { type GradeSystem, buildGradeDomain } from '../../Meta/context';

/** Grade range of one grade system; a system without an entry (or without bounds) is not filtered. */
export type GradeRange = { low?: string; high?: string };

/**
 * One grade filter: the grade domain of a system that has rows, the labels the content holds for it, and the range
 * currently selected for it.
 *
 * A list can hold grades of several systems (a region-wide list, a profile covering every region the user has climbed
 * in), and weights are only comparable inside one system, which is why every system gets its own filter instead of one
 * range over a merged list: a range set for one system must never hide rows of another.
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
   * Grade labels of this system that the content holds and that a range can narrow, ordered easy → hard. The
   * placeholder `n/a` (weight 0) is left out: it marks an ungraded problem, which no range can select.
   */
  labels: string[];
  /** Active range, with bounds the system's own domain does not know dropped (a stale preference is ignored). */
  low?: string;
  high?: string;
};

/**
 * Grade filter of one grade system, from the grades the content holds for it (`presentGrades`) and the range a user
 * stored for it earlier.
 *
 * The domain is the system's *complete* domain rather than only the present labels, so the control can offer grades the
 * visible content does not use yet; {@link GradeFilter.labels} is what the content actually holds. A stored bound that
 * is not a grade of this system (left over from another region, or an older catalogue) is dropped, while the entry
 * itself is kept so the range comes back if that system returns.
 */
export const buildGradeFilter = (
  system: GradeSystem,
  presentGrades: Iterable<string>,
  stored: GradeRange = {},
): GradeFilter => {
  const { easyToHard, mapping, weight } = buildGradeDomain([system]);
  const present = new Set(presentGrades);

  return {
    gradeSystemId: system.id,
    name: system.name,
    easyToHard,
    mapping,
    labels: easyToHard.filter((grade) => present.has(grade) && (weight[grade] ?? 0) > 0),
    low: stored.low !== undefined && mapping[stored.low] !== undefined ? stored.low : undefined,
    high: stored.high !== undefined && mapping[stored.high] !== undefined ? stored.high : undefined,
  };
};
