import { type ComponentProps, useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AccordionContainer from './AccordionContainer';
import type { Row } from './types';
import { type GroupOption, type OrderOption, type State, useProblemListState } from './state';
import { ChevronDown, Filter, FolderTree, ArrowDownWideNarrow } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useGrades } from '../Meta';

type Props = {
  rows: Row[];
  mode: 'sector' | 'user';
  defaultOrder: OrderOption;
  storageKey: string;
  toolbarAction?: React.ReactNode;
  contentBeforeList?: React.ReactNode | ((filteredRows: Row[]) => React.ReactNode);
  excludedSortOptions?: OrderOption[];
};

type OrderByOption = { key: string; text: string; value: OrderOption };

const ORDER_BY_OPTIONS: Record<'sector' | 'user', OrderByOption[]> = {
  sector: [
    { key: 'name', text: 'Name', value: 'name' },
    { key: 'ascents', text: 'Ascents', value: 'ascents' },
    { key: 'first-ascent', text: 'First ascent', value: 'first-ascent' },
    { key: 'grade-asc', text: 'Grade (easy -> hard)', value: 'grade-asc' },
    { key: 'grade-desc', text: 'Grade (hard -> easy)', value: 'grade-desc' },
    { key: 'number', text: 'Number', value: 'number' },
    { key: 'rating', text: 'Rating', value: 'rating' },
  ],
  user: [
    { key: 'name', text: 'Name', value: 'name' },
    { key: 'date', text: 'Date', value: 'date' },
    { key: 'grade-asc', text: 'Grade (easy -> hard)', value: 'grade-asc' },
    { key: 'grade-desc', text: 'Grade (hard -> easy)', value: 'grade-desc' },
    { key: 'rating', text: 'Rating', value: 'rating' },
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
    text: 'Area',
    value: 'area',
    isApplicable: ({ uniqueAreas }) => uniqueAreas.length > 1,
  },
  none: {
    key: 'none',
    text: 'None',
    value: 'none',
    isApplicable: () => true,
  },
  rock: {
    key: 'rock',
    text: 'Rock',
    value: 'rock',
    isApplicable: ({ uniqueRocks }) => uniqueRocks.length > 1,
  },
  sector: {
    key: 'sector',
    text: 'Sector',
    value: 'sector',
    isApplicable: ({ uniqueSectors }) => uniqueSectors.length > 1,
  },
  type: {
    key: 'type',
    text: 'Type',
    value: 'type',
    isApplicable: ({ uniqueTypes }) => uniqueTypes.length > 1,
  },
};

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
    <span className='text-[11px] leading-none font-medium opacity-85 group-hover:opacity-100 sm:text-[12px]'>
      {label}
    </span>
    <input type='checkbox' className='hidden' checked={checked} onChange={onChange} />
  </label>
);

type ToolbarDropdownOption<T extends string> = {
  key: string;
  text: string;
  value: T;
};

const ToolbarDropdown = <T extends string>({
  label,
  icon: Icon,
  value,
  options,
  onSelect,
  compact,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  value: T;
  options: ToolbarDropdownOption<T>[];
  onSelect: (v: T) => void;
  compact?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node) || menuRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportPadding = 8;
      const itemHeight = 30;
      const estimatedMenuHeight = Math.min(Math.max(options.length * itemHeight + 8, 120), 320);
      const spaceAbove = rect.top - viewportPadding;
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const shouldOpenAbove = spaceBelow < Math.min(estimatedMenuHeight, 160);
      const top = shouldOpenAbove ? Math.max(viewportPadding, rect.top - estimatedMenuHeight - 4) : rect.bottom + 4;
      const width = Math.min(Math.max(rect.width, 140), 240);
      const maxLeft = Math.max(viewportPadding, window.innerWidth - width - viewportPadding);
      const left = Math.min(rect.left, maxLeft);
      setMenuPosition({
        top,
        left,
        width,
        maxHeight: Math.min(Math.max(shouldOpenAbove ? spaceAbove : spaceBelow, 120), 320),
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen || !selectedOptionRef.current) return;
    const id = window.requestAnimationFrame(() => {
      selectedOptionRef.current?.scrollIntoView({ block: 'nearest' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen, value]);

  return (
    <div className='relative shrink-0' ref={ref}>
      <button
        ref={buttonRef}
        type='button'
        onClick={() => setIsOpen((v) => !v)}
        aria-label={label}
        className={cn(
          compact
            ? 'inline-flex h-7 min-w-[96px] items-center justify-between gap-1 rounded-md px-2 text-[11px] leading-none font-medium transition-colors sm:text-[12px]'
            : 'inline-flex h-8 items-center justify-between gap-1 rounded-full border px-2.5 text-[11px] leading-none font-medium whitespace-nowrap transition-colors sm:text-[12px]',
          isOpen
            ? 'bg-surface-hover/55 border-white/18 text-slate-100'
            : 'bg-surface-nav/25 hover:bg-surface-nav/40 border-white/10 text-slate-300 hover:text-slate-200',
        )}
      >
        {Icon ? (
          <Icon size={11} className={cn('transition-colors', isOpen ? 'text-slate-300' : 'text-slate-500')} />
        ) : null}
        <span className='text-slate-200'>{selected?.text ?? ''}</span>
        <ChevronDown size={11} className={cn('text-slate-500 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              className='bg-surface-card/96 border-surface-border fixed z-[220] overflow-y-auto rounded-xl border py-1 shadow-2xl backdrop-blur-sm'
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
              }}
            >
              {options.map((opt) => (
                <button
                  ref={opt.value === value ? selectedOptionRef : null}
                  key={opt.key}
                  type='button'
                  onClick={() => {
                    onSelect(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-[11px] leading-none transition-colors sm:text-[12px]',
                    opt.value === value
                      ? 'bg-surface-hover/70 text-slate-100'
                      : 'hover:bg-surface-hover/40 text-slate-300 hover:text-slate-100',
                  )}
                >
                  {opt.text}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

const GradeRangeControl = ({
  low,
  high,
  lowOptions,
  highOptions,
  onLowSelect,
  onHighSelect,
}: {
  low: string;
  high: string;
  lowOptions: ToolbarDropdownOption<string>[];
  highOptions: ToolbarDropdownOption<string>[];
  onLowSelect: (next: string) => void;
  onHighSelect: (next: string) => void;
}) => (
  <div className='bg-surface-nav/25 inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 pr-1 pl-2'>
    <span className='px-2 text-[11px] leading-none tracking-[0.08em] text-slate-500 uppercase sm:text-[12px]'>
      Grade
    </span>
    <ToolbarDropdown compact label='Lowest grade' value={low} options={lowOptions} onSelect={onLowSelect} />
    <span className='px-1 text-[11px] text-slate-500 sm:text-[12px]'>to</span>
    <ToolbarDropdown compact label='Highest grade' value={high} options={highOptions} onSelect={onHighSelect} />
  </div>
);

export const ProblemList = ({
  rows: allRows,
  mode,
  defaultOrder,
  storageKey,
  toolbarAction,
  contentBeforeList,
  excludedSortOptions,
}: Props) => {
  const [showFilter, setFilterShowing] = useState(false);
  const [isTypesMenuOpen, setIsTypesMenuOpen] = useState(false);
  const { easyToHard, mapping } = useGrades();
  const typesMenuRef = useRef<HTMLDivElement>(null);

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

  const orderByOptions = ORDER_BY_OPTIONS[mode].filter((opt) => !excludedSortOptions?.includes(opt.value));
  const maxGradeIndex = Math.max(easyToHard.length - 1, 0);
  const currentLow = gradeLow ?? easyToHard[0];
  const currentHigh = gradeHigh ?? easyToHard[maxGradeIndex];
  const lowestGradeOptions = easyToHard
    .filter((label) => (mapping[label] ?? 0) < (mapping[currentHigh] ?? maxGradeIndex))
    .map((label) => ({ key: `low-${label}`, text: label, value: label }));
  const highestGradeOptions = easyToHard
    .filter((label) => (mapping[label] ?? maxGradeIndex) > (mapping[currentLow] ?? 0))
    .map((label) => ({ key: `high-${label}`, text: label, value: label }));
  const selectedTypeCount = allTypes.filter((type) => !!types[type]).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typesMenuRef.current && !typesMenuRef.current.contains(e.target as Node)) setIsTypesMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!allRows?.length) {
    return null;
  }

  const list = (() => {
    if (filtered.length === 0) {
      return <div className='py-6 text-[11px] text-slate-500 sm:text-[12px]'>Empty list.</div>;
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

    return (
      <div className={cn('mt-4 flex flex-col', mode === 'user' ? 'gap-0.5' : 'gap-2')}>
        {filtered.map(({ element }) => element)}
      </div>
    );
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
  const orderedGroupByOptions = [
    ...groupByOptions.filter((opt) => opt.value === 'none'),
    ...groupByOptions.filter((opt) => opt.value !== 'none'),
  ];
  const orderedSortOptions = [
    ...orderByOptions.filter((opt) => opt.value === defaultOrder),
    ...orderByOptions.filter((opt) => opt.value !== defaultOrder),
  ];

  return (
    <div className='space-y-4'>
      <div className='flex min-w-0 flex-wrap items-center gap-1.5 pb-1'>
        {groupByOptions.length > 1 && (
          <ToolbarDropdown
            label='Group'
            icon={FolderTree}
            value={groupBy}
            options={orderedGroupByOptions}
            onSelect={(next) => dispatch({ action: 'group-by', groupBy: next })}
          />
        )}

        <ToolbarDropdown
          label='Sort'
          icon={ArrowDownWideNarrow}
          value={order}
          options={orderedSortOptions}
          onSelect={(next) => dispatch({ action: 'order-by', order: next })}
        />

        <button
          type='button'
          onClick={() => setFilterShowing((v) => !v)}
          className={cn(
            'inline-flex h-8 items-center justify-center gap-1 rounded-full border px-2.5 text-[11px] leading-none font-medium whitespace-nowrap transition-colors sm:text-[12px]',
            showFilter
              ? 'bg-surface-hover/55 border-white/18 text-slate-100'
              : 'bg-surface-nav/25 hover:bg-surface-nav/40 border-white/10 text-slate-300 hover:text-slate-200',
          )}
        >
          <Filter size={11} /> Filter
        </button>

        {toolbarAction}
      </div>

      {showFilter && (
        <div className='bg-surface-nav/14 space-y-4 rounded-lg p-4'>
          <div className='flex flex-wrap items-center gap-3 md:gap-4'>
            <GradeRangeControl
              low={currentLow}
              high={currentHigh}
              lowOptions={lowestGradeOptions}
              highOptions={highestGradeOptions}
              onLowSelect={(next) => dispatch({ action: 'set-grade', low: next })}
              onHighSelect={(next) => dispatch({ action: 'set-grade', high: next })}
            />
            {allTypes.length > 1 && (
              <div className='relative' ref={typesMenuRef}>
                <button
                  type='button'
                  onClick={() => setIsTypesMenuOpen((v) => !v)}
                  className={cn(
                    'inline-flex h-9 min-w-[176px] items-center justify-between gap-1 rounded-lg border px-3 text-[11px] leading-none font-medium transition-colors sm:text-[12px]',
                    isTypesMenuOpen
                      ? 'bg-surface-hover/55 border-white/18 text-slate-100'
                      : 'bg-surface-nav/25 hover:bg-surface-nav/40 border-white/10 text-slate-300 hover:text-slate-200',
                  )}
                >
                  <span>Types{selectedTypeCount > 0 ? ` (${selectedTypeCount})` : ''}</span>
                  <ChevronDown
                    size={11}
                    className={cn('text-slate-500 transition-transform', isTypesMenuOpen && 'rotate-180')}
                  />
                </button>
                {isTypesMenuOpen && (
                  <div className='bg-surface-card/96 border-surface-border absolute top-full left-0 z-50 mt-1 min-w-60 rounded-xl border p-3 shadow-2xl backdrop-blur-sm'>
                    <div className='space-y-2'>
                      {allTypes.map((type) => (
                        <ToggleLabel
                          key={type}
                          label={`${type} (${lookup[type]})`}
                          checked={types[type]}
                          onChange={() =>
                            dispatch({
                              action: 'type',
                              type,
                              enabled: !types[type],
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'sector' && containsTicked && (
              <ToggleLabel
                label='Hide ticked'
                checked={hideTicked}
                onChange={() => dispatch({ action: 'hide-ticked' })}
              />
            )}
            {mode === 'user' && containsFa && (
              <ToggleLabel label='Only show FA' checked={onlyFa} onChange={() => dispatch({ action: 'only-fa' })} />
            )}
          </div>
        </div>
      )}

      {typeof contentBeforeList === 'function' ? contentBeforeList(filtered) : contentBeforeList}

      {list}
    </div>
  );
};

export default ProblemList;
