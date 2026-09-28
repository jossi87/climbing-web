import type { Metadata } from '../../shared/components/Meta/context';
import { hours } from '../../utils/hours';
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

/** “routes” → “route”, so a single match does not read “Showing 1 routes”. */
const singular = (kind: 'routes' | 'problems'): string => (kind === 'routes' ? 'route' : 'problem');

/**
 * The header line for how much of the catalogue the filter lets through.
 *
 * Only the *shown* count is reported: the subheader directly above already lists the totals, so repeating
 * them (“Showing 6 of 2443 routes · 2437 hidden by the filter”) buries the one number that changed.
 *
 * The shown count is `totalProblems - hiddenProblems` — `hiddenProblems` is what the filter *dropped*, so
 * reading it as the result inverts the line (the bug this replaced).
 */
export const describeFilterResult = (
  { totalProblems, hiddenProblems }: Pick<State, 'totalProblems' | 'hiddenProblems'>,
  kind: 'routes' | 'problems',
): FilterResultSummary => {
  const shown = totalProblems - hiddenProblems;
  if (shown <= 0) {
    return { text: `No ${kind} match the filter.`, tone: 'warning' };
  }

  return { text: `Showing ${shown} ${shown === 1 ? singular(kind) : kind}`, tone: 'default' };
};

/** How many names of a multi-select are spelled out before the rest collapses into “+n”. */
const NAMES_SHOWN = 3;

const formatNames = (names: string[]): string =>
  names.length <= NAMES_SHOWN
    ? names.join(', ')
    : `${names.slice(0, NAMES_SHOWN).join(', ')} +${names.length - NAMES_SHOWN}`;

/**
 * “100 – 800 m”, “from 100 m” or “up to 800 m”.
 *
 * `0` is the “no bound” value of both numeric ranges (see the reducer's `DEFAULT_INITIAL_FILTER`), so it
 * never renders as a bound of its own — otherwise an unset side would read as “from 0”.
 */
const formatRange = (low: number, high: number, unit = ''): string => {
  const bound = (value: number) => `${value}${unit}`;
  if (low && high) return `${bound(low)} – ${bound(high)}`;
  return low ? `from ${bound(low)}` : `up to ${bound(high)}`;
};

/** Hour dropdowns show “12:00”; the chip should read the same. */
const formatHour = (hour: number): string => hours.find((h) => h.value === hour)?.text || `${hour}:00`;

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
 */
export const describeActiveFilters = (state: State, meta: Metadata): ActiveFilter[] => {
  const filters: ActiveFilter[] = [];
  const regions = state.unfilteredData?.regions ?? [];

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
      label: 'Regions',
      value: formatNames(regionIds.map((id) => regionNames.get(id) ?? `#${id}`)),
      clear: { action: 'reset', section: 'regions' },
    });
  }

  const areaIds = Object.keys(state.filterAreaIds).map(Number);
  if (areaIds.length) {
    filters.push({
      id: 'areas',
      label: 'Areas',
      value: formatNames(areaIds.map((id) => areaNames.get(id) ?? `#${id}`)),
      clear: { action: 'reset', section: 'areas' },
    });
  }

  const { filterGradeLow, filterGradeHigh } = state;
  if (filterGradeLow || filterGradeHigh) {
    filters.push({
      id: 'grades',
      label: 'Grade',
      value:
        filterGradeLow && filterGradeHigh
          ? `${filterGradeLow} – ${filterGradeHigh}`
          : filterGradeLow
            ? `from ${filterGradeLow}`
            : `up to ${filterGradeHigh}`,
      clear: { action: 'reset', section: 'grades' },
    });
  }

  if (state.filterFaYearLow || state.filterFaYearHigh) {
    filters.push({
      id: 'fa-year',
      label: 'FA year',
      value: formatRange(state.filterFaYearLow, state.filterFaYearHigh),
      clear: { action: 'reset', section: 'fa-year' },
    });
  }

  if (state.filterStartingAltitudeLow || state.filterStartingAltitudeHigh) {
    filters.push({
      id: 'starting-altitude',
      label: 'Altitude',
      value: formatRange(state.filterStartingAltitudeLow, state.filterStartingAltitudeHigh, ' m'),
      clear: { action: 'reset', section: 'starting-altitude' },
    });
  }

  if (state.filterHideTicked) {
    filters.push({ id: 'hide-ticked', value: 'Hide ticked', clear: { action: 'set-hide-ticked', checked: false } });
  }

  if (state.filterOnlyAdmin) {
    filters.push({ id: 'only-admin', value: 'Only admin', clear: { action: 'set-only-admin', checked: false } });
  }

  if (state.filterOnlySuperAdmin) {
    filters.push({
      id: 'only-super-admin',
      value: 'Only superadmin',
      clear: { action: 'set-only-super-admin', checked: false },
    });
  }

  const typeIds = toggledIds(state.filterTypes);
  if (typeIds.length) {
    filters.push({
      id: 'types',
      label: 'Types',
      value: formatNames(typeIds.map((id) => meta.types.find((type) => type.id === id)?.subType || `#${id}`)),
      clear: { action: 'reset', section: 'types' },
    });
  }

  const pitches = (['Single-pitch', 'Multi-pitch'] as const).filter((pitch) => state.filterPitches[pitch]);
  if (pitches.length) {
    filters.push({
      id: 'pitches',
      label: 'Pitches',
      value: pitches.join(', '),
      clear: { action: 'reset', section: 'pitches' },
    });
  }

  const orientationIds = toggledIds(state.filterSectorOrientations);
  if (orientationIds.length) {
    filters.push({
      id: 'orientations',
      label: 'Orientation',
      value: formatNames(
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
      label: 'Sun at',
      value: formatHour(state.filterOnlySunOnWallAt),
      clear: { action: 'set-only-sun-on-wall-at', hour: 0 },
    });
  }

  if (state.filterOnlyShadeOnWallAt) {
    filters.push({
      id: 'shade-on-wall-at',
      label: 'Shade at',
      value: formatHour(state.filterOnlyShadeOnWallAt),
      clear: { action: 'set-only-shade-on-wall-at', hour: 0 },
    });
  }

  return filters;
};
