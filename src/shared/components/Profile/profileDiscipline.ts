/**
 * Discipline presentation for the profile lists.
 *
 * A problem's discipline comes from `type.group` in the database and is exposed as `group`
 * on `ProfileAscent` / `ProfileTodoProblem`. The domain is the three climbing disciplines
 * (bouldering / route / ice), so a profile can have activity in at most three groups.
 *
 * Profile lists pass the discipline on every row (`Row.discipline`), and the shared list toolbar
 * turns that into the multi-select discipline filter (`ProblemList`, `ProblemList/state.ts`).
 */

/** Canonical display order for the `type.group` discipline values. */
export const DISCIPLINE_GROUP_ORDER = ['Bouldering', 'Climbing', 'Ice'];

/** Human-readable label for a `type.group` discipline value. */
export const disciplineGroupLabel = (group: string) => {
  switch (group) {
    case 'Bouldering':
      return 'Bouldering';
    case 'Climbing':
      return 'Route climbing';
    case 'Ice':
      return 'Ice climbing';
    default:
      return group;
  }
};

/** Stable ordering of the distinct discipline groups present in a dataset. */
export const sortDisciplineGroups = (groups: string[]) =>
  [...groups].sort((a, b) => {
    const ai = DISCIPLINE_GROUP_ORDER.indexOf(a);
    const bi = DISCIPLINE_GROUP_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

/** Ordered distinct discipline groups found on the given rows (`type.group` values). */
export const distinctDisciplineGroups = (values: (string | undefined)[]) =>
  sortDisciplineGroups([...new Set(values.filter((v): v is string => !!v))]);
