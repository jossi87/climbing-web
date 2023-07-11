import { useReducer } from "react";
import { neverGuard } from "../../utils/neverGuard";
import * as Sentry from "@sentry/react";
import { itemLocalStorage } from "../../utils/use-local-storage";

export type State = {
  visible: boolean;
  gradeDifficultyLookup: Record<string, number>;
  totalAreas: number;
  totalSectors: number;
  totalProblems: number;
  unfilteredData: ProblemArea[];
} & {
  filterGradeLow: string | undefined;
  filterGradeHigh: string | undefined;
  filterTypes: Record<number, boolean> | undefined;
  filterPitches:
    | { "Single-pitch": boolean; "Multi-pitch": boolean }
    | undefined;
  filterHideTicked: boolean | undefined;
  filterOnlyAdmin: boolean | undefined;
  filterOnlySuperAdmin: boolean | undefined;
  filteredData: ProblemArea[];

  filteredAreas: number;
  filteredSectors: number;
  filteredProblems: number;
};

export type Update =
  | { action: "set-data"; data: ProblemArea[] }
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
  | {
      action: "set-grades";
      low: string;
      high: string;
      gradeDifficultyLookup: State["gradeDifficultyLookup"];
    }
  | { action: "set-hide-ticked"; checked: boolean }
  | { action: "set-only-admin"; checked: boolean }
  | { action: "set-only-super-admin"; checked: boolean }
  | ({
      action: "set-grade";
      gradeDifficultyLookup: State["gradeDifficultyLookup"];
    } & ({ low: string } | { high: string }))
  | { action: "close-filter" }
  | { action: "open-filter" }
  | { action: "toggle-filter" }
  | { action: "reset" };

const count = (data: ProblemArea[]): [number, number, number] => {
  return data.reduce(
    ([areas, sectors, problems], area) => [
      areas,
      sectors + area.sectors.length,
      problems +
        area.sectors.reduce((acc, sector) => sector.problems.length + acc, 0),
    ],
    [data.length, 0, 0],
  );
};

const filter = (state: State): State => {
  const {
    gradeDifficultyLookup,
    filterGradeLow,
    filterGradeHigh,
    filterHideTicked,
    filterPitches,
    filterTypes,
    filterOnlyAdmin,
    filterOnlySuperAdmin,
    unfilteredData,
    totalAreas,
    totalProblems,
    totalSectors,
  } = state;
  const filteredOut = {
    areas: 0,
    sectors: 0,
    problems: 0,
  };

  const transaction = Sentry.startTransaction({
    name: "filter-problems",
    data: { totalAreas, totalProblems, totalSectors },
  });
  const span = transaction.startChild();
  const filteredData = (unfilteredData ?? [])
    .map((problemArea) => {
      return {
        ...problemArea,
        sectors: problemArea.sectors
          .map((sector) => {
            return {
              ...sector,
              problems: sector.problems.filter((problem) => {
                if (filterHideTicked) {
                  if (problem.ticked) {
                    filteredOut.problems += 1;
                    return false;
                  }
                }

                if (filterOnlyAdmin) {
                  const locked = problem.lockedAdmin;
                  if (locked) {
                    filteredOut.problems += 1;
                  }
                  return locked;
                }

                if (filterOnlySuperAdmin) {
                  const locked = problem.lockedSuperadmin;
                  if (locked) {
                    filteredOut.problems += 1;
                  }
                  return locked;
                }

                if (
                  filterTypes &&
                  Object.values(filterTypes).some((v) => !!v)
                ) {
                  if (!filterTypes[problem.t.id]) {
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
                    problem.numPitches >= 2
                  ) {
                    filteredOut.problems += 1;
                    return false;
                  }
                  if (
                    !filterPitches["Single-pitch"] &&
                    problem.numPitches <= 1
                  ) {
                    filteredOut.problems += 1;
                    return false;
                  }
                }

                if (filterGradeLow || filterGradeHigh) {
                  const low =
                    gradeDifficultyLookup[filterGradeLow] ??
                    Number.MIN_SAFE_INTEGER;
                  const high =
                    gradeDifficultyLookup[filterGradeHigh] ??
                    Number.MAX_SAFE_INTEGER;
                  const test = gradeDifficultyLookup[problem.grade];

                  if (test !== undefined && (test < low || test > high)) {
                    filteredOut.problems += 1;
                    return false;
                  }
                }

                return true;
              }),
            };
          })
          .filter(({ lockedAdmin, lockedSuperadmin, problems }) => {
            const include =
              problems.length > 0 ||
              (filterOnlyAdmin && lockedAdmin) ||
              (filterOnlySuperAdmin && lockedSuperadmin);
            if (!include) {
              filteredOut.sectors += 1;
            }
            return include;
          }),
      };
    })
    .filter(({ lockedAdmin, lockedSuperadmin, sectors }) => {
      const include =
        sectors.length > 0 ||
        (filterOnlyAdmin && lockedAdmin) ||
        (filterOnlySuperAdmin && lockedSuperadmin);
      if (!include) {
        filteredOut.areas += 1;
      }
      return include;
    });
  span.finish();
  transaction.finish();

  return {
    ...state,
    filteredData,
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
      const [totalAreas, totalSectors, totalProblems] = count(data);

      return {
        ...state,
        totalAreas,
        totalSectors,
        totalProblems,
        unfilteredData: data,
        filteredData: data,
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

    case "set-grades": {
      const { low, high, gradeDifficultyLookup } = update;
      return {
        ...state,
        gradeDifficultyLookup: gradeDifficultyLookup,
        filterGradeLow: low,
        filterGradeHigh: high,
      };
    }

    case "set-grade": {
      const low = "low" in update ? update.low : undefined;
      const high = "high" in update ? update.high : undefined;
      return {
        ...state,
        gradeDifficultyLookup: update.gradeDifficultyLookup,
        filterGradeLow: low ?? state.filterGradeLow ?? undefined,
        filterGradeHigh: high ?? state.filterGradeHigh ?? undefined,
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
      };
    }

    case "set-only-super-admin": {
      const { checked } = update;
      return {
        ...state,
        filterOnlySuperAdmin: checked,
      };
    }

    case "reset": {
      return {
        ...state,
        filterGradeLow: undefined,
        filterGradeHigh: undefined,
        filterHideTicked: undefined,
        filterPitches: undefined,
        filterTypes: undefined,
        filterOnlyAdmin: undefined,
        filterOnlySuperAdmin: undefined,
        filteredData: state.unfilteredData,
      };
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

    default: {
      return neverGuard(action, state);
    }
  }
};

const localStorageItems = {
  onlyAdmin: itemLocalStorage("filter/only-admin", false),
  onlySuperAdmin: itemLocalStorage("filter/only-super-admin", false),
  grades: itemLocalStorage("filter/grades", undefined),
  gradeLow: itemLocalStorage("filter/grades/low", undefined),
  gradeHigh: itemLocalStorage("filter/grades/high", undefined),
  types: itemLocalStorage("filter/types", undefined),
  pitches: itemLocalStorage("filter/pitches", undefined),
  hideTicked: itemLocalStorage("filter/hide-ticked", false),
};

const wrappedReducer: typeof reducer = (state, update) => {
  const reduced = reducer(state, update);

  localStorageItems.onlyAdmin.set(reduced.filterOnlyAdmin);
  localStorageItems.onlySuperAdmin.set(reduced.filterOnlySuperAdmin);
  localStorageItems.gradeLow.set(reduced.filterGradeLow);
  localStorageItems.gradeHigh.set(reduced.filterGradeHigh);
  localStorageItems.types.set(reduced.filterTypes);
  localStorageItems.pitches.set(reduced.filterPitches);
  localStorageItems.hideTicked.set(reduced.filterHideTicked);

  return filter(reduced);
};

export const useFilterState = (init?: Partial<State>) => {
  return useReducer(wrappedReducer, {
    visible: false,
    gradeDifficultyLookup: {},
    totalAreas: 0,
    totalSectors: 0,
    totalProblems: 0,
    unfilteredData: [],

    // Information about the filters
    filterOnlyAdmin: localStorageItems.onlyAdmin.get(),
    filterOnlySuperAdmin: localStorageItems.onlySuperAdmin.get(),
    filterGradeLow: localStorageItems.gradeLow.get(),
    filterGradeHigh: localStorageItems.gradeHigh.get(),
    filterTypes: localStorageItems.types.get(),
    filterPitches: localStorageItems.pitches.get(),
    filterHideTicked: localStorageItems.hideTicked.get(),
    filteredData: [],
    filteredAreas: 0,
    filteredSectors: 0,
    filteredProblems: 0,

    // Customizations
    ...init,
  });
};
