import { useState, useCallback, type ComponentProps, type UIEvent, type FormEvent, type ChangeEvent } from 'react';
import MediaUpload from '../../shared/components/MediaUpload/MediaUpload';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta';
import { postSector, spaPathFromRedirectResponse, useAccessToken, useArea, useElevation, useSector } from '../../api';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { SLOPE_APPROACH_COLOR, SLOPE_DESCENT_COLOR } from '../../shared/slopePolylineColors';
import { useNavigate, useParams } from 'react-router-dom';
import { VisibilitySelectorField } from '../../shared/ui/VisibilitySelector';
import type { components } from '../../@types/buldreinfo/swagger';
import { ProblemOrder } from './ProblemOrder';
import { PolylineEditor } from './PolylineEditor';
import { ZoomLogic } from './ZoomLogic';
import { PolylineMarkers } from './PolylineMarkers';
import { captureException } from '@sentry/react';
import { hours } from '../../utils/hours';
import ExternalLink from '../../shared/ui/ExternalLinks';
import {
  Info,
  Edit,
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
import { designContract } from '../../design/contract';
import { Card, SectionHeader } from '../../shared/ui';

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
      <div className='bg-surface-card border-surface-border mx-auto mt-10 max-w-2xl rounded-2xl border p-12 text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500'>
          <AlertTriangle size={32} />
        </div>
        <h2 className='type-h1 mb-2'>404</h2>
        <p className='text-slate-400'>
          Cannot find the specified sector because it does not exist or you do not have sufficient permissions.
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
        compassDirectionId === 0 ? undefined : meta.compassDirections.find((cd) => cd.id === compassDirectionId);
      setData((prevState) => ({ ...prevState, wallDirectionManual }));
    },
    [meta.compassDirections],
  );

  const onLockedChanged = useCallback(
    ({ lockedAdmin, lockedSuperadmin }: Required<Pick<Sector, 'lockedAdmin' | 'lockedSuperadmin'>>) => {
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

  const onExternalLinksUpdated = useCallback((externalLinks: components['schemas']['ExternalLink'][]) => {
    setData((prevState) => ({ ...prevState, externalLinks }));
  }, []);

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
          const path = spaPathFromRedirectResponse(res);
          if (path === null) return;
          const fallback =
            res.idSector && res.idSector > 0
              ? `/sector/${res.idSector}`
              : sectorId > 0
                ? `/sector/${sectorId}`
                : res.idArea && res.idArea > 0
                  ? `/area/${res.idArea}`
                  : `/area/${areaId}`;
          navigate(path ?? fallback);
        })
        .catch((error) => {
          console.warn(error);
          captureException(error);
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
          backgroundColor: SLOPE_APPROACH_COLOR,
          background: true,
        });
      }
      if (s.descent?.coordinates?.length) {
        slopes.push({
          slope: s.descent,
          backgroundColor: SLOPE_DESCENT_COLOR,
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
      backgroundColor: SLOPE_APPROACH_COLOR,
      background: false,
    });
  }
  if (data.descent?.coordinates?.length) {
    slopes.push({
      slope: data.descent,
      backgroundColor: SLOPE_DESCENT_COLOR,
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
    'w-full bg-surface-nav border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white transition-colors focus:border-brand focus:outline-none';
  const labelClasses = 'ml-1 mb-1 block text-[11px] font-medium text-slate-400 sm:text-[12px]';

  return (
    <div className='w-full min-w-0 pb-20'>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>
      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='p-4 sm:p-5'>
          <SectionHeader
            title='Edit Sector'
            icon={Edit}
            description={
              <>
                Contact{' '}
                <a href='mailto:jostein.oygarden@gmail.com' className='hover:text-brand font-semibold text-slate-200'>
                  Jostein Øygarden
                </a>{' '}
                if you want to move or split sector.
              </>
            }
          />
          <form onSubmit={save} className='mt-3 space-y-3'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <div className='space-y-2 md:col-span-2 lg:col-span-1'>
                  <label className={labelClasses}>Sector name</label>
                  <input
                    className={cn(inputClasses, !data.name && 'border-red-500/50')}
                    value={data.name ?? ''}
                    onChange={(e) => onNameChanged(dummyEvent, { value: e.target.value })}
                  />
                  {!data.name && <p className='ml-1 text-[10px] font-bold text-red-500'>Sector name required</p>}
                </div>

                {meta.isClimbing && (
                  <div className='space-y-2'>
                    <label className={labelClasses}>Wall Direction</label>
                    <select
                      className={inputClasses}
                      value={data.wallDirectionManual?.id || 0}
                      onChange={(e) => onWallDirectionManualIdChanged(dummyEvent, { value: e.target.value })}
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
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className={labelClasses}>Sun from hour</label>
                    <select
                      className={inputClasses}
                      value={data.sunFromHour || ''}
                      onChange={(e) => onSunFromHourChanged(dummyEvent, { value: e.target.value })}
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
                      onChange={(e) => onSunToHourChanged(dummyEvent, { value: e.target.value })}
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
                    className={cn(
                      inputClasses,
                      'border-red-500/25 pl-10 focus:border-red-400/45 focus:ring-1 focus:ring-red-400/15',
                    )}
                    placeholder='Sector closed reason...'
                    value={data.accessClosed ?? ''}
                    onChange={(e) => onAccessClosedChanged(dummyEvent, { value: e.target.value })}
                  />
                  <AlertTriangle className='absolute top-1/2 left-3 -translate-y-1/2 text-red-400/90' size={14} />
                  <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[9px] font-black tracking-tighter text-red-300/90 uppercase'>
                    Sector Closed
                  </span>
                </div>
                <div className='relative'>
                  <input
                    className={cn(
                      inputClasses,
                      'border-orange-500/25 pl-10 focus:border-orange-400/45 focus:ring-1 focus:ring-orange-400/15',
                    )}
                    placeholder='Sector restrictions...'
                    value={data.accessInfo ?? ''}
                    onChange={(e) => onAccessInfoChanged(dummyEvent, { value: e.target.value })}
                  />
                  <Info className='absolute top-1/2 left-3 -translate-y-1/2 text-orange-400/90' size={14} />
                  <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[9px] font-black tracking-tighter text-orange-300/90 uppercase'>
                    Restrictions
                  </span>
                </div>
              </div>
            </div>

            <ExternalLink
              externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
              onExternalLinksUpdated={onExternalLinksUpdated}
              hideLabel
              mobileFlat
            />

            <div className='space-y-4'>
              <label className={labelClasses}>Add media</label>
              <MediaUpload onMediaChanged={onNewMediaChanged} isMultiPitch={false} />
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className={labelClasses}>Sector map</label>
                <div className='border-surface-border bg-surface-raised overflow-hidden rounded-lg border'>
                  <div
                    className='border-surface-border bg-surface-card border-b px-3 py-2.5'
                    role='group'
                    aria-label='Map drawing mode'
                  >
                    <div className='max-sm:grid max-sm:grid-cols-2 max-sm:gap-1.5 sm:flex sm:flex-wrap sm:items-stretch sm:gap-0.5'>
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
                            designContract.typography.uiCompact,
                            'inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 tracking-wide transition-colors sm:min-h-9 sm:w-auto sm:justify-start sm:rounded-lg sm:px-3',
                            leafletMode === m.id
                              ? designContract.surfaces.segmentActiveBrandBorder
                              : designContract.surfaces.segmentIdleRaised,
                          )}
                        >
                          <m.icon size={14} strokeWidth={2} className='shrink-0 opacity-80' aria-hidden />
                          <span className='min-w-0 truncate'>{m.label}</span>
                        </button>
                      ))}
                      <button
                        type='button'
                        onClick={clearDrawing}
                        className='border-surface-border hover:bg-surface-hover inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-md border border-dashed px-2 py-2 text-[11px] font-semibold tracking-wide text-orange-400 transition-colors hover:text-orange-300 max-sm:col-span-2 sm:ml-0.5 sm:w-auto sm:border-0 sm:border-l sm:border-solid sm:pl-3'
                      >
                        <RotateCcw size={14} strokeWidth={2} aria-hidden /> Reset
                      </button>
                    </div>
                  </div>

                  <div className='border-surface-border relative overflow-hidden border-b'>
                    <Leaflet
                      markers={markers}
                      outlines={outlines}
                      slopes={slopes}
                      defaultCenter={defaultCenter}
                      defaultZoom={defaultZoom}
                      onMouseClick={onMapMouseClick}
                      onMouseMove={onMouseMove}
                      height={'300px'}
                      showSatelliteImage={meta.isBouldering}
                      clusterMarkers={false}
                      rocks={undefined}
                      flyToId={null}
                    >
                      <ZoomLogic area={area} sector={data} />
                      {leafletMode === 'POLYGON' && <PolylineMarkers coordinates={data.outline ?? []} />}
                      {leafletMode === 'APPROACH' && <PolylineMarkers coordinates={data.approach?.coordinates ?? []} />}
                      {leafletMode === 'DESCENT' && <PolylineMarkers coordinates={data.descent?.coordinates ?? []} />}
                    </Leaflet>
                  </div>

                  <div className='border-surface-border flex items-center gap-3 border-t px-3 py-2.5'>
                    <button
                      type='button'
                      role='switch'
                      aria-checked={sectorMarkers != null && sectorMarkers.length > 0}
                      onClick={() => {
                        if (sectorMarkers == null || sectorMarkers.length === 0) {
                          if (sectorId) {
                            setSectorMarkers(
                              data.problems
                                ?.filter((p): p is Required<Pick<typeof p, 'coordinates' | 'name'>> => !!p.coordinates)
                                .map((p) => ({ coordinates: p.coordinates, label: p.name })) || [],
                            );
                          }
                        } else {
                          setSectorMarkers([]);
                        }
                      }}
                      className={cn(
                        'focus-visible:ring-brand-border/70 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2',
                        sectorMarkers != null && sectorMarkers.length > 0 ? 'bg-brand' : 'bg-slate-700',
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          sectorMarkers != null && sectorMarkers.length > 0 ? 'translate-x-5' : 'translate-x-0',
                        )}
                      />
                    </button>
                    <span className='text-[11px] font-medium text-slate-300 sm:text-[12px]'>
                      Include all markers in sector
                    </span>
                  </div>
                </div>
              </div>

              {leafletMode === 'PARKING' && (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-1'>
                    <label className={labelClasses}>Latitude</label>
                    <input
                      className={inputClasses}
                      inputMode='decimal'
                      placeholder='e.g. 59.123'
                      value={data.parking?.latitude ?? ''}
                      onChange={onLatChanged}
                    />
                  </div>
                  <div className='space-y-1'>
                    <label className={labelClasses}>Longitude</label>
                    <input
                      className={inputClasses}
                      inputMode='decimal'
                      placeholder='e.g. 10.456'
                      value={data.parking?.longitude ?? ''}
                      onChange={onLngChanged}
                    />
                  </div>
                </div>
              )}

              {['POLYGON', 'APPROACH', 'DESCENT'].includes(leafletMode) && (
                <div className='space-y-2'>
                  <label className={labelClasses}>{['Outline', elevation].filter(Boolean).join(' ')}</label>
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
                      if (leafletMode === 'POLYGON') setData((prev) => ({ ...prev, outline: coordinates }));
                      else if (leafletMode === 'APPROACH') setData((prev) => ({ ...prev, approach: { coordinates } }));
                      else if (leafletMode === 'DESCENT') setData((prev) => ({ ...prev, descent: { coordinates } }));
                    }}
                    upload={leafletMode !== 'POLYGON'}
                  />
                </div>
              )}
            </div>

            {data.problemOrder && data.problemOrder.length > 1 && (
              <div>
                <button
                  type='button'
                  onClick={() => setShowProblemOrder(!showProblemOrder)}
                  className='bg-surface-card type-label flex w-full items-center justify-between rounded-lg p-3 sm:p-4'
                >
                  <span className='flex items-center gap-2'>
                    <Route size={14} className='text-brand' /> Change order of problems in sector
                  </span>
                  {showProblemOrder ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {showProblemOrder && (
                  <div className='animate-in fade-in slide-in-from-top-2 space-y-3 p-3 pt-0 duration-200 sm:p-4 sm:pt-0'>
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
                className='bg-surface-nav border-surface-border hover:bg-surface-hover type-label rounded-lg border px-6 py-2.5 opacity-85 transition-all hover:opacity-100'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={saving || !data.name || !!data.sunFromHour !== !!data.sunToHour}
                className='type-label flex items-center gap-2 rounded-lg bg-emerald-400 px-8 py-2.5 text-slate-950 shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-300 disabled:opacity-50'
              >
                {saving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
                Save Sector
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default SectorEdit;
