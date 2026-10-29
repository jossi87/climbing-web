import type { TFunction } from 'i18next';
import type { Metadata } from '../../shared/components/Meta/context';
import { hours } from '../../utils/hours';
import { routeTypeLabel } from '../../utils/routeTradGear';
import type { State, Update } from './reducer';

/**
 * One chip of the “what am I filtering on” row in the problems header.
 *
 * `clear` is the reducer action that removes *exactly* this filter, so dismissing a chip does not have to
 * guess the section it belongs to: “Hide ticked” clears only the ticked toggle, while
 * `{ action: 'reset', section: 'options' }` would also switch off “Only admin”.
 */
export type ActiveFilter = {
  /** Stable React key (also the handle used by tests). */
  id: string;
  /** Optional section prefix (“Grade”). Flags such as “Hide ticked” read fine without one. */
  label?: string;
  /** The selection itself, already formatted for display (“5+ – 7-”, “from 100 m”, “12:00”). */
  value: string;
  /** Action that removes this filter. */
  clear: Update;
};

/** Single-line text for a chip (screen readers, tooltips). */
export const activeFilterText = ({ label, value }: Pick<ActiveFilter, 'label' | 'value'>): string =>
  label ? `${label}: ${value}` : value;

export type FilterResultSummary = {
  /** “Showing 6 routes”. */
  text: string;
  /** `'warning'` when the filter leaves nothing, so the header can ink the line as a problem. */
  tone: 'default' | 'warning';
};

/**
 * The header line for how much of the catalogue the filter lets through.
 *
 * Only the *shown* count is reported: the subheader directly above already lists the totals, so repeating
 * them (“Showing 6 of 2443 routes · 2437 hidden by the filter”) buries the one number that changed.
 *
 * The shown count is `totalProblems - hiddenProblems` — `hiddenProblems` is what the filter *dropped*, so
 * reading it as the result inverts the line (the bug this replaced).
 *
 * `t` carries the noun as a counted phrase (a locale inflects “route”/“routes” itself — the singular/plural
 * helper this replaced only knew English) and the wording of the empty case.
 */
export const describeFilterResult = (
  t: TFunction,
  { totalProblems, hiddenProblems }: Pick<State, 'totalProblems' | 'hiddenProblems'>,
  kind: 'routes' | 'problems',
): FilterResultSummary => {
  const shown = totalProblems - hiddenProblems;
  if (shown <= 0) {
    return {
      text: t(kind === 'routes' ? 'filterSummary.noMatchRoutes' : 'filterSummary.noMatchProblems'),
      tone: 'warning',
    };
  }

  return {
    text: t(kind === 'routes' ? 'filterSummary.showingRoutes' : 'filterSummary.showingProblems', { count: shown }),
    tone: 'default',
  };
};

/** How many names of a multi-select are spelled out before the rest collapses into “+n”. */
const NAMES_SHOWN = 3;

/** Longest search term a chip spells out before it is cut short (the full text stays in the field). */
const SEARCH_TERM_SHOWN = 40;

const formatNames = (t: TFunction, names: string[]): string =>
  names.length <= NAMES_SHOWN
    ? names.join(', ')
    : `${names.slice(0, NAMES_SHOWN).join(', ')} ${t('filterSummary.namesMore', { count: names.length - NAMES_SHOWN })}`;

/**
 * “100 – 800 m”, “from 100 m” or “up to 800 m”.
 *
 * `0`/`''` is the “no bound” value of every range (see the reducer's `DEFAULT_INITIAL_FILTER`), so an unset
 * side never renders as a bound of its own — otherwise it would read as “from 0”.
 *
 * Grades are free text (`6a+`, `VIIIb`), so the bounds are not necessarily numbers; they arrive already
 * carrying their unit, because the glue around them (“from”, “up to”, the dash) is locale wording: Czech says
 * “od 100 m”, English “from 100 m”.
 */
const formatRange = (
  t: TFunction,
  low: number | string | null | undefined,
  high: number | string | null | undefined,
  unit = '',
): string => {
  const bound = (value: number | string | null | undefined) => `${value}${unit}`;
  if (low && high) return t('filterSummary.rangeLowHigh', { low: bound(low), high: bound(high) });
  return low ? t('filterSummary.rangeFrom', { low: bound(low) }) : t('filterSummary.rangeUpTo', { high: bound(high) });
};

/** Hour dropdowns show “12:00”; the chip should read the same. */
const formatHour = (t: TFunction, hour: number): string =>
  hours.find((h) => h.value === hour)?.text || t('filterSummary.hour', { hour });

/** Ids selected in a record of toggles (`filterTypes`, `filterSectorOrientations`). */
const toggledIds = (record: Record<number, boolean>): number[] =>
  Object.entries(record)
    .filter(([, on]) => on)
    .map(([id]) => Number(id));

/**
 * Summarises the active filter as chips, in the order the filter form presents the sections (`FILTER_SECTIONS`
 * in `./reducer`), so the chip row and the form read the same way top-to-bottom.
 *
 * Only deviations from the defaults produce a chip — the same rule that decides whether a section shows its
 * “on” affordance in the form, so the two never disagree.
 *
 * `t` is passed in rather than resolved here: the labels are the filter sections' own wording (`filter.*`),
 * and the values the short forms of `filterSummary.*`.
 */
export const describeActiveFilters = (t: TFunction, state: State, meta: Metadata): ActiveFilter[] => {
  const filters: ActiveFilter[] = [];
  const regions = state.unfilteredData?.regions ?? [];

  const searchTerm = state.filterSearch.trim();
  if (searchTerm) {
    const shown =
      searchTerm.length > SEARCH_TERM_SHOWN ? `${searchTerm.slice(0, SEARCH_TERM_SHOWN).trimEnd()}…` : searchTerm;
    filters.push({
      id: 'search',
      label: t('filterSummary.search'),
      value: t('filterSummary.searchText', { text: shown }),
      clear: { action: 'reset', section: 'search' },
    });
  }

  // Names come from the loaded tree, but the *selection* drives the chips: a stored/shared filter may point
  // at a region or area the current tree no longer contains, and that id still has to show up in the summary
  // (otherwise the strip and the form's “this section is on” affordance would disagree).
  const regionNames = new Map<number, string>();
  const areaNames = new Map<number, string>();
  for (const region of regions) {
    if (region.id !== undefined) regionNames.set(region.id, region.name || `#${region.id}`);
    for (const area of region.areas ?? []) {
      if (area.id !== undefined) areaNames.set(area.id, area.name || `#${area.id}`);
    }
  }

  const regionIds = Object.keys(state.filterRegionIds).map(Number);
  if (regionIds.length) {
    filters.push({
      id: 'regions',
      label: t('filter.regions'),
      value: formatNames(
        t,
        regionIds.map((id) => regionNames.get(id) ?? `#${id}`),
      ),
      clear: { action: 'reset', section: 'regions' },
    });
  }

  const areaIds = Object.keys(state.filterAreaIds).map(Number);
  if (areaIds.length) {
    filters.push({
      id: 'areas',
      label: t('filter.areas'),
      value: formatNames(
        t,
        areaIds.map((id) => areaNames.get(id) ?? `#${id}`),
      ),
      clear: { action: 'reset', section: 'areas' },
    });
  }

  /**
   * One chip per grade system with an active range. A page can span regions, and regions do not have to share a grade
   * system, so “Grade: 6a – 7c” would not say which of the systems it narrows. The system is only named while the page
   * actually holds more than one; a single-system list keeps the short label.
   */
  const multiGradeSystem = state.gradeFilters.length > 1;
  for (const gradeFilter of state.gradeFilters) {
    if (gradeFilter.low === undefined && gradeFilter.high === undefined) continue;
    filters.push({
      id: `grade-${gradeFilter.gradeSystemId}`,
      label: t(multiGradeSystem ? 'filterSummary.gradeWithSystem' : 'filterSummary.grade', {
        system: gradeFilter.name,
      }),
      value: formatRange(t, gradeFilter.low, gradeFilter.high),
      clear: { action: 'set-grade-range', gradeSystemId: gradeFilter.gradeSystemId },
    });
  }

  if (state.filterFaYearLow || state.filterFaYearHigh) {
    filters.push({
      id: 'fa-year',
      label: t('filterSummary.faYear'),
      value: formatRange(t, state.filterFaYearLow, state.filterFaYearHigh),
      clear: { action: 'reset', section: 'fa-year' },
    });
  }

  if (state.filterStartingAltitudeLow || state.filterStartingAltitudeHigh) {
    filters.push({
      id: 'starting-altitude',
      label: t('filterSummary.altitude'),
      value: formatRange(t, state.filterStartingAltitudeLow, state.filterStartingAltitudeHigh, ' m'),
      clear: { action: 'reset', section: 'starting-altitude' },
    });
  }

  // Stars and ascents get a chip each, like sun/shade: either can be dropped without losing the other.
  if (state.filterMinStars) {
    filters.push({
      id: 'min-stars',
      label: t('filterSummary.stars'),
      value: t('filterSummary.starsAtLeast', { stars: state.filterMinStars }),
      clear: { action: 'set-min-stars', stars: 0 },
    });
  }

  if (state.filterMinAscents) {
    filters.push({
      id: 'min-ascents',
      label: t('filterSummary.ascents'),
      value: t('filterSummary.ascentsAtLeast', { ascents: state.filterMinAscents }),
      clear: { action: 'set-min-ascents', ascents: 0 },
    });
  }

  if (state.filterHideTicked) {
    filters.push({
      id: 'hide-ticked',
      value: t('filter.hideTicked'),
      clear: { action: 'set-hide-ticked', checked: false },
    });
  }

  if (state.filterOnlyTodo) {
    filters.push({
      id: 'only-todo',
      value: t('filter.onlyTodo'),
      clear: { action: 'set-only-todo', checked: false },
    });
  }

  if (state.filterOnlyAdmin) {
    filters.push({
      id: 'only-admin',
      value: t('filter.onlyAdmin'),
      clear: { action: 'set-only-admin', checked: false },
    });
  }

  if (state.filterOnlySuperAdmin) {
    filters.push({
      id: 'only-super-admin',
      value: t('filter.onlySuperAdmin'),
      clear: { action: 'set-only-super-admin', checked: false },
    });
  }

  const typeIds = toggledIds(state.filterTypes);
  if (typeIds.length) {
    filters.push({
      id: 'types',
      label: t('filter.types'),
      value: formatNames(
        t,
        typeIds.map((id) => {
          const type = meta.types.find((candidate) => candidate.id === id);
          return (type ? routeTypeLabel(type.type, type.subType) : '') || `#${id}`;
        }),
      ),
      clear: { action: 'reset', section: 'types' },
    });
  }

  const pitches = (['Single-pitch', 'Multi-pitch'] as const).filter((pitch) => state.filterPitches[pitch]);
  if (pitches.length) {
    filters.push({
      id: 'pitches',
      label: t('filter.pitches'),
      value: pitches
        .map((pitch) => t(pitch === 'Single-pitch' ? 'filter.pitchSingle' : 'filter.pitchMulti'))
        .join(', '),
      clear: { action: 'reset', section: 'pitches' },
    });
  }

  const orientationIds = toggledIds(state.filterSectorOrientations);
  if (orientationIds.length) {
    filters.push({
      id: 'orientations',
      label: t('filter.orientation'),
      value: formatNames(
        t,
        orientationIds.map(
          (id) => meta.compassDirections.find((direction) => direction.id === id)?.direction || `#${id}`,
        ),
      ),
      clear: { action: 'reset', section: 'orientations' },
    });
  }

  // Sun and shade get a chip each — either can be dropped without losing the other.
  if (state.filterOnlySunOnWallAt) {
    filters.push({
      id: 'sun-on-wall-at',
      label: t('filterSummary.sunAt'),
      value: formatHour(t, state.filterOnlySunOnWallAt),
      clear: { action: 'set-only-sun-on-wall-at', hour: 0 },
    });
  }

  if (state.filterOnlyShadeOnWallAt) {
    filters.push({
      id: 'shade-on-wall-at',
      label: t('filterSummary.shadeAt'),
      value: formatHour(t, state.filterOnlyShadeOnWallAt),
      clear: { action: 'set-only-shade-on-wall-at', hour: 0 },
    });
  }

  return filters;
};
