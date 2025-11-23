import { Dispatch, useEffect, useMemo, useReducer } from 'react';
import { neverGuard } from '../../../utils/neverGuard';
import { DispatchUpdate } from '../FilterForm/GradeSelect/GradeSelect';
import { Row } from './types';
import { useGrades } from '../meta';
import { getLocales } from '../../../api';
import { useSessionStorage } from '../../../utils/use-local-storage';

export type OrderOption =
  | 'ascents'
  | 'date'
  | 'first-ascent'
  | 'grade-asc'
  | 'grade-desc'
  | 'name'
  | 'number'
  | 'rating';

export type GroupOption = 'area' | 'none' | 'rock' | 'sector' | 'type';

type UiState = {
  gradeLow: string | undefined;
  gradeHigh: string | undefined;
  order: OrderOption;
  groupBy: GroupOption;
  hideTicked: boolean;
  onlyFa: boolean;
  types: Record<string, boolean>;
};

type DerivedState = {
  filtered: Row[];
  numHidden: number;
  uniqueAreas: string[];
  uniqueRocks: string[];
  uniqueSectors: string[];
  uniqueTypes: string[];
  containsFa: boolean;
  containsTicked: boolean;
};

export type State = UiState & DerivedState;

type Update =
  | DispatchUpdate
  | { action: 'order-by'; order: UiState['order'] }
  | { action: 'group-by'; groupBy: UiState['groupBy'] }
  | { action: 'hide-ticked'; hideTicked?: UiState['hideTicked'] }
  | { action: 'only-fa'; onlyFa?: UiState['onlyFa'] }
  | { action: 'type'; type: string; enabled: boolean };

const uiStateReducer = (state: UiState, update: Update): UiState => {
  const { action } = update;
  switch (action) {
    case 'set-grades': {
      return {
        ...state,
        gradeLow: update.low,
        gradeHigh: update.high,
      };
    }

    case 'set-grade': {
      if ('low' in update) {
        return {
          ...state,
          gradeLow: update.low,
        };
      }
      return {
        ...state,
        gradeHigh: update.high,
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

    case 'type': {
      return {
        ...state,
        types: {
          ...state.types,
          [update.type]: update.enabled,
        },
      };
    }

    default: {
      return neverGuard(action, state);
    }
  }
};

const SORTS: Record<State['order'], (a: Row, b: Row) => number> = {
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
    return (
      a.faDate?.localeCompare(b.faDate, getLocales()) || a.name.localeCompare(b.name, getLocales())
    );
  },

  'grade-desc': (a, b) =>
    b.gradeNumber - a.gradeNumber || a.name.localeCompare(b.name, getLocales()),

  'grade-asc': (a, b) =>
    a.gradeNumber - b.gradeNumber || a.name.localeCompare(b.name, getLocales()),

  number: (a, b) => (a?.nr ?? 0) - (b?.nr ?? 0) || a.name.localeCompare(b.name, getLocales()),

  rating: (a, b) =>
    b.stars - a.stars ||
    b.gradeNumber - a.gradeNumber ||
    a.name.localeCompare(b.name, getLocales()),
} as const;

const CLEANED_GROUP_BY: Record<GroupOption, GroupOption> = {
  type: 'type',
  area: 'area',
  none: 'none',
  rock: 'rock',
  sector: 'sector',
};

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
}: {
  rows: Row[];
  order: State['order'];
  key: string;
}): State & { dispatch: Dispatch<Update> } => {
  const [storedHideTicked, setStoredHideTicked] = useSessionStorage(
    `problemList/${key}/hideTicked`,
    false,
  );
  const [storedOnlyFa, setStoredOnlyFa] = useSessionStorage(`problemList/${key}/onlyFa`, false);
  const [storedGroupBy, setStoredGroupBy] = useSessionStorage(`problemList/${key}/groupBy`, 'none');
  const [storedOrderBy, setStoredOrderBy] = useSessionStorage(
    `problemList/${key}/sectorOrderBy`,
    defaultOrder,
  );

  const { mapping, easyToHard, idToGrade } = useGrades();
  const [{ gradeLow, gradeHigh, hideTicked, onlyFa, order, groupBy, types }, dispatch] = useReducer(
    uiStateReducer,
    {
      gradeHigh: undefined,
      gradeLow: undefined,
      order: CLEANED_ORDER[storedOrderBy] ?? 'name',
      groupBy: CLEANED_GROUP_BY[storedGroupBy as GroupOption] ?? 'none',
      hideTicked: storedHideTicked,
      onlyFa: storedOnlyFa,
      types: rows.reduce((acc, { subType }) => ({ ...acc, [subType]: false }), {}),
    },
  );

  useEffect(() => setStoredHideTicked(hideTicked), [hideTicked, setStoredHideTicked]);
  useEffect(() => setStoredOnlyFa(onlyFa), [onlyFa, setStoredOnlyFa]);
  useEffect(() => setStoredGroupBy(groupBy), [groupBy, setStoredGroupBy]);
  useEffect(() => setStoredOrderBy(order), [order, setStoredOrderBy]);

  const [filtered, uniqueAreas, uniqueRocks, uniqueSectors, uniqueTypes] = useMemo(() => {
    const areas = new Set<string>();
    const rocks = new Set<string>();
    const sectors = new Set<string>();
    const typeNames = new Set<string>();

    const filterByType = !Object.values(types).every((v) => {
      return !v;
    });

    const indexLow = mapping[gradeLow ?? easyToHard[0]];
    const indexHigh = mapping[gradeHigh ?? easyToHard[easyToHard.length - 1]];

    const filtered = rows
      .filter((problem) => {
        areas.add(problem.areaName);
        rocks.add(problem.rock);
        sectors.add(problem.sectorName);
        typeNames.add(problem.subType);

        const index = mapping[idToGrade[problem.gradeNumber] ?? 'n/a'] ?? 0;

        return (
          index >= indexLow &&
          index <= indexHigh &&
          (hideTicked ? !problem.ticked : true) &&
          (onlyFa ? problem.fa : true) &&
          (filterByType ? !!types[problem.subType] : true)
        );
      })
      .sort(SORTS[order]);

    return [
      filtered,
      [...areas].sort(),
      [...rocks].sort(),
      [...sectors].sort(),
      [...typeNames].sort(),
    ];
  }, [easyToHard, gradeHigh, gradeLow, hideTicked, idToGrade, mapping, onlyFa, order, rows, types]);

  return {
    dispatch,

    // UI state
    gradeLow,
    gradeHigh,
    order,
    groupBy,
    hideTicked,
    onlyFa,
    types,

    // Derived state
    filtered,
    numHidden: rows.length - filtered.length,
    uniqueAreas,
    uniqueRocks,
    uniqueSectors,
    uniqueTypes,
    containsFa: !!rows.find(({ fa }) => !!fa),
    containsTicked: !!rows.find(({ ticked }) => !!ticked),
  };
};
