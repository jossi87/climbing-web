import { useState, useCallback, type FormEvent, type ChangeEvent, type ElementType } from 'react';
import MediaUpload from '../../shared/components/MediaUpload/MediaUpload';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { useMeta } from '../../shared/components/Meta/context';
import { Loading } from '../../shared/components/Widgets/Widgets';
import { useNavigate, useParams } from 'react-router-dom';
import { VisibilitySelectorField } from '../../shared/ui/VisibilitySelector';
import { captureException } from '@sentry/react';
import { useAreaEdit } from './useAreaEdit';
import { hours } from '../../utils/hours';
import ExternalLink from '../../shared/ui/ExternalLinks';
import {
  Info,
  Trash2,
  Dog,
  Code,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Hash,
  Save,
  Loader2,
  type LucideProps,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const dummyEvent = {} as ChangeEvent<HTMLInputElement>;

type ToggleProps = {
  label: string;
  icon: ElementType<LucideProps>;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  color?: string;
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
    setNewMedia,
    setSectorSort,
    setString,
    setVisibility,
    setNumber,
    setExternalLinks,
  } = useAreaEdit({ areaId: +(areaId ?? 0) });
  const [showSectorOrder, setShowSectorOrder] = useState(false);

  const save = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!data?.name) return;

      if (!data.trash || confirm('Are you sure you want to move area to trash?')) {
        performSave(data)
          .then(async (res) => {
            navigate(res.destination ?? '/areas');
          })
          .catch((error) => {
            captureException(error);
          });
      }
    },
    [data, navigate, performSave],
  );

  const handleNumberChange = (field: 'sunFromHour' | 'sunToHour') => (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === '' ? undefined : Number(e.target.value);
    setNumber(field)(dummyEvent, { value: val });
  };

  if (!data) return <Loading />;

  const safeSectors = data.sectors ?? [];
  const safeSectorOrder = data.sectorOrder ?? [];

  const defaultCenter =
    data.coordinates && data.coordinates.latitude !== 0 && data.coordinates.longitude !== 0
      ? { lat: +(data.coordinates.latitude ?? 0), lng: +(data.coordinates.longitude ?? 0) }
      : meta.defaultCenter;
  const defaultZoom: number = data.coordinates ? 8 : meta.defaultZoom;

  const inputClasses =
    'w-full bg-surface-nav border border-surface-border rounded-lg py-2 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors';
  const labelClasses = 'text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block';

  return (
    <div className='mx-auto max-w-4xl space-y-6 px-4 pb-20'>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>

      <div className='bg-surface-nav/20 border-surface-border flex items-center gap-3 rounded-xl border p-4 text-xs text-slate-400'>
        <Info size={16} className='text-brand shrink-0' />
        <p>
          Contact{' '}
          <a href='mailto:jostein.oygarden@gmail.com' className='hover:text-brand font-bold text-slate-200'>
            Jostein Øygarden
          </a>{' '}
          if you want to split area.
        </p>
      </div>

      <form onSubmit={save} className='space-y-6'>
        <div className='bg-surface-card border-surface-border space-y-6 rounded-xl border p-6 shadow-sm'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className={labelClasses}>Area name</label>
              <input
                className={cn(inputClasses, !data.name && 'border-red-500/50')}
                placeholder='Enter name'
                value={data.name ?? ''}
                onChange={(e) => setString('name')(e, { value: e.target.value })}
              />
              {!data.name && <p className='ml-1 text-[10px] font-bold text-red-500'>Area name required</p>}
            </div>

            <VisibilitySelectorField
              value={{
                lockedAdmin: !!data.lockedAdmin,
                lockedSuperadmin: !!data.lockedSuperadmin,
              }}
              onChange={setVisibility}
            />
          </div>

          <div className='border-surface-border/50 flex flex-wrap gap-6 border-y py-4'>
            <Toggle
              label='For developers'
              icon={Code}
              checked={!!data.forDevelopers}
              onChange={() => setBoolean('forDevelopers')(dummyEvent, { checked: !data.forDevelopers })}
            />
            <Toggle
              label='No dogs allowed'
              icon={Dog}
              checked={!!data.noDogsAllowed}
              onChange={() => setBoolean('noDogsAllowed')(dummyEvent, { checked: !data.noDogsAllowed })}
            />
            <Toggle
              label='Trash'
              icon={Trash2}
              checked={!!data.trash}
              disabled={!data.id || data.id <= 0}
              onChange={() => setBoolean('trash')(dummyEvent, { checked: !data.trash })}
              color='text-red-500'
            />
          </div>

          {meta.isClimbing && (
            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <label className={labelClasses}>Sun from hour</label>
                <select
                  className={inputClasses}
                  value={data.sunFromHour ?? ''}
                  onChange={handleNumberChange('sunFromHour')}
                >
                  <option value=''>Empty</option>
                  {hours.map((h) => (
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
                  value={data.sunToHour ?? ''}
                  onChange={handleNumberChange('sunToHour')}
                >
                  <option value=''>Empty</option>
                  {hours.map((h) => (
                    <option key={h.key} value={h.value}>
                      {h.text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <label className={labelClasses}>
              Description (supports{' '}
              <a
                href='https://jonschlinkert.github.io/remarkable/demo/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-brand underline'
              >
                markdown
              </a>
              )
            </label>
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
                className={cn(inputClasses, 'pl-10')}
                placeholder='Enter closed-reason...'
                value={data.accessClosed ?? ''}
                onChange={(e) => setString('accessClosed')(e, { value: e.target.value })}
              />
              <AlertTriangle className='absolute top-1/2 left-3 -translate-y-1/2 text-amber-500' size={14} />
              <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[9px] font-black tracking-tighter text-amber-500 uppercase'>
                Area Closed
              </span>
            </div>
            <div className='relative'>
              <input
                className={cn(inputClasses, 'pl-10')}
                placeholder='Enter specific restrictions...'
                value={data.accessInfo ?? ''}
                onChange={(e) => setString('accessInfo')(e, { value: e.target.value })}
              />
              <Info className='absolute top-1/2 left-3 -translate-y-1/2 text-blue-400' size={14} />
              <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[9px] font-black tracking-tighter text-blue-400 uppercase'>
                Restrictions
              </span>
            </div>
          </div>
        </div>

        <ExternalLink
          externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
          onExternalLinksUpdated={setExternalLinks}
        />

        <div className='bg-surface-card border-surface-border space-y-4 rounded-xl border p-6 shadow-sm'>
          <label className={labelClasses}>Add media</label>
          <MediaUpload onMediaChanged={setNewMedia} isMultiPitch={false} />
        </div>

        <div className='bg-surface-card border-surface-border space-y-6 rounded-xl border p-6 shadow-sm'>
          <div className='space-y-2'>
            <label className={labelClasses}>Mark area center on map</label>
            <div className='border-surface-border overflow-hidden rounded-lg border'>
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
                height={'300px'}
                showSatelliteImage={false}
                clusterMarkers={false}
                flyToId={null}
              />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-1'>
              <label className={labelClasses}>Latitude</label>
              <input
                className={inputClasses}
                value={data.coordinates?.latitude || ''}
                onChange={(e) => setCoord('latitude')(e, { value: e.target.value })}
              />
            </div>
            <div className='space-y-1'>
              <label className={labelClasses}>Longitude</label>
              <input
                className={inputClasses}
                value={data.coordinates?.longitude || ''}
                onChange={(e) => setCoord('longitude')(e, { value: e.target.value })}
              />
            </div>
          </div>
        </div>

        {safeSectorOrder.length > 1 && (
          <div className='bg-surface-card border-surface-border rounded-xl border shadow-sm'>
            <button
              type='button'
              onClick={() => setShowSectorOrder(!showSectorOrder)}
              className='type-label flex w-full items-center justify-between p-4'
            >
              <span className='flex items-center gap-2'>
                <Hash size={14} className='text-brand' />
                Change Sector Order
              </span>
              {showSectorOrder ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {showSectorOrder && (
              <div className='space-y-3 p-4 pt-0'>
                <p className='mb-2 text-[10px] text-slate-500 italic'>Lower numbers appear first</p>
                {safeSectorOrder.map((s) => (
                  <div key={s.id} className='group flex items-center'>
                    <div className='relative flex-1'>
                      <Hash className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-600' size={12} />
                      <input
                        className={cn(inputClasses, 'rounded-r-none border-r-0 pl-8')}
                        value={s.sorting ?? ''}
                        onChange={(e) => s.id != null && setSectorSort(s.id)(e, { value: e.target.value })}
                      />
                    </div>
                    <div className='bg-surface-nav border-surface-border min-w-35 rounded-r-lg border border-l-0 px-4 py-2 text-xs font-bold text-slate-300'>
                      {s.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={() => navigate(+(areaId ?? -1) > 0 ? `/area/${areaId}` : `/areas`)}
            className='bg-surface-nav border-surface-border hover:bg-surface-hover type-label rounded-lg border px-6 py-2.5 opacity-85 transition-all hover:opacity-100'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSaving || !data.name || !!data.sunFromHour !== !!data.sunToHour}
            className='bg-brand hover:bg-brand/90 shadow-brand/20 type-label flex items-center gap-2 rounded-lg px-8 py-2.5 shadow-lg transition-all disabled:opacity-50'
          >
            {isSaving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
            Save Area
          </button>
        </div>
      </form>
    </div>
  );
};

const Toggle = ({ label, icon: Icon, checked, onChange, disabled, color = 'text-brand' }: ToggleProps) => (
  <div className={cn('flex items-center gap-3', disabled && 'cursor-not-allowed opacity-40')}>
    <button
      type='button'
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
        checked ? 'bg-brand' : 'bg-slate-700',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
    <div className='flex items-center gap-1.5'>
      <Icon size={14} className={checked ? color : 'text-slate-500'} />
      <span className='text-[10px] font-black tracking-widest text-slate-300 uppercase'>{label}</span>
    </div>
  </div>
);

export default AreaEdit;
