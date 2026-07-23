import { useState, useCallback, type ComponentProps, type UIEvent, type FormEvent, type ChangeEvent } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta';
import {
  postSector,
  postTrails,
  spaPathFromRedirectResponse,
  useAccessToken,
  useArea,
  useElevation,
  useSector,
} from '../../api';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getTrailColor } from '../../shared/slopePolylineColors';
import { useNavigate, useParams } from 'react-router-dom';
import { VisibilitySelectorField } from '../../shared/ui/VisibilitySelector';
import type { components } from '../../@types/buldreinfo/swagger';
import { ProblemOrder } from './ProblemOrder';
import { PolylineEditor } from './PolylineEditor';
import { ZoomLogic } from './ZoomLogic';
import { PolylineMarkers } from './PolylineMarkers';
import { TrailSectorSelector } from './TrailSectorSelector';
import { captureSentryException } from '../../utils/sentry';
import { hours } from '../../utils/hours';
import ExternalLink from '../../shared/ui/ExternalLinks';
import {
  Info,
  Edit,
  MapPin,
  AlertTriangle,
  Hash,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  ArrowUpFromLine,
  ArrowDownFromLine,
  Loader2,
  Crosshair,
  PenLine,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { Card, FormSwitch, MarkdownFieldLabel, NotFoundCard, SectionHeader } from '../../shared/ui';
import { sanitizeCoordInput, useCoordinateText } from '../../shared/hooks/useCoordinateText';

type Area = components['schemas']['Area'];
type Sector = components['schemas']['Sector'];
type Trail = components['schemas']['Trail'];
type TrailMarker = components['schemas']['TrailMarker'];

const dummyEvent = {} as ChangeEvent<HTMLInputElement>;

const useIds = (): { areaId: number; sectorId: number } => {
  const { sectorId, areaId } = useParams();
  if (!sectorId) throw new Error('Missing sectorId parameter');
  if (!areaId) throw new Error('Missing areaId parameter');
  return { sectorId: +sectorId, areaId: +areaId };
};

function SectorEditLoaderNotFound() {
  const meta = useMeta();
  return (
    <>
      <title>{`Not found | ${meta?.title}`}</title>
      <NotFoundCard
        className='mt-4 sm:mt-6'
        title='404'
        description='Cannot find the specified sector because it does not exist or you do not have sufficient permissions.'
      />
    </>
  );
}

export const SectorEditLoader = () => {
  const { areaId, sectorId } = useIds();
  const { data: area } = useArea(areaId);
  const { data: sector, error } = useSector(sectorId);

  if (error) {
    return <SectorEditLoaderNotFound />;
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
      problemOrder: [],
    } satisfies Sector);

  return <SectorEdit key={value.id} sector={value} area={area} />;
};

type Props = {
  sector: Sector;
  area: Area;
};

type OnChangeParams = { value: string | number | undefined };

const emptyTrail = (isDescent: boolean, sectorId: number | undefined): Trail => ({
  title: isDescent ? 'Descent' : 'Approach',
  description: '',
  isDescent,
  path: [],
  markers: [],
  media: [],
  sectors: sectorId != null ? [{ sectorId }] : [],
});

export const SectorEdit = ({ sector, area }: Props) => {
  const navigate = useNavigate();
  const meta = useMeta();
  const accessToken = useAccessToken();
  const { areaId, sectorId } = useIds();
  const [leafletMode, setLeafletMode] = useState('PARKING');
  const { setLocation } = useElevation();

  const [data, setData] = useState<Sector>(sector);

  /** Local trail state — saved as part of the sector save. */
  const [trails, setTrails] = useState<Trail[]>(() => {
    const existing = sector.trails ?? [];
    return existing.map((t) => ({
      ...t,
      sectors: t.sectors?.length ? t.sectors : [{ sectorId: sector.id }],
    }));
  });

  /** Which trail index we are currently editing path for on the map (null = not editing a trail path). */
  const [editingTrailPathIndex, setEditingTrailPathIndex] = useState<number | null>(null);

  /** `null` = do not show problem markers; array (possibly empty) = include-all mode is on. */
  const [sectorMarkers, setSectorMarkers] = useState<ComponentProps<typeof Leaflet>['markers'] | null>(null);

  const [saving, setSaving] = useState(false);
  const [trailErrors, setTrailErrors] = useState<string[]>([]);

  /*
   * Lat/lng raw-text adapter — see {@link useCoordinateText} for the why. The parsed numbers still live in
   * `data.parking.{latitude,longitude}` (so map markers / save payload are unchanged); we only adopt the raw
   * text for what the inputs render, plus the consumer-side guard logic that survives mid-typed decimals like
   * `"60."`. Pass the stored values **as-is**: `data.parking?.latitude` is `number | undefined` here (the
   * existing handlers below do collapse blank input to `0`, but that's a pre-existing UX quirk for this form
   * — preserving it keeps this change scoped to the dropped-decimals bug).
   */
  const lat = useCoordinateText(data.parking?.latitude);
  const lng = useCoordinateText(data.parking?.longitude);

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

  const onOrientationManualIdChanged = useCallback(
    (_: unknown, { value }: OnChangeParams) => {
      const compassDirectionId = +(value ?? 0);
      const orientationManual =
        compassDirectionId === 0 ? undefined : meta.compassDirections.find((cd) => cd.id === compassDirectionId);
      setData((prevState) => ({ ...prevState, orientationManual }));
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

  const validateTrails = (): string[] => {
    const errors: string[] = [];
    const active = trails.filter((t) => !t.delete);
    active.forEach((t, i) => {
      if (!t.title?.trim()) {
        errors.push(`Trail #${i + 1}: title is required`);
      }
      if (!t.path || t.path.length < 2) {
        errors.push(`Trail #${i + 1} ("${t.title || 'untitled'}"): path must have at least 2 points`);
      }
      (t.markers ?? []).forEach((m, mi) => {
        if (!m.label?.trim()) {
          errors.push(`Trail #${i + 1} ("${t.title || 'untitled'}"): marker #${mi + 1} needs a label`);
        }
        if (!m.coordinates?.latitude || !m.coordinates?.longitude) {
          errors.push(`Trail #${i + 1} ("${t.title || 'untitled'}"): marker #${mi + 1} needs lat/lng`);
        }
      });
    });
    return errors;
  };

  const save = (event: UIEvent | FormEvent) => {
    event.preventDefault();
    const trailErrors = validateTrails();
    setTrailErrors(trailErrors);
    if (trailErrors.length > 0) return;

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
        data.orientationManual ?? ({} as components['schemas']['CompassDirection']),
        [], // trails are saved separately via postTrail
        data.externalLinks ?? [],
        [],
        data.problemOrder,
      )
        .then(async (res) => {
          const nextSectorId = res.idSector && res.idSector > 0 ? res.idSector : sectorId;

          // Save all trails in a single POST (including deleted trails so the server knows to delete them)
          if (trails.length > 0) {
            await postTrails(
              accessToken,
              trails.map((t) => ({
                ...t,
                // Preserve the user's sector selection; if none set, default to the current sector
                sectors: t.sectors?.length ? t.sectors : [{ sectorId: nextSectorId }],
              })),
            );
          }

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
          captureSentryException(error);
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
    } else if (leafletMode.startsWith('TRAIL_PATH_')) {
      const activeIndex = parseInt(leafletMode.replace('TRAIL_PATH_', ''), 10);
      if (!isNaN(activeIndex)) {
        if (trailMapMode === 'marker') {
          // Add a marker at the clicked location
          setTrails((prev) => {
            // Map from activeTrails index to full trails array index
            const active = prev.filter((t) => !t.delete);
            const trail = active[activeIndex];
            if (!trail) return prev;
            const fullIndex = prev.indexOf(trail);
            const next = [...prev];
            const updated = { ...trail };
            const markers = [...(updated.markers ?? [])];
            markers.push({
              label: '',
              coordinates: { latitude: event.latlng.lat, longitude: event.latlng.lng },
            });
            updated.markers = markers;
            next[fullIndex] = updated;
            return next;
          });
        } else {
          // Add a path point
          setTrails((prev) => {
            // Map from activeTrails index to full trails array index
            const active = prev.filter((t) => !t.delete);
            const trail = active[activeIndex];
            if (!trail) return prev;
            const fullIndex = prev.indexOf(trail);
            const next = [...prev];
            const updated = { ...trail };
            updated.path = [...(updated.path ?? []), { latitude: event.latlng.lat, longitude: event.latlng.lng }];
            next[fullIndex] = updated;
            return next;
          });
        }
      }
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

  /*
   * Lat / lng input handlers. Three steps per keystroke:
   *   1. `sanitizeCoordInput(raw)` — strip non-numeric chars, convert `,` → `.`, dedupe leading `-` and `.`
   *      so the field can only ever hold a finite signed decimal. Multi-coord polyline editors handle their
   *      own commas/semicolons separately and do **not** route through this sanitizer (see PolylineEditor).
   *   2. `lat.setText` / `lng.setText` keeps the sanitized text as the source of truth for the input (so
   *      trailing decimals like `"60."` survive across re-renders — see {@link useCoordinateText}).
   *   3. `setData(...)` parses the same sanitized string to a number and persists into `data.parking` so map
   *      markers / save payload stay in their existing numeric shape.
   * Empty / unparseable input collapses to `0` for the parsed write (preserves the existing reducer-shaped
   * default), but the visible `"0"` round-trip is gated by the hook's sync effect — clearing the field shows
   * `"0"` only because that's what the original behaviour did too (see initialisation comment above).
   */
  const onLatChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeCoordInput(e.target.value);
    lat.setText(sanitized);
    const parsed = parseFloat(sanitized);
    const next = isNaN(parsed) ? 0 : parsed;
    setData((prevState) => ({
      ...prevState,
      parking: { longitude: 0, ...prevState.parking, latitude: next },
    }));
  };

  const onLngChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeCoordInput(e.target.value);
    lng.setText(sanitized);
    const parsed = parseFloat(sanitized);
    const next = isNaN(parsed) ? 0 : parsed;
    setData((prevState) => ({
      ...prevState,
      parking: { latitude: 0, ...prevState.parking, longitude: next },
    }));
  };

  const outlines: ComponentProps<typeof Leaflet>['outlines'] = [];
  const trailPolylines: ComponentProps<typeof Leaflet>['trails'] = [];
  let otherDescentCount = 0;
  let otherAscentCount = 0;
  (area.sectors ?? [])
    .filter((s) => s.id !== data.id)
    .forEach((s) => {
      if (s.outline?.length) {
        outlines.push({
          outline: s.outline,
          background: true,
          label: s.name,
        });
      }
      (s.trails ?? []).forEach((t) => {
        const index = t.isDescent ? otherDescentCount++ : otherAscentCount++;
        trailPolylines.push({
          trail: t,
          backgroundColor: getTrailColor(!!t.isDescent, index),
          background: true,
        });
      });
    });

  if (data.outline?.length) {
    outlines.push({ outline: data.outline, background: false });
  }
  let localDescentCount = 0;
  let localAscentCount = 0;
  trails.forEach((t) => {
    if (t.delete) return;
    // Skip trails with no path points — Leaflet Polyline requires latlngs
    if (!t.path || t.path.length < 2) return;
    const index = t.isDescent ? localDescentCount++ : localAscentCount++;
    trailPolylines.push({
      trail: t,
      backgroundColor: getTrailColor(!!t.isDescent, index),
      background: false,
    });
  });

  const markers: ComponentProps<typeof Leaflet>['markers'] = [];
  if (data.parking) {
    markers.push({
      coordinates: data.parking,
      isParking: true,
      label: data.name || undefined,
      url: data.id && data.id > 0 ? '/sector/' + data.id : undefined,
    });
  }
  if (sectorMarkers != null) {
    markers.push(...sectorMarkers);
  }

  const inputClasses =
    'w-full bg-surface-nav border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white transition-colors focus:border-brand focus:outline-none';
  const labelClasses = 'ml-1 mb-1 block text-[12px] font-medium text-slate-400 sm:text-[13px]';

  /*
   * **Add vs Edit mode** — `data.id <= 0` is the loader's convention for "no record exists yet"
   * (the loader synthesises a placeholder with `id: -1` for new sectors). We branch on that here
   * so the page title, HTML `<title>`, header icon, and subtitle all agree about which mode the
   * user is in. Subtitle ("contact Jostein to move or split sector") is **hidden** in Add mode —
   * the sector doesn't exist yet, so there's nothing to move or split.
   */
  const isNew = !data.id || data.id <= 0;
  const headerTitle = isNew ? 'Add Sector' : 'Edit Sector';

  // ── Trail helpers ──

  const addTrail = useCallback(
    (isDescent: boolean) => {
      setTrails((prev) => {
        // The new trail's index in the active (non-deleted) list determines the tab index
        const activeCount = prev.filter((t) => !t.delete).length;
        // Schedule auto-selection of the new trail tab after state update
        setTimeout(() => {
          setLeafletMode(`TRAIL_PATH_${activeCount}`);
          setEditingTrailPathIndex(activeCount);
        }, 0);
        return [...prev, emptyTrail(isDescent, sector.id)];
      });
    },
    [sector.id],
  );

  const removeTrail = useCallback(
    (index: number) => {
      setTrails((prev) => {
        const next = [...prev];
        const trail = { ...next[index] };
        if (trail.id && trail.id > 0) {
          trail.delete = true;
          next[index] = trail;
        } else {
          next.splice(index, 1);
        }
        return next;
      });
      // If we're editing the removed trail, switch to Parking tab
      if (editingTrailPathIndex === index) {
        setEditingTrailPathIndex(null);
        setLeafletMode('PARKING');
      } else if (editingTrailPathIndex != null && editingTrailPathIndex > index) {
        // Shift the editing index down since the array shrunk
        setEditingTrailPathIndex(editingTrailPathIndex - 1);
      }
    },
    [editingTrailPathIndex],
  );

  const updateTrail = useCallback((index: number, patch: Partial<Trail>) => {
    setTrails((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  /** Raw text for marker lat/lng inputs (preserves mid-typed decimals like "60.") */
  const [markerRawText, setMarkerRawText] = useState<Record<string, string>>({});

  const updateMarker = useCallback((trailIndex: number, markerIndex: number, patch: Partial<TrailMarker>) => {
    setTrails((prev) => {
      const next = [...prev];
      const trail = { ...next[trailIndex] };
      const markers = [...(trail.markers ?? [])];
      markers[markerIndex] = { ...markers[markerIndex], ...patch };
      trail.markers = markers;
      next[trailIndex] = trail;
      return next;
    });
  }, []);

  const removeMarker = useCallback((trailIndex: number, markerIndex: number) => {
    setTrails((prev) => {
      const next = [...prev];
      const trail = { ...next[trailIndex] };
      trail.markers = (trail.markers ?? []).filter((_, i) => i !== markerIndex);
      next[trailIndex] = trail;
      return next;
    });
  }, []);

  const activeTrails = trails.filter((t) => !t.delete);

  /** Trail map mode: 'path' = add path points, 'marker' = add markers on click */
  const [trailMapMode, setTrailMapMode] = useState<'path' | 'marker'>('path');

  /** Whether the "+" add-trail dropdown menu is open */
  const [showAddTrailMenu, setShowAddTrailMenu] = useState(false);

  return (
    <div className='w-full min-w-0 pb-20'>
      <title>{`${isNew ? 'Add sector' : `Edit ${data.name}`} | ${meta?.title}`}</title>

      <form onSubmit={save} className='mt-6 space-y-6'>
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
                  if you want to move or split sector.
                </>
              )
            }
          />
          <div className='space-y-4 p-3 sm:p-5'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-2 md:col-span-2 lg:col-span-1'>
                <label className={labelClasses}>Sector name</label>
                <input
                  className={cn(inputClasses, !data.name && 'border-red-500/50')}
                  value={data.name ?? ''}
                  onChange={(e) => onNameChanged(dummyEvent, { value: e.target.value })}
                />
                {!data.name && <p className='ml-1 text-[11px] font-bold text-red-500'>Sector name required</p>}
              </div>

              {meta.isClimbing && (
                <div className='space-y-2'>
                  <label className={labelClasses}>Orientation</label>
                  <select
                    className={inputClasses}
                    value={data.orientationManual?.id || 0}
                    onChange={(e) => onOrientationManualIdChanged(dummyEvent, { value: e.target.value })}
                  >
                    <option value={0}>
                      {data.orientationCalculated
                        ? `${data.orientationCalculated.direction} (calculated)`
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
                <FormSwitch
                  checked={!!data.trash}
                  onChange={() => setData((p) => ({ ...p, trash: !p.trash }))}
                  disabled={!data.id || data.id <= 0}
                  variant='danger'
                  aria-label='Move to trash'
                />
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
              <MarkdownFieldLabel className={labelClasses}>Description</MarkdownFieldLabel>
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
                <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[11px] font-black tracking-tighter text-red-300/90 uppercase'>
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
                <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[11px] font-black tracking-tighter text-orange-300/90 uppercase'>
                  Restrictions
                </span>
              </div>
            </div>

            {/* ── External links (inside basic info) ── */}
            <div>
              <ExternalLink
                externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
                onExternalLinksUpdated={onExternalLinksUpdated}
                hideLabel
                mobileFlat
              />
            </div>
          </div>
        </Card>

        {/* ── Map ── */}
        <Card>
          <SectionHeader title='Map' icon={MapPin} />
          {/* Include all markers toggle */}
          <div className='-mt-4 mb-2 flex items-center gap-2 px-3 sm:px-5'>
            <FormSwitch
              checked={sectorMarkers !== null}
              onChange={() => {
                if (sectorMarkers === null) {
                  setSectorMarkers(
                    data.problems
                      ?.filter((p): p is Required<Pick<typeof p, 'coordinates' | 'name'>> => !!p.coordinates)
                      .map((p) => ({ coordinates: p.coordinates, label: p.name })) ?? [],
                  );
                } else {
                  setSectorMarkers(null);
                }
              }}
              variant='brand'
              aria-label='Include all markers in sector'
            />
            <span className='text-[12px] font-medium text-slate-300 sm:text-[13px]'>Include all markers in sector</span>
          </div>
          {/* Tab bar: Parking | Outline | Trail tabs | + Add */}
          <div
            className='border-surface-border bg-surface-card flex flex-wrap items-center gap-1 border-b px-0 py-1.5 sm:px-0 sm:py-2.5'
            role='tablist'
            aria-label='Map tab'
          >
            {/* Parking tab — split button */}
            <div
              className={cn(
                'inline-flex items-center overflow-hidden rounded-md',
                leafletMode === 'PARKING'
                  ? 'border-brand bg-brand/20 border shadow-sm'
                  : 'border-surface-border bg-surface-raised border',
              )}
            >
              <button
                type='button'
                role='tab'
                aria-selected={leafletMode === 'PARKING'}
                onClick={() => {
                  setLeafletMode('PARKING');
                  setEditingTrailPathIndex(null);
                }}
                className={cn(
                  designContract.typography.uiCompact,
                  'px-2.5 py-1 text-[11px] tracking-wide transition-colors sm:px-4 sm:py-1.5 sm:text-[12px]',
                  leafletMode === 'PARKING'
                    ? 'type-on-accent font-semibold'
                    : 'light:text-slate-600 light:hover:type-on-accent hover:type-on-accent text-slate-300',
                )}
              >
                Parking
              </button>
              {data.parking?.latitude && data.parking?.longitude && (
                <>
                  <div className='bg-surface-border/50 w-px self-stretch' />
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setData((prev) => ({ ...prev, parking: undefined }));
                    }}
                    className='light:text-red-600 light:hover:text-red-800 inline-flex items-center justify-center px-1.5 py-1 text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 sm:px-2 sm:py-1.5'
                    title='Clear parking'
                  >
                    <RotateCcw size={10} />
                  </button>
                </>
              )}
            </div>
            {/* Outline tab — split button */}
            <div
              className={cn(
                'inline-flex items-center overflow-hidden rounded-md',
                leafletMode === 'POLYGON'
                  ? 'border-brand bg-brand/20 border shadow-sm'
                  : 'border-surface-border bg-surface-raised border',
              )}
            >
              <button
                type='button'
                role='tab'
                aria-selected={leafletMode === 'POLYGON'}
                onClick={() => {
                  setLeafletMode('POLYGON');
                  setEditingTrailPathIndex(null);
                }}
                className={cn(
                  designContract.typography.uiCompact,
                  'px-2.5 py-1 text-[11px] tracking-wide transition-colors sm:px-4 sm:py-1.5 sm:text-[12px]',
                  leafletMode === 'POLYGON'
                    ? 'type-on-accent font-semibold'
                    : 'light:text-slate-600 light:hover:type-on-accent hover:type-on-accent text-slate-300',
                )}
              >
                Outline
              </button>
              {(data.outline?.length ?? 0) > 0 && (
                <>
                  <div className='bg-surface-border/50 w-px self-stretch' />
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setData((prev) => ({ ...prev, outline: undefined }));
                    }}
                    className='light:text-red-600 light:hover:text-red-800 inline-flex items-center justify-center px-1.5 py-1 text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 sm:px-2 sm:py-1.5'
                    title='Clear outline'
                  >
                    <RotateCcw size={10} />
                  </button>
                </>
              )}
            </div>
            {/* Trail tabs — split buttons */}
            {activeTrails.map((trail, i) => (
              <div
                key={i}
                className={cn(
                  'inline-flex items-center overflow-hidden rounded-md',
                  leafletMode === `TRAIL_PATH_${i}`
                    ? 'border-brand bg-brand/20 border shadow-sm'
                    : 'border-surface-border bg-surface-raised border',
                )}
              >
                <button
                  type='button'
                  role='tab'
                  aria-selected={leafletMode === `TRAIL_PATH_${i}`}
                  onClick={() => {
                    setLeafletMode(`TRAIL_PATH_${i}`);
                    setEditingTrailPathIndex(i);
                  }}
                  className={cn(
                    designContract.typography.uiCompact,
                    'inline-flex items-center gap-1 px-2.5 py-1 text-[11px] tracking-wide transition-colors sm:px-4 sm:py-1.5 sm:text-[12px]',
                    leafletMode === `TRAIL_PATH_${i}`
                      ? 'type-on-accent font-semibold'
                      : 'light:text-slate-600 light:hover:type-on-accent hover:type-on-accent text-slate-300',
                  )}
                >
                  {trail.isDescent ? (
                    <ArrowDownFromLine size={10} className='text-purple-600' />
                  ) : (
                    <ArrowUpFromLine size={10} className='text-lime-600' />
                  )}
                  {trail.title || (trail.isDescent ? 'Descent' : 'Approach')}
                </button>
                <div className='bg-surface-border/50 w-px self-stretch' />
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrail(trails.indexOf(trail));
                  }}
                  className='light:text-red-600 light:hover:text-red-800 inline-flex items-center justify-center px-1.5 py-1 text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 sm:px-2 sm:py-1.5'
                  title='Remove trail'
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            {/* Add trail dropdown */}
            <div className='relative ml-1'>
              <button
                type='button'
                onClick={() => setShowAddTrailMenu((p) => !p)}
                className='hover:bg-surface-hover inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-slate-400 transition-colors hover:text-slate-200'
                title='Add trail'
              >
                <Plus size={14} /> Add
              </button>
              {showAddTrailMenu && (
                <>
                  <div className='fixed inset-0 z-10' onClick={() => setShowAddTrailMenu(false)} />
                  <div className='border-surface-border bg-surface-nav absolute top-full left-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border shadow-xl'>
                    <button
                      type='button'
                      onClick={() => {
                        addTrail(false);
                        setShowAddTrailMenu(false);
                      }}
                      className='hover:bg-surface-hover flex w-full items-center gap-2 px-3 py-2 text-[12px] font-medium text-slate-200 transition-colors'
                    >
                      <ArrowUpFromLine size={12} className='text-lime-500' /> Approach
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        addTrail(true);
                        setShowAddTrailMenu(false);
                      }}
                      className='hover:bg-surface-hover flex w-full items-center gap-2 px-3 py-2 text-[12px] font-medium text-slate-200 transition-colors'
                    >
                      <ArrowDownFromLine size={12} className='text-purple-500' /> Descent
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Map */}
          <div className='relative z-0 h-[35vh] min-h-[220px] w-full overflow-hidden sm:h-[50vh]'>
            <Leaflet
              markers={markers}
              outlines={outlines}
              trails={trailPolylines}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMouseClick={onMapMouseClick}
              onMouseMove={onMouseMove}
              height='100%'
              showSatelliteImage={meta.isBouldering}
              clusterMarkers={false}
              rocks={undefined}
              flyToId={null}
            >
              <ZoomLogic area={area} sector={data} />
              {leafletMode === 'POLYGON' && <PolylineMarkers coordinates={data.outline ?? []} />}
              {leafletMode.startsWith('TRAIL_PATH_') && editingTrailPathIndex != null && (
                <PolylineMarkers coordinates={activeTrails[editingTrailPathIndex]?.path ?? []} />
              )}
            </Leaflet>
          </div>

          {/* Editor below map — depends on selected tab */}
          <div className='px-0 pb-3 sm:px-0 sm:pb-5'>
            {leafletMode === 'PARKING' && (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <label className={labelClasses}>Latitude</label>
                  <input
                    className={inputClasses}
                    inputMode='decimal'
                    placeholder='e.g. 59.123'
                    value={lat.text}
                    onChange={onLatChanged}
                  />
                </div>
                <div className='space-y-1'>
                  <label className={labelClasses}>Longitude</label>
                  <input
                    className={inputClasses}
                    inputMode='decimal'
                    placeholder='e.g. 10.456'
                    value={lng.text}
                    onChange={onLngChanged}
                  />
                </div>
              </div>
            )}

            {leafletMode === 'POLYGON' && (
              <div className='space-y-2'>
                <PolylineEditor
                  coordinates={data.outline ?? []}
                  parking={data.parking ?? {}}
                  onChange={(coordinates) => {
                    setData((prev) => ({ ...prev, outline: coordinates }));
                  }}
                  upload={false}
                  slopeType={undefined}
                />
              </div>
            )}

            {leafletMode.startsWith('TRAIL_PATH_') &&
              editingTrailPathIndex != null &&
              activeTrails[editingTrailPathIndex] && (
                <div className='space-y-4 pt-2'>
                  {/* Title */}
                  <div className='space-y-1'>
                    <label className={labelClasses}>Title *</label>
                    <input
                      className={cn(
                        'type-on-accent w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none',
                        !activeTrails[editingTrailPathIndex].title?.trim()
                          ? 'bg-surface-nav border-red-500/60 focus:border-red-400'
                          : 'border-surface-border bg-surface-nav focus:border-brand',
                      )}
                      placeholder={activeTrails[editingTrailPathIndex].isDescent ? 'Descent' : 'Approach'}
                      value={activeTrails[editingTrailPathIndex].title ?? ''}
                      onChange={(e) =>
                        updateTrail(trails.indexOf(activeTrails[editingTrailPathIndex]), { title: e.target.value })
                      }
                    />
                  </div>

                  {/* Description */}
                  <div className='space-y-1'>
                    <MarkdownFieldLabel className={labelClasses}>Description</MarkdownFieldLabel>
                    <textarea
                      className={cn(
                        'border-surface-border bg-surface-nav type-on-accent focus:border-brand w-full resize-none rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none',
                        'min-h-20',
                      )}
                      value={activeTrails[editingTrailPathIndex].description ?? ''}
                      onChange={(e) =>
                        updateTrail(trails.indexOf(activeTrails[editingTrailPathIndex]), {
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Sector sharing */}
                  <TrailSectorSelector
                    areaSectors={area.sectors ?? []}
                    currentSectorId={data.id}
                    sectors={activeTrails[editingTrailPathIndex].sectors ?? []}
                    onChange={(sectors) =>
                      updateTrail(trails.indexOf(activeTrails[editingTrailPathIndex]), { sectors })
                    }
                  />

                  {/* Path / Marker toggle / Reverse */}
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => setTrailMapMode('path')}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors',
                        trailMapMode === 'path' ? 'bg-brand/20 type-on-accent' : 'hover:type-on-accent text-slate-400',
                      )}
                    >
                      <PenLine size={12} /> Path
                    </button>
                    <button
                      type='button'
                      onClick={() => setTrailMapMode('marker')}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors',
                        trailMapMode === 'marker'
                          ? 'bg-brand/20 type-on-accent'
                          : 'hover:type-on-accent text-slate-400',
                      )}
                    >
                      <Crosshair size={12} /> Marker
                    </button>
                    <div className='bg-surface-border/40 mx-1 w-px self-stretch' />
                    <button
                      type='button'
                      onClick={() => {
                        const trail = activeTrails[editingTrailPathIndex];
                        if (!trail) return;
                        const reversed = [...(trail.path ?? [])].reverse();
                        updateTrail(trails.indexOf(trail), { path: reversed });
                      }}
                      className='inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-amber-500/15 hover:text-amber-400'
                      title='Reverse trail direction'
                    >
                      <RotateCcw size={12} /> Reverse
                    </button>
                    <span className='text-[11px] text-slate-500'>
                      {trailMapMode === 'path' ? 'Click map to add path points' : 'Click map to place a marker'}
                    </span>
                  </div>

                  {/* Path editor */}
                  <div className='space-y-2'>
                    <PolylineEditor
                      coordinates={activeTrails[editingTrailPathIndex]?.path ?? []}
                      parking={data.parking ?? {}}
                      onChange={(coordinates) => {
                        updateTrail(trails.indexOf(activeTrails[editingTrailPathIndex]), { path: coordinates });
                      }}
                      upload={true}
                      slopeType={activeTrails[editingTrailPathIndex]?.isDescent ? 'descent' : 'approach'}
                    />
                    {(!activeTrails[editingTrailPathIndex]?.path ||
                      activeTrails[editingTrailPathIndex]?.path.length < 2) && (
                      <p className='ml-1 text-[11px] font-bold text-red-500'>Path must have at least 2 points</p>
                    )}
                  </div>

                  {/* Markers */}
                  {(activeTrails[editingTrailPathIndex]?.markers ?? []).length > 0 && (
                    <div className='space-y-2'>
                      <label className={labelClasses}>Markers</label>
                      {(activeTrails[editingTrailPathIndex]?.markers ?? []).map((marker, mi) => (
                        <div key={mi} className='flex items-center gap-2'>
                          <input
                            className={cn(
                              'type-on-accent flex-1 rounded-lg border px-2.5 py-2 text-sm transition-colors focus:outline-none',
                              !marker.label?.trim()
                                ? 'bg-surface-nav border-red-500/60 focus:border-red-400'
                                : 'border-surface-border bg-surface-nav focus:border-brand',
                            )}
                            placeholder='Label *'
                            value={marker.label ?? ''}
                            onChange={(e) =>
                              updateMarker(trails.indexOf(activeTrails[editingTrailPathIndex]), mi, {
                                label: e.target.value,
                              })
                            }
                          />
                          <input
                            className={cn(
                              'type-on-accent w-28 rounded-lg border px-2.5 py-2 text-sm transition-colors focus:outline-none',
                              !marker.coordinates?.latitude
                                ? 'bg-surface-nav border-red-500/60 focus:border-red-400'
                                : 'border-surface-border bg-surface-nav focus:border-brand',
                            )}
                            inputMode='decimal'
                            placeholder='Lat *'
                            value={
                              markerRawText[`${trails.indexOf(activeTrails[editingTrailPathIndex])}-${mi}-lat`] ??
                              marker.coordinates?.latitude ??
                              ''
                            }
                            onChange={(e) => {
                              const sanitized = sanitizeCoordInput(e.target.value);
                              const key = `${trails.indexOf(activeTrails[editingTrailPathIndex])}-${mi}-lat`;
                              setMarkerRawText((prev) => ({ ...prev, [key]: sanitized }));
                              const parsed = parseFloat(sanitized);
                              updateMarker(trails.indexOf(activeTrails[editingTrailPathIndex]), mi, {
                                coordinates: {
                                  ...marker.coordinates,
                                  latitude: isNaN(parsed) ? (undefined as unknown as number) : parsed,
                                },
                              });
                            }}
                          />
                          <input
                            className={cn(
                              'type-on-accent w-28 rounded-lg border px-2.5 py-2 text-sm transition-colors focus:outline-none',
                              !marker.coordinates?.longitude
                                ? 'bg-surface-nav border-red-500/60 focus:border-red-400'
                                : 'border-surface-border bg-surface-nav focus:border-brand',
                            )}
                            inputMode='decimal'
                            placeholder='Lng *'
                            value={
                              markerRawText[`${trails.indexOf(activeTrails[editingTrailPathIndex])}-${mi}-lng`] ??
                              marker.coordinates?.longitude ??
                              ''
                            }
                            onChange={(e) => {
                              const sanitized = sanitizeCoordInput(e.target.value);
                              const key = `${trails.indexOf(activeTrails[editingTrailPathIndex])}-${mi}-lng`;
                              setMarkerRawText((prev) => ({ ...prev, [key]: sanitized }));
                              const parsed = parseFloat(sanitized);
                              updateMarker(trails.indexOf(activeTrails[editingTrailPathIndex]), mi, {
                                coordinates: {
                                  ...marker.coordinates,
                                  longitude: isNaN(parsed) ? (undefined as unknown as number) : parsed,
                                },
                              });
                            }}
                          />
                          <button
                            type='button'
                            onClick={() => removeMarker(trails.indexOf(activeTrails[editingTrailPathIndex]), mi)}
                            className='shrink-0 rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300'
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </Card>

        {/* ── Problem order ── */}
        {data.problems && data.problems.length > 0 && (
          <Card>
            <SectionHeader title='Problem order' icon={Hash} />
            <div className='p-3 sm:p-5'>
              <ProblemOrder
                problemOrder={data.problemOrder}
                onChange={(problemOrder) => setData((prev) => ({ ...prev, problemOrder }))}
              />
            </div>
          </Card>
        )}

        {/* ── Trail validation errors ── */}
        {trailErrors.length > 0 && (
          <Card>
            <div className='space-y-1 p-3 sm:p-5'>
              <p className='text-[12px] font-bold text-red-400'>Fix these trail issues before saving:</p>
              {trailErrors.map((err, i) => (
                <p key={i} className='text-[12px] text-red-300'>
                  • {err}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* ── Save / Cancel ── */}
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={() => navigate(sectorId > 0 ? `/sector/${sectorId}` : `/area/${areaId}`)}
            className='form-footer-cancel'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={saving || !data.name || validateTrails().length > 0}
            className='type-label flex items-center gap-2 rounded-lg bg-emerald-400 px-8 py-2.5 text-slate-950 shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-300 disabled:opacity-50'
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
