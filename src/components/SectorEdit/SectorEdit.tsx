import {
  useState,
  useCallback,
  type ComponentProps,
  type UIEvent,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import MediaUpload from '../common/media-upload/media-upload';
import { Loading } from '../common/widgets/widgets';
import { useMeta } from '../common/meta';
import { postSector, useAccessToken, useArea, useElevation, useSector } from '../../api';
import Leaflet from '../common/leaflet/leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { VisibilitySelectorField } from '../common/VisibilitySelector';
import type { components } from '../../@types/buldreinfo/swagger';
import { ProblemOrder } from './ProblemOrder';
import { PolylineEditor } from './PolylineEditor';
import { ZoomLogic } from './ZoomLogic';
import { PolylineMarkers } from './PolylineMarkers';
import { captureMessage } from '@sentry/react';
import { hours } from '../../utils/hours';
import ExternalLinks from '../common/external-links/external-links';
import {
  Info,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Layers,
  Route,
  ArrowDownCircle,
  RotateCcw,
  Save,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type Area = components['schemas']['Area'];
type Sector = components['schemas']['Sector'];

const dummyEvent = {} as ChangeEvent<HTMLInputElement>;

const useIds = (): { areaId: number; sectorId: number } => {
  const { sectorId, areaId } = useParams();
  if (!sectorId) throw new Error('Missing sectorId parameter');
  if (!areaId) throw new Error('Missing areaId parameter');
  return { sectorId: +sectorId, areaId: +areaId };
};

export const SectorEditLoader = () => {
  const { areaId, sectorId } = useIds();
  const { data: area } = useArea(areaId);
  const { data: sector, error } = useSector(sectorId);

  if (error) {
    return (
      <div className='p-12 bg-surface-card border border-surface-border rounded-2xl text-center max-w-2xl mx-auto mt-10'>
        <div className='w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
          <AlertTriangle size={32} />
        </div>
        <h2 className='text-3xl font-black text-white mb-2 uppercase tracking-tighter'>404</h2>
        <p className='text-slate-400'>
          Cannot find the specified sector because it does not exist or you do not have sufficient
          permissions.
        </p>
      </div>
    );
  }

  if (!area) return <Loading />;

  const value =
    sector ??
    ({
      areaId,
      id: -1,
      lockedAdmin: area.lockedAdmin,
      lockedSuperadmin: area.lockedSuperadmin,
      name: '',
      comment: '',
      accessInfo: '',
      accessClosed: '',
      parking: undefined,
      newMedia: [],
      problemOrder: [],
    } satisfies Sector);

  return <SectorEdit key={value.id} sector={value} area={area} />;
};

type Props = {
  sector: Sector;
  area: Area;
};

type OnChangeParams = { value: string | number | undefined };

export const SectorEdit = ({ sector, area }: Props) => {
  const navigate = useNavigate();
  const meta = useMeta();
  const accessToken = useAccessToken();
  const { areaId, sectorId } = useIds();
  const [leafletMode, setLeafletMode] = useState('PARKING');
  const { elevation, setLocation } = useElevation();

  const [data, setData] = useState<Sector>(sector);

  const [showProblemOrder, setShowProblemOrder] = useState(false);
  const [sectorMarkers, setSectorMarkers] = useState<ComponentProps<typeof Leaflet>['markers']>([]);

  const [saving, setSaving] = useState(false);

  let defaultCenter;
  let defaultZoom;
  if (data.parking?.latitude && data.parking?.longitude) {
    defaultCenter = { lat: data.parking.latitude, lng: data.parking.longitude };
    defaultZoom = 14;
  } else if (area.coordinates?.latitude && area.coordinates?.longitude) {
    defaultCenter = {
      lat: area.coordinates.latitude,
      lng: area.coordinates.longitude,
    };
    defaultZoom = 14;
  } else {
    defaultCenter = meta.defaultCenter;
    defaultZoom = meta.defaultZoom;
  }

  const onNameChanged = useCallback((_: unknown, { value }: OnChangeParams) => {
    setData((prevState) => ({ ...prevState, name: value as string }));
  }, []);

  const onWallDirectionManualIdChanged = useCallback(
    (_: unknown, { value }: OnChangeParams) => {
      const compassDirectionId = +(value ?? 0);
      const wallDirectionManual =
        compassDirectionId === 0
          ? undefined
          : meta.compassDirections.find((cd) => cd.id === compassDirectionId);
      setData((prevState) => ({ ...prevState, wallDirectionManual }));
    },
    [meta.compassDirections],
  );

  const onLockedChanged = useCallback(
    ({
      lockedAdmin,
      lockedSuperadmin,
    }: Required<Pick<Sector, 'lockedAdmin' | 'lockedSuperadmin'>>) => {
      setData((prevState) => ({
        ...prevState,
        lockedAdmin,
        lockedSuperadmin,
      }));
    },
    [],
  );

  const onSunFromHourChanged = useCallback((_: unknown, { value }: OnChangeParams) => {
    setData((prevState) => ({ ...prevState, sunFromHour: +(value ?? 0) }));
  }, []);

  const onSunToHourChanged = useCallback((_: unknown, { value }: OnChangeParams) => {
    setData((prevState) => ({ ...prevState, sunToHour: +(value ?? 0) }));
  }, []);

  const onCommentChanged = useCallback((_: unknown, { value }: OnChangeParams) => {
    setData((prevState) => ({ ...prevState, comment: value as string }));
  }, []);

  const onAccessInfoChanged = useCallback((_: unknown, { value }: OnChangeParams) => {
    setData((prevState) => ({ ...prevState, accessInfo: value as string }));
  }, []);

  const onAccessClosedChanged = useCallback((_: unknown, { value }: OnChangeParams) => {
    setData((prevState) => ({ ...prevState, accessClosed: value as string }));
  }, []);

  const onExternalLinksUpdated = useCallback(
    (externalLinks: components['schemas']['ExternalLink'][]) => {
      setData((prevState) => ({ ...prevState, externalLinks }));
    },
    [],
  );

  const onNewMediaChanged = useCallback((newMedia: Sector['newMedia']) => {
    setData((prevState) => ({ ...prevState, newMedia }));
  }, []);

  const save = (event: UIEvent | FormEvent) => {
    event.preventDefault();
    const trash = !!data.trash;
    if (!trash || confirm('Are you sure you want to move sector to trash?')) {
      setSaving(true);
      postSector(
        accessToken,
        areaId,
        sectorId,
        !!data.trash,
        !!data.lockedAdmin,
        !!data.lockedSuperadmin,
        data.name ?? '',
        data.comment ?? '',
        data.accessInfo ?? '',
        data.accessClosed ?? '',
        data.sunFromHour ?? 0,
        data.sunToHour ?? 0,
        data.parking ?? ({} as components['schemas']['Coordinates']),
        data.outline ?? [],
        data.wallDirectionManual ?? ({} as components['schemas']['CompassDirection']),
        data.approach ?? {},
        data.descent ?? {},
        data.externalLinks ?? [],
        data.newMedia ?? [],
        data.problemOrder,
      )
        .then(async (res) => {
          if (!res.destination) {
            captureMessage('Missing res.destination');
            navigate(-1);
          } else {
            navigate(res.destination);
          }
        })
        .catch((error) => {
          console.warn(error);
        })
        .finally(() => setSaving(false));
    }
  };

  const onMapMouseClick: ComponentProps<typeof Leaflet>['onMouseClick'] = (event) => {
    if (leafletMode === 'PARKING') {
      setData((prevState) => ({
        ...prevState,
        parking: {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        },
      }));
    } else if (leafletMode === 'POLYGON') {
      const outline = [...(data.outline || [])];
      outline.push({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
      setData((prevState) => ({ ...prevState, outline }));
    } else if (leafletMode === 'APPROACH') {
      const coordinates = [...(data.approach?.coordinates || [])];
      coordinates.push({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
      setData((prevState) => ({ ...prevState, approach: { coordinates } }));
    } else if (leafletMode === 'DESCENT') {
      const coordinates = [...(data.descent?.coordinates || [])];
      coordinates.push({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
      setData((prevState) => ({ ...prevState, descent: { coordinates } }));
    }
  };

  const onMouseMove: NonNullable<ComponentProps<typeof Leaflet>['onMouseMove']> = useCallback(
    (event) => {
      if (leafletMode === 'POLYGON') {
        setLocation(event.latlng);
      }
    },
    [leafletMode, setLocation],
  );

  function clearDrawing() {
    if (leafletMode === 'PARKING') {
      setData((prevState) => ({ ...prevState, parking: undefined }));
    } else if (leafletMode === 'POLYGON') {
      setData((prevState) => ({ ...prevState, outline: undefined }));
    } else if (leafletMode === 'APPROACH') {
      setData((prevState) => ({ ...prevState, approach: undefined }));
    } else if (leafletMode === 'DESCENT') {
      setData((prevState) => ({ ...prevState, descent: undefined }));
    }
  }

  const onLatChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let lat = parseFloat(value.replace(',', '.'));
    if (isNaN(lat)) {
      lat = 0;
    }
    setData((prevState) => ({
      ...prevState,
      parking: {
        longitude: 0,
        ...prevState.parking,
        latitude: lat,
      },
    }));
  }, []);

  const onLngChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let lng = parseFloat(value.replace(',', '.'));
    if (isNaN(lng)) {
      lng = 0;
    }
    setData((prevState) => ({
      ...prevState,
      parking: {
        latitude: 0,
        ...prevState.parking,
        longitude: lng,
      },
    }));
  }, []);

  const outlines: ComponentProps<typeof Leaflet>['outlines'] = [];
  const slopes: ComponentProps<typeof Leaflet>['slopes'] = [];
  area.sectors?.forEach((s) => {
    if (s.id !== data.id) {
      if (s.outline?.length) {
        outlines.push({
          outline: s.outline,
          background: true,
          label: s.name,
        });
      }
      if (s.approach?.coordinates?.length) {
        slopes.push({
          slope: s.approach,
          backgroundColor: 'lime',
          background: true,
        });
      }
      if (s.descent?.coordinates?.length) {
        slopes.push({
          slope: s.descent,
          backgroundColor: 'purple',
          background: true,
        });
      }
    }
  });

  if (data.outline?.length) {
    outlines.push({ outline: data.outline, background: false });
  }
  if (data.approach?.coordinates?.length) {
    slopes.push({
      slope: data.approach,
      backgroundColor: 'lime',
      background: false,
    });
  }
  if (data.descent?.coordinates?.length) {
    slopes.push({
      slope: data.descent,
      backgroundColor: 'purple',
      background: false,
    });
  }

  const markers: ComponentProps<typeof Leaflet>['markers'] = [];
  if (data.parking) {
    markers.push({
      coordinates: data.parking,
      isParking: true,
    });
  }
  if (sectorMarkers) {
    markers.push(...sectorMarkers);
  }

  const inputClasses =
    'w-full bg-surface-nav border border-surface-border rounded-lg py-2 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors';
  const labelClasses =
    'text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block';

  return (
    <div className='max-w-4xl mx-auto space-y-6 pb-20 px-4'>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>

      <div className='flex items-center gap-3 p-4 bg-surface-nav/20 border border-surface-border rounded-xl text-slate-400 text-xs'>
        <Info size={16} className='text-brand shrink-0' />
        <p>
          Contact{' '}
          <a
            href='mailto:jostein.oygarden@gmail.com'
            className='text-slate-200 hover:text-brand font-bold'
          >
            Jostein Øygarden
          </a>{' '}
          if you want to move or split sector.
        </p>
      </div>

      <form onSubmit={save} className='space-y-6'>
        <div className='bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='md:col-span-2 lg:col-span-1 space-y-2'>
              <label className={labelClasses}>Sector name</label>
              <input
                className={cn(inputClasses, !data.name && 'border-red-500/50')}
                value={data.name ?? ''}
                onChange={(e) => onNameChanged(dummyEvent, { value: e.target.value })}
              />
              {!data.name && (
                <p className='text-[10px] text-red-500 font-bold ml-1'>Sector name required</p>
              )}
            </div>

            {meta.isClimbing && (
              <div className='space-y-2'>
                <label className={labelClasses}>Wall Direction</label>
                <select
                  className={inputClasses}
                  value={data.wallDirectionManual?.id || 0}
                  onChange={(e) =>
                    onWallDirectionManualIdChanged(dummyEvent, { value: e.target.value })
                  }
                >
                  <option value={0}>
                    {data.wallDirectionCalculated
                      ? `${data.wallDirectionCalculated.direction} (calculated)`
                      : '<calculate from outline>'}
                  </option>
                  {meta.compassDirections.map((cd) => (
                    <option key={cd.id} value={cd.id}>
                      {cd.direction}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <VisibilitySelectorField
              value={{ lockedAdmin: !!data.lockedAdmin, lockedSuperadmin: !!data.lockedSuperadmin }}
              onChange={onLockedChanged}
            />

            <div className='space-y-2'>
              <label className={labelClasses}>Move to trash</label>
              <button
                type='button'
                disabled={!data.id || data.id <= 0}
                onClick={() => setData((p) => ({ ...p, trash: !p.trash }))}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-30',
                  data.trash ? 'bg-red-500' : 'bg-slate-700',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    data.trash ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          </div>

          {meta.isClimbing && (
            <div className='grid grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <label className={labelClasses}>Sun from hour</label>
                <select
                  className={inputClasses}
                  value={data.sunFromHour ?? 0}
                  onChange={(e) => onSunFromHourChanged(dummyEvent, { value: e.target.value })}
                >
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
                  value={data.sunToHour ?? 0}
                  onChange={(e) => onSunToHourChanged(dummyEvent, { value: e.target.value })}
                >
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
              value={data.comment ?? ''}
              onChange={(e) => onCommentChanged(dummyEvent, { value: e.target.value })}
            />
          </div>

          <div className='space-y-4'>
            <div className='relative'>
              <input
                className={cn(inputClasses, 'pl-10')}
                placeholder='Sector closed reason...'
                value={data.accessClosed ?? ''}
                onChange={(e) => onAccessClosedChanged(dummyEvent, { value: e.target.value })}
              />
              <AlertTriangle
                className='absolute left-3 top-1/2 -translate-y-1/2 text-amber-500'
                size={14}
              />
              <span className='absolute left-10 -top-2 px-1 bg-surface-card text-[9px] font-black text-amber-500 uppercase tracking-tighter'>
                Sector Closed
              </span>
            </div>
            <div className='relative'>
              <input
                className={cn(inputClasses, 'pl-10')}
                placeholder='Sector restrictions...'
                value={data.accessInfo ?? ''}
                onChange={(e) => onAccessInfoChanged(dummyEvent, { value: e.target.value })}
              />
              <Info className='absolute left-3 top-1/2 -translate-y-1/2 text-blue-400' size={14} />
              <span className='absolute left-10 -top-2 px-1 bg-surface-card text-[9px] font-black text-blue-400 uppercase tracking-tighter'>
                Restrictions
              </span>
            </div>
          </div>
        </div>

        <ExternalLinks
          externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
          onExternalLinksUpdated={onExternalLinksUpdated}
        />

        <div className='bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm'>
          <label className={labelClasses}>Add media</label>
          <MediaUpload onMediaChanged={onNewMediaChanged} isMultiPitch={false} />
        </div>

        <div className='bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex bg-surface-nav rounded-lg p-1 border border-surface-border'>
              {[
                { id: 'PARKING', label: 'Parking', icon: MapPin },
                { id: 'POLYGON', label: 'Outline', icon: Layers },
                { id: 'APPROACH', label: 'Approach', icon: Route },
                { id: 'DESCENT', label: 'Descent', icon: ArrowDownCircle },
              ].map((m) => (
                <button
                  key={m.id}
                  type='button'
                  onClick={() => setLeafletMode(m.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all',
                    leafletMode === m.id
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300',
                  )}
                >
                  <m.icon size={12} /> {m.label}
                </button>
              ))}
              <button
                type='button'
                onClick={clearDrawing}
                className='px-3 py-1.5 text-orange-500 hover:text-orange-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-2 border-l border-surface-border'
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <button
              type='button'
              onClick={() => {
                if (sectorMarkers == null || sectorMarkers.length === 0) {
                  if (sectorId) {
                    setSectorMarkers(
                      data.problems
                        ?.filter(
                          (p): p is Required<Pick<typeof p, 'coordinates' | 'name'>> =>
                            !!p.coordinates,
                        )
                        .map((p) => ({ coordinates: p.coordinates, label: p.name })) || [],
                    );
                  }
                } else {
                  setSectorMarkers([]);
                }
              }}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border',
                sectorMarkers != null && sectorMarkers.length > 0
                  ? 'bg-brand border-brand text-white'
                  : 'bg-surface-nav border-surface-border text-slate-400 hover:text-white',
              )}
            >
              Include all markers in sector
            </button>
          </div>

          <div className='rounded-xl overflow-hidden border border-surface-border relative'>
            <Leaflet
              markers={markers}
              outlines={outlines}
              slopes={slopes}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMouseClick={onMapMouseClick}
              onMouseMove={onMouseMove}
              height={'400px'}
              showSatelliteImage={meta.isBouldering}
              clusterMarkers={false}
              rocks={undefined}
              flyToId={null}
            >
              <ZoomLogic area={area} sector={data} />
              {leafletMode === 'POLYGON' && <PolylineMarkers coordinates={data.outline ?? []} />}
              {leafletMode === 'APPROACH' && (
                <PolylineMarkers coordinates={data.approach?.coordinates ?? []} />
              )}
              {leafletMode === 'DESCENT' && (
                <PolylineMarkers coordinates={data.descent?.coordinates ?? []} />
              )}
            </Leaflet>
          </div>

          {leafletMode === 'PARKING' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className={labelClasses}>Latitude</label>
                <input
                  className={inputClasses}
                  placeholder='Latitude'
                  value={data.parking?.latitude ?? ''}
                  onChange={onLatChanged}
                />
              </div>
              <div className='space-y-1'>
                <label className={labelClasses}>Longitude</label>
                <input
                  className={inputClasses}
                  placeholder='Longitude'
                  value={data.parking?.longitude ?? ''}
                  onChange={onLngChanged}
                />
              </div>
            </div>
          )}

          {['POLYGON', 'APPROACH', 'DESCENT'].includes(leafletMode) && (
            <div className='space-y-2'>
              <label className={labelClasses}>
                {['Outline', elevation].filter(Boolean).join(' ')}
              </label>
              <PolylineEditor
                coordinates={
                  leafletMode === 'POLYGON'
                    ? (data.outline ?? [])
                    : leafletMode === 'APPROACH'
                      ? (data.approach?.coordinates ?? [])
                      : (data.descent?.coordinates ?? [])
                }
                parking={data.parking ?? {}}
                onChange={(coordinates) => {
                  if (leafletMode === 'POLYGON')
                    setData((prev) => ({ ...prev, outline: coordinates }));
                  else if (leafletMode === 'APPROACH')
                    setData((prev) => ({ ...prev, approach: { coordinates } }));
                  else if (leafletMode === 'DESCENT')
                    setData((prev) => ({ ...prev, descent: { coordinates } }));
                }}
                upload={leafletMode !== 'POLYGON'}
              />
            </div>
          )}
        </div>

        {data.problemOrder && data.problemOrder.length > 1 && (
          <div className='bg-surface-card border border-surface-border rounded-xl shadow-sm'>
            <button
              type='button'
              onClick={() => setShowProblemOrder(!showProblemOrder)}
              className='w-full flex items-center justify-between p-4 text-xs font-bold text-white uppercase tracking-widest'
            >
              <span className='flex items-center gap-2'>
                <Route size={14} className='text-brand' /> Change order of problems in sector
              </span>
              {showProblemOrder ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {showProblemOrder && (
              <div className='p-4 pt-0 animate-in fade-in slide-in-from-top-2 duration-200'>
                <ProblemOrder
                  problemOrder={data.problemOrder}
                  onChange={(problemOrder) => setData((prev) => ({ ...prev, problemOrder }))}
                />
              </div>
            )}
          </div>
        )}

        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={() => navigate(sectorId ? `/sector/${sectorId}` : `/area/${areaId}`)}
            className='px-6 py-2.5 bg-surface-nav border border-surface-border hover:bg-surface-hover text-slate-300 rounded-lg text-xs font-black uppercase tracking-widest transition-all'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={saving || !data.name || !!data.sunFromHour !== !!data.sunToHour}
            className='flex items-center gap-2 px-8 py-2.5 bg-brand hover:bg-brand/90 disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand/20'
          >
            {saving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
            Save Sector
          </button>
        </div>
      </form>
    </div>
  );
};

export default SectorEdit;
