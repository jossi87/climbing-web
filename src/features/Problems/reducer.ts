import { useCallback, useEffect, useReducer, useState } from 'react';
import { neverGuard } from '../../utils/neverGuard';
import { type GradeSystem, useMeta } from '../../shared/components/Meta/context';
import { itemLocalStorage } from '../../utils/use-local-storage';
import type { components } from '../../@types/buldreinfo/swagger';
import { captureSentryException, captureSentryMessage } from '../../utils/sentry';
import { applyFilterDiff, decodeFilterHash, encodeFilterHash, filterDiff } from './filterHash';
import { type GradeFilter, type GradeRange, buildGradeFilters } from './gradeFilters';
import { startingAltitudeOf } from './startingAltitude';

type FilterResults = {
  /** The catalogue with everything the active filter drops taken out — i.e. what the list renders. */
  filteredData: components['schemas']['Toc'];
  /**
   * One grade filter per grade system that has rows in `unfilteredData`, each with its own domain and range (see
   * `buildGradeFilters`). Derived here rather than in the filter form so the control and the predicate always agree.
   */
  gradeFilters: GradeFilter[];
  /**
   * How much the active filter **dropped**, so the UI reports “showing” as `total* - hidden*`.
   * (Named after what it counts: these used to be `filtered*`, which read as “what survived filtering” and
   * had the header claim “Showing 2437 of 2443 routes · 6 hidden” for a filter that showed 6 routes.)
   */
  hiddenRegions: number;
  hiddenAreas: number;
  hiddenSectors: number;
  hiddenProblems: number;
};

type FilterInputs = {
  /**
   * Free text matched against the problem's name and description (see `filter`). Empty means “no search”, like
   * `0` does for the numeric bounds.
   */
  filterSearch: string;
  filterRegionIds: Record<number, true>;
  filterAreaIds: Record<number, true>;
  filterOnlySunOnWallAt: number;
  filterOnlyShadeOnWallAt: number;
  filterSectorOrientations: Record<number, boolean>;
  /** Grade range per grade system (keyed by system id) — the list can hold grades of several systems. */
  filterGradeRanges: Record<string, GradeRange>;
  filterFaYearLow: number;
  filterFaYearHigh: number;
  filterStartingAltitudeLow: number;
  filterStartingAltitudeHigh: number;
  /** Lower bound on the average star rating; `0` means “no bound”. */
  filterMinStars: number;
  /** Lower bound on the number of registered ascents; `0` means “no bound”. */
  filterMinAscents: number;
  filterTypes: Record<number, boolean>;
  filterPitches: {
    'Single-pitch': boolean;
    'Multi-pitch': boolean;
  };
  filterHideTicked: boolean;
  /** Only the problems the signed-in user has on their todo list. */
  filterOnlyTodo: boolean;
  filterOnlyAdmin: boolean;
  filterOnlySuperAdmin: boolean;
};

/**
 * Default (unfiltered) state of the filter form.
 *
 * `0` is the "no bound" value for both numeric ranges (`filterFaYear*` and
 * `filterStartingAltitude*`) and for the thresholds (`filterMinStars`, `filterMinAscents`).
 * Code that applies them must therefore treat `0` as "unbounded" (using `||`, not `??`) —
 * otherwise an unset bound is compared as a real year/altitude/threshold and hides every row
 * (e.g. "FA year from 1990" while `filterFaYearHigh` is still 0 matches nothing).
 */
const DEFAULT_INITIAL_FILTER: FilterInputs = {
  filterSearch: '',
  filterRegionIds: {},
  filterAreaIds: {},
  filterGradeRanges: {},
  filterFaYearLow: 0,
  filterFaYearHigh: 0,
  filterStartingAltitudeLow: 0,
  filterStartingAltitudeHigh: 0,
  filterMinStars: 0,
  filterMinAscents: 0,
  filterHideTicked: false,
  filterOnlyTodo: false,
  filterPitches: {
    'Single-pitch': false,
    'Multi-pitch': false,
  },
  filterTypes: {},
  filterOnlyAdmin: false,
  filterOnlySuperAdmin: false,
  filterOnlySunOnWallAt: 0,
  filterOnlyShadeOnWallAt: 0,
  filterSectorOrientations: {},
} as const;

type FilterState = FilterInputs & FilterResults;

type UiState = {
  visible: boolean;
};

type DataState = {
  /** Every grade system the catalogue knows; the source of each grade filter's domain (see `buildGradeFilters`). */
  gradeSystems: GradeSystem[];
  totalRegions: number;
  totalAreas: number;
  totalSectors: number;
  totalProblems: number;
  unfilteredData: components['schemas']['Toc'];
};

export type State = UiState & DataState & FilterState;

/**
 * The filter selection carried by `state`, i.e. everything that a shared filter link reproduces.
 *
 * Enumerated explicitly instead of being derived from the state keys so that a field added to
 * {@link FilterInputs} has to be added here too (the compiler enforces it) — the previous
 * "pick the state entries whose *flattened* key matches a default key" approach silently dropped
 * fields whose default is a non-empty object, so e.g. pitch filters could never be shared.
 */
export const filterInputsOf = (state: State): FilterInputs => ({
  filterSearch: state.filterSearch,
  filterRegionIds: state.filterRegionIds,
  filterAreaIds: state.filterAreaIds,
  filterOnlySunOnWallAt: state.filterOnlySunOnWallAt,
  filterOnlyShadeOnWallAt: state.filterOnlyShadeOnWallAt,
  filterSectorOrientations: state.filterSectorOrientations,
  filterGradeRanges: state.filterGradeRanges,
  filterFaYearLow: state.filterFaYearLow,
  filterFaYearHigh: state.filterFaYearHigh,
  filterStartingAltitudeLow: state.filterStartingAltitudeLow,
  filterStartingAltitudeHigh: state.filterStartingAltitudeHigh,
  filterMinStars: state.filterMinStars,
  filterMinAscents: state.filterMinAscents,
  filterTypes: state.filterTypes,
  filterPitches: state.filterPitches,
  filterHideTicked: state.filterHideTicked,
  filterOnlyTodo: state.filterOnlyTodo,
  filterOnlyAdmin: state.filterOnlyAdmin,
  filterOnlySuperAdmin: state.filterOnlySuperAdmin,
});

export type ResetField =
  | 'all'
  | 'search'
  | 'regions'
  | 'areas'
  | 'fa-year'
  | 'options'
  | 'orientations'
  | 'conditions'
  | 'pitches'
  | 'types'
  | 'grades'
  | 'starting-altitude'
  | 'stars-ascents';

/** Filter form sections, in the order they are rendered (`'all'` is the header's “Clear filter”). */
export const FILTER_SECTIONS = [
  'search',
  'regions',
  'areas',
  'grades',
  'fa-year',
  'starting-altitude',
  'stars-ascents',
  'options',
  'types',
  'pitches',
  'orientations',
  'conditions',
] as const satisfies readonly ResetField[];

/**
 * Whether a filter section currently differs from the unfiltered defaults.
 *
 * Drives the “this filter is on” highlight and the reset button of each group header in the
 * filter form — the sections are the only place that knows the defaults, so the check lives here
 * next to {@link DEFAULT_INITIAL_FILTER} rather than being re-implemented in the UI.
 */
export const isFilterSectionActive = (state: State, section: ResetField): boolean => {
  switch (section) {
    case 'all':
      return FILTER_SECTIONS.some((s) => isFilterSectionActive(state, s));
    case 'search':
      // Whitespace-only is not a search: the form treats a blank field as “no filter” too.
      return state.filterSearch.trim().length > 0;
    case 'regions':
      return Object.keys(state.filterRegionIds).length > 0;
    case 'areas':
      return Object.keys(state.filterAreaIds).length > 0;
    case 'grades':
      return state.gradeFilters.some(({ low, high }) => low !== undefined || high !== undefined);
    case 'fa-year':
      return !!state.filterFaYearLow || !!state.filterFaYearHigh;
    case 'starting-altitude':
      return !!state.filterStartingAltitudeLow || !!state.filterStartingAltitudeHigh;
    case 'stars-ascents':
      return !!state.filterMinStars || !!state.filterMinAscents;
    case 'options':
      return state.filterHideTicked || state.filterOnlyTodo || state.filterOnlyAdmin || state.filterOnlySuperAdmin;

    case 'types':
      return Object.values(state.filterTypes).some(Boolean);
    case 'pitches':
      return state.filterPitches['Single-pitch'] || state.filterPitches['Multi-pitch'];
    case 'orientations':
      return Object.values(state.filterSectorOrientations).some(Boolean);
    case 'conditions':
      return !!state.filterOnlySunOnWallAt || !!state.filterOnlyShadeOnWallAt;
    default:
      return neverGuard(section, false);
  }
};

export type Update =
  | { action: 'set-data'; data: components['schemas']['Toc'] }
  | {
      action: 'toggle-pitches';
      option: keyof State['filterPitches'];
      checked: boolean;
    }
  | {
      action: 'toggle-types';
      option: keyof State['filterTypes'];
      checked: boolean;
    }
  | { action: 'toggle-region'; regionId: number; enabled: boolean }
  | { action: 'toggle-area'; areaId: number; enabled: boolean }
  | { action: 'set-only-sun-on-wall-at'; hour: number }
  | { action: 'set-only-shade-on-wall-at'; hour: number }
  | {
      action: 'toggle-sector-orientations';
      option: keyof State['filterSectorOrientations'];
      checked: boolean;
    }
  | {
      action: 'set-grade-systems';
      gradeSystems: GradeSystem[];
    }
  | { action: 'set-grade-range'; gradeSystemId: number; low?: string; high?: string }
  | { action: 'set-fa-years'; low: number; high: number }
  | { action: 'set-starting-altitudes'; low: number; high: number }
  | { action: 'set-search'; text: string }
  /** `0` clears the threshold (see `DEFAULT_INITIAL_FILTER`). */
  | { action: 'set-min-stars'; stars: number }
  | { action: 'set-min-ascents'; ascents: number }
  | { action: 'set-hide-ticked'; checked: boolean }
  | { action: 'set-only-todo'; checked: boolean }
  | { action: 'set-only-admin'; checked: boolean }
  | { action: 'set-only-super-admin'; checked: boolean }
  | ({ action: 'set-starting-altitude' } & ({ low: number } | { high: number }))
  | ({ action: 'set-fa-year' } & ({ low: number } | { high: number }))
  | { action: 'close-filter' }
  | { action: 'open-filter' }
  | { action: 'toggle-filter' }
  | { action: 'reset'; section: ResetField }
  // Not intended to be used "externally" (ie, at the component level)
  | ({ action: 'init-filter-state' } & Partial<FilterInputs>);

/**
 * Case- and diacritic-insensitive form of a string, for matching typed text against problem names.
 *
 * Searching is a convenience, not an exact lookup, so “ostlandet” has to find “Østlandet” and a user without
 * Norwegian letters on the keyboard is not locked out. `normalize('NFD')` + stripping the combining marks
 * handles å/ä/é, but not æ/ø/đ, which have no decomposition, so those are folded by hand.
 */
const searchKey = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/đ/g, 'd')
    .replace(/ß/g, 'ss');

const filter = (state: State): State => {
  const {
    filterSearch,
    filterRegionIds,
    filterAreaIds,
    filterOnlySunOnWallAt,
    filterOnlyShadeOnWallAt,
    filterSectorOrientations,
    filterGradeRanges,
    filterFaYearHigh,
    filterFaYearLow,
    filterStartingAltitudeHigh,
    filterStartingAltitudeLow,
    filterMinStars,
    filterMinAscents,
    filterHideTicked,
    filterOnlyTodo,
    filterOnlyAdmin,
    filterOnlySuperAdmin,
    filterPitches,
    filterTypes,
    gradeSystems,
    unfilteredData,
  } = state;
  /**
   * One filter per grade system that has rows, each with its own domain and range. Computed from the unfiltered
   * catalogue, so the controls keep their labels while a range narrows the list.
   */
  const gradeFilters = buildGradeFilters(unfilteredData, gradeSystems, filterGradeRanges);
  const gradeFiltersById = new Map(gradeFilters.map((gradeFilter) => [gradeFilter.gradeSystemId, gradeFilter]));
  const filteredOut = {
    regions: 0,
    areas: 0,
    sectors: 0,
    problems: 0,
  };

  const filterRegionIdsCount = Object.keys(filterRegionIds).length;
  const filterAreaIdsCount = Object.keys(filterAreaIds).length;

  /**
   * Search terms, normalised once for the whole pass. Every word has to appear in the name or the description,
   * so “kant cruiser” matches “… kant … cruiser …” in either order — a single `includes` would fail on the
   * moment the user adds a second word.
   */
  const searchWords = searchKey(filterSearch).split(/\s+/).filter(Boolean);

  const filteredData = {
    ...unfilteredData,
    regions: unfilteredData?.regions
      ?.map((region) => {
        return {
          ...region,
          areas: region.areas
            ?.map((area) => {
              /**
               * The grade filter of the area's own grade system — `undefined` while that system has no rows (or the
               * payload predates `TocArea.gradeSystemId`), in which case the area's rows are not grade-filtered.
               */
              const areaGradeFilter = gradeFiltersById.get(area.gradeSystemId ?? 0);
              return {
                ...area,
                sectors: area.sectors
                  ?.map((sector) => {
                    return {
                      ...sector,
                      problems: sector.problems?.filter((problem) => {
                        if (filterRegionIdsCount > 0) {
                          if (!filterRegionIds[region.id ?? -1]) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }
                        if (filterAreaIdsCount > 0) {
                          if (!filterAreaIds[area.id ?? -1]) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (searchWords.length > 0) {
                          const haystack = searchKey(`${problem.name ?? ''} ${problem.description ?? ''}`);
                          if (!searchWords.every((word) => haystack.includes(word))) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterOnlySunOnWallAt > 0) {
                          const sunFromHour = sector.sunFromHour || area.sunFromHour;
                          const sunToHour = sector.sunToHour || area.sunToHour;
                          if (
                            !sunFromHour ||
                            !sunToHour ||
                            sunFromHour > filterOnlySunOnWallAt ||
                            sunToHour < filterOnlySunOnWallAt
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterOnlyShadeOnWallAt > 0) {
                          const sunFromHour = sector.sunFromHour || area.sunFromHour;
                          const sunToHour = sector.sunToHour || area.sunToHour;
                          if (
                            !sunFromHour ||
                            !sunToHour ||
                            (sunFromHour <= filterOnlyShadeOnWallAt && sunToHour > filterOnlyShadeOnWallAt)
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterSectorOrientations && Object.values(filterSectorOrientations).some((v) => !!v)) {
                          const orientationId = sector.orientationManual?.id || sector.orientationCalculated?.id;
                          if (!orientationId || !filterSectorOrientations[orientationId]) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterHideTicked) {
                          if (problem.ticked) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterOnlyTodo) {
                          if (!problem.todo) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterTypes && Object.values(filterTypes).some((v) => !!v)) {
                          if (!problem.t?.id || !filterTypes[problem.t?.id]) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterPitches && (filterPitches['Multi-pitch'] || filterPitches['Single-pitch'])) {
                          if (!filterPitches['Multi-pitch'] && problem.numPitches && problem.numPitches >= 2) {
                            filteredOut.problems += 1;
                            return false;
                          }
                          if (
                            !filterPitches['Single-pitch'] &&
                            (problem.numPitches === undefined || problem.numPitches <= 1)
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (
                          areaGradeFilter &&
                          (areaGradeFilter.low !== undefined || areaGradeFilter.high !== undefined)
                        ) {
                          // Each system is filtered against its own range: a range set for one system never hides
                          // rows graded in another (a region-wide list can hold several systems).
                          const index = problem.grade ? areaGradeFilter.mapping[problem.grade] : undefined;
                          const low =
                            areaGradeFilter.low !== undefined
                              ? areaGradeFilter.mapping[areaGradeFilter.low]
                              : undefined;
                          const high =
                            areaGradeFilter.high !== undefined
                              ? areaGradeFilter.mapping[areaGradeFilter.high]
                              : undefined;

                          // A grade the system does not know (project, or a label missing from the catalogue) is hidden
                          // like before: an active range means “only the grades I asked for”.
                          if (
                            index === undefined ||
                            (low !== undefined && index < low) ||
                            (high !== undefined && index > high)
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterFaYearLow || filterFaYearHigh) {
                          // 0 means "no bound" — widen it instead of comparing against 0.
                          const low = filterFaYearLow || Number.MIN_SAFE_INTEGER;
                          const high = filterFaYearHigh || Number.MAX_SAFE_INTEGER;
                          const matchesYear = (year?: number) => !!year && year >= low && year <= high;
                          // The year shown for a problem is its aid ascent (FA) year when it has
                          // one and its first free ascent (FFA) year otherwise; the years offered
                          // in the filter come from `problem.fa_date` (`ffaYear`). Matching only
                          // `faYear` would hide (almost) everything — it is 0 unless the problem
                          // has a registered aid ascent.
                          if (!matchesYear(problem.faYear) && !matchesYear(problem.ffaYear)) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterStartingAltitudeLow || filterStartingAltitudeHigh) {
                          // 0 means "no bound" on either side of the range.
                          const low = filterStartingAltitudeLow || Number.MIN_SAFE_INTEGER;
                          const high = filterStartingAltitudeHigh || Number.MAX_SAFE_INTEGER;
                          // The altitude the list shows for the row — registered value, else its map elevation
                          // (`startingAltitudeOf`). A problem with neither reads as 0, which is what it has always
                          // compared as: out of range for a minimum, but inside a maximum-only range.
                          const actualAlt = startingAltitudeOf(problem)?.meters ?? 0;

                          if (actualAlt < low || actualAlt > high) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        // Star ratings are averages (`2.67`), so the threshold is a floor rather than a bucket: “2 ★
                        // and up” keeps the 2.67 as well. An unrated problem fails every non-zero bound.
                        if (filterMinStars > 0 && (problem.stars ?? 0) < filterMinStars) {
                          filteredOut.problems += 1;
                          return false;
                        }

                        // A problem nobody has ascended has no `numTicks` (zero ascents), which fails every bound.
                        if (filterMinAscents > 0 && (problem.numTicks ?? 0) < filterMinAscents) {
                          filteredOut.problems += 1;
                          return false;
                        }

                        if (filterOnlySuperAdmin) {
                          const locked = problem.lockedSuperadmin;
                          if (!locked) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterOnlyAdmin) {
                          const locked = problem.lockedAdmin;
                          if (!locked) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        return true;
                      }),
                    };
                  })
                  .filter(({ lockedAdmin, lockedSuperadmin, problems }) => {
                    if (
                      !problems?.length ||
                      (filterOnlyAdmin && !lockedAdmin) ||
                      (filterOnlySuperAdmin && !lockedSuperadmin)
                    ) {
                      filteredOut.sectors += 1;
                      return false;
                    }
                    return true;
                  }),
              };
            })
            .filter(({ lockedAdmin, lockedSuperadmin, sectors, id }) => {
              if (
                !sectors?.length ||
                (filterOnlyAdmin && !lockedAdmin) ||
                (filterOnlySuperAdmin && !lockedSuperadmin) ||
                (filterAreaIdsCount && !filterAreaIds[id ?? -1])
              ) {
                filteredOut.areas += 1;
                return false;
              }
              return true;
            }),
        };
      })
      .filter(({ id }) => {
        if (filterRegionIdsCount && !filterRegionIds[id ?? -1]) {
          filteredOut.regions += 1;
          return false;
        }
        return true;
      }),
  };

  return {
    ...state,
    filteredData,
    gradeFilters,
    hiddenRegions: filteredOut.regions,
    hiddenAreas: filteredOut.areas,
    hiddenSectors: filteredOut.sectors,
    hiddenProblems: filteredOut.problems,
  };
};

const reducer = (state: State, update: Update): State => {
  const { action } = update;
  switch (action) {
    case 'set-data': {
      const { data } = update;
      const { numRegions, numAreas, numSectors, numProblems } = data;

      return {
        ...state,
        totalRegions: numRegions ?? 0,
        totalAreas: numAreas ?? 0,
        totalSectors: numSectors ?? 0,
        totalProblems: numProblems ?? 0,
        unfilteredData: data,
      };
    }

    case 'toggle-pitches': {
      const { checked, option } = update;

      return {
        ...state,
        filterPitches: {
          ...state.filterPitches,
          [option]: checked,
        },
      };
    }

    case 'toggle-types': {
      const { checked, option } = update;
      return {
        ...state,
        filterTypes: {
          ...state.filterTypes,
          [option]: checked,
        },
      };
    }

    case 'toggle-region': {
      const { regionId, enabled } = update;
      if (enabled) {
        return {
          ...state,
          filterRegionIds: {
            ...state.filterRegionIds,
            [regionId]: true,
          },
        };
      }

      const filterRegionIds = {
        ...state.filterRegionIds,
      };
      delete filterRegionIds[regionId];

      return {
        ...state,
        filterRegionIds,
      };
    }

    case 'toggle-area': {
      const { areaId, enabled } = update;
      if (enabled) {
        return {
          ...state,
          filterAreaIds: {
            ...state.filterAreaIds,
            [areaId]: true,
          },
        };
      }

      const filterAreaIds = {
        ...state.filterAreaIds,
      };
      delete filterAreaIds[areaId];

      return {
        ...state,
        filterAreaIds,
      };
    }

    case 'set-search': {
      const { text } = update;
      // Stored exactly as typed (trailing spaces and all) so the caret does not jump while editing; the
      // predicate splits and trims when it matches.
      return {
        ...state,
        filterSearch: text,
      };
    }

    case 'set-only-sun-on-wall-at': {
      const { hour } = update;
      return {
        ...state,
        filterOnlySunOnWallAt: hour,
      };
    }

    case 'set-only-shade-on-wall-at': {
      const { hour } = update;
      return {
        ...state,
        filterOnlyShadeOnWallAt: hour,
      };
    }

    case 'toggle-sector-orientations': {
      const { checked, option } = update;
      return {
        ...state,
        filterSectorOrientations: {
          ...state.filterSectorOrientations,
          [option]: checked,
        },
      };
    }

    case 'set-grade-systems': {
      const { gradeSystems } = update;
      return {
        ...state,
        gradeSystems,
      };
    }

    case 'set-grade-range': {
      const { gradeSystemId, low, high } = update;
      const key = String(gradeSystemId);
      const filterGradeRanges = { ...state.filterGradeRanges };

      // An entry without bounds is dropped, so a cleared system never lingers in the URL or storage.
      if (low === undefined && high === undefined) {
        delete filterGradeRanges[key];
      } else {
        filterGradeRanges[key] = { low, high };
      }

      return {
        ...state,
        filterGradeRanges,
      };
    }

    case 'set-fa-years': {
      const { low, high } = update;
      return {
        ...state,
        filterFaYearLow: low,
        filterFaYearHigh: high,
      };
    }

    case 'set-fa-year': {
      const low = 'low' in update ? update.low : undefined;
      const high = 'high' in update ? update.high : undefined;
      return {
        ...state,
        filterFaYearLow: low ?? state.filterFaYearLow ?? undefined,
        filterFaYearHigh: high ?? state.filterFaYearHigh ?? undefined,
      };
    }

    case 'set-starting-altitudes': {
      const { low, high } = update;
      return {
        ...state,
        filterStartingAltitudeLow: low,
        filterStartingAltitudeHigh: high,
      };
    }

    case 'set-starting-altitude': {
      const low = 'low' in update ? update.low : undefined;
      const high = 'high' in update ? update.high : undefined;
      return {
        ...state,
        filterStartingAltitudeLow: low ?? state.filterStartingAltitudeLow ?? undefined,
        filterStartingAltitudeHigh: high ?? state.filterStartingAltitudeHigh ?? undefined,
      };
    }

    case 'set-min-stars': {
      const { stars } = update;
      return {
        ...state,
        filterMinStars: stars,
      };
    }

    case 'set-min-ascents': {
      const { ascents } = update;
      return {
        ...state,
        filterMinAscents: ascents,
      };
    }

    case 'set-hide-ticked': {
      const { checked } = update;
      return {
        ...state,
        filterHideTicked: checked,
      };
    }

    case 'set-only-todo': {
      const { checked } = update;
      return {
        ...state,
        filterOnlyTodo: checked,
      };
    }

    case 'set-only-admin': {
      const { checked } = update;
      return {
        ...state,
        filterOnlyAdmin: checked,
        filterOnlySuperAdmin: false,
      };
    }

    case 'set-only-super-admin': {
      const { checked } = update;
      return {
        ...state,
        filterOnlyAdmin: false,
        filterOnlySuperAdmin: checked,
      };
    }

    case 'reset': {
      const { section } = update;

      switch (section) {
        case 'all': {
          return {
            ...state,
            ...DEFAULT_INITIAL_FILTER,
          };
        }
        case 'search': {
          return {
            ...state,
            filterSearch: DEFAULT_INITIAL_FILTER.filterSearch,
          };
        }
        case 'regions': {
          return {
            ...state,
            filterRegionIds: DEFAULT_INITIAL_FILTER.filterRegionIds,
          };
        }
        case 'areas': {
          return {
            ...state,
            filterAreaIds: DEFAULT_INITIAL_FILTER.filterAreaIds,
          };
        }
        case 'grades': {
          return {
            ...state,
            filterGradeRanges: DEFAULT_INITIAL_FILTER.filterGradeRanges,
          };
        }
        case 'fa-year': {
          return {
            ...state,
            filterFaYearLow: DEFAULT_INITIAL_FILTER.filterFaYearLow,
            filterFaYearHigh: DEFAULT_INITIAL_FILTER.filterFaYearHigh,
          };
        }
        case 'starting-altitude': {
          return {
            ...state,
            filterStartingAltitudeLow: DEFAULT_INITIAL_FILTER.filterStartingAltitudeLow,
            filterStartingAltitudeHigh: DEFAULT_INITIAL_FILTER.filterStartingAltitudeHigh,
          };
        }
        case 'stars-ascents': {
          return {
            ...state,
            filterMinStars: DEFAULT_INITIAL_FILTER.filterMinStars,
            filterMinAscents: DEFAULT_INITIAL_FILTER.filterMinAscents,
          };
        }
        case 'options': {
          return {
            ...state,
            filterHideTicked: DEFAULT_INITIAL_FILTER.filterHideTicked,
            filterOnlyTodo: DEFAULT_INITIAL_FILTER.filterOnlyTodo,
            filterOnlyAdmin: DEFAULT_INITIAL_FILTER.filterOnlyAdmin,
            filterOnlySuperAdmin: DEFAULT_INITIAL_FILTER.filterOnlySuperAdmin,
          };
        }
        case 'conditions': {
          return {
            ...state,
            filterOnlySunOnWallAt: DEFAULT_INITIAL_FILTER.filterOnlySunOnWallAt,
            filterOnlyShadeOnWallAt: DEFAULT_INITIAL_FILTER.filterOnlyShadeOnWallAt,
          };
        }
        case 'orientations': {
          return {
            ...state,
            filterSectorOrientations: DEFAULT_INITIAL_FILTER.filterSectorOrientations,
          };
        }
        case 'pitches': {
          return {
            ...state,
            filterPitches: DEFAULT_INITIAL_FILTER.filterPitches,
          };
        }
        case 'types': {
          return {
            ...state,
            filterTypes: DEFAULT_INITIAL_FILTER.filterTypes,
          };
        }
        default: {
          return neverGuard(section, state);
        }
      }
    }

    case 'close-filter': {
      return {
        ...state,
        visible: false,
      };
    }

    case 'open-filter': {
      return {
        ...state,
        visible: true,
      };
    }

    case 'toggle-filter': {
      return {
        ...state,
        visible: !state.visible,
      };
    }

    case 'init-filter-state': {
      return {
        ...state,
        ...DEFAULT_INITIAL_FILTER,
        ...update,
      };
    }

    default: {
      return neverGuard(action, state);
    }
  }
};

const storageItems = {
  search: itemLocalStorage('filter/search', DEFAULT_INITIAL_FILTER.filterSearch),
  regionIds: itemLocalStorage('filter/region-ids', DEFAULT_INITIAL_FILTER.filterRegionIds),
  areaIds: itemLocalStorage('filter/area-ids', DEFAULT_INITIAL_FILTER.filterAreaIds),
  onlySunOnWallAt: itemLocalStorage('filter/only-sun-on-wall-at', DEFAULT_INITIAL_FILTER.filterOnlySunOnWallAt),
  onlyShadeOnWallAt: itemLocalStorage('filter/only-shade-on-wall-at', DEFAULT_INITIAL_FILTER.filterOnlyShadeOnWallAt),
  sectorOrientations: itemLocalStorage('filter/sector-orientations', DEFAULT_INITIAL_FILTER.filterSectorOrientations),
  gradeRanges: itemLocalStorage<Record<string, GradeRange>>(
    'filter/grade-ranges',
    DEFAULT_INITIAL_FILTER.filterGradeRanges,
  ),
  faYearHigh: itemLocalStorage('filter/fa-year/high', DEFAULT_INITIAL_FILTER.filterFaYearHigh),
  faYearLow: itemLocalStorage('filter/fa-year/low', DEFAULT_INITIAL_FILTER.filterFaYearLow),
  startingAltitudeLow: itemLocalStorage(
    'filter/starting-altitude/low',
    DEFAULT_INITIAL_FILTER.filterStartingAltitudeLow,
  ),
  startingAltitudeHigh: itemLocalStorage(
    'filter/starting-altitude/high',
    DEFAULT_INITIAL_FILTER.filterStartingAltitudeHigh,
  ),
  minStars: itemLocalStorage('filter/min-stars', DEFAULT_INITIAL_FILTER.filterMinStars),
  minAscents: itemLocalStorage('filter/min-ascents', DEFAULT_INITIAL_FILTER.filterMinAscents),
  hideTicked: itemLocalStorage('filter/hide-ticked', DEFAULT_INITIAL_FILTER.filterHideTicked),
  onlyTodo: itemLocalStorage('filter/only-todo', DEFAULT_INITIAL_FILTER.filterOnlyTodo),
  onlyAdmin: itemLocalStorage('filter/only-admin', DEFAULT_INITIAL_FILTER.filterOnlyAdmin),
  onlySuperAdmin: itemLocalStorage('filter/only-super-admin', DEFAULT_INITIAL_FILTER.filterOnlySuperAdmin),
  pitches: itemLocalStorage('filter/pitches', DEFAULT_INITIAL_FILTER.filterPitches),
  types: itemLocalStorage('filter/types', DEFAULT_INITIAL_FILTER.filterTypes),
};

/**
 * The pre-per-system grade keys held one label pair from the region's *merged* grades. A label cannot be attributed to
 * one system any more (the list spans regions, and several systems may share a label), so the old bounds are dropped
 * rather than guessed onto a system: anything else would apply a filter the user never chose for that system.
 */
window.localStorage.removeItem('filter/grades/low');
window.localStorage.removeItem('filter/grades/high');

const wrappedReducer: typeof reducer = (state, update) => {
  const reduced = reducer(state, update);

  storageItems.search.set(reduced.filterSearch);
  storageItems.regionIds.set(reduced.filterRegionIds);
  storageItems.areaIds.set(reduced.filterAreaIds);
  storageItems.onlySunOnWallAt.set(reduced.filterOnlySunOnWallAt);
  storageItems.onlyShadeOnWallAt.set(reduced.filterOnlyShadeOnWallAt);
  storageItems.sectorOrientations.set(reduced.filterSectorOrientations);
  storageItems.gradeRanges.set(reduced.filterGradeRanges);
  storageItems.faYearHigh.set(reduced.filterFaYearHigh);
  storageItems.faYearLow.set(reduced.filterFaYearLow);
  storageItems.startingAltitudeLow.set(reduced.filterStartingAltitudeLow);
  storageItems.startingAltitudeHigh.set(reduced.filterStartingAltitudeHigh);
  storageItems.minStars.set(reduced.filterMinStars);
  storageItems.minAscents.set(reduced.filterMinAscents);
  storageItems.hideTicked.set(reduced.filterHideTicked);
  storageItems.onlyTodo.set(reduced.filterOnlyTodo);
  storageItems.onlyAdmin.set(reduced.filterOnlyAdmin);
  storageItems.onlySuperAdmin.set(reduced.filterOnlySuperAdmin);
  storageItems.pitches.set(reduced.filterPitches);
  storageItems.types.set(reduced.filterTypes);

  return filter(reduced);
};

/** Longest search text accepted from a shared link — a filter hash is user input, and a match is linear in it. */
const MAX_SEARCH_LENGTH = 200;

/**
 * Keeps the fields a hash carried in a usable shape, and drops the rest so they fall back to their defaults.
 *
 * A hash is typed, pasted and hand-edited, and `applyFilterDiff` hands over whatever JSON it decoded: a number
 * where a string belongs (or `null`) would end up in the state and break the predicate — `filterSearch.split`
 * on `null`, or `'2' < 1` comparing a string. Dropping the key (rather than writing `undefined`) is what makes
 * the default apply, since the selection is spread over it.
 */
const sanitizeHashSelection = (selection: Partial<FilterInputs>): Partial<FilterInputs> => {
  const sanitized = { ...selection };

  if (typeof sanitized.filterSearch === 'string') {
    sanitized.filterSearch = sanitized.filterSearch.slice(0, MAX_SEARCH_LENGTH);
  } else {
    delete sanitized.filterSearch;
  }

  for (const key of ['filterMinStars', 'filterMinAscents'] as const) {
    const value = sanitized[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      sanitized[key] = value;
    } else {
      delete sanitized[key];
    }
  }

  if (typeof sanitized.filterOnlyTodo !== 'boolean') {
    delete sanitized.filterOnlyTodo;
  }

  return sanitized;
};

const parseHash = (hash: string): Partial<FilterInputs> => {
  const diff = decodeFilterHash(hash);
  if (!diff) {
    throw new Error('Invalid filter hash');
  }

  return sanitizeHashSelection(applyFilterDiff(diff, DEFAULT_INITIAL_FILTER) as Partial<FilterInputs>);
};

/** The filter selection stored on this device. */
const selectionFromStorage = (): FilterInputs => ({
  filterSearch: storageItems.search.get(),
  filterRegionIds: storageItems.regionIds.get(),
  filterAreaIds: storageItems.areaIds.get(),
  filterOnlySunOnWallAt: storageItems.onlySunOnWallAt.get(),
  filterOnlyShadeOnWallAt: storageItems.onlyShadeOnWallAt.get(),
  filterSectorOrientations: storageItems.sectorOrientations.get(),
  filterGradeRanges: storageItems.gradeRanges.get(),
  filterFaYearHigh: storageItems.faYearHigh.get(),
  filterFaYearLow: storageItems.faYearLow.get(),
  filterStartingAltitudeHigh: storageItems.startingAltitudeHigh.get(),
  filterStartingAltitudeLow: storageItems.startingAltitudeLow.get(),
  filterMinStars: storageItems.minStars.get(),
  filterMinAscents: storageItems.minAscents.get(),
  filterHideTicked: storageItems.hideTicked.get(),
  filterOnlyTodo: storageItems.onlyTodo.get(),
  filterOnlyAdmin: storageItems.onlyAdmin.get(),
  filterOnlySuperAdmin: storageItems.onlySuperAdmin.get(),
  filterPitches: storageItems.pitches.get(),
  filterTypes: storageItems.types.get(),
});

type InitialSelection = {
  selection: FilterInputs;
  /** The shared filter link (`#…`) the selection was read from, if the page was opened with one. */
  sharedHash: string | null;
  /** Set when the page was opened with a hash that is not a valid filter link. */
  error: unknown;
};

/**
 * Resolves the selection a page load starts from: a shared filter link when the URL has one,
 * otherwise whatever this device remembered.
 *
 * This is deliberately resolved during the first render rather than from an effect: the effect
 * that mirrors the state back into the URL runs before an effect that reads the hash, so
 * loading from an effect meant the URL was reset to "no filters" first and the shared link was
 * never read — the recipient ended up on their own (or, in a fresh browser, no) filters.
 */
const resolveInitialSelection = (): InitialSelection => {
  const { hash } = window.location;

  if (hash) {
    try {
      return {
        selection: { ...DEFAULT_INITIAL_FILTER, ...parseHash(hash) },
        sharedHash: hash,
        error: null,
      };
    } catch (error) {
      return { selection: selectionFromStorage(), sharedHash: hash, error };
    }
  }

  return { selection: selectionFromStorage(), sharedHash: null, error: null };
};

export const useFilterState = (init?: Partial<UiState>) => {
  const { allGradeSystems, isAdmin, isSuperAdmin } = useMeta();

  // Resolved once during the first render (see `resolveInitialSelection`), before the URL is
  // written back and before anything is filtered.
  const [initial] = useState(resolveInitialSelection);

  const [state, dispatch] = useReducer(wrappedReducer, {
    visible: false,
    gradeSystems: allGradeSystems,
    totalRegions: 0,
    totalAreas: 0,
    totalSectors: 0,
    totalProblems: 0,
    unfilteredData: {},

    ...initial.selection,
    // Admin filters are dropped for visitors without the matching privileges, both when coming
    // from a shared link and when coming from storage.
    filterOnlyAdmin: isAdmin && !!initial.selection.filterOnlyAdmin,
    filterOnlySuperAdmin: isSuperAdmin && !!initial.selection.filterOnlySuperAdmin,

    // Filtered data
    filteredData: {},
    gradeFilters: [],
    hiddenRegions: 0,
    hiddenAreas: 0,
    hiddenSectors: 0,
    hiddenProblems: 0,

    // Customizations
    ...init,
  });

  useEffect(() => {
    dispatch({ action: 'set-grade-systems', gradeSystems: allGradeSystems });
  }, [allGradeSystems]);

  useEffect(() => {
    // Report how the page was opened. The selection itself was already read from the hash during
    // the first render (`resolveInitialSelection`), so this is not affected by the URL being
    // rewritten below.
    if (initial.sharedHash) {
      captureSentryMessage('filter-hash', { hash: initial.sharedHash });
    }
    if (initial.error) {
      console.warn('Failed to parse filter hash', initial.error);
      captureSentryException(initial.error, { hash: initial.sharedHash });
    }
  }, [initial]);

  useEffect(() => {
    // Mirror the filter state into the URL so the address bar (and therefore a copied URL) always
    // reproduces what is on screen. Only the fields that deviate from the defaults are encoded,
    // so an unfiltered page ends up with an empty hash again.
    const out = encodeFilterHash(filterDiff(filterInputsOf(state), DEFAULT_INITIAL_FILTER));
    window.history.replaceState(undefined, '', `#${out}`);
  }, [state]);

  const loadFromHash = useCallback(
    async (hash: string) => {
      try {
        const out = await parseHash(hash);
        dispatch({
          action: 'init-filter-state',
          ...out,
          filterOnlyAdmin: isAdmin && !!out.filterOnlyAdmin,
          filterOnlySuperAdmin: isSuperAdmin && !!out.filterOnlySuperAdmin,
        });
      } catch (e) {
        console.warn('Failed to parse hash', e);
        captureSentryException(e, { hash });
        throw e;
      }
    },
    [isAdmin, isSuperAdmin],
  );

  useEffect(() => {
    const onHashChange = (e: HashChangeEvent) => {
      const url = new URL(e.newURL);
      captureSentryMessage('filter-hashchange', { hash: url.hash });
      loadFromHash(url.hash).catch((e) => {
        window.history.replaceState(undefined, '', '');
        console.warn(e);
        // TODO: Anything else? Should we show an alert or something?
      });
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [loadFromHash]);

  return [state, dispatch] as const;
};
