import { useCallback, useEffect, useReducer } from "react";
import { neverGuard } from "../../utils/neverGuard";
import { useGrades, useMeta } from "../common/meta/meta";
import { itemLocalStorage } from "../../utils/use-local-storage";
import { components } from "../../@types/buldreinfo/swagger";
import { flatten, unflatten } from "flat";
import jsonUrl from "json-url";
import { captureMessage, captureException } from "@sentry/react";

const codec = jsonUrl("lzw");

type FilterResults = {
  filteredData: components["schemas"]["Toc"];
  filteredRegions: number;
  filteredAreas: number;
  filteredSectors: number;
  filteredProblems: number;
};

type FilterInputs = {
  filterRegionIds: Record<number, true>;
  filterAreaIds: Record<number, true>;
  filterAreaOnlySunOnWallAt: number;
  filterAreaOnlyShadeOnWallAt: number;
  filterSectorWallDirections: Record<number, boolean>;
  filterGradeLow: string | undefined;
  filterGradeHigh: string | undefined;
  filterFaYearLow: number;
  filterFaYearHigh: number;
  filterTypes: Record<number, boolean>;
  filterPitches: {
    "Single-pitch": boolean;
    "Multi-pitch": boolean;
  };
  filterHideTicked: boolean;
  filterOnlyAdmin: boolean;
  filterOnlySuperAdmin: boolean;
};

const DEFAULT_INITIAL_FILTER: FilterInputs = {
  filterRegionIds: {},
  filterAreaIds: {},
  filterGradeLow: undefined,
  filterGradeHigh: undefined,
  filterFaYearLow: 0,
  filterFaYearHigh: 0,
  filterHideTicked: false,
  filterPitches: {
    "Single-pitch": false,
    "Multi-pitch": false,
  },
  filterTypes: {},
  filterOnlyAdmin: false,
  filterOnlySuperAdmin: false,
  filterAreaOnlySunOnWallAt: 0,
  filterAreaOnlyShadeOnWallAt: 0,
  filterSectorWallDirections: {},
} as const;

const FLAT_FILTER: Readonly<Record<string, unknown>> = flatten(
  DEFAULT_INITIAL_FILTER,
);

const FILTER_INPUT_KEYS: Readonly<string[]> = Object.keys(FLAT_FILTER);
const FILTER_INPUT_KEYS_SET: Readonly<Set<string>> = new Set(FILTER_INPUT_KEYS);

type FilterState = FilterInputs & FilterResults;

type UiState = {
  visible: boolean;
};

type DataState = {
  gradeDifficultyLookup: Record<string, number>;
  totalRegions: number;
  totalAreas: number;
  totalSectors: number;
  totalProblems: number;
  unfilteredData: components["schemas"]["Toc"];
};

export type State = UiState & DataState & FilterState;

export type ResetField =
  | "all"
  | "regions"
  | "areas"
  | "fa-year"
  | "options"
  | "wall-directions"
  | "conditions"
  | "pitches"
  | "types"
  | "grades";

export type Update =
  | { action: "set-data"; data: components["schemas"]["Toc"] }
  | {
      action: "toggle-pitches";
      option: keyof State["filterPitches"];
      checked: boolean;
    }
  | {
      action: "toggle-types";
      option: keyof State["filterTypes"];
      checked: boolean;
    }
  | { action: "toggle-region"; regionId: number; enabled: boolean }
  | { action: "toggle-area"; areaId: number; enabled: boolean }
  | { action: "set-area-only-sun-on-wall-at"; hour: number }
  | { action: "set-area-only-shade-on-wall-at"; hour: number }
  | {
      action: "toggle-sector-wall-directions";
      option: keyof State["filterSectorWallDirections"];
      checked: boolean;
    }
  | {
      action: "set-grade-mapping";
      gradeDifficultyLookup: State["gradeDifficultyLookup"];
    }
  | { action: "set-grades"; low: string; high: string }
  | { action: "set-fa-years"; low: number; high: number }
  | { action: "set-hide-ticked"; checked: boolean }
  | { action: "set-only-admin"; checked: boolean }
  | { action: "set-only-super-admin"; checked: boolean }
  | ({ action: "set-grade" } & ({ low: string } | { high: string }))
  | ({ action: "set-fa-year" } & ({ low: number } | { high: number }))
  | { action: "close-filter" }
  | { action: "open-filter" }
  | { action: "toggle-filter" }
  | { action: "reset"; section: ResetField }
  // Not intended to be used "externally" (ie, at the component level)
  | ({ action: "init-filter-state" } & Partial<FilterInputs>);

const filter = (state: State): State => {
  const {
    filterRegionIds,
    filterAreaIds,
    filterAreaOnlySunOnWallAt,
    filterAreaOnlyShadeOnWallAt,
    filterSectorWallDirections,
    filterGradeHigh,
    filterGradeLow,
    filterFaYearHigh,
    filterFaYearLow,
    filterHideTicked,
    filterOnlyAdmin,
    filterOnlySuperAdmin,
    filterPitches,
    filterTypes,
    gradeDifficultyLookup,
    unfilteredData,
  } = state;
  const filteredOut = {
    regions: 0,
    areas: 0,
    sectors: 0,
    problems: 0,
  };

  const filterRegionIdsCount = Object.keys(filterRegionIds).length;
  const filterAreaIdsCount = Object.keys(filterAreaIds).length;

  const filteredData = {
    ...unfilteredData,
    regions: unfilteredData?.regions
      ?.map((region) => {
        return {
          ...region,
          areas: region.areas
            ?.map((area) => {
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

                        if (filterAreaOnlySunOnWallAt > 0) {
                          if (
                            !area.sunFromHour ||
                            !area.sunToHour ||
                            area.sunFromHour > filterAreaOnlySunOnWallAt ||
                            area.sunToHour < filterAreaOnlySunOnWallAt
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterAreaOnlyShadeOnWallAt > 0) {
                          if (
                            !area.sunFromHour ||
                            !area.sunToHour ||
                            (area.sunFromHour <= filterAreaOnlyShadeOnWallAt &&
                              area.sunToHour > filterAreaOnlyShadeOnWallAt)
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (
                          filterSectorWallDirections &&
                          Object.values(filterSectorWallDirections).some(
                            (v) => !!v,
                          )
                        ) {
                          const wallDirectionId =
                            sector.wallDirectionManual?.id ||
                            sector.wallDirectionCalculated?.id;
                          if (
                            !wallDirectionId ||
                            !filterSectorWallDirections[wallDirectionId]
                          ) {
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

                        if (
                          filterTypes &&
                          Object.values(filterTypes).some((v) => !!v)
                        ) {
                          if (!problem.t?.id || !filterTypes[problem.t?.id]) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (
                          filterPitches &&
                          (filterPitches["Multi-pitch"] ||
                            filterPitches["Single-pitch"])
                        ) {
                          if (
                            !filterPitches["Multi-pitch"] &&
                            problem.numPitches &&
                            problem.numPitches >= 2
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
                          if (
                            !filterPitches["Single-pitch"] &&
                            (problem.numPitches === undefined ||
                              problem.numPitches <= 1)
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterGradeLow || filterGradeHigh) {
                          const low =
                            gradeDifficultyLookup[
                              filterGradeLow ?? "undefined"
                            ] ?? Number.MIN_SAFE_INTEGER;
                          const high =
                            gradeDifficultyLookup[
                              filterGradeHigh ?? "undefined"
                            ] ?? Number.MAX_SAFE_INTEGER;
                          const test =
                            gradeDifficultyLookup[problem.grade ?? "ungraded"];

                          if (test === undefined || test < low || test > high) {
                            filteredOut.problems += 1;
                            return false;
                          }
                        }

                        if (filterFaYearLow || filterFaYearHigh) {
                          const low =
                            filterFaYearLow ?? Number.MIN_SAFE_INTEGER;
                          const high =
                            filterFaYearHigh ?? Number.MAX_SAFE_INTEGER;
                          if (
                            problem.faYear &&
                            (problem.faYear < low || problem.faYear > high)
                          ) {
                            filteredOut.problems += 1;
                            return false;
                          }
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
    filteredRegions: filteredOut.regions,
    filteredAreas: filteredOut.areas,
    filteredSectors: filteredOut.sectors,
    filteredProblems: filteredOut.problems,
  };
};

const reducer = (state: State, update: Update): State => {
  const { action } = update;
  switch (action) {
    case "set-data": {
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

    case "toggle-pitches": {
      const { checked, option } = update;

      return {
        ...state,
        filterPitches: {
          ...state.filterPitches,
          [option]: checked,
        },
      };
    }

    case "toggle-types": {
      const { checked, option } = update;
      return {
        ...state,
        filterTypes: {
          ...state.filterTypes,
          [option]: checked,
        },
      };
    }

    case "toggle-region": {
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

    case "toggle-area": {
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

    case "set-area-only-sun-on-wall-at": {
      const { hour } = update;
      return {
        ...state,
        filterAreaOnlySunOnWallAt: hour,
      };
    }

    case "set-area-only-shade-on-wall-at": {
      const { hour } = update;
      return {
        ...state,
        filterAreaOnlyShadeOnWallAt: hour,
      };
    }

    case "toggle-sector-wall-directions": {
      const { checked, option } = update;
      return {
        ...state,
        filterSectorWallDirections: {
          ...state.filterSectorWallDirections,
          [option]: checked,
        },
      };
    }

    case "set-grade-mapping": {
      const { gradeDifficultyLookup } = update;
      return {
        ...state,
        gradeDifficultyLookup,
      };
    }

    case "set-grades": {
      const { low, high } = update;
      return {
        ...state,
        filterGradeLow: low,
        filterGradeHigh: high,
      };
    }

    case "set-grade": {
      const low = "low" in update ? update.low : undefined;
      const high = "high" in update ? update.high : undefined;
      return {
        ...state,
        filterGradeLow: low ?? state.filterGradeLow ?? undefined,
        filterGradeHigh: high ?? state.filterGradeHigh ?? undefined,
      };
    }

    case "set-fa-years": {
      const { low, high } = update;
      return {
        ...state,
        filterFaYearLow: low,
        filterFaYearHigh: high,
      };
    }

    case "set-fa-year": {
      const low = "low" in update ? update.low : undefined;
      const high = "high" in update ? update.high : undefined;
      return {
        ...state,
        filterFaYearLow: low ?? state.filterFaYearLow ?? undefined,
        filterFaYearHigh: high ?? state.filterFaYearHigh ?? undefined,
      };
    }

    case "set-hide-ticked": {
      const { checked } = update;
      return {
        ...state,
        filterHideTicked: checked,
      };
    }

    case "set-only-admin": {
      const { checked } = update;
      return {
        ...state,
        filterOnlyAdmin: checked,
        filterOnlySuperAdmin: false,
      };
    }

    case "set-only-super-admin": {
      const { checked } = update;
      return {
        ...state,
        filterOnlyAdmin: false,
        filterOnlySuperAdmin: checked,
      };
    }

    case "reset": {
      const { section } = update;

      switch (section) {
        case "all": {
          return {
            ...state,
            ...DEFAULT_INITIAL_FILTER,
          };
        }
        case "regions": {
          return {
            ...state,
            filterRegionIds: DEFAULT_INITIAL_FILTER.filterRegionIds,
          };
        }
        case "areas": {
          return {
            ...state,
            filterAreaIds: DEFAULT_INITIAL_FILTER.filterAreaIds,
          };
        }
        case "grades": {
          return {
            ...state,
            filterGradeLow: DEFAULT_INITIAL_FILTER.filterGradeLow,
            filterGradeHigh: DEFAULT_INITIAL_FILTER.filterGradeHigh,
          };
        }
        case "fa-year": {
          return {
            ...state,
            filterFaYearLow: DEFAULT_INITIAL_FILTER.filterFaYearLow,
            filterFaYearHigh: DEFAULT_INITIAL_FILTER.filterFaYearHigh,
          };
        }
        case "options": {
          return {
            ...state,
            filterHideTicked: DEFAULT_INITIAL_FILTER.filterHideTicked,
            filterOnlyAdmin: DEFAULT_INITIAL_FILTER.filterOnlyAdmin,
            filterOnlySuperAdmin: DEFAULT_INITIAL_FILTER.filterOnlySuperAdmin,
          };
        }
        case "conditions": {
          return {
            ...state,
            filterAreaOnlySunOnWallAt:
              DEFAULT_INITIAL_FILTER.filterAreaOnlySunOnWallAt,
            filterAreaOnlyShadeOnWallAt:
              DEFAULT_INITIAL_FILTER.filterAreaOnlyShadeOnWallAt,
          };
        }
        case "wall-directions": {
          return {
            ...state,
            filterSectorWallDirections:
              DEFAULT_INITIAL_FILTER.filterSectorWallDirections,
          };
        }
        case "pitches": {
          return {
            ...state,
            filterPitches: DEFAULT_INITIAL_FILTER.filterPitches,
          };
        }
        case "types": {
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

    case "close-filter": {
      return {
        ...state,
        visible: false,
      };
    }

    case "open-filter": {
      return {
        ...state,
        visible: true,
      };
    }

    case "toggle-filter": {
      return {
        ...state,
        visible: !state.visible,
      };
    }

    case "init-filter-state": {
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
  regionIds: itemLocalStorage(
    "filter/region-ids",
    DEFAULT_INITIAL_FILTER.filterRegionIds,
  ),
  areaIds: itemLocalStorage(
    "filter/area-ids",
    DEFAULT_INITIAL_FILTER.filterAreaIds,
  ),
  areaOnlySunOnWallAt: itemLocalStorage(
    "filter/area-only-sun-on-wall-at",
    DEFAULT_INITIAL_FILTER.filterAreaOnlySunOnWallAt,
  ),
  areaOnlyShadeOnWallAt: itemLocalStorage(
    "filter/area-only-shade-on-wall-at",
    DEFAULT_INITIAL_FILTER.filterAreaOnlyShadeOnWallAt,
  ),
  sectorWallDirections: itemLocalStorage(
    "filter/sector-wall-directions",
    DEFAULT_INITIAL_FILTER.filterSectorWallDirections,
  ),
  gradeHigh: itemLocalStorage(
    "filter/grades/high",
    DEFAULT_INITIAL_FILTER.filterGradeHigh,
  ),
  gradeLow: itemLocalStorage(
    "filter/grades/low",
    DEFAULT_INITIAL_FILTER.filterGradeLow,
  ),
  faYearHigh: itemLocalStorage(
    "filter/fa-year/high",
    DEFAULT_INITIAL_FILTER.filterFaYearHigh,
  ),
  faYearLow: itemLocalStorage(
    "filter/fa-year/low",
    DEFAULT_INITIAL_FILTER.filterFaYearLow,
  ),
  hideTicked: itemLocalStorage(
    "filter/hide-ticked",
    DEFAULT_INITIAL_FILTER.filterHideTicked,
  ),
  onlyAdmin: itemLocalStorage(
    "filter/only-admin",
    DEFAULT_INITIAL_FILTER.filterOnlyAdmin,
  ),
  onlySuperAdmin: itemLocalStorage(
    "filter/only-super-admin",
    DEFAULT_INITIAL_FILTER.filterOnlySuperAdmin,
  ),
  pitches: itemLocalStorage(
    "filter/pitches",
    DEFAULT_INITIAL_FILTER.filterPitches,
  ),
  types: itemLocalStorage("filter/types", DEFAULT_INITIAL_FILTER.filterTypes),
};

const wrappedReducer: typeof reducer = (state, update) => {
  const reduced = reducer(state, update);

  storageItems.regionIds.set(reduced.filterRegionIds);
  storageItems.areaIds.set(reduced.filterAreaIds);
  storageItems.areaOnlySunOnWallAt.set(reduced.filterAreaOnlySunOnWallAt);
  storageItems.areaOnlyShadeOnWallAt.set(reduced.filterAreaOnlyShadeOnWallAt);
  storageItems.sectorWallDirections.set(reduced.filterSectorWallDirections);
  storageItems.gradeHigh.set(reduced.filterGradeHigh);
  storageItems.gradeLow.set(reduced.filterGradeLow);
  storageItems.faYearHigh.set(reduced.filterFaYearHigh);
  storageItems.faYearLow.set(reduced.filterFaYearLow);
  storageItems.hideTicked.set(reduced.filterHideTicked);
  storageItems.onlyAdmin.set(reduced.filterOnlyAdmin);
  storageItems.onlySuperAdmin.set(reduced.filterOnlySuperAdmin);
  storageItems.pitches.set(reduced.filterPitches);
  storageItems.types.set(reduced.filterTypes);

  return filter(reduced);
};

const parseHash = (hash: string): Promise<Partial<FilterInputs>> => {
  return codec.decompress(hash.replace(/^#/, "")).then((obj) => {
    // TODO: Validate the object
    const unflattened: Partial<FilterInputs> = unflatten(obj, { object: true });
    return unflattened;
  });
};

export const useFilterState = (init?: Partial<UiState>) => {
  const { mapping } = useGrades();
  const { isAdmin, isSuperAdmin } = useMeta();

  const [state, dispatch] = useReducer(wrappedReducer, {
    visible: false,
    gradeDifficultyLookup: {},
    totalRegions: 0,
    totalAreas: 0,
    totalSectors: 0,
    totalProblems: 0,
    unfilteredData: {},

    ...DEFAULT_INITIAL_FILTER,

    // Filtered data
    filteredData: {},
    filteredRegions: 0,
    filteredAreas: 0,
    filteredSectors: 0,
    filteredProblems: 0,

    // Customizations
    ...init,
  });

  useEffect(() => {
    dispatch({ action: "set-grade-mapping", gradeDifficultyLookup: mapping });
  }, [mapping]);

  useEffect(() => {
    // Pull the input data out from the huge state object. This is pretty
    // inefficient, but we could address this in the future by splitting the
    // state into separate reducers instead of one giant object.
    const inputState = Object.entries(state)
      .filter(([key]) => FILTER_INPUT_KEYS_SET.has(key))
      .reduce<Partial<FilterInputs>>((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {} satisfies Partial<FilterInputs>);

    // We're trying to construct a minimal diff between the current filter and
    // the default filter. The simplest way to do this is by flattening the two
    // objects and comparing the keys (so we don't have to do any recursion).
    const flattenedInput: Record<string, unknown> = flatten(inputState);
    const minimalDiffEntries = Object.entries(flattenedInput).filter(
      ([k, filterValue]) => {
        if (!!filterValue && typeof filterValue === "object") {
          return Object.keys(filterValue).length > 0;
        }

        const defaultValue = FLAT_FILTER[k] ?? false;
        return filterValue !== undefined && filterValue !== defaultValue;
      },
    );

    (minimalDiffEntries.length === 0
      ? Promise.resolve("")
      : codec.compress(
          minimalDiffEntries.reduce<Record<string, unknown>>((acc, [k, v]) => {
            if (!acc) {
              return { [k]: v };
            }
            acc[k] = v;
            return acc;
          }, {}),
        )
    ).then((out) => {
      history.replaceState(undefined, "", `#${out}`);
    });
  }, [state]);

  const loadFromHash = useCallback(
    async (hash: string) => {
      try {
        const out = await parseHash(hash);
        dispatch({
          action: "init-filter-state",
          ...out,
          filterOnlyAdmin: isAdmin && !!out.filterOnlyAdmin,
          filterOnlySuperAdmin: isSuperAdmin && !!out.filterOnlySuperAdmin,
        });
      } catch (e) {
        console.warn("Failed to parse hash", e);
        captureException(e, { extra: { hash } });
        throw e;
      }
    },
    [isAdmin, isSuperAdmin],
  );

  useEffect(() => {
    const onHashChange = (e: HashChangeEvent) => {
      const url = new URL(e.newURL);
      captureMessage("filter-hashchange", { extra: { hash: url.hash } });
      loadFromHash(url.hash).catch((e) => {
        window.history.replaceState(undefined, "", "");
        console.warn(e);
        // TODO: Anything else? Should we show an alert or something?
      });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [loadFromHash]);

  const loadFromLocalStorage = useCallback(() => {
    const partial: Partial<FilterInputs> = {
      // Information about the filters
      filterRegionIds: storageItems.regionIds.get(),
      filterAreaIds: storageItems.areaIds.get(),
      filterAreaOnlySunOnWallAt: storageItems.areaOnlySunOnWallAt.get(),
      filterAreaOnlyShadeOnWallAt: storageItems.areaOnlyShadeOnWallAt.get(),
      filterSectorWallDirections: storageItems.sectorWallDirections.get(),
      filterGradeHigh: storageItems.gradeHigh.get(),
      filterGradeLow: storageItems.gradeLow.get(),
      filterFaYearHigh: storageItems.faYearHigh.get(),
      filterFaYearLow: storageItems.faYearLow.get(),
      filterHideTicked: storageItems.hideTicked.get(),
      filterOnlyAdmin: isAdmin && storageItems.onlyAdmin.get(),
      filterOnlySuperAdmin: isSuperAdmin && storageItems.onlySuperAdmin.get(),
      filterPitches: storageItems.pitches.get(),
      filterTypes: storageItems.types.get(),
    };

    dispatch({ action: "init-filter-state", ...partial });
  }, [isAdmin, isSuperAdmin]);

  useEffect(() => {
    if (window.location.hash) {
      captureMessage("filter-hash", { extra: { hash: window.location.hash } });
      loadFromHash(window.location.hash).catch((e) => {
        window.history.replaceState(undefined, "", "");
        console.warn(e);
        loadFromLocalStorage();
      });
    } else {
      loadFromLocalStorage();
    }
  }, [loadFromHash, loadFromLocalStorage]);

  return [state, dispatch] as const;
};
