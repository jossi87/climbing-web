import { type Dispatch, useCallback, useEffect, useMemo, useReducer } from 'react';
import { neverGuard } from '../../../utils/neverGuard';
import { rowListTypeKey, type Row } from './types';
import { buildGradeDomain, useGradeSystems, useMeta } from '../Meta';
import { distinctDisciplines } from '../Profile/profileDiscipline';
import { getLocales } from '../../../api';
import { disciplineRank } from '../../../utils/discipline';
import { useLocalStorage, useSessionStorage } from '../../../utils/use-local-storage';

export type OrderOption =
  'ascents' | 'date' | 'first-ascent' | 'grade-asc' | 'grade-desc' | 'name' | 'number' | 'rating';

export type GroupOption = 'area' | 'none' | 'rock' | 'sector' | 'type';

/** Grade range of one grade system; a system without an entry (or without bounds) is not filtered. */
export type GradeRange = { low?: string; high?: string };

/**
 * One grade filter of the list: the grade domain of a system present on the rows, its active range, and the labels the
 * content actually holds for it.
 */
export type GradeFilter = {
  gradeSystemId: number;
  name: string;
  /** Grades of this system ordered easy → hard. */
  easyToHard: string[];
  /** Grade label → index in {@link easyToHard}. */
  mapping: Record<string, number>;
  /** Grade labels of this system present in the rows, ordered easy → hard. */
  labels: string[];
  low?: string;
  high?: string;
};

type UiState = {
  /** Grade range per grade system (keyed by system id) — a list may hold grades of several systems. */
  gradeRanges: Record<string, GradeRange>;
  order: OrderOption;
  groupBy: GroupOption;
  hideTicked: boolean;
  onlyFa: boolean;
  onlyMultipitch: boolean;
  types: Record<string, boolean>;
  /** Profile lists: enabled state per discipline name; not persisted. */
  disciplines: Record<string, boolean>;
};

type DerivedState = {
  filtered: Row[];
  numHidden: number;
  uniqueAreas: string[];
  uniqueRocks: string[];
  uniqueSectors: string[];
  uniqueTypes: string[];
  /** Ordered disciplines found on the rows; empty for lists without a discipline facet (sector / area). */
  uniqueDisciplines: string[];
  /**
   * One entry per grade system found on the rows, in catalogue order. Each system is filtered against its own range,
   * so a list spanning several systems (a profile list covers every region the user has climbed in) stays filterable —
   * grades of another system never hide a row. Grade *sorting* ranks each row within its own discipline, see
   * `gradeRank`.
   */
  gradeFilters: GradeFilter[];
  containsFa: boolean;
  containsTicked: boolean;
  containsMultipitch: boolean;
};

export type State = UiState & DerivedState;

type Update =
  | { action: 'set-grade'; gradeSystemId: number; low?: string; high?: string }
  | { action: 'order-by'; order: UiState['order'] }
  | { action: 'group-by'; groupBy: UiState['groupBy'] }
  | { action: 'hide-ticked'; hideTicked?: UiState['hideTicked'] }
  | { action: 'only-fa'; onlyFa?: UiState['onlyFa'] }
  | { action: 'only-multipitch'; onlyMultipitch?: UiState['onlyMultipitch'] }
  | { action: 'init-types'; typeNames: string[] }
  | { action: 'type'; type: string; enabled: boolean }
  | { action: 'init-disciplines'; disciplines: string[] }
  | { action: 'discipline'; discipline: string; enabled: boolean }
  | { action: 'reset'; defaultOrder: OrderOption };

const uiStateReducer = (state: UiState, update: Update): UiState => {
  const { action } = update;
  switch (action) {
    case 'set-grade': {
      const key = String(update.gradeSystemId);
      return {
        ...state,
        gradeRanges: {
          ...state.gradeRanges,
          [key]: {
            ...state.gradeRanges[key],
            ...(update.low !== undefined ? { low: update.low } : {}),
            ...(update.high !== undefined ? { high: update.high } : {}),
          },
        },
      };
    }

    case 'order-by': {
      return {
        ...state,
        order: update.order,
      };
    }

    case 'group-by': {
      return {
        ...state,
        groupBy: state.groupBy !== update.groupBy ? update.groupBy : 'none',
      };
    }

    case 'hide-ticked': {
      return {
        ...state,
        hideTicked: update.hideTicked !== undefined ? update.hideTicked : !state.hideTicked,
      };
    }

    case 'only-fa': {
      return {
        ...state,
        onlyFa: update.onlyFa !== undefined ? update.onlyFa : !state.onlyFa,
      };
    }

    case 'only-multipitch': {
      return {
        ...state,
        onlyMultipitch: update.onlyMultipitch !== undefined ? update.onlyMultipitch : !state.onlyMultipitch,
      };
    }

    case 'type': {
      return {
        ...state,
        types: {
          ...state.types,
          [update.type]: update.enabled,
        },
      };
    }

    case 'init-types': {
      const nextTypes: Record<string, boolean> = {};
      for (const typeName of update.typeNames) {
        nextTypes[typeName] = state.types[typeName] ?? true;
      }
      return {
        ...state,
        types: nextTypes,
      };
    }

    case 'discipline': {
      const nextDisciplines = {
        ...state.disciplines,
        [update.discipline]: update.enabled,
      };
      /** Never leave the list without any discipline — unticking the last one resets to “all disciplines”. */
      const anyEnabled = Object.values(nextDisciplines).some(Boolean);
      return {
        ...state,
        disciplines: anyEnabled
          ? nextDisciplines
          : Object.fromEntries(Object.keys(nextDisciplines).map((discipline) => [discipline, true])),
      };
    }

    case 'init-disciplines': {
      const nextDisciplines: Record<string, boolean> = {};
      for (const discipline of update.disciplines) {
        nextDisciplines[discipline] = state.disciplines[discipline] ?? true;
      }
      return {
        ...state,
        disciplines: nextDisciplines,
      };
    }

    case 'reset': {
      const defaultTypes: Record<string, boolean> = {};
      for (const typeName of Object.keys(state.types)) {
        defaultTypes[typeName] = true;
      }
      const defaultDisciplines: Record<string, boolean> = {};
      for (const discipline of Object.keys(state.disciplines)) {
        defaultDisciplines[discipline] = true;
      }
      return {
        ...state,
        gradeRanges: {},
        order: update.defaultOrder,
        groupBy: 'none',
        hideTicked: false,
        onlyFa: false,
        onlyMultipitch: false,
        types: defaultTypes,
        disciplines: defaultDisciplines,
      };
    }

    default: {
      return neverGuard(action, state);
    }
  }
};

/**
 * Rank for a row the list cannot rank: below the easiest grade of its discipline, mirroring the old weight-0 rows
 * (after every graded row in `grade-desc`, before them in `grade-asc`).
 */
const NO_GRADE_RANK = Number.MAX_SAFE_INTEGER;

/**
 * `gradeRank` supplies the round-robin grade rank of each row (see `useProblemListState`): every row's grade ranked
 * within its own discipline, so equal ranks are the same «level» across disciplines. The other orders are row-local.
 */
const buildSorts = (gradeRank: (row: Row) => number): Record<State['order'], (a: Row, b: Row) => number> => ({
  name: (a, b) =>
    a.areaName.localeCompare(b.areaName, getLocales()) ||
    a.sectorName.localeCompare(b.sectorName, getLocales()) ||
    a.name.localeCompare(b.name, getLocales()),

  ascents: (a, b) => b.numTicks - a.numTicks || a.name.localeCompare(b.name, getLocales()),

  date: (a, b) => a.num - b.num || a.name.localeCompare(b.name, getLocales()),

  'first-ascent': (a, b) => {
    if (a.faDate && !b.faDate) {
      return -1;
    } else if (!a.faDate && b.faDate) {
      return 1;
    }
    return (a.faDate ?? '').localeCompare(b.faDate ?? '', getLocales()) || a.name.localeCompare(b.name, getLocales());
  },

  'grade-desc': (a, b) =>
    gradeRank(a) - gradeRank(b) ||
    disciplineRank(a) - disciplineRank(b) ||
    a.num - b.num ||
    a.name.localeCompare(b.name, getLocales()),

  'grade-asc': (a, b) =>
    gradeRank(b) - gradeRank(a) ||
    disciplineRank(a) - disciplineRank(b) ||
    a.num - b.num ||
    a.name.localeCompare(b.name, getLocales()),

  number: (a, b) => (a?.nr ?? 0) - (b?.nr ?? 0) || a.name.localeCompare(b.name, getLocales()),

  rating: (a, b) =>
    b.stars - a.stars || gradeRank(a) - gradeRank(b) || a.num - b.num || a.name.localeCompare(b.name, getLocales()),
});

const CLEANED_ORDER: Record<OrderOption, OrderOption> = {
  number: 'number',
  name: 'name',
  ascents: 'ascents',
  date: 'date',
  'first-ascent': 'first-ascent',
  'grade-asc': 'grade-asc',
  'grade-desc': 'grade-desc',
  rating: 'rating',
};

export const useProblemListState = ({
  rows,
  order: defaultOrder,
  key,
  sortPreferenceBucket,
  filterPreferenceBucket,
}: {
  rows: Row[];
  order: State['order'];
  key: string;
  /**
   * Sector / area lists: persist sort in localStorage under a shared bucket (grade vs number default styles,
   * plus area aggregate). Omit for user profile lists — then sort is keyed by `problemList/${key}/order`.
   */
  sortPreferenceBucket?: 'grade' | 'number' | 'area';
  /**
   * When provided, grade range and type filters are persisted in localStorage under a shared key so
   * they carry over when navigating between pages in the same context (e.g. sector browsing).
   * Use `'sector'` for sector and area lists. Omit for user profile lists (per-page key used instead).
   */
  filterPreferenceBucket?: string;
}): State & { dispatch: Dispatch<Update> } => {
  const [storedHideTicked, setStoredHideTicked] = useSessionStorage(`problemList/${key}/hideTicked`, false);
  const [storedOnlyFa, setStoredOnlyFa] = useSessionStorage(`problemList/${key}/onlyFa`, false);
  const [storedOnlyMultipitch, setStoredOnlyMultipitch] = useSessionStorage(`problemList/${key}/onlyMultipitch`, false);

  const orderStorageKey =
    sortPreferenceBucket != null
      ? `problemList/sector/sortPreference/${sortPreferenceBucket}`
      : `problemList/${key}/order`;

  const [storedOrderBy, setStoredOrderBy] = useLocalStorage(orderStorageKey, defaultOrder);

  const filterStorageKey =
    filterPreferenceBucket != null ? `problemList/filterPreference/${filterPreferenceBucket}` : `problemList/${key}`;
  /**
   * Grade ranges keyed by grade system id: a list can hold grades of several systems (a profile covers every region
   * the user has climbed in) and weights are only comparable within one system, so each system keeps its own range.
   */
  const [storedGradeRanges, setStoredGradeRanges] = useLocalStorage<Record<string, GradeRange>>(
    `${filterStorageKey}/gradeRanges`,
    {},
  );
  /** Pre-per-system keys, read only to fold a saved range into {@link storedGradeRanges} (see the migration effect). */
  const [legacyGradeLow, setLegacyGradeLow] = useLocalStorage<string | null>(`${filterStorageKey}/gradeLow`, null);
  const [legacyGradeHigh, setLegacyGradeHigh] = useLocalStorage<string | null>(`${filterStorageKey}/gradeHigh`, null);
  const [storedTypes, setStoredTypes] = useLocalStorage<Record<string, boolean>>(`${filterStorageKey}/types`, {});

  const regionGradeSystems = useGradeSystems();
  const { allGradeSystems } = useMeta();

  /**
   * Grade system shared by every row, if there is one. `undefined` while the rows span several systems, and while they
   * have none and the region declares several; a region with a single system resolves rows without one to it.
   */
  const sharedGradeSystemId = useMemo(() => {
    const ids = new Set(rows.map((row) => row.gradeSystemId ?? 0));
    if (ids.size > 1) return undefined;
    const id = [...ids][0] ?? 0;
    if (id > 0) return id;
    return regionGradeSystems.length === 1 ? regionGradeSystems[0].id : undefined;
  }, [regionGradeSystems, rows]);

  /** Grade system of one row — rows without one adopt the list's single system (projects, older payloads). */
  const resolveRowGradeSystemId = useCallback(
    (row: Row) => {
      const id = row.gradeSystemId ?? 0;
      return id > 0 ? id : sharedGradeSystemId;
    },
    [sharedGradeSystemId],
  );

  /** Freshly stored ranges, or a one-time fold of the pre-per-system keys into the list's single system. */
  const initialGradeRanges = useMemo<Record<string, GradeRange>>(() => {
    if (Object.keys(storedGradeRanges).length > 0) return storedGradeRanges;
    if (sharedGradeSystemId === undefined) return {};
    if (legacyGradeLow === null && legacyGradeHigh === null) return {};
    return {
      [String(sharedGradeSystemId)]: { low: legacyGradeLow ?? undefined, high: legacyGradeHigh ?? undefined },
    };
  }, [legacyGradeHigh, legacyGradeLow, sharedGradeSystemId, storedGradeRanges]);

  const typeNames = useMemo(() => [...new Set(rows.map(rowListTypeKey))].sort(), [rows]);
  /** Profile lists only: the disciplines present on the rows, ordered by the discipline flags (bouldering → rope → ice). */
  const disciplineNames = useMemo(() => distinctDisciplines(rows), [rows]);

  const [{ gradeRanges, hideTicked, onlyFa, onlyMultipitch, order, groupBy, types, disciplines }, dispatch] =
    useReducer(uiStateReducer, {
      gradeRanges: initialGradeRanges,
      order: CLEANED_ORDER[storedOrderBy as OrderOption] ?? defaultOrder,
      /** Grouping is not persisted — default to none each visit. */
      groupBy: 'none',
      hideTicked: storedHideTicked,
      onlyFa: storedOnlyFa,
      onlyMultipitch: storedOnlyMultipitch,
      types: rows.reduce(
        (acc, row) => {
          const tKey = rowListTypeKey(row);
          return { ...acc, [tKey]: storedTypes[tKey] ?? true };
        },
        {} as Record<string, boolean>,
      ),
      /** Disciplines are not persisted either — “ALL” is the default for every visit. */
      disciplines: rows.reduce(
        (acc, row) => (row.discipline ? { ...acc, [row.discipline]: true } : acc),
        {} as Record<string, boolean>,
      ),
    });

  useEffect(() => setStoredHideTicked(hideTicked), [hideTicked, setStoredHideTicked]);
  useEffect(() => setStoredOnlyFa(onlyFa), [onlyFa, setStoredOnlyFa]);
  useEffect(() => setStoredOnlyMultipitch(onlyMultipitch), [onlyMultipitch, setStoredOnlyMultipitch]);
  useEffect(() => setStoredOrderBy(order), [order, setStoredOrderBy]);
  useEffect(() => setStoredGradeRanges(gradeRanges), [gradeRanges, setStoredGradeRanges]);
  /** One-time migration: fold the pre-per-system keys into `gradeRanges` (the initial state already applies them). */
  useEffect(() => {
    if (legacyGradeLow === null && legacyGradeHigh === null) return;
    /** No rows yet (still loading): keep the legacy keys for the render that knows the list's grade system. */
    if (rows.length === 0) return;
    if (Object.keys(storedGradeRanges).length === 0 && sharedGradeSystemId !== undefined) {
      setStoredGradeRanges({
        [String(sharedGradeSystemId)]: { low: legacyGradeLow ?? undefined, high: legacyGradeHigh ?? undefined },
      });
    }
    setLegacyGradeLow(null);
    setLegacyGradeHigh(null);
  }, [
    legacyGradeHigh,
    legacyGradeLow,
    rows.length,
    setLegacyGradeHigh,
    setLegacyGradeLow,
    setStoredGradeRanges,
    sharedGradeSystemId,
    storedGradeRanges,
  ]);
  useEffect(() => setStoredTypes((prev) => ({ ...prev, ...types })), [types, setStoredTypes]);
  useEffect(() => dispatch({ action: 'init-types', typeNames }), [typeNames]);
  useEffect(() => dispatch({ action: 'init-disciplines', disciplines: disciplineNames }), [disciplineNames]);

  /**
   * One grade filter per grade system found on the rows, in catalogue order (stable while sorting/filtering). Each
   * filter owns its system's grade domain, so a range can never hide rows of another system — unlike a single range
   * built from one system, which used to drop every row whose grade that system did not know.
   *
   * A stored bound that is not a grade of its system (stale preference, or a shared sector bucket that moved to an
   * area with another system) is ignored; the entry itself is kept for when that system comes back.
   */
  const gradeFilters = useMemo<GradeFilter[]>(() => {
    const presentSystemIds = new Set<number>();
    for (const row of rows) {
      const systemId = resolveRowGradeSystemId(row);
      if (systemId !== undefined) presentSystemIds.add(systemId);
    }

    return allGradeSystems.flatMap((system) => {
      if (!presentSystemIds.has(system.id)) return [];
      const { easyToHard, mapping } = buildGradeDomain([system], false);
      const presentGrades = new Set<string>();
      for (const row of rows) {
        if (row.grade && resolveRowGradeSystemId(row) === system.id) presentGrades.add(row.grade);
      }
      /** A system may repeat a label; the content lists it once. */
      const grades = [...new Set(easyToHard)];
      const stored = gradeRanges[String(system.id)] ?? {};
      return [
        {
          gradeSystemId: system.id,
          name: system.name,
          easyToHard: grades,
          mapping,
          labels: grades.filter((grade) => presentGrades.has(grade)),
          low: stored.low !== undefined && mapping[stored.low] !== undefined ? stored.low : undefined,
          high: stored.high !== undefined && mapping[stored.high] !== undefined ? stored.high : undefined,
        },
      ];
    });
  }, [allGradeSystems, gradeRanges, resolveRowGradeSystemId, rows]);

  /** System id → filter, for the row predicate below (a map keeps the per-row lookup O(1)). */
  const gradeFiltersById = useMemo(
    () => new Map(gradeFilters.map((filter) => [filter.gradeSystemId, filter])),
    [gradeFilters],
  );

  /**
   * Grade sort key: every row's grade ranked within its own discipline — 0 is the hardest grade this list holds for
   * that discipline, 1 the second hardest, and so on. «Grade (hard → easy)» therefore walks the hardest grade of every
   * discipline first, then the second hardest of every discipline, and so on. Inside a discipline grades are ordered by
   * their own `gradeWeight`; those weights are relative to the row's grade system, so merging several systems inside
   * one discipline is a best effort — but it never mixes disciplines, which a plain `gradeWeight` sort did.
   *
   * The rows are the source of truth rather than the meta `mapping`: a profile list spans regions, so it can hold
   * grades of systems the current region does not declare (e.g. bouldering grades on a rope region's page), and those
   * have no entry in `mapping`. Rows without a grade (projects) rank below the easiest grade, so they come first in
   * `grade-asc` and last in `grade-desc`.
   */
  const gradeRank = useMemo(() => {
    /** Discipline → grade label → the heaviest weight seen for it (one label of one system always weighs the same). */
    const weightByDiscipline = new Map<string, Map<string, number>>();
    for (const row of rows) {
      if (!row.grade) continue;
      const discipline = row.discipline ?? '';
      const weights = weightByDiscipline.get(discipline) ?? new Map<string, number>();
      weights.set(row.grade, Math.max(weights.get(row.grade) ?? 0, row.gradeWeight));
      weightByDiscipline.set(discipline, weights);
    }

    const rankByDiscipline = new Map<string, Map<string, number>>();
    for (const [discipline, weights] of weightByDiscipline) {
      const hardToEasy = [...weights].sort(
        ([gradeA, weightA], [gradeB, weightB]) => weightB - weightA || gradeA.localeCompare(gradeB, getLocales()),
      );
      rankByDiscipline.set(discipline, new Map(hardToEasy.map(([grade], rank) => [grade, rank])));
    }

    const rankByRow = new Map<Row, number>();
    for (const row of rows) {
      const ranks = rankByDiscipline.get(row.discipline ?? '');
      /** A row without a grade (project) ranks below the easiest grade of its own discipline. */
      const rank = row.grade ? ranks?.get(row.grade) : ranks?.size;
      rankByRow.set(row, rank ?? NO_GRADE_RANK);
    }
    return (row: Row) => rankByRow.get(row) ?? NO_GRADE_RANK;
  }, [rows]);

  const [filtered, uniqueAreas, uniqueRocks, uniqueSectors, uniqueTypes] = useMemo(() => {
    const areas = new Set<string>();
    const rocks = new Set<string>();
    const sectors = new Set<string>();
    const typeNames = new Set<string>();

    const filterByType = !Object.values(types).every((v) => {
      return !v;
    });
    const filterByDiscipline = !Object.values(disciplines).every((v) => {
      return !v;
    });

    const filterByGrade = (row: Row) => {
      const systemId = resolveRowGradeSystemId(row);
      if (systemId === undefined) return true;
      const filter = gradeFiltersById.get(systemId);
      if (!filter || (filter.low === undefined && filter.high === undefined)) return true;
      const index = filter.mapping[row.grade];
      /** Unknown grade (a project's empty grade, or a label the catalogue does not hold): never hide the row. */
      if (index === undefined) return true;
      const low = filter.low !== undefined ? filter.mapping[filter.low] : undefined;
      const high = filter.high !== undefined ? filter.mapping[filter.high] : undefined;
      return (low === undefined || index >= low) && (high === undefined || index <= high);
    };

    const filtered = rows
      .filter((problem) => {
        areas.add(problem.areaName);
        rocks.add(problem.rock);
        sectors.add(problem.sectorName);
        const tKey = rowListTypeKey(problem);
        typeNames.add(tKey);

        return (
          filterByGrade(problem) &&
          (hideTicked ? !problem.ticked : true) &&
          (onlyFa ? problem.fa : true) &&
          (onlyMultipitch ? (problem.numPitches ?? 0) > 1 : true) &&
          (filterByType ? !!types[tKey] : true) &&
          (filterByDiscipline && problem.discipline ? !!disciplines[problem.discipline] : true)
        );
      })
      .sort(buildSorts(gradeRank)[order]);

    return [filtered, [...areas].sort(), [...rocks].sort(), [...sectors].sort(), [...typeNames].sort()];
  }, [
    disciplines,
    gradeFiltersById,
    gradeRank,
    hideTicked,
    onlyFa,
    onlyMultipitch,
    order,
    resolveRowGradeSystemId,
    rows,
    types,
  ]);

  return {
    dispatch,

    // UI state
    gradeRanges,
    order,
    groupBy,
    hideTicked,
    onlyFa,
    onlyMultipitch,
    types,
    disciplines,

    // Derived state
    filtered,
    numHidden: rows.length - filtered.length,
    uniqueAreas,
    uniqueRocks,
    uniqueSectors,
    uniqueTypes,
    uniqueDisciplines: disciplineNames,
    gradeFilters,
    containsFa: !!rows.find(({ fa }) => !!fa),
    containsTicked: !!rows.find(({ ticked }) => !!ticked),
    containsMultipitch: !!rows.find(({ numPitches }) => (numPitches ?? 0) > 1),
  };
};
