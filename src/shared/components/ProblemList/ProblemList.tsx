import { type ComponentProps, type ReactNode, useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { TranslationKey } from '../../../i18n';
import { createPortal } from 'react-dom';
import AccordionContainer from './AccordionContainer';
import { rowListTypeKey, type Row } from './types';
import { type GroupOption, type OrderOption, type State, useProblemListState } from './state';
import { ChevronDown, Filter, FolderTree, ArrowDownWideNarrow, RotateCcw, Check, Layers } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import {
  activityFilterChipBase,
  activityFilterChipChanged,
  activityFilterChipChangedInk,
  activityFilterChipChangedText,
  activityFilterChipOn,
} from '../../../design/activityFilterChips';
import { twInk } from '../../../design/twInk';
import { FormSwitch } from '../../ui';
import { ProblemListCompactContext } from './compactViewContext';

/** Subtle “open” affordance (matches ToolbarDropdown's open ring) — used for the Filter chip while its panel is open. */
const problemListToolbarChipOpen = 'ring-1 ring-white/20 light:ring-slate-400/55';

type Props = {
  rows: Row[];
  mode: 'sector' | 'user';
  defaultOrder: OrderOption;
  storageKey: string;
  /** Sector/area: remember sort in localStorage (shared by grade vs number listing style). User lists omit. */
  sortPreferenceBucket?: 'grade' | 'number' | 'area';
  /** Sector/area: remember grade range + type filters in localStorage under a shared key. Use `'sector'` for sector/area lists. Omit for user profile lists. */
  filterPreferenceBucket?: string;
  toolbarAction?: React.ReactNode;
  /** Renders above the toolbar (e.g. map) so group/sort/filter stay between map and list. */
  contentBeforeList?: React.ReactNode | ((filteredRows: Row[]) => React.ReactNode);
  excludedSortOptions?: OrderOption[];
  /** Optional compact/detailed toggle in toolbar (default view: compact). */
  enableViewModeToggle?: boolean;
  /**
   * Toolbar + filter row above the card; `wrapDetachedContent` wraps summary + list only.
   * Use the same horizontal padding as the card body (`px-4 sm:px-5`) so columns line up.
   */
  detachToolbar?: boolean;
  wrapDetachedContent?: (content: ReactNode) => ReactNode;
  /** Space between `contentBeforeList` and the list (default matches most pages). */
  leadingBottomClassName?: string;
  /** `mode="user"` only: gap between list rows (default `gap-3 sm:gap-4`). */
  userListClassName?: string;
};

/**
 * Sort options hold translation keys instead of text: `t` is only available inside the component, and a
 * module-scope table of English prose is exactly what would leak untranslated into a localized page.
 */
type OrderByOption = { key: string; textKey: TranslationKey; shortTextKey: TranslationKey; value: OrderOption };

const ORDER_BY_OPTIONS: Record<'sector' | 'user', OrderByOption[]> = {
  sector: [
    { key: 'name', textKey: 'problemList.sortBy.name', shortTextKey: 'problemList.sortBy.name', value: 'name' },
    {
      key: 'ascents',
      textKey: 'problemList.sortBy.ascents',
      shortTextKey: 'problemList.sortBy.ascents',
      value: 'ascents',
    },
    {
      key: 'first-ascent',
      textKey: 'problemList.sortBy.firstAscent',
      shortTextKey: 'problemList.sortBy.firstAscentShort',
      value: 'first-ascent',
    },
    {
      key: 'grade-asc',
      textKey: 'problemList.sortBy.gradeAsc',
      shortTextKey: 'problemList.sortBy.gradeAscShort',
      value: 'grade-asc',
    },
    {
      key: 'grade-desc',
      textKey: 'problemList.sortBy.gradeDesc',
      shortTextKey: 'problemList.sortBy.gradeDescShort',
      value: 'grade-desc',
    },
    {
      key: 'number',
      textKey: 'problemList.sortBy.number',
      shortTextKey: 'problemList.sortBy.numberShort',
      value: 'number',
    },
    {
      key: 'rating',
      textKey: 'problemList.sortBy.rating',
      shortTextKey: 'problemList.sortBy.ratingShort',
      value: 'rating',
    },
  ],
  user: [
    { key: 'name', textKey: 'problemList.sortBy.name', shortTextKey: 'problemList.sortBy.name', value: 'name' },
    { key: 'date', textKey: 'problemList.sortBy.date', shortTextKey: 'problemList.sortBy.date', value: 'date' },
    {
      key: 'grade-asc',
      textKey: 'problemList.sortBy.gradeAsc',
      shortTextKey: 'problemList.sortBy.gradeAscShort',
      value: 'grade-asc',
    },
    {
      key: 'grade-desc',
      textKey: 'problemList.sortBy.gradeDesc',
      shortTextKey: 'problemList.sortBy.gradeDescShort',
      value: 'grade-desc',
    },
    {
      key: 'rating',
      textKey: 'problemList.sortBy.rating',
      shortTextKey: 'problemList.sortBy.ratingShort',
      value: 'rating',
    },
  ],
};

/**
 * Group builders. `t` arrives as the first argument (the table is module scope, so there is no hook in
 * reach), and each header is built from `problemList.groupHeader` with the name as a placeholder — the
 * `<Without area>` fallback is translated too, so nothing English is ever glued onto the number.
 */
const GROUP_BY: Record<
  GroupOption,
  (
    t: TFunction,
    partialState: Pick<State, 'uniqueAreas' | 'uniqueRocks' | 'uniqueSectors' | 'uniqueTypes' | 'filtered'>,
  ) => ComponentProps<typeof AccordionContainer>['accordionRows']
> = {
  area: (t, { uniqueAreas, filtered }) =>
    uniqueAreas.map((areaName) => {
      const list = filtered.filter((p) => p.areaName === areaName).map((p) => p.element);
      return {
        label: t('problemList.groupHeader', {
          name: areaName || t('problemList.withoutArea'),
          total: list.length,
        }),
        length: list.length,
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),

  none: () => {
    throw new Error('This should not have been called');
  },

  rock: (t, { uniqueRocks, filtered }) =>
    uniqueRocks.map((rock) => {
      const list = filtered.filter((p) => p.rock === rock).map((p) => p.element);
      return {
        label: t('problemList.groupHeader', {
          name: rock || t('problemList.withoutRock'),
          total: list.length,
        }),
        length: list.length,
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),

  sector: (t, { uniqueSectors, filtered }) =>
    uniqueSectors.map((sectorName) => {
      const list = filtered.filter((p) => p.sectorName === sectorName).map((p) => p.element);
      return {
        length: list.length,
        label: t('problemList.groupHeader', {
          name: sectorName || t('problemList.noSector'),
          total: list.length,
        }),
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),

  type: (t, { uniqueTypes, filtered }) =>
    uniqueTypes.map((typeKey) => {
      const list = filtered.filter((p) => rowListTypeKey(p) === typeKey).map((p) => p.element);
      return {
        label: t('problemList.groupHeader', {
          name: typeKey || t('problemList.noType'),
          total: list.length,
        }),
        length: list.length,
        content: <div className='flex flex-col gap-2'>{list}</div>,
      };
    }),
};

type GroupByOption = {
  key: string;
  /** Translation keys; resolved in the component, where `t` is in scope (see `OrderByOption`). */
  textKey: TranslationKey;
  /** Short label for dense toolbars (defaults to `textKey`). */
  shortTextKey?: TranslationKey;
  value: GroupOption;
  isApplicable: (state: Pick<State, 'uniqueAreas' | 'uniqueRocks' | 'uniqueSectors' | 'uniqueTypes'>) => boolean;
};

const GROUP_BY_OPTIONS: Record<GroupOption, GroupByOption> = {
  area: {
    key: 'area',
    textKey: 'problemList.groupBy.area',
    shortTextKey: 'problemList.groupBy.area',
    value: 'area',
    isApplicable: ({ uniqueAreas }) => uniqueAreas.length > 1,
  },
  none: {
    key: 'none',
    textKey: 'problemList.groupBy.none',
    shortTextKey: 'problemList.groupBy.none',
    value: 'none',
    isApplicable: () => true,
  },
  rock: {
    key: 'rock',
    textKey: 'problemList.groupBy.rock',
    shortTextKey: 'problemList.groupBy.rock',
    value: 'rock',
    isApplicable: ({ uniqueRocks }) => uniqueRocks.length > 1,
  },
  sector: {
    key: 'sector',
    textKey: 'problemList.groupBy.sector',
    shortTextKey: 'problemList.groupBy.sector',
    value: 'sector',
    isApplicable: ({ uniqueSectors }) => uniqueSectors.length > 1,
  },
  type: {
    key: 'type',
    textKey: 'problemList.groupBy.type',
    shortTextKey: 'problemList.groupBy.type',
    value: 'type',
    isApplicable: ({ uniqueTypes }) => uniqueTypes.length > 1,
  },
};

/** Dense filters: pill switch (`ios` variant) — gray off, white/gray/black on-state only; works in light and dark. */
const ToggleLabel = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label className='group inline-flex cursor-pointer items-center gap-2.5'>
    <FormSwitch checked={checked} onChange={onChange} size='compact' variant='ios' />
    <span
      className={cn(
        designContract.typography.meta,
        'light:group-hover:text-slate-950 font-medium text-slate-400 transition-colors group-hover:text-slate-300',
        twInk.lightTextSlate800,
        checked && 'light:text-slate-950 text-slate-200',
      )}
    >
      {label}
    </span>
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
  checkedValues,
  onToggleValue,
  displayText,
  displayShortText,
  compact,
  fullWidth,
  className: wrapperClassName,
  variant = 'default',
  changed = false,
  onOpen,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  /** Single-select: the currently selected option. Omit in multi-select mode (see `checkedValues`). */
  value?: T;
  options: ToolbarDropdownOption<T>[];
  /** Single-select handler. Omit in multi-select mode. */
  onSelect?: (v: T) => void;
  /**
   * Multi-select: the options currently enabled. When set, the menu stays open on click and each option
   * renders as a checkbox — the chip text then comes from `displayText` / `displayShortText`.
   */
  checkedValues?: T[];
  /** Multi-select: toggles a single option (the menu stays open). */
  onToggleValue?: (v: T) => void;
  /** Chip text override (multi-select) — otherwise derived from `value`. */
  displayText?: string;
  /** Short chip text override (dense/compact toolbar) — otherwise derived from `value`. */
  displayShortText?: string;
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
  /** Borderless controls for the dense group/sort/filter row. */
  variant?: 'default' | 'ghost';
  /** Applies brand styling (like the active Filter chip) when the value differs from the default. */
  changed?: boolean;
  /** Called when the dropdown is opened — used to close sibling panels (e.g. the filter). */
  onOpen?: () => void;
}) => {
  const isMulti = !!checkedValues;
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
  const selected = value !== undefined ? options.find((opt) => opt.value === value) : undefined;
  const shortLabel = displayShortText ?? selected?.shortText ?? selected?.text ?? displayText ?? '';
  const fullLabel = displayText ?? selected?.text ?? '';
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
        onClick={() => {
          if (!isOpen) onOpen?.();
          setIsOpen((v) => !v);
        }}
        aria-label={`${label}: ${fullLabel}`}
        title={fullLabel ? `${label}: ${fullLabel}` : label}
        className={cn(
          variant === 'ghost'
            ? 'inline-flex h-8 w-full min-w-0 items-center justify-start gap-1.5 rounded-lg px-2 text-[13px] leading-none font-medium transition-colors sm:px-2.5 sm:text-[14px]'
            : compact
              ? 'inline-flex h-7 w-full min-w-0 items-center justify-start gap-1.5 rounded-md border px-1.5 text-[12px] leading-none font-medium transition-colors sm:px-2 sm:text-[13px] md:h-7'
              : cn(
                  activityFilterChipBase,
                  changed ? activityFilterChipChanged : activityFilterChipOn,
                  isOpen && problemListToolbarChipOpen,
                  'w-full min-w-0 justify-start',
                ),
          fullWidth && !compact ? 'w-full md:w-auto' : fullWidth && compact ? 'w-full' : '',
          variant === 'ghost'
            ? isOpen
              ? 'bg-surface-raised-hover text-slate-100'
              : 'hover:bg-surface-raised-hover border-0 bg-transparent text-slate-300 hover:text-slate-100'
            : compact
              ? isOpen
                ? 'border-surface-border bg-surface-hover text-slate-100'
                : 'border-surface-border bg-surface-raised hover:border-surface-border hover:bg-surface-raised-hover text-slate-300 hover:text-slate-200'
              : null,
        )}
      >
        {Icon ? (
          <Icon
            size={12}
            className={cn(
              'shrink-0 transition-colors',
              variant === 'default' && !compact && 'hidden md:block',
              changed
                ? activityFilterChipChangedInk
                : variant === 'default' && !compact
                  ? 'text-slate-300'
                  : isOpen
                    ? 'text-slate-300'
                    : 'text-slate-400',
            )}
          />
        ) : null}
        <div className='flex min-w-0 flex-1 items-center gap-1 overflow-hidden md:gap-1.5'>
          {!compact ? (
            <span
              className={cn(
                'shrink-0 max-md:text-[10px] md:text-[11px]',
                changed
                  ? activityFilterChipChangedText
                  : variant === 'default'
                    ? cn('text-slate-400', twInk.lightTextSlate700)
                    : 'text-slate-500',
              )}
            >
              {label}:
            </span>
          ) : null}
          {variant === 'ghost' && compact && fullWidth ? (
            <span className='min-w-0 flex-1 text-left text-slate-100'>
              <span className='block truncate md:hidden'>{shortLabel}</span>
              <span className='hidden md:block md:whitespace-nowrap'>{fullLabel}</span>
            </span>
          ) : compact ? (
            <span className='min-w-0 flex-1 truncate text-left text-slate-200'>{displayLabel}</span>
          ) : (
            <>
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-left md:hidden',
                  changed ? activityFilterChipChangedText : cn('text-slate-100', twInk.lightTextSlate900),
                )}
              >
                {shortLabel}
              </span>
              <span
                className={cn(
                  'hidden min-w-0 flex-1 truncate text-left md:block',
                  changed ? activityFilterChipChangedText : cn('text-slate-100', twInk.lightTextSlate900),
                )}
              >
                {fullLabel}
              </span>
            </>
          )}
          <ChevronDown
            size={10}
            strokeWidth={2}
            className={cn(
              'shrink-0 text-slate-300 transition-transform',
              variant === 'default' && !compact && 'hidden md:block',
              isOpen && 'rotate-180',
            )}
          />
        </div>
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
                {options.map((opt) => {
                  const checked = checkedValues ? checkedValues.includes(opt.value) : opt.value === value;
                  return (
                    <button
                      ref={checked ? selectedOptionRef : null}
                      key={opt.key}
                      type='button'
                      role={isMulti ? 'menuitemcheckbox' : undefined}
                      aria-checked={isMulti ? checked : undefined}
                      onClick={() => {
                        if (isMulti) {
                          /** Multi-select keeps the menu open so several options can be toggled in one go. */
                          onToggleValue?.(opt.value);
                          return;
                        }
                        onSelect?.(opt.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full px-3 py-2.5 text-left text-[13px] leading-snug transition-colors sm:px-3.5 sm:text-[14px]',
                        isMulti && 'flex items-center gap-2',
                        checked
                          ? 'bg-surface-raised-hover font-medium text-slate-50'
                          : 'hover:bg-surface-raised-hover text-slate-300 hover:text-slate-50',
                      )}
                    >
                      {isMulti ? (
                        <>
                          <Check
                            size={13}
                            strokeWidth={2.5}
                            className={cn('shrink-0', checked ? activityFilterChipChangedInk : 'text-transparent')}
                          />
                          <span className='min-w-0 flex-1 truncate'>{opt.text}</span>
                        </>
                      ) : (
                        opt.text
                      )}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

/**
 * Hide the sort/filter toolbar for a single row only — one item has nothing to reorder.
 * The Group control is shown only when at least one grouping dimension has 2+ values (`groupByOptions.length > 1`).
 */
/** Threshold uses full row count in `ProblemList`, not filtered length — so narrow filters do not hide group/sort/filter. */
const MIN_ROWS_FOR_LIST_CONTROLS = 2;
const GLOBAL_VIEW_MODE_KEY = 'problemList.detailed';

const GradeRangeControl = ({
  systemName,
  low,
  high,
  lowOptions,
  highOptions,
  onLowSelect,
  onHighSelect,
}: {
  /** Grade system this control filters; shown only while the list holds several systems. */
  systemName?: string;
  low: string;
  high: string;
  lowOptions: ToolbarDropdownOption<string>[];
  highOptions: ToolbarDropdownOption<string>[];
  onLowSelect: (next: string) => void;
  onHighSelect: (next: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className='inline-flex flex-wrap items-center gap-1.5 sm:gap-2'
      role='group'
      aria-label={systemName ? t('problemList.gradeWithSystem', { system: systemName }) : t('problemList.grade')}
    >
      <span className={cn(designContract.typography.meta, 'shrink-0 text-slate-500')}>
        {systemName ? t('problemList.gradeWithSystem', { system: systemName }) : t('problemList.grade')}
      </span>
      <ToolbarDropdown
        compact
        variant='ghost'
        label={t('problemList.gradeLow')}
        value={low}
        options={lowOptions}
        onSelect={onLowSelect}
      />
      <span className={cn(designContract.typography.meta, 'text-slate-500')}>{t('problemList.gradeTo')}</span>
      <ToolbarDropdown
        compact
        variant='ghost'
        label={t('problemList.gradeHigh')}
        value={high}
        options={highOptions}
        onSelect={onHighSelect}
      />
    </div>
  );
};

export const ProblemList = ({
  rows: allRows,
  mode,
  defaultOrder,
  storageKey,
  sortPreferenceBucket,
  filterPreferenceBucket,
  toolbarAction,
  contentBeforeList,
  excludedSortOptions,
  enableViewModeToggle = false,
  detachToolbar = false,
  wrapDetachedContent,
  leadingBottomClassName = 'mb-4 sm:mb-5',
  userListClassName,
}: Props) => {
  const { t } = useTranslation();
  const [showFilter, setFilterShowing] = useState(false);
  const [compactRows, setCompactRows] = useState<boolean>(() => {
    if (!enableViewModeToggle) return false;
    const savedDetailed = window.localStorage.getItem(GLOBAL_VIEW_MODE_KEY);
    return savedDetailed !== '1';
  });

  useEffect(() => {
    if (!enableViewModeToggle) return;
    if (compactRows) {
      window.localStorage.removeItem(GLOBAL_VIEW_MODE_KEY);
      return;
    }
    window.localStorage.setItem(GLOBAL_VIEW_MODE_KEY, '1');
  }, [compactRows, enableViewModeToggle]);

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
    gradeFilters,
    order,
    groupBy,
    hideTicked,
    onlyFa,
    onlyMultipitch,
    types,
    disciplines,
    filtered,
    uniqueAreas,
    uniqueRocks,
    uniqueSectors,
    uniqueTypes,
    uniqueDisciplines,
    containsFa,
    containsTicked,
    containsMultipitch,
    dispatch,
  } = useProblemListState({
    rows: allRows,
    order: defaultOrder,
    key: storageKey,
    sortPreferenceBucket,
    filterPreferenceBucket,
  });

  /** Filter leading the toolbar when the profile rows span 2+ disciplines; ordered by their flags (see `utils/discipline`). */
  const disciplineOptions = useMemo(
    () => uniqueDisciplines.map((discipline) => ({ key: discipline, text: discipline, value: discipline })),
    [uniqueDisciplines],
  );
  const enabledDisciplines = uniqueDisciplines.filter((discipline) => disciplines[discipline] !== false);
  const allDisciplinesEnabled = enabledDisciplines.length === uniqueDisciplines.length;
  /** Dense chip summary: “All”, the single discipline, or “Bouldering +2”. */
  const disciplineShortLabel = allDisciplinesEnabled
    ? t('problemList.disciplineAll')
    : enabledDisciplines.length === 1
      ? enabledDisciplines[0]
      : `${enabledDisciplines[0]} +${enabledDisciplines.length - 1}`;

  /**
   * Grade sorting ranks each grade within its own discipline, so mixed lists keep it (see `useProblemListState`).
   * Option text is resolved here (`textKey` → `t`) because the tables are module scope.
   */
  const orderByOptions = useMemo(
    () =>
      ORDER_BY_OPTIONS[mode]
        .filter((opt) => !excludedSortOptions?.includes(opt.value))
        .map(({ textKey, shortTextKey, ...opt }) => ({ ...opt, text: t(textKey), shortText: t(shortTextKey) })),
    [mode, excludedSortOptions, t],
  );
  /**
   * One grade range control per grade system in the list. A system only appears while its range can filter (2+ grades
   * in the content) or a range is already set; with a single system the control keeps its traditional unlabelled look,
   * while several systems each name their own (like the activity feed's per-system chips).
   */
  const gradeFilterControls = useMemo(() => {
    const multiSystem = gradeFilters.length > 1;
    return gradeFilters.flatMap((filter) => {
      /** Content grades plus the current selection, so a stale persisted value still renders. */
      const labels = [...filter.labels];
      for (const grade of [filter.low, filter.high]) {
        if (grade !== undefined && !labels.includes(grade)) labels.push(grade);
      }
      if (labels.length <= 1 && filter.low === undefined && filter.high === undefined) return [];
      labels.sort((a, b) => (filter.mapping[a] ?? 0) - (filter.mapping[b] ?? 0));

      const low = filter.low ?? labels[0] ?? filter.easyToHard[0];
      const high = filter.high ?? labels[labels.length - 1] ?? filter.easyToHard[filter.easyToHard.length - 1];
      if (low === undefined || high === undefined) return [];

      const options = labels.map((label) => ({ key: label, text: label, shortText: label, value: label }));
      const maxIndex = Math.max(filter.easyToHard.length - 1, 0);
      return [
        {
          filter,
          systemName: multiSystem ? filter.name : undefined,
          low,
          high,
          lowOptions: options.filter(({ value }) => (filter.mapping[value] ?? 0) <= (filter.mapping[high] ?? maxIndex)),
          highOptions: options.filter(({ value }) => (filter.mapping[value] ?? maxIndex) >= (filter.mapping[low] ?? 0)),
        },
      ];
    });
  }, [gradeFilters]);

  const showListControls = allRows.length >= MIN_ROWS_FOR_LIST_CONTROLS;

  const hasActiveFilters =
    gradeFilters.some(({ low, high }) => low !== undefined || high !== undefined) ||
    Object.values(types).some((v) => !v) ||
    hideTicked ||
    onlyFa ||
    onlyMultipitch;

  /** Anything deviates from the defaults — drives the Reset button visibility (sort/group/discipline included). */
  const hasChanges = hasActiveFilters || order !== defaultOrder || groupBy !== 'none' || !allDisciplinesEnabled;

  if (!allRows?.length) {
    return null;
  }

  const list = (() => {
    if (filtered.length === 0) {
      return <div className='py-6 text-[13px] text-slate-500 md:text-[14px]'>{t('problemList.empty')}</div>;
    }

    if (groupBy && groupBy !== 'none') {
      const mapper = GROUP_BY[groupBy];
      return (
        <AccordionContainer
          accordionRows={mapper(t, {
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
      <div className={cn('flex flex-col', mode === 'user' ? (userListClassName ?? 'gap-3 sm:gap-4') : 'gap-0')}>
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
    .map(({ isApplicable: _, textKey, shortTextKey, ...props }) => ({
      ...props,
      text: t(textKey),
      shortText: shortTextKey ? t(shortTextKey) : undefined,
    }));
  const orderedGroupByOptions = [
    ...groupByOptions.filter((opt) => opt.value === 'none'),
    ...groupByOptions.filter((opt) => opt.value !== 'none'),
  ];
  const orderedSortOptions = [
    ...orderByOptions.filter((opt) => opt.value === defaultOrder),
    ...orderByOptions.filter((opt) => opt.value !== defaultOrder),
  ];

  const leading = typeof contentBeforeList === 'function' ? contentBeforeList(filtered) : contentBeforeList;

  /** Primary ink on chip labels — same in on/off so Filter/Details stay readable (panel open state is obvious). */
  const problemListToolbarChipInk = cn('text-slate-100', twInk.lightTextSlate900);

  const viewToggleAction = enableViewModeToggle ? (
    <label
      className={cn(activityFilterChipBase, activityFilterChipOn, 'shrink-0 cursor-pointer items-center')}
      title={t('problemList.toggleDetails')}
    >
      <FormSwitch checked={!compactRows} onChange={() => setCompactRows((v) => !v)} size='compact' variant='ios' />
      <span className={cn(designContract.typography.uiCompact, 'whitespace-nowrap', problemListToolbarChipInk)}>
        {t('problemList.details')}
      </span>
    </label>
  ) : null;

  const toolbarRow =
    showListControls || toolbarAction || viewToggleAction ? (
      <div className={designContract.layout.problemListToolbarRow}>
        {showListControls && (
          <>
            {disciplineOptions.length > 1 && (
              <ToolbarDropdown
                className='relative min-w-0 shrink-0 md:max-w-[15rem]'
                label={t('problemList.discipline')}
                icon={Layers}
                displayText={allDisciplinesEnabled ? t('problemList.allDisciplines') : enabledDisciplines.join(', ')}
                displayShortText={disciplineShortLabel}
                checkedValues={enabledDisciplines}
                onToggleValue={(discipline) =>
                  dispatch({ action: 'discipline', discipline, enabled: disciplines[discipline] === false })
                }
                options={disciplineOptions}
                changed={!allDisciplinesEnabled}
                onOpen={() => setFilterShowing(false)}
              />
            )}
            {groupByOptions.length > 1 && (
              <ToolbarDropdown
                className='relative min-w-0 shrink-0 md:max-w-[12rem]'
                label={t('problemList.group')}
                icon={FolderTree}
                value={groupBy}
                options={orderedGroupByOptions}
                onSelect={(next) => dispatch({ action: 'group-by', groupBy: next })}
                changed={groupBy !== 'none'}
                onOpen={() => setFilterShowing(false)}
              />
            )}
            <ToolbarDropdown
              className='relative min-w-0 shrink-0 md:max-w-[22rem]'
              label={t('problemList.sort')}
              icon={ArrowDownWideNarrow}
              value={order}
              options={orderedSortOptions}
              onSelect={(next) => dispatch({ action: 'order-by', order: next })}
              changed={order !== defaultOrder}
              onOpen={() => setFilterShowing(false)}
            />
            <button
              type='button'
              aria-expanded={showFilter}
              aria-label={showFilter ? t('problemList.hideFilter') : t('problemList.showFilter')}
              onClick={() => setFilterShowing((v) => !v)}
              className={cn(
                activityFilterChipBase,
                hasActiveFilters ? activityFilterChipChanged : activityFilterChipOn,
                showFilter && problemListToolbarChipOpen,
                'relative shrink-0 justify-center transition-[background-color,border-color,color,box-shadow]',
              )}
            >
              <Filter
                size={12}
                className={cn('shrink-0', hasActiveFilters ? activityFilterChipChangedInk : problemListToolbarChipInk)}
                strokeWidth={2}
              />
              <span
                className={cn(
                  designContract.typography.uiCompact,
                  'whitespace-nowrap',
                  hasActiveFilters ? activityFilterChipChangedText : problemListToolbarChipInk,
                )}
              >
                {t('problemList.filter')}
              </span>
            </button>
            {hasChanges && (
              <button
                type='button'
                aria-label={t('problemList.resetAll')}
                title={t('problemList.resetAll')}
                onClick={() => {
                  setFilterShowing(false);
                  dispatch({ action: 'reset', defaultOrder });
                }}
                className={cn(
                  activityFilterChipBase,
                  activityFilterChipChanged,
                  'relative shrink-0 justify-center transition-[background-color,border-color,color,box-shadow]',
                )}
              >
                <RotateCcw size={12} className={cn('shrink-0', activityFilterChipChangedInk)} strokeWidth={2} />
                <span
                  className={cn(
                    designContract.typography.uiCompact,
                    'whitespace-nowrap',
                    activityFilterChipChangedText,
                  )}
                >
                  {t('problemList.reset')}
                </span>
              </button>
            )}
          </>
        )}
        {viewToggleAction}
        {toolbarAction}
      </div>
    ) : null;

  const filterPanel =
    showListControls && showFilter ? (
      <div
        className={cn(
          'flex w-full min-w-0 flex-col',
          /** Fluid full-width strip (no box) — content aligns with the container; `detachToolbar` matches the list padding. */
          detachToolbar ? 'px-4 sm:px-5' : 'px-0',
          'gap-2 py-2 sm:gap-2.5 sm:py-2.5',
          'border-surface-border/40 border-b',
        )}
        role='region'
        aria-label={t('problemList.listFilters')}
      >
        {/**
         * One range per grade system on the rows: a profile list spans regions, so it can hold several systems and each
         * of them must stay filterable. A system's range only ever touches its own rows.
         */}
        {gradeFilterControls.map(({ filter, systemName, low, high, lowOptions, highOptions }) => (
          <div key={filter.gradeSystemId} className='flex flex-wrap items-center gap-x-3 gap-y-2'>
            <GradeRangeControl
              systemName={systemName}
              low={low}
              high={high}
              lowOptions={lowOptions}
              highOptions={highOptions}
              onLowSelect={(next) => dispatch({ action: 'set-grade', gradeSystemId: filter.gradeSystemId, low: next })}
              onHighSelect={(next) =>
                dispatch({ action: 'set-grade', gradeSystemId: filter.gradeSystemId, high: next })
              }
            />
          </div>
        ))}
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

        {mode === 'user' && containsMultipitch && (
          <div className='flex flex-wrap gap-x-4 gap-y-1.5'>
            <ToggleLabel
              label={t('problemList.onlyMultipitch')}
              checked={onlyMultipitch}
              onChange={() => dispatch({ action: 'only-multipitch' })}
            />
          </div>
        )}

        {(mode === 'sector' && containsTicked) || (mode === 'user' && containsFa) ? (
          <div className='flex flex-wrap gap-x-4 gap-y-1.5'>
            {mode === 'sector' && containsTicked && (
              <ToggleLabel
                label={t('filter.hideTicked')}
                checked={hideTicked}
                onChange={() => dispatch({ action: 'hide-ticked' })}
              />
            )}
            {mode === 'user' && containsFa && (
              <ToggleLabel
                label={t('problemList.onlyFa')}
                checked={onlyFa}
                onChange={() => dispatch({ action: 'only-fa' })}
              />
            )}
          </div>
        ) : null}
      </div>
    ) : null;

  const listBody = (
    <>
      {leading ? <div className={leadingBottomClassName}>{leading}</div> : null}
      {list}
    </>
  );

  /**
   * No horizontal padding on the pill row (avoids mobile inset). End alignment: `md:ml-auto` on
   * {@link designContract.layout.problemListToolbarRow}. Filter: fluid full-width strip whose padding aligns with the list.
   */
  const detachedStripClass = cn(
    'flex w-full min-w-0 flex-col gap-3',
    'max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] sm:mx-0 sm:w-full',
  );

  const detachedChrome =
    toolbarRow || filterPanel ? (
      <div className={detachedStripClass}>
        {toolbarRow ? <div className='flex w-full min-w-0 px-0 max-md:justify-center'>{toolbarRow}</div> : null}
        {filterPanel ? <div className='w-full min-w-0'>{filterPanel}</div> : null}
      </div>
    ) : null;

  return (
    <ProblemListCompactContext.Provider value={compactRows}>
      {detachToolbar ? (
        <div className='flex w-full min-w-0 flex-col gap-1 sm:gap-2'>
          {detachedChrome}
          {wrapDetachedContent ? wrapDetachedContent(listBody) : <div className='flex flex-col gap-4'>{listBody}</div>}
        </div>
      ) : (
        <div className='flex w-full min-w-0 flex-col gap-3 sm:gap-4'>
          {toolbarRow}
          {filterPanel}
          {leading ? <div className={leadingBottomClassName}>{leading}</div> : null}
          {list}
        </div>
      )}
    </ProblemListCompactContext.Provider>
  );
};

export default ProblemList;
