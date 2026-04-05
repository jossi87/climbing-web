import { type ComponentProps, useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AccordionContainer from './AccordionContainer';
import { rowListTypeKey, type Row } from './types';
import { type GroupOption, type OrderOption, type State, useProblemListState } from './state';
import { ChevronDown, Filter, FolderTree, ArrowDownWideNarrow } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { useGrades } from '../Meta';

type Props = {
  rows: Row[];
  mode: 'sector' | 'user';
  defaultOrder: OrderOption;
  storageKey: string;
  toolbarAction?: React.ReactNode;
  /** Renders above the toolbar (e.g. map) so group/sort/filter stay between map and list. */
  contentBeforeList?: React.ReactNode | ((filteredRows: Row[]) => React.ReactNode);
  excludedSortOptions?: OrderOption[];
};

type OrderByOption = { key: string; text: string; shortText: string; value: OrderOption };

const ORDER_BY_OPTIONS: Record<'sector' | 'user', OrderByOption[]> = {
  sector: [
    { key: 'name', text: 'Name', shortText: 'Name', value: 'name' },
    { key: 'ascents', text: 'Ascents', shortText: 'Ascents', value: 'ascents' },
    { key: 'first-ascent', text: 'First ascent', shortText: '1st asc.', value: 'first-ascent' },
    { key: 'grade-asc', text: 'Grade (easy -> hard)', shortText: 'Easy→hard', value: 'grade-asc' },
    { key: 'grade-desc', text: 'Grade (hard -> easy)', shortText: 'Hard→easy', value: 'grade-desc' },
    { key: 'number', text: 'Number', shortText: '#', value: 'number' },
    { key: 'rating', text: 'Rating', shortText: 'Stars', value: 'rating' },
  ],
  user: [
    { key: 'name', text: 'Name', shortText: 'Name', value: 'name' },
    { key: 'date', text: 'Date', shortText: 'Date', value: 'date' },
    { key: 'grade-asc', text: 'Grade (easy -> hard)', shortText: 'Easy→hard', value: 'grade-asc' },
    { key: 'grade-desc', text: 'Grade (hard -> easy)', shortText: 'Hard→easy', value: 'grade-desc' },
    { key: 'rating', text: 'Rating', shortText: 'Stars', value: 'rating' },
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
    uniqueTypes.map((typeKey) => {
      const list = filtered.filter((p) => rowListTypeKey(p) === typeKey).map((p) => p.element);
      return {
        label: `${typeKey || '<No type>'} (${list.length})`,
        length: list.length,
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),
};

type GroupByOption = {
  key: string;
  text: string;
  /** Short label for dense toolbars (defaults to `text`). */
  shortText?: string;
  value: GroupOption;
  isApplicable: (state: Pick<State, 'uniqueAreas' | 'uniqueRocks' | 'uniqueSectors' | 'uniqueTypes'>) => boolean;
};

const GROUP_BY_OPTIONS: Record<GroupOption, GroupByOption> = {
  area: {
    key: 'area',
    text: 'Area',
    shortText: 'Area',
    value: 'area',
    isApplicable: ({ uniqueAreas }) => uniqueAreas.length > 1,
  },
  none: {
    key: 'none',
    text: 'None',
    shortText: 'None',
    value: 'none',
    isApplicable: () => true,
  },
  rock: {
    key: 'rock',
    text: 'Rock',
    shortText: 'Rock',
    value: 'rock',
    isApplicable: ({ uniqueRocks }) => uniqueRocks.length > 1,
  },
  sector: {
    key: 'sector',
    text: 'Sector',
    shortText: 'Sector',
    value: 'sector',
    isApplicable: ({ uniqueSectors }) => uniqueSectors.length > 1,
  },
  type: {
    key: 'type',
    text: 'Type',
    shortText: 'Type',
    value: 'type',
    isApplicable: ({ uniqueTypes }) => uniqueTypes.length > 1,
  },
};

const ToggleLabel = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label className='group inline-flex cursor-pointer items-center gap-2'>
    <div
      className={cn(
        'relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-colors duration-200 ease-in-out focus:outline-none',
        checked
          ? 'border-brand-border bg-surface-hover shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'border-surface-border bg-surface-raised group-hover:border-surface-border group-hover:bg-surface-raised-hover',
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-slate-200 shadow-sm ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-3.5' : 'translate-x-0',
        )}
      />
    </div>
    <span
      className={cn(
        designContract.typography.meta,
        'font-medium text-slate-400 transition-colors group-hover:text-slate-300',
        checked && 'text-slate-200',
      )}
    >
      {label}
    </span>
    <input type='checkbox' className='hidden' checked={checked} onChange={onChange} />
  </label>
);

type ToolbarDropdownOption<T extends string> = {
  key: string;
  text: string;
  shortText?: string;
  value: T;
};

const ToolbarDropdown = <T extends string>({
  label,
  icon: Icon,
  value,
  options,
  onSelect,
  compact,
  fullWidth,
  className: wrapperClassName,
  variant = 'default',
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  value: T;
  options: ToolbarDropdownOption<T>[];
  onSelect: (v: T) => void;
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
  /** Borderless controls for the dense group/sort/filter row. */
  variant?: 'default' | 'ghost';
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
  const shortLabel = selected?.shortText ?? selected?.text ?? '';
  const fullLabel = selected?.text ?? '';
  const displayLabel = compact || fullWidth ? shortLabel : fullLabel;

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
      const width = Math.min(Math.max(rect.width, 160), 320);
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
    <div className={cn('relative', fullWidth ? 'min-w-0 flex-1' : 'shrink-0', wrapperClassName)} ref={ref}>
      <button
        ref={buttonRef}
        type='button'
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`${label}: ${selected?.text ?? ''}`}
        title={selected?.text ? `${label}: ${selected.text}` : label}
        className={cn(
          variant === 'ghost'
            ? 'inline-flex h-8 w-full min-w-0 items-center justify-between gap-1 rounded-lg px-2 text-[11px] leading-none font-medium transition-colors sm:px-2.5 sm:text-[12px]'
            : compact
              ? 'inline-flex h-7 w-full min-w-0 items-center justify-between gap-0.5 rounded-md border px-1.5 text-[10px] leading-none font-medium transition-colors sm:gap-1 sm:px-2 sm:text-[11px] md:h-7'
              : 'inline-flex h-9 w-full max-w-full min-w-0 items-center justify-between gap-1.5 rounded-md border px-3 text-[11px] leading-none font-medium whitespace-nowrap transition-colors sm:text-[12px] md:h-8 md:w-auto md:max-w-[22rem] md:gap-1 md:px-2.5',
          fullWidth && !compact ? 'w-full md:w-auto' : fullWidth && compact ? 'w-full' : '',
          variant === 'ghost'
            ? isOpen
              ? 'bg-surface-raised-hover text-slate-100'
              : 'hover:bg-surface-raised-hover border-0 bg-transparent text-slate-300 hover:text-slate-100'
            : isOpen
              ? 'border-surface-border bg-surface-hover text-slate-100'
              : 'border-surface-border bg-surface-raised hover:border-surface-border hover:bg-surface-raised-hover text-slate-300 hover:text-slate-200',
        )}
      >
        {Icon ? (
          <Icon size={11} className={cn('shrink-0 transition-colors', isOpen ? 'text-slate-300' : 'text-slate-400')} />
        ) : null}
        {!compact && <span className='shrink-0 text-slate-500'>{label}:</span>}
        {variant === 'ghost' && compact && fullWidth ? (
          <span className='min-w-0 flex-1 text-left text-slate-100'>
            <span className='block truncate md:hidden'>{shortLabel}</span>
            <span className='hidden md:block md:whitespace-nowrap'>{fullLabel}</span>
          </span>
        ) : (
          <span className='min-w-0 flex-1 truncate text-left text-slate-200'>{displayLabel}</span>
        )}
        <ChevronDown size={11} className={cn('shrink-0 text-slate-500 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              className='bg-surface-card border-surface-border/50 ring-surface-border/40 fixed z-[220] overflow-hidden overflow-y-auto rounded-xl border py-1 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.65)] ring-1'
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: Math.max(menuPosition.width, 176),
                maxHeight: menuPosition.maxHeight,
              }}
            >
              <div className='divide-surface-border/40 divide-y'>
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
                      'w-full px-3 py-2.5 text-left text-[11px] leading-snug transition-colors sm:px-3.5 sm:text-[12px]',
                      opt.value === value
                        ? 'bg-surface-raised-hover font-medium text-slate-50'
                        : 'hover:bg-surface-raised-hover text-slate-300 hover:text-slate-50',
                    )}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

/** Hide group/sort/filter when the list is tiny — sorting or filtering a handful of rows adds noise. */
const MIN_ROWS_FOR_LIST_CONTROLS = 4;

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
  <div className='inline-flex flex-wrap items-center gap-1.5 sm:gap-2'>
    <span className={cn(designContract.typography.meta, 'shrink-0 text-slate-500')}>Grade</span>
    <ToolbarDropdown
      compact
      variant='ghost'
      label='Lowest grade'
      value={low}
      options={lowOptions}
      onSelect={onLowSelect}
    />
    <span className={cn(designContract.typography.meta, 'text-slate-500')}>to</span>
    <ToolbarDropdown
      compact
      variant='ghost'
      label='Highest grade'
      value={high}
      options={highOptions}
      onSelect={onHighSelect}
    />
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
  const { easyToHard, mapping } = useGrades();

  const [allTypes, lookup] = useMemo(() => {
    const types = new Set<string>();
    const lookup: Record<string, number> = {};
    for (const row of allRows) {
      const key = rowListTypeKey(row);
      types.add(key);
      lookup[key] = (lookup[key] ?? 0) + 1;
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
    .map((label) => ({ key: `low-${label}`, text: label, shortText: label, value: label }));
  const highestGradeOptions = easyToHard
    .filter((label) => (mapping[label] ?? maxGradeIndex) > (mapping[currentLow] ?? 0))
    .map((label) => ({ key: `high-${label}`, text: label, shortText: label, value: label }));
  const showListControls = filtered.length > MIN_ROWS_FOR_LIST_CONTROLS;

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
        <AccordionContainer
          accordionRows={mapper({
            uniqueAreas,
            uniqueRocks,
            uniqueSectors,
            uniqueTypes,
            filtered,
          }).filter(({ length }) => length)}
        />
      );
    }

    return (
      <div className={cn('flex flex-col', mode === 'user' ? 'gap-3 sm:gap-4' : 'gap-0')}>
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

  const leading = typeof contentBeforeList === 'function' ? contentBeforeList(filtered) : contentBeforeList;

  return (
    <div className='flex flex-col gap-4'>
      {leading}

      {(showListControls || toolbarAction) && (
        <div className='flex min-w-0 flex-nowrap items-center justify-start gap-2 overflow-hidden md:gap-2'>
          {showListControls && (
            <>
              {groupByOptions.length > 1 && (
                <ToolbarDropdown
                  className='min-w-0 flex-1 basis-0 md:max-w-[12rem] md:flex-none md:basis-auto'
                  label='Group'
                  icon={FolderTree}
                  value={groupBy}
                  options={orderedGroupByOptions}
                  onSelect={(next) => dispatch({ action: 'group-by', groupBy: next })}
                />
              )}
              <ToolbarDropdown
                className={
                  groupByOptions.length > 1
                    ? 'min-w-0 flex-1 basis-0 md:max-w-[22rem] md:flex-none md:basis-auto'
                    : 'min-w-0 shrink-0 md:max-w-[22rem]'
                }
                label='Sort'
                icon={ArrowDownWideNarrow}
                value={order}
                options={orderedSortOptions}
                onSelect={(next) => dispatch({ action: 'order-by', order: next })}
              />
              <button
                type='button'
                aria-expanded={showFilter}
                aria-label={showFilter ? 'Hide filters' : 'Show filters'}
                onClick={() => setFilterShowing((v) => !v)}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-[11px] font-medium whitespace-nowrap transition-colors sm:text-[12px] md:h-8 md:gap-1.5 md:px-3',
                  showFilter
                    ? 'border-surface-border bg-surface-hover ring-surface-border/50 text-slate-100 ring-1'
                    : 'border-surface-border/60 hover:border-surface-border hover:bg-surface-raised bg-transparent text-slate-400 hover:text-slate-100',
                )}
              >
                <Filter size={11} className='shrink-0 opacity-90' />
                <span>Filters</span>
              </button>
            </>
          )}
          {toolbarAction}
        </div>
      )}

      {showListControls && showFilter && (
        <div className='border-surface-border/40 mt-2 flex flex-col gap-2.5 border-t pt-3 sm:gap-2'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
            <GradeRangeControl
              low={currentLow}
              high={currentHigh}
              lowOptions={lowestGradeOptions}
              highOptions={highestGradeOptions}
              onLowSelect={(next) => dispatch({ action: 'set-grade', low: next })}
              onHighSelect={(next) => dispatch({ action: 'set-grade', high: next })}
            />
          </div>
          {allTypes.length > 1 && (
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5'>
              {allTypes.map((type) => (
                <ToggleLabel
                  key={type}
                  label={`${type} (${lookup[type]})`}
                  checked={types[type] !== false}
                  onChange={() =>
                    dispatch({
                      action: 'type',
                      type,
                      enabled: !(types[type] ?? true),
                    })
                  }
                />
              ))}
            </div>
          )}

          {(mode === 'sector' && containsTicked) || (mode === 'user' && containsFa) ? (
            <div className='flex flex-wrap gap-x-4 gap-y-1.5'>
              {mode === 'sector' && containsTicked && (
                <ToggleLabel
                  label='Hide ticked'
                  checked={hideTicked}
                  onChange={() => dispatch({ action: 'hide-ticked' })}
                />
              )}
              {mode === 'user' && containsFa && (
                <ToggleLabel label='Only FA' checked={onlyFa} onChange={() => dispatch({ action: 'only-fa' })} />
              )}
            </div>
          ) : null}
        </div>
      )}

      {list}
    </div>
  );
};

export default ProblemList;
