import { type ComponentProps, useMemo, useState, type ChangeEvent } from 'react';
import AccordionContainer from './accordion-container';
import { GradeSelect } from '../FilterForm/GradeSelect';
import type { Row } from './types';
import { type GroupOption, type OrderOption, type State, useProblemListState } from './state';
import { ChevronDown, Filter, FolderTree, ArrowDownWideNarrow, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Props = {
  rows: Row[];
  mode: 'sector' | 'user';
  defaultOrder: OrderOption;
  storageKey: string;
};

type OrderByOption = { key: string; text: string; value: OrderOption };

const ORDER_BY_OPTIONS: Record<'sector' | 'user', OrderByOption[]> = {
  sector: [
    { key: 'name', text: 'name', value: 'name' },
    { key: 'ascents', text: 'ascents', value: 'ascents' },
    { key: 'first-ascent', text: 'first ascent', value: 'first-ascent' },
    { key: 'grade-asc', text: 'grade (easy -> hard)', value: 'grade-asc' },
    { key: 'grade-desc', text: 'grade (hard -> easy)', value: 'grade-desc' },
    { key: 'number', text: 'number', value: 'number' },
    { key: 'rating', text: 'rating', value: 'rating' },
  ],
  user: [
    { key: 'name', text: 'name', value: 'name' },
    { key: 'date', text: 'date', value: 'date' },
    { key: 'grade-asc', text: 'grade (easy -> hard)', value: 'grade-asc' },
    { key: 'grade-desc', text: 'grade (hard -> easy)', value: 'grade-desc' },
    { key: 'rating', text: 'rating', value: 'rating' },
  ],
} as const;

const GROUP_BY: Record<
  GroupOption,
  (
    partialState: Pick<
      State,
      'uniqueAreas' | 'uniqueRocks' | 'uniqueSectors' | 'uniqueTypes' | 'filtered'
    >,
  ) => ComponentProps<typeof AccordionContainer>['accordionRows']
> = {
  area: ({ uniqueAreas, filtered }) =>
    uniqueAreas.map((areaName) => {
      const list = filtered.filter((p) => p.areaName === areaName).map((p) => p.element);
      return {
        label: `${areaName || '<Without area>'} (${list.length})`,
        length: list.length,
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),

  none: () => {
    throw new Error('This should not have been called');
  },

  rock: ({ uniqueRocks, filtered }) =>
    uniqueRocks.map((rock) => {
      const list = filtered.filter((p) => p.rock === rock).map((p) => p.element);
      return {
        label: `${rock || '<Without rock>'} (${list.length})`,
        length: list.length,
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),

  sector: ({ uniqueSectors, filtered }) =>
    uniqueSectors.map((sectorName) => {
      const list = filtered.filter((p) => p.sectorName === sectorName).map((p) => p.element);
      return {
        length: list.length,
        label: `${sectorName || '<No sector>'} (${list.length})`,
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),

  type: ({ uniqueTypes, filtered }) =>
    uniqueTypes.map((subType) => {
      const list = filtered.filter((p) => p.subType === subType).map((p) => p.element);
      return {
        label: `${subType || '<No type>'} (${list.length})`,
        length: list.length,
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),
};

type GroupByOption = {
  key: string;
  text: string;
  value: GroupOption;
  isApplicable: (
    state: Pick<State, 'uniqueAreas' | 'uniqueRocks' | 'uniqueSectors' | 'uniqueTypes'>,
  ) => boolean;
};

const GROUP_BY_OPTIONS: Record<GroupOption, GroupByOption> = {
  area: {
    key: 'area',
    text: 'area',
    value: 'area',
    isApplicable: ({ uniqueAreas }) => uniqueAreas.length > 1,
  },
  none: {
    key: 'none',
    text: 'none',
    value: 'none',
    isApplicable: () => true,
  },
  rock: {
    key: 'rock',
    text: 'rock',
    value: 'rock',
    isApplicable: ({ uniqueRocks }) => uniqueRocks.length > 1,
  },
  sector: {
    key: 'sector',
    text: 'sector',
    value: 'sector',
    isApplicable: ({ uniqueSectors }) => uniqueSectors.length > 1,
  },
  type: {
    key: 'type',
    text: 'type',
    value: 'type',
    isApplicable: ({ uniqueTypes }) => uniqueTypes.length > 1,
  },
};

const CheckboxLabel = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <label className='flex items-center gap-2 cursor-pointer group'>
    <div
      className={cn(
        'w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0',
        checked
          ? 'bg-brand border-brand'
          : 'bg-surface-nav border-surface-border group-hover:border-slate-400',
      )}
    >
      {checked && <div className='w-2 h-2 rounded-sm bg-white' />}
    </div>
    <span className='text-sm text-slate-300 select-none group-hover:text-white transition-colors'>
      {label}
    </span>
    <input type='checkbox' className='hidden' checked={checked} onChange={onChange} />
  </label>
);

const ToggleLabel = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className='flex items-center gap-3 cursor-pointer group'>
    <div
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none p-0.5',
        checked ? 'bg-brand' : 'bg-surface-border group-hover:bg-slate-600',
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </div>
    <span className='text-sm font-medium text-slate-300 group-hover:text-white'>{label}</span>
    <input type='checkbox' className='hidden' checked={checked} onChange={onChange} />
  </label>
);

export const ProblemList = ({ rows: allRows, mode, defaultOrder, storageKey }: Props) => {
  const [showFilter, setFilterShowing] = useState(false);

  const [allTypes, lookup] = useMemo(() => {
    const types = new Set<string>();
    const lookup: Record<string, number> = {};
    for (const row of allRows) {
      types.add(row.subType);
      lookup[row.subType] = (lookup[row.subType] ?? 0) + 1;
    }
    return [[...types].sort(), lookup];
  }, [allRows]);

  const {
    gradeLow,
    gradeHigh,
    order,
    groupBy,
    hideTicked,
    onlyFa,
    types,
    filtered,
    uniqueAreas,
    uniqueRocks,
    uniqueSectors,
    uniqueTypes,
    containsFa,
    containsTicked,
    dispatch,
  } = useProblemListState({
    rows: allRows,
    order: defaultOrder,
    key: storageKey,
  });

  const orderByOptions = ORDER_BY_OPTIONS[mode];

  if (!allRows?.length) {
    return null;
  }

  const list = (() => {
    if (filtered.length === 0) {
      const hidden = allRows.length - filtered.length;
      return (
        <div className='flex items-start gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mt-4'>
          <AlertTriangle className='text-orange-500 shrink-0 mt-0.5' size={20} />
          <div>
            <h3 className='text-orange-500 font-bold text-[15px] mb-1'>No visible data</h3>
            <p className='text-orange-400/80 text-sm'>
              There are active filters which are hiding {hidden} {hidden > 1 ? 'results' : 'result'}
              .
            </p>
          </div>
        </div>
      );
    }

    if (groupBy && groupBy !== 'none') {
      const mapper = GROUP_BY[groupBy];
      return (
        <div className='mt-4'>
          <AccordionContainer
            accordionRows={mapper({
              uniqueAreas,
              uniqueRocks,
              uniqueSectors,
              uniqueTypes,
              filtered,
            }).filter(({ length }) => length)}
          />
        </div>
      );
    }

    return <div className='flex flex-col gap-2 mt-4'>{filtered.map(({ element }) => element)}</div>;
  })();

  const groupByOptions = Object.values(GROUP_BY_OPTIONS)
    .filter(({ isApplicable }) =>
      isApplicable({
        uniqueAreas,
        uniqueRocks,
        uniqueSectors,
        uniqueTypes,
      }),
    )
    .map(({ isApplicable: _, ...props }) => props);

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2 p-2 bg-surface-nav/50 border border-surface-border rounded-xl'>
        {groupByOptions.length > 1 && (
          <div className='flex items-center gap-2 px-2 border-r border-surface-border/50'>
            <FolderTree size={14} className='text-slate-500' />
            <div className='relative'>
              <select
                className='appearance-none bg-transparent py-1.5 pl-2 pr-6 text-sm font-bold text-slate-300 focus:outline-none focus:text-white cursor-pointer'
                value={groupBy}
                onChange={(e) =>
                  dispatch({
                    action: 'group-by',
                    groupBy: (e.target.value as GroupOption) ?? 'none',
                  })
                }
              >
                {groupByOptions.map((opt) => (
                  <option key={opt.key} value={opt.value} className='bg-surface-card'>
                    {opt.text}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className='absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
              />
            </div>
          </div>
        )}

        <div className='flex items-center gap-2 px-2 border-r border-surface-border/50'>
          <ArrowDownWideNarrow size={14} className='text-slate-500' />
          <div className='relative'>
            <select
              className='appearance-none bg-transparent py-1.5 pl-2 pr-6 text-sm font-bold text-slate-300 focus:outline-none focus:text-white cursor-pointer'
              value={order}
              onChange={(e) =>
                dispatch({
                  action: 'order-by',
                  order: (e.target.value as OrderOption) ?? 'grade-desc',
                })
              }
            >
              {orderByOptions.map((opt) => (
                <option key={opt.key} value={opt.value} className='bg-surface-card'>
                  {opt.text}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className='absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
            />
          </div>
        </div>

        <button
          type='button'
          onClick={() => setFilterShowing((v) => !v)}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 ml-auto rounded-lg text-sm font-bold transition-all',
            showFilter
              ? 'bg-brand text-white shadow-md shadow-brand/20'
              : 'text-slate-400 hover:text-white hover:bg-surface-nav',
          )}
        >
          <Filter size={14} /> Filter
        </button>
      </div>

      {showFilter && (
        <div className='bg-surface-card border border-surface-border rounded-xl p-5 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-3'>
              <h5 className='text-[10px] font-black uppercase tracking-widest text-slate-500 m-0'>
                Grades
              </h5>
              <div className='px-1'>
                <GradeSelect low={gradeLow} high={gradeHigh} dispatch={dispatch} />
              </div>
            </div>

            <div className='space-y-6'>
              {allTypes.length > 1 && (
                <div className='space-y-3'>
                  <h5 className='text-[10px] font-black uppercase tracking-widest text-slate-500 m-0'>
                    Types
                  </h5>
                  <div className='flex flex-wrap gap-4 px-1'>
                    {allTypes.map((type) => (
                      <CheckboxLabel
                        key={type}
                        label={`${type} (${lookup[type]})`}
                        checked={types[type]}
                        onChange={(e) => {
                          dispatch({
                            action: 'type',
                            type,
                            enabled: e.target.checked,
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(mode === 'sector' && containsTicked) || (mode === 'user' && containsFa) ? (
                <div className='space-y-3'>
                  <h5 className='text-[10px] font-black uppercase tracking-widest text-slate-500 m-0'>
                    Options
                  </h5>
                  <div className='flex flex-wrap gap-6 px-1'>
                    {mode === 'sector' && containsTicked && (
                      <ToggleLabel
                        label='Hide ticked'
                        checked={hideTicked}
                        onChange={() => dispatch({ action: 'hide-ticked' })}
                      />
                    )}
                    {mode === 'user' && containsFa && (
                      <ToggleLabel
                        label='Only show FA'
                        checked={onlyFa}
                        onChange={() => dispatch({ action: 'only-fa' })}
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {list}
    </div>
  );
};

export default ProblemList;
