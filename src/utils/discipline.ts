/** Discipline flags from the `discipline` table — the source of truth for region tabs and the profile filter. */
export type DisciplineFlags = {
  isBouldering?: boolean;
  isRopeClimbing?: boolean;
  isIceClimbing?: boolean;
};

/** Region tabs (`/regions/:type`) in canonical discipline order (bouldering → rope climbing → ice climbing). */
export const DISCIPLINE_TYPES = ['bouldering', 'climbing', 'ice'] as const;

export type DisciplineType = (typeof DISCIPLINE_TYPES)[number];

/** Flag read order, matching {@link DISCIPLINE_TYPES}. */
const DISCIPLINE_FLAGS: readonly (keyof DisciplineFlags)[] = ['isBouldering', 'isRopeClimbing', 'isIceClimbing'];

/** `0` bouldering, `1` rope climbing, `2` ice climbing — or the flags’ length when none of them is set. */
export const disciplineRank = (flags: DisciplineFlags): number => {
  const index = DISCIPLINE_FLAGS.findIndex((flag) => flags[flag]);
  return index === -1 ? DISCIPLINE_FLAGS.length : index;
};

/** True when the flags describe the discipline behind the given `/regions/:type` tab. */
export const isDisciplineType = (flags: DisciplineFlags, type: DisciplineType): boolean =>
  disciplineRank(flags) === DISCIPLINE_TYPES.indexOf(type);

/** True when both rows belong to the same discipline. */
export const sameDiscipline = (a: DisciplineFlags, b: DisciplineFlags): boolean =>
  DISCIPLINE_FLAGS.every((flag) => Boolean(a[flag]) === Boolean(b[flag]));
