import { type ComponentProps, useMemo, useState, type ChangeEvent } from 'react';
import AccordionContainer from './AccordionContainer';
import { GradeSelect } from '../FilterForm/GradeSelect';
import type { Row } from './types';
import { type GroupOption, type OrderOption, type State, useProblemListState } from './state';
import { ChevronDown, Filter, FolderTree, ArrowDownWideNarrow, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

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
    partialState: Pick<State, 'uniqueAreas' | 'uniqueRocks' | 'uniqueSectors' | 'uniqueTypes' | 'filtered'>,
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
  isApplicable: (state: Pick<State, 'uniqueAreas' | 'uniqueRocks' | 'uniqueSectors' | 'uniqueTypes'>) => boolean;
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
  <label className='group flex cursor-pointer items-center gap-2'>
    <div
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
        checked ? 'bg-brand border-brand' : 'bg-surface-nav border-surface-border group-hover:border-slate-400',
      )}
    >
      {checked && <div className='h-2 w-2 rounded-sm bg-white' />}
    </div>
    <span className='text-sm opacity-85 transition-colors select-none group-hover:opacity-100'>{label}</span>
    <input type='checkbox' className='hidden' checked={checked} onChange={onChange} />
  </label>
);

const ToggleLabel = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label className='group flex cursor-pointer items-center gap-3'>
    <div
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none',
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
    <span className='text-sm font-medium opacity-85 group-hover:opacity-100'>{label}</span>
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
        <div className='mt-4 flex items-start gap-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4'>
          <AlertTriangle className='mt-0.5 shrink-0 text-orange-500' size={20} />
          <div>
            <h3 className='mb-1 text-[15px] font-bold text-orange-500'>No visible data</h3>
            <p className='text-sm text-orange-400/80'>
              There are active filters which are hiding {hidden} {hidden > 1 ? 'results' : 'result'}.
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

    return <div className='mt-4 flex flex-col gap-2'>{filtered.map(({ element }) => element)}</div>;
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
      <div className='bg-surface-nav/50 border-surface-border flex flex-wrap items-center gap-2 rounded-xl border p-2'>
        {groupByOptions.length > 1 && (
          <div className='border-surface-border/50 flex items-center gap-2 border-r px-2'>
            <FolderTree size={14} className='text-slate-500' />
            <div className='relative'>
              <select
                className='cursor-pointer appearance-none bg-transparent py-1.5 pr-6 pl-2 text-sm font-bold opacity-85 focus:opacity-100 focus:outline-none'
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
                className='pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-slate-500'
              />
            </div>
          </div>
        )}

        <div className='border-surface-border/50 flex items-center gap-2 border-r px-2'>
          <ArrowDownWideNarrow size={14} className='text-slate-500' />
          <div className='relative'>
            <select
              className='cursor-pointer appearance-none bg-transparent py-1.5 pr-6 pl-2 text-sm font-bold opacity-85 focus:opacity-100 focus:outline-none'
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
              className='pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-slate-500'
            />
          </div>
        </div>

        <button
          type='button'
          onClick={() => setFilterShowing((v) => !v)}
          className={cn(
            'ml-auto flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold transition-all',
            showFilter ? 'bg-brand shadow-brand/20 shadow-md' : 'hover:bg-surface-nav opacity-70 hover:opacity-100',
          )}
        >
          <Filter size={14} /> Filter
        </button>
      </div>

      {showFilter && (
        <div className='bg-surface-card border-surface-border space-y-6 rounded-xl border p-5'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <div className='space-y-3'>
              <h5 className={cn('m-0', designContract.typography.label)}>Grades</h5>
              <div className='px-1'>
                <GradeSelect low={gradeLow} high={gradeHigh} dispatch={dispatch} />
              </div>
            </div>

            <div className='space-y-6'>
              {allTypes.length > 1 && (
                <div className='space-y-3'>
                  <h5 className={cn('m-0', designContract.typography.label)}>Types</h5>
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
                  <h5 className={cn('m-0', designContract.typography.label)}>Options</h5>
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
