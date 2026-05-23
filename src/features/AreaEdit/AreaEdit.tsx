import { useCallback, type FormEvent, type ChangeEvent } from 'react';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { useMeta } from '../../shared/components/Meta/context';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useNavigate, useParams } from 'react-router-dom';
import { VisibilitySelectorField } from '../../shared/ui/VisibilitySelector';
import { captureSentryException } from '../../utils/sentry';
import { spaPathFromRedirectResponse } from '../../api';
import { useAreaEdit } from './useAreaEdit';
import { hours } from '../../utils/hours';
import ExternalLink from '../../shared/ui/ExternalLinks';
import { Info, AlertTriangle, Hash, Edit, MapPin, Save, Loader2, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, FormSwitch, MarkdownFieldLabel, SectionHeader } from '../../shared/ui';
import { sanitizeCoordInput, useCoordinateText } from '../../shared/hooks/useCoordinateText';

const dummyEvent = {} as ChangeEvent<HTMLInputElement>;

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

export const AreaEdit = () => {
  const meta = useMeta();
  const navigate = useNavigate();
  const { areaId } = useParams();
  const {
    isSaving,
    area: data,
    save: performSave,
    setBoolean,
    setCoord,
    setLatLng,
    setSectorSort,
    setString,
    setVisibility,
    setNumber,
    setExternalLinks,
  } = useAreaEdit({ areaId: +(areaId ?? 0) });

  const save = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!data?.name) return;

      if (!data.trash || confirm('Are you sure you want to move area to trash?')) {
        performSave(data)
          .then(async (res) => {
            const path = spaPathFromRedirectResponse(res);
            if (path === null) return;
            const id = res.idArea && res.idArea > 0 ? res.idArea : +(areaId ?? 0);
            const fallback = id > 0 ? `/area/${id}` : '/areas';
            navigate(path ?? fallback);
          })
          .catch((error) => {
            captureSentryException(error);
          });
      }
    },
    [areaId, data, navigate, performSave],
  );

  const handleNumberChange = (field: 'sunFromHour' | 'sunToHour') => (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === '' ? undefined : Number(e.target.value);
    setNumber(field)(dummyEvent, { value: val });
  };

  /*
   * Lat/lng raw-text adapter — see {@link useCoordinateText} for the why. The reducer keeps storing parsed
   * **numbers** in `state.coordinates` (so map markers / save payload are unchanged); we only adopt the raw text
   * for what the inputs render, plus the consumer-side guard logic that survives mid-typed decimals like `"60."`.
   *
   * `|| undefined` mapping: the reducer collapses blank / unparseable input to `0` (its `getCoordValue`
   * fallback), and the original input rendered `0` as the empty placeholder via `value={… || ''}`. Mapping
   * `0 → undefined` here preserves that UX — when the user clears the field, the hook stores `''`, the
   * reducer stores `0`, and the sync effect treats them as equivalent so we don't bounce a stray `"0"` back
   * into the input. Trade-off: typing literal `0` already collapsed to `''` in the original, so no regression.
   *
   * Ordering: hooks must run on every render in the same order, so they live above the `if (!data) return …`
   * early-return below — moving them under it would break Rules of Hooks. Reading the (always-defined) reducer
   * state for the initial value is fine because `state` is initialized to `DEFAULT_STATE` synchronously.
   */
  const lat = useCoordinateText(data?.coordinates?.latitude || undefined);
  const lng = useCoordinateText(data?.coordinates?.longitude || undefined);

  if (!data) return <Loading />;

  const safeSectors = data.sectors ?? [];
  const safeSectorOrder = data.sectorOrder ?? [];

  const defaultCenter =
    data.coordinates && data.coordinates.latitude !== 0 && data.coordinates.longitude !== 0
      ? { lat: +(data.coordinates.latitude ?? 0), lng: +(data.coordinates.longitude ?? 0) }
      : meta.defaultCenter;
  const defaultZoom: number = data.coordinates ? 8 : meta.defaultZoom;

  const inputClasses =
    'w-full bg-surface-nav border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white transition-colors focus:border-brand focus:outline-none';
  const labelClasses = 'ml-1 mb-1 block text-[12px] font-medium text-slate-400 sm:text-[13px]';

  /*
   * **Add vs Edit mode** — `data.id <= 0` is the reducer's convention for "no record exists yet"
   * (`DEFAULT_STATE.id === -1`, overwritten by the API's real id once an existing area's data
   * resolves). We branch on that here so the page title, HTML `<title>`, header icon, and
   * subtitle all agree about which mode the user is in. Subtitle ("contact Jostein to split
   * area") is **hidden** in Add mode — the area doesn't exist yet, so there's nothing to split.
   */
  const isNew = !data.id || data.id <= 0;
  const headerTitle = isNew ? 'Add Area' : 'Edit Area';

  return (
    <div className='w-full min-w-0 pb-20'>
      <title>{`${isNew ? 'Add area' : `Edit ${data.name}`} | ${meta?.title}`}</title>

      <form id='area-edit-form' onSubmit={save} className='mt-6 space-y-6'>
        {/* ── Basic info ── */}
        <Card>
          <SectionHeader
            title={headerTitle}
            icon={isNew ? Plus : Edit}
            description={
              isNew ? undefined : (
                <>
                  Contact{' '}
                  <a href='mailto:jostein.oygarden@gmail.com' className='hover:text-brand font-semibold text-slate-200'>
                    Jostein Øygarden
                  </a>{' '}
                  if you want to split area.
                </>
              )
            }
          />
          <div className='space-y-4 p-3 sm:p-5'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <label className={labelClasses}>Area name</label>
                <input
                  className={cn(inputClasses, !data.name && 'border-red-500/50')}
                  placeholder='Enter name'
                  value={data.name ?? ''}
                  onChange={(e) => setString('name')(e, { value: e.target.value })}
                />
                {!data.name && <p className='ml-1 text-[11px] font-bold text-red-500'>Area name required</p>}
              </div>

              <VisibilitySelectorField
                value={{
                  lockedAdmin: !!data.lockedAdmin,
                  lockedSuperadmin: !!data.lockedSuperadmin,
                }}
                onChange={setVisibility}
              />
            </div>

            <div className='flex flex-wrap gap-2 py-1 sm:gap-4'>
              <Toggle
                label='For developers'
                checked={!!data.forDevelopers}
                onChange={() => setBoolean('forDevelopers')(dummyEvent, { checked: !data.forDevelopers })}
              />
              <Toggle
                label='No dogs allowed'
                checked={!!data.noDogsAllowed}
                onChange={() => setBoolean('noDogsAllowed')(dummyEvent, { checked: !data.noDogsAllowed })}
              />
              <Toggle
                label='Trash'
                checked={!!data.trash}
                disabled={!data.id || data.id <= 0}
                onChange={() => setBoolean('trash')(dummyEvent, { checked: !data.trash })}
              />
            </div>

            {meta.isClimbing && (
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className={labelClasses}>Sun from hour</label>
                  <select
                    className={inputClasses}
                    value={data.sunFromHour || ''}
                    onChange={handleNumberChange('sunFromHour')}
                  >
                    <option value=''>Empty</option>
                    {hours
                      .filter((h) => h.value > 0)
                      .map((h) => (
                        <option key={h.key} value={h.value}>
                          {h.text}
                        </option>
                      ))}
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className={labelClasses}>Sun to hour</label>
                  <select
                    className={inputClasses}
                    value={data.sunToHour || ''}
                    onChange={handleNumberChange('sunToHour')}
                  >
                    <option value=''>Empty</option>
                    {hours
                      .filter((h) => h.value > 0)
                      .map((h) => (
                        <option key={h.key} value={h.value}>
                          {h.text}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <MarkdownFieldLabel className={labelClasses}>Description</MarkdownFieldLabel>
              <textarea
                className={cn(inputClasses, 'min-h-30 resize-none')}
                placeholder='Enter description'
                value={data.comment ?? ''}
                onChange={(e) => setString('comment')(e, { value: e.target.value })}
              />
            </div>

            <div className='space-y-4'>
              <div className='relative'>
                <input
                  className={cn(
                    inputClasses,
                    'border-red-500/25 pl-10 focus:border-red-400/45 focus:ring-1 focus:ring-red-400/15',
                  )}
                  placeholder='Enter closed-reason...'
                  value={data.accessClosed ?? ''}
                  onChange={(e) => setString('accessClosed')(e, { value: e.target.value })}
                />
                <AlertTriangle className='absolute top-1/2 left-3 -translate-y-1/2 text-red-400/90' size={14} />
                <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[11px] font-black tracking-tighter text-red-300/90 uppercase'>
                  Area Closed
                </span>
              </div>
              <div className='relative'>
                <input
                  className={cn(
                    inputClasses,
                    'border-orange-500/25 pl-10 focus:border-orange-400/45 focus:ring-1 focus:ring-orange-400/15',
                  )}
                  placeholder='Enter specific restrictions...'
                  value={data.accessInfo ?? ''}
                  onChange={(e) => setString('accessInfo')(e, { value: e.target.value })}
                />
                <Info className='absolute top-1/2 left-3 -translate-y-1/2 text-orange-400/90' size={14} />
                <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[11px] font-black tracking-tighter text-orange-300/90 uppercase'>
                  Restrictions
                </span>
              </div>
            </div>

            <div>
              <ExternalLink
                externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
                onExternalLinksUpdated={setExternalLinks}
                hideLabel
                mobileFlat
              />
            </div>
          </div>
        </Card>

        {/* ── Map ── */}
        <Card>
          <SectionHeader title='Map' icon={MapPin} />
          <div className='relative z-0 h-[35vh] min-h-[220px] w-full overflow-hidden sm:h-[40vh]'>
            <Leaflet
              autoZoom={true}
              markers={
                data.coordinates?.latitude
                  ? [
                      {
                        coordinates: {
                          latitude: data.coordinates.latitude,
                          longitude: data.coordinates.longitude ?? 0,
                        },
                      },
                    ]
                  : []
              }
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMouseClick={setLatLng}
              outlines={safeSectors
                .filter((s) => (s.outline ?? []).length > 0)
                .map((s) => ({ background: true, outline: s.outline ?? [] }))}
              height='100%'
              showSatelliteImage={false}
              clusterMarkers={false}
              flyToId={null}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 px-0 pb-3 sm:grid-cols-2 sm:px-0 sm:pb-5'>
            <div className='space-y-1'>
              <label className={labelClasses}>Latitude</label>
              <input
                className={inputClasses}
                inputMode='decimal'
                placeholder='e.g. 59.123'
                value={lat.text}
                onChange={(e) => {
                  const sanitized = sanitizeCoordInput(e.target.value);
                  lat.setText(sanitized);
                  setCoord('latitude')(e, { value: sanitized });
                }}
              />
            </div>
            <div className='space-y-1'>
              <label className={labelClasses}>Longitude</label>
              <input
                className={inputClasses}
                inputMode='decimal'
                placeholder='e.g. 10.456'
                value={lng.text}
                onChange={(e) => {
                  const sanitized = sanitizeCoordInput(e.target.value);
                  lng.setText(sanitized);
                  setCoord('longitude')(e, { value: sanitized });
                }}
              />
            </div>
          </div>
        </Card>

        {/* ── Sector order ── */}
        {safeSectorOrder.length > 1 && (
          <Card>
            <SectionHeader title='Sector order' icon={Hash} />
            <div className='p-3 sm:p-5'>
              <div className='space-y-1.5'>
                {safeSectorOrder.map((s) => (
                  <div key={s.id} className='group flex items-center'>
                    <div className='relative flex-1'>
                      <Hash className='absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-500' size={12} />
                      <input
                        type='number'
                        step={1}
                        defaultValue={s.sorting ?? 0}
                        placeholder='Number'
                        className='bg-surface-nav border-surface-border focus:border-brand w-full rounded-l-lg border py-1.5 pr-2.5 pl-8 text-[13px] transition-colors focus:outline-none'
                        onChange={(e) => s.id != null && setSectorSort(s.id)(e, { value: e.target.value })}
                      />
                    </div>
                    <div className='bg-surface-raised border-surface-border min-w-28 rounded-r-lg border border-l-0 px-3 py-1.5 text-[12px] font-bold text-slate-400'>
                      {s.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── Save / Cancel ── */}
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={() => navigate(+(areaId ?? -1) > 0 ? `/area/${areaId}` : `/areas`)}
            className='form-footer-cancel'
          >
            Cancel
          </button>
          <button
            type='submit'
            form='area-edit-form'
            disabled={isSaving || !data.name || !!data.sunFromHour !== !!data.sunToHour}
            className='type-label flex items-center gap-2 rounded-lg bg-emerald-400 px-8 py-2.5 text-slate-950 shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-300 disabled:opacity-50'
          >
            {isSaving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
            Save Area
          </button>
        </div>
      </form>
    </div>
  );
};

const Toggle = ({ label, checked, onChange, disabled }: ToggleProps) => (
  <div className={cn('flex items-center gap-2 sm:gap-3', disabled && 'cursor-not-allowed opacity-40')}>
    <FormSwitch checked={checked} onChange={onChange} disabled={disabled} variant='brand' aria-label={label} />
    <span className='text-[12px] font-medium text-slate-300 sm:text-[13px]'>{label}</span>
  </div>
);

export default AreaEdit;
