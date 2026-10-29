import { useCallback, useRef, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GradeSelect } from './GradeSelect';
import { getLocales } from '../../../api';
import { useMeta } from '../Meta';
import { useFilter } from './context';
import type { ResetField } from '../../../features/Problems/reducer';
import { isFilterSectionActive } from '../../../features/Problems/reducer';
import { YearSelect } from './YearSelect';
import { hours } from '../../../utils/hours';
import { routeTypeLabel } from '../../../utils/routeTradGear';
import { StartingAltitudeSelect } from './StartingAltitudeSelect';
import { ChevronDown, Trash2, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { FormSwitch, SearchInput } from '../../ui';

/**
 * Pitch-count filter options. `key`/`value` stay the literals the reducer keys on (and the API expects);
 * `labelKey` is translated at render, so the option table itself holds no English prose.
 */
const CLIMBING_OPTIONS = [
  {
    key: 'Single-pitch',
    value: 'Single-pitch',
    labelKey: 'filter.pitchSingle',
  },
  {
    key: 'Multi-pitch',
    value: 'Multi-pitch',
    labelKey: 'filter.pitchMulti',
  },
] as const;

/**
 * Thresholds offered by the “minimum stars” dropdown. Star ratings are averages over 0–3, so the bounds are floors
 * rather than buckets: “2” keeps a 2.67 as well.
 */
const STAR_OPTIONS = [1, 2, 3] as const;

/**
 * Thresholds offered by the “minimum ascents” dropdown — from “at least one” up to a well-trafficked classic, which is
 * the spread that separates “established” from “popular” in a catalogue where most rows have a handful of ascents.
 */
const ASCENT_OPTIONS = [1, 5, 10, 25, 50, 100] as const;

type GroupHeaderProps = {
  title: string;
  reset: ResetField;
  buttons?: (
    | {
        icon: React.ElementType;
        onClick: () => void;
      }
    | undefined
  )[];
};

const GroupHeader = ({ title, reset, buttons }: GroupHeaderProps) => {
  const { t } = useTranslation();
  const filter = useFilter();
  const { dispatch } = filter;
  // A section only shows its reset button (and the brand “on” ink) while it actually restricts the list.
  const active = isFilterSectionActive(filter, reset);
  /**
   * The section's own (already translated) label goes in as `{{section}}` rather than being glued to a
   * verb here — a locale has to be able to inflect or reorder “Reset …”.
   */
  const resetLabel = t('filter.resetSection', { section: title });

  return (
    <div
      className={cn(
        'mb-3 flex items-center justify-between gap-3 border-b py-2',
        active ? 'border-brand-border' : 'border-surface-border',
      )}
    >
      <h5
        className={cn(
          'm-0 flex min-w-0 items-center gap-1.5',
          designContract.typography.label,
          active && 'text-brand light:text-amber-700',
        )}
      >
        {active && <span aria-hidden className='bg-brand light:bg-amber-700 h-1.5 w-1.5 shrink-0 rounded-full' />}
        {title}
      </h5>
      <div className='flex shrink-0 items-center gap-1.5'>
        {buttons
          ?.filter((b): b is NonNullable<typeof b> => !!b)
          ?.map(({ icon: IconComponent, onClick }, idx) => (
            <button
              key={idx}
              type='button'
              onClick={onClick}
              className='p-1 text-slate-500 transition-colors hover:text-slate-200'
            >
              <IconComponent size={14} />
            </button>
          ))}
        {active && (
          <button
            type='button'
            onClick={() => dispatch({ action: 'reset', section: reset })}
            className={cn(
              'border-brand-border bg-brand/18 text-brand hover:bg-brand/30 inline-flex h-6 w-6 shrink-0 items-center justify-center',
              'rounded-md border transition-colors',
              'light:border-brand light:bg-brand/25 light:text-amber-800 light:hover:bg-brand/45 light:hover:text-amber-900',
            )}
            title={resetLabel}
            aria-label={resetLabel}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

type AreaSizeState = 'show-all' | 'show-some' | 'too-few';

const STYLES: Record<AreaSizeState, CSSProperties> = {
  'show-all': {},
  'show-some': { maxHeight: '10vh', overflow: 'auto' },
  'too-few': {},
} as const;

const ICONS: Record<AreaSizeState, React.ElementType | undefined> = {
  'show-all': Minimize2,
  'show-some': Maximize2,
  'too-few': undefined,
};

const useSizing = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  const measuredTooFew = () => {
    const el = ref.current;
    if (!el) return false;
    const { clientHeight: containerHeight, scrollHeight: contentsHeight } = el;
    return contentsHeight < containerHeight || contentsHeight - containerHeight < containerHeight * 0.25;
  };

  const getStatus = (): AreaSizeState => {
    if (measuredTooFew()) return 'too-few';
    return expanded ? 'show-all' : 'show-some';
  };

  const onClick = useCallback(() => {
    if (measuredTooFew()) return;
    setExpanded((v) => !v);
  }, []);

  const status = getStatus();

  return {
    ref,
    style: STYLES[status],
    icon: ICONS[status],
    onClick,
  };
};

type CheckboxLabelProps = {
  label: ReactNode;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

const CheckboxLabel = ({ label, checked, onChange, disabled = false }: CheckboxLabelProps) => (
  <label className={cn('group flex cursor-pointer items-center gap-2.5', disabled && 'cursor-not-allowed opacity-50')}>
    <FormSwitch
      checked={checked}
      disabled={disabled}
      onChange={() => {
        if (disabled) return;
        onChange({ target: { checked: !checked } } as ChangeEvent<HTMLInputElement>);
      }}
    />
    <span className='text-sm opacity-85 transition-colors select-none group-hover:opacity-100'>{label}</span>
  </label>
);

export const FilterForm = () => {
  const { t } = useTranslation();
  const meta = useMeta();
  const filterState = useFilter();
  const {
    unfilteredData,
    filterSearch,
    filterRegionIds,
    filterAreaIds,
    filterOnlySunOnWallAt,
    filterOnlyShadeOnWallAt,
    filterMinStars,
    filterMinAscents,
    gradeFilters,
    filterSectorOrientations,
    filterOnlyAdmin,
    filterOnlySuperAdmin,
    filterHideTicked,
    filterOnlyTodo,
    filterPitches,
    filterTypes,
    dispatch,
  } = filterState;

  /** Any section deviating from the defaults — drives the header's “Clear filter”. */
  const anyFilterActive = isFilterSectionActive(filterState, 'all');

  /**
   * One control per grade system that can narrow the list. A system needs at least two narrowable grades in the content
   * (`n/a` marks ungraded rows and is not one) to have a range worth choosing, or a range that is already set, so it
   * stays visible and can be cleared.
   */
  const gradeSystemFilters = gradeFilters.filter(
    (gradeFilter) => gradeFilter.labels.length > 1 || gradeFilter.low !== undefined || gradeFilter.high !== undefined,
  );
  /** Several systems on one page each name their own control; a single system keeps the traditional unlabelled pair. */
  const multiGradeSystem = gradeFilters.length > 1;

  const disciplineOptions = meta.types
    .sort((a, b) => routeTypeLabel(a.type, a.subType).localeCompare(routeTypeLabel(b.type, b.subType), getLocales()))
    .map((t) => ({ key: t.id, value: t.id, text: routeTypeLabel(t.type, t.subType) }));

  const compassDirectionOptions = meta.compassDirections.map((cd) => ({
    key: cd.id,
    value: cd.id,
    text: cd.direction,
  }));

  const {
    ref: regionContainerRef,
    style: regionContainerStyle,
    icon: regionContainerButton,
    onClick: regionContainerAction,
  } = useSizing();

  const {
    ref: areaContainerRef,
    style: areaContainerStyle,
    icon: areaContainerButton,
    onClick: areaContainerAction,
  } = useSizing();

  return (
    <div className='space-y-6'>
      <div className='border-surface-border flex items-center justify-between border-b pb-4'>
        <h3 className='type-h2 m-0'>{t('filter.title')}</h3>
        <div className='flex items-center gap-2'>
          {anyFilterActive && (
            <button
              type='button'
              onClick={() => dispatch({ action: 'reset', section: 'all' })}
              className={cn(
                'bg-surface-nav border-surface-border flex items-center gap-1.5 rounded-md border px-3 py-1.5 opacity-80 transition-colors hover:opacity-100',
                designContract.typography.uiCompact,
                'uppercase',
              )}
            >
              <Trash2 size={12} /> {t('filter.clear')}
            </button>
          )}
          <button
            type='button'
            onClick={() => dispatch({ action: 'close-filter' })}
            className={cn(
              'bg-surface-nav border-surface-border flex items-center gap-1.5 rounded-md border px-3 py-1.5 opacity-80 transition-colors hover:opacity-100',
              designContract.typography.uiCompact,
              'uppercase',
            )}
          >
            <X size={12} /> {t('common.close')}
          </button>
        </div>
      </div>

      <div>
        <GroupHeader title={t('filter.search')} reset='search' />
        <div className='px-1'>
          <SearchInput
            type='text'
            inputMode='search'
            autoComplete='off'
            spellCheck={false}
            value={filterSearch}
            placeholder={t('filter.searchPlaceholder')}
            ariaLabel={t('filter.search')}
            onChange={(e) => dispatch({ action: 'set-search', text: e.target.value })}
            onClear={() => dispatch({ action: 'set-search', text: '' })}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        <div className='space-y-6'>
          {gradeSystemFilters.length > 0 && (
            <div>
              <GroupHeader title={t('filter.gradeBetween')} reset='grades' />
              <div className='space-y-4 px-1'>
                {gradeSystemFilters.map((gradeFilter) => (
                  <div key={gradeFilter.gradeSystemId} className='space-y-1.5'>
                    {/* A page can span regions, and regions do not have to share a grade system. */}
                    {multiGradeSystem && (
                      <div className={cn(designContract.typography.label, 'text-slate-400')}>
                        {t('filter.gradeWithSystem', { system: gradeFilter.name })}
                      </div>
                    )}
                    <GradeSelect filter={gradeFilter} dispatch={dispatch} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <GroupHeader title={t('filter.faYearBetween')} reset='fa-year' />
            <div className='px-1'>
              <YearSelect />
            </div>
          </div>

          <div>
            <GroupHeader title={t('filter.startingAltitudeBetween')} reset='starting-altitude' />
            <div className='px-1'>
              <StartingAltitudeSelect />
            </div>
          </div>

          <div>
            <GroupHeader title={t('filter.starsAscents')} reset='stars-ascents' />
            <div className='flex flex-col gap-4 px-1'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-slate-300'>{t('filter.minStars')}</span>
                <div className='relative'>
                  <select
                    className='bg-surface-nav border-surface-border type-body focus:border-brand appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none'
                    value={filterMinStars || 0}
                    onChange={(e) => {
                      dispatch?.({ action: 'set-min-stars', stars: Number(e.target.value) });
                    }}
                  >
                    <option value={0}>{t('common.any')}</option>
                    {STAR_OPTIONS.map((stars) => (
                      <option key={stars} value={stars}>
                        {t('filter.starsAtLeast', { stars })}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
                  />
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-slate-300'>{t('filter.minAscents')}</span>
                <div className='relative'>
                  <select
                    className='bg-surface-nav border-surface-border type-body focus:border-brand appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none'
                    value={filterMinAscents || 0}
                    onChange={(e) => {
                      dispatch?.({ action: 'set-min-ascents', ascents: Number(e.target.value) });
                    }}
                  >
                    <option value={0}>{t('common.any')}</option>
                    {ASCENT_OPTIONS.map((ascents) => (
                      <option key={ascents} value={ascents}>
                        {t('filter.ascentsAtLeast', { ascents })}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <GroupHeader title={t('filter.options')} reset='options' />
            <div className='flex flex-col gap-3 px-1'>
              <CheckboxLabel
                label={t('filter.hideTicked')}
                checked={!!filterHideTicked}
                disabled={!meta.isAuthenticated}
                onChange={(e) => dispatch?.({ action: 'set-hide-ticked', checked: !!e.target.checked })}
              />
              {/* Same login requirement as “Hide ticked”: the todo flag is per user, so it is empty when signed out. */}
              <CheckboxLabel
                label={t('filter.onlyTodo')}
                checked={!!filterOnlyTodo}
                disabled={!meta.isAuthenticated}
                onChange={(e) => dispatch?.({ action: 'set-only-todo', checked: !!e.target.checked })}
              />
              {meta.isAdmin && (
                <CheckboxLabel
                  label={t('filter.onlyAdmin')}
                  checked={!!filterOnlyAdmin}
                  onChange={(e) => {
                    dispatch?.({ action: 'set-only-admin', checked: !!e.target.checked });
                  }}
                />
              )}
              {meta.isSuperAdmin && (
                <CheckboxLabel
                  label={t('filter.onlySuperAdmin')}
                  checked={!!filterOnlySuperAdmin}
                  onChange={(e) => {
                    dispatch?.({
                      action: 'set-only-super-admin',
                      checked: !!e.target.checked,
                    });
                  }}
                />
              )}
            </div>
          </div>

          {disciplineOptions.length > 1 && (
            <div>
              <GroupHeader title={t('filter.types')} reset='types' />
              <div className='flex flex-wrap gap-4 px-1'>
                {disciplineOptions.map((discipline) => (
                  <CheckboxLabel
                    key={discipline.key}
                    label={discipline.text}
                    checked={!!filterTypes?.[discipline.value ?? 0]}
                    onChange={(e) => {
                      dispatch?.({
                        action: 'toggle-types',
                        option: discipline.value ?? 0,
                        checked: !!e.target.checked,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {!meta.isBouldering && (
            <div>
              <GroupHeader title={t('filter.pitches')} reset='pitches' />
              <div className='flex flex-wrap gap-4 px-1'>
                {CLIMBING_OPTIONS.map((option) => (
                  <CheckboxLabel
                    key={option.key}
                    label={t(option.labelKey)}
                    checked={!!filterPitches?.[option.value]}
                    onChange={(e) => {
                      dispatch?.({
                        action: 'toggle-pitches',
                        option: option.value,
                        checked: !!e.target.checked,
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {meta.isClimbing && (
          <div className='space-y-6'>
            <div>
              <GroupHeader title={t('filter.orientation')} reset='orientations' />
              <div className='flex flex-wrap gap-4 px-1'>
                {compassDirectionOptions.map((option) => (
                  <CheckboxLabel
                    key={option.key}
                    label={option.text}
                    checked={!!filterSectorOrientations?.[option.value ?? 0]}
                    onChange={(e) => {
                      dispatch?.({
                        action: 'toggle-sector-orientations',
                        option: option.value ?? 0,
                        checked: !!e.target.checked,
                      });
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <GroupHeader title={t('filter.conditions')} reset='conditions' />
              <div className='flex flex-col gap-4 px-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-slate-300'>{t('filter.sunOnWallAt')}</span>
                  <div className='relative'>
                    <select
                      className='bg-surface-nav border-surface-border type-body focus:border-brand appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none'
                      value={filterOnlySunOnWallAt || 0}
                      onChange={(e) => {
                        dispatch?.({
                          action: 'set-only-sun-on-wall-at',
                          hour: Number(e.target.value),
                        });
                      }}
                    >
                      {hours.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.text}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
                    />
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-slate-300'>{t('filter.shadeOnWallAt')}</span>
                  <div className='relative'>
                    <select
                      className='bg-surface-nav border-surface-border type-body focus:border-brand appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none'
                      value={filterOnlyShadeOnWallAt || 0}
                      onChange={(e) => {
                        dispatch?.({
                          action: 'set-only-shade-on-wall-at',
                          hour: Number(e.target.value),
                        });
                      }}
                    >
                      {hours.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.text}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='space-y-6 pt-4'>
        {(unfilteredData?.regions?.length ?? 0) > 1 && (
          <div>
            <GroupHeader
              title={t('filter.regions')}
              reset='regions'
              buttons={[
                regionContainerButton
                  ? {
                      icon: regionContainerButton,
                      onClick: regionContainerAction,
                    }
                  : undefined,
              ]}
            />
            <div style={regionContainerStyle} ref={regionContainerRef} className='flex flex-wrap gap-4 px-1'>
              {unfilteredData?.regions?.map(({ id = 0, name = '' }) => (
                <CheckboxLabel
                  key={id}
                  label={name}
                  checked={!!filterRegionIds[id]}
                  onChange={(e) =>
                    dispatch({
                      action: 'toggle-region',
                      regionId: id,
                      enabled: !!e.target.checked,
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <GroupHeader
            title={t('filter.areas')}
            reset='areas'
            buttons={[areaContainerButton ? { icon: areaContainerButton, onClick: areaContainerAction } : undefined]}
          />
          <div style={areaContainerStyle} ref={areaContainerRef} className='flex flex-wrap gap-4 px-1'>
            {unfilteredData?.regions?.map((region) =>
              region.areas?.map(({ id = 0, name = '' }) => (
                <CheckboxLabel
                  key={id}
                  label={name}
                  checked={!!filterAreaIds[id]}
                  onChange={(e) =>
                    dispatch({
                      action: 'toggle-area',
                      areaId: id,
                      enabled: !!e.target.checked,
                    })
                  }
                />
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
