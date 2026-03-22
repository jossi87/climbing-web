import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { GradeSelect } from './GradeSelect';
import { getLocales } from '../../../api';
import { useMeta } from '../meta';
import { useFilter } from './context';
import type { ResetField } from '../../Problems/reducer';
import { YearSelect } from './YearSelect';
import { hours } from '../../../utils/hours';
import { StartingAltitudeSelect } from './StartingAltitudeSelect';
import { ChevronDown, Trash2, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const CLIMBING_OPTIONS = [
  {
    key: 'Single-pitch',
    value: 'Single-pitch',
    text: 'Single-pitch',
  },
  {
    key: 'Multi-pitch',
    value: 'Multi-pitch',
    text: 'Multi-pitch',
  },
] as const;

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
  const { dispatch } = useFilter();

  return (
    <div className='flex items-center justify-between py-2 border-b border-surface-border mb-3'>
      <h5 className='text-[10px] font-black uppercase tracking-widest text-slate-500 m-0'>
        {title}
      </h5>
      <div className='flex items-center gap-2'>
        {buttons
          ?.filter((b): b is NonNullable<typeof b> => !!b)
          ?.map(({ icon: IconComponent, onClick }, idx) => (
            <button
              key={idx}
              type='button'
              onClick={onClick}
              className='p-1 text-slate-500 hover:text-white transition-colors'
            >
              <IconComponent size={14} />
            </button>
          ))}
        <button
          type='button'
          onClick={() => dispatch({ action: 'reset', section: reset })}
          className='p-1 text-slate-500 hover:text-red-400 transition-colors'
          title='Reset'
        >
          <Trash2 size={14} />
        </button>
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
    return (
      contentsHeight < containerHeight || contentsHeight - containerHeight < containerHeight * 0.25
    );
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
  <label
    className={cn(
      'flex items-center gap-2 cursor-pointer group',
      disabled && 'opacity-50 cursor-not-allowed',
    )}
  >
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
    <input
      type='checkbox'
      className='hidden'
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
  </label>
);

export const FilterForm = () => {
  const meta = useMeta();
  const {
    unfilteredData,
    filterRegionIds,
    filterAreaIds,
    filterOnlySunOnWallAt,
    filterOnlyShadeOnWallAt,
    filterGradeHigh,
    filterGradeLow,
    filterSectorWallDirections,
    filterOnlyAdmin,
    filterOnlySuperAdmin,
    filterHideTicked,
    filterPitches,
    filterTypes,
    filteredProblems,
    dispatch,
  } = useFilter();

  const disciplineOptions = meta.types
    .sort((a, b) => (a.subType ?? '').localeCompare(b.subType ?? '', getLocales()))
    .map((t) => ({ key: t.id, value: t.id, text: t.subType }));

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
      <div className='flex items-center justify-between border-b border-surface-border pb-4'>
        <h3 className='text-lg font-black uppercase tracking-tight text-white m-0'>Filter</h3>
        <div className='flex items-center gap-2'>
          {filteredProblems > 0 && (
            <button
              type='button'
              onClick={() => dispatch({ action: 'reset', section: 'all' })}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-nav border border-surface-border text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors'
            >
              <Trash2 size={12} /> Clear filter
            </button>
          )}
          <button
            type='button'
            onClick={() => dispatch({ action: 'close-filter' })}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-nav border border-surface-border text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors'
          >
            <X size={12} /> Close
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        <div className='space-y-6'>
          <div>
            <GroupHeader title='Grades' reset='grades' />
            <div className='px-1'>
              <GradeSelect low={filterGradeLow} high={filterGradeHigh} dispatch={dispatch} />
            </div>
          </div>

          <div>
            <GroupHeader title='First Ascent Year' reset='fa-year' />
            <div className='px-1'>
              <YearSelect />
            </div>
          </div>

          <div>
            <GroupHeader title='Starting altitude' reset='starting-altitude' />
            <div className='px-1'>
              <StartingAltitudeSelect />
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <GroupHeader title='Options' reset='options' />
            <div className='flex flex-col gap-3 px-1'>
              <CheckboxLabel
                label='Hide ticked'
                checked={!!filterHideTicked}
                disabled={!meta.isAuthenticated}
                onChange={(e) =>
                  dispatch?.({ action: 'set-hide-ticked', checked: !!e.target.checked })
                }
              />
              {meta.isAdmin && (
                <CheckboxLabel
                  label='Only admin'
                  checked={!!filterOnlyAdmin}
                  onChange={(e) => {
                    dispatch?.({ action: 'set-only-admin', checked: !!e.target.checked });
                  }}
                />
              )}
              {meta.isSuperAdmin && (
                <CheckboxLabel
                  label='Only superadmin'
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
              <GroupHeader title='Types' reset='types' />
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
              <GroupHeader title='Pitches' reset='pitches' />
              <div className='flex flex-wrap gap-4 px-1'>
                {CLIMBING_OPTIONS.map((option) => (
                  <CheckboxLabel
                    key={option.key}
                    label={option.text}
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
              <GroupHeader title='Wall direction' reset='wall-directions' />
              <div className='flex flex-wrap gap-4 px-1'>
                {compassDirectionOptions.map((option) => (
                  <CheckboxLabel
                    key={option.key}
                    label={option.text}
                    checked={!!filterSectorWallDirections?.[option.value ?? 0]}
                    onChange={(e) => {
                      dispatch?.({
                        action: 'toggle-sector-wall-directions',
                        option: option.value ?? 0,
                        checked: !!e.target.checked,
                      });
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <GroupHeader title='Conditions' reset='conditions' />
              <div className='flex flex-col gap-4 px-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-slate-300'>Sun on wall at</span>
                  <div className='relative'>
                    <select
                      className='appearance-none bg-surface-nav border border-surface-border rounded-md px-3 py-1.5 text-sm text-white pr-8 focus:outline-none focus:border-brand'
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
                      className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
                    />
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-slate-300'>Shade on wall at</span>
                  <div className='relative'>
                    <select
                      className='appearance-none bg-surface-nav border border-surface-border rounded-md px-3 py-1.5 text-sm text-white pr-8 focus:outline-none focus:border-brand'
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
                      className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
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
              title='Regions'
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
            <div
              style={regionContainerStyle}
              ref={regionContainerRef}
              className='flex flex-wrap gap-4 px-1'
            >
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
            title='Areas'
            reset='areas'
            buttons={[
              areaContainerButton
                ? { icon: areaContainerButton, onClick: areaContainerAction }
                : undefined,
            ]}
          />
          <div
            style={areaContainerStyle}
            ref={areaContainerRef}
            className='flex flex-wrap gap-4 px-1'
          >
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
