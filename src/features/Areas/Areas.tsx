import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { Loading } from '../../shared/ui/StatusWidgets';
import { profileRowMiddleDotClass } from '../../shared/components/Profile/ProfileRowTextSep';
import { LockSymbol } from '../../shared/ui/Indicators';
import { useAreas, useArea } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import { Map as MapIcon, Plus, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { Card, SectionHeader } from '../../shared/ui';
import { NoDogsAllowed } from '../../shared/components/Widgets/NoDogsAllowed';
import { SunOnWall } from '../../shared/components/Widgets/ClimbingWidgets';
import { Markdown } from '../../shared/components/Markdown/Markdown';
import type { MarkerDef } from '../../shared/components/Leaflet/markers';

/** Full-width horizontal grade distribution bars for area panel, using grade colours from the API. */
const AreaPanelGradeDistribution = ({
  data,
  className,
}: {
  data: { grade?: string; color?: string; num?: number }[];
  className?: string;
}) => {
  const maxValue = Math.max(1, ...data.map((d) => d.num ?? 0));
  const [barMaxHeight, setBarMaxHeight] = useState(125);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setBarMaxHeight(mq.matches ? 125 : 80);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return (
    <div className={cn('flex w-full items-end gap-[2px]', className)}>
      {data.map((g, i) => {
        const total = g.num ?? 0;
        const pct = maxValue > 0 ? total / maxValue : 0;
        const color = g.color
          ? (() => {
              const hex = g.color.replace('#', '');
              if (hex.length !== 6 && hex.length !== 3) return undefined;
              const full =
                hex.length === 3
                  ? hex
                      .split('')
                      .map((c) => c + c)
                      .join('')
                  : hex;
              const r = parseInt(full.slice(0, 2), 16);
              const g2 = parseInt(full.slice(2, 4), 16);
              const b = parseInt(full.slice(4, 6), 16);
              if (isNaN(r) || isNaN(g2) || isNaN(b)) return undefined;
              return `rgba(${r}, ${g2}, ${b}, 0.55)`;
            })()
          : undefined;
        const barHeight = Math.max(Math.round(pct * barMaxHeight), 2);
        return (
          <div key={i} className='flex min-w-0 flex-1 flex-col items-center gap-0.5'>
            {total > 0 && (
              <span className='text-[10px] leading-none font-semibold text-slate-300 opacity-80'>{total}</span>
            )}
            <div
              className='w-full rounded-sm'
              style={{
                height: barHeight,
                backgroundColor: color ?? 'rgba(255, 255, 255, 0.15)',
                opacity: total > 0 ? 0.85 : 0.15,
              }}
              title={`${g.grade}: ${total} route${total !== 1 ? 's' : ''}`}
            />
            <span className='text-center text-[9px] leading-none text-slate-400 opacity-55'>{g.grade}</span>
          </div>
        );
      })}
    </div>
  );
};

const AreaPanel = ({
  area,
  onClose,
}: {
  area: NonNullable<ReturnType<typeof useArea>['data']>;
  onClose: () => void;
}) => {
  const meta = useMeta();
  // Count problems and sectors
  const sectorCount = area.sectors?.length ?? 0;
  const problemCount = (area.sectors ?? []).reduce((acc, s) => acc + (s.problems?.length ?? 0), 0);
  const tickSum = (area.sectors ?? []).reduce(
    (acc, s) => acc + (s.problems ?? []).reduce((m, p) => m + (p.numTicks ?? 0), 0),
    0,
  );

  // Find min/max lengthMeter across all problems
  const lengthRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const s of area.sectors ?? []) {
      for (const p of s.problems ?? []) {
        const l = p.lengthMeter ?? 0;
        if (l > 0) {
          if (l < min) min = l;
          if (l > max) max = l;
        }
      }
    }
    return max > 0 ? { min: min === Infinity ? 0 : min, max } : null;
  }, [area.sectors]);

  // Count problems split by single-pitch vs multi-pitch, then by sub-type
  const problemBreakdown = useMemo(() => {
    const singlePitch = new Map<string, number>();
    const multiPitch = new Map<string, number>();
    let singleTotal = 0;
    let multiTotal = 0;

    for (const s of area.sectors ?? []) {
      for (const p of s.problems ?? []) {
        const subType = p.t?.subType || p.t?.type || 'Unknown';
        const isMulti = (p.numPitches ?? 0) > 1;
        if (isMulti) {
          multiPitch.set(subType, (multiPitch.get(subType) ?? 0) + 1);
          multiTotal++;
        } else {
          singlePitch.set(subType, (singlePitch.get(subType) ?? 0) + 1);
          singleTotal++;
        }
      }
    }

    const formatGroup = (map: Map<string, number>, total: number) => {
      if (total === 0) return null;
      const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
      const details = entries.map(([type, count]) => `${count} ${type}`).join(', ');
      return { total, details };
    };

    return {
      single: formatGroup(singlePitch, singleTotal),
      multi: formatGroup(multiPitch, multiTotal),
    };
  }, [area.sectors]);

  // Aggregate grade counts from all sectors
  const gradeCounts = useMemo(() => {
    const map = new Map<string, { grade: string; color?: string; num: number }>();
    for (const s of area.sectors ?? []) {
      for (const gc of s.gradeCounts ?? []) {
        const key = gc.grade ?? '';
        if (!key) continue;
        const existing = map.get(key);
        if (existing) {
          existing.num += gc.num ?? 0;
        } else {
          map.set(key, { grade: key, color: gc.color, num: gc.num ?? 0 });
        }
      }
    }
    return [...map.values()];
  }, [area.sectors]);

  const hasAccessRestrictions = area.accessClosed || area.noDogsAllowed || area.accessInfo;

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {/* Header */}
      <div className='border-surface-border flex items-center justify-between gap-2 border-b px-3 py-2'>
        <div className='flex min-w-0 items-center gap-1.5'>
          <h2 className='truncate text-sm font-bold text-slate-100'>
            <Link to={`/area/${area.id}`} className='hover:text-brand transition-colors'>
              {area.name}
            </Link>
          </h2>
          <LockSymbol lockedAdmin={!!area.lockedAdmin} lockedSuperadmin={!!area.lockedSuperadmin} />
          <a
            href={`/area/${area.id}`}
            target='_blank'
            rel='noopener noreferrer'
            className='hover:bg-surface-hover inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:text-slate-200'
            aria-label='Open area page in new tab'
            title='Open area page in new tab'
          >
            <ExternalLink size={14} />
          </a>
          {area.sunFromHour != null && area.sunToHour != null && (
            <SunOnWall sunFromHour={area.sunFromHour} sunToHour={area.sunToHour} variant='inline' />
          )}
        </div>
        <button
          type='button'
          onClick={onClose}
          className='hover:bg-surface-hover inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:text-slate-200'
          aria-label='Close area panel'
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className='flex-1 space-y-3 overflow-y-auto p-3'>
        {/* Stats row */}
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-400'>
          <span>
            {sectorCount} sector{sectorCount !== 1 ? 's' : ''}
          </span>
          {meta.isBouldering ? (
            <>
              <span className='text-slate-600'>·</span>
              <span>
                {problemCount} problem{problemCount !== 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <>
              {problemBreakdown.single && (
                <>
                  <span className='text-slate-600'>·</span>
                  <span>
                    {problemBreakdown.single.total} Single-pitch ({problemBreakdown.single.details})
                  </span>
                </>
              )}
              {problemBreakdown.multi && (
                <>
                  <span className='text-slate-600'>·</span>
                  <span>
                    {problemBreakdown.multi.total} Multi-pitch ({problemBreakdown.multi.details})
                  </span>
                </>
              )}
            </>
          )}
          {lengthRange && (
            <>
              <span className='text-slate-600'>·</span>
              <span>
                {lengthRange.min === lengthRange.max ? `${lengthRange.min}m` : `${lengthRange.min}-${lengthRange.max}m`}
              </span>
            </>
          )}
          {tickSum > 0 && (
            <>
              <span className='text-slate-600'>·</span>
              <span>
                {tickSum} tick{tickSum !== 1 ? 's' : ''}
              </span>
            </>
          )}
          {area.pageViews && (
            <>
              <span className='text-slate-600'>·</span>
              <span>{area.pageViews} page views</span>
            </>
          )}
        </div>

        {/* Grade distribution */}
        {gradeCounts.length > 0 && <AreaPanelGradeDistribution data={gradeCounts} />}

        {/* Access restrictions */}
        {hasAccessRestrictions && (
          <div className='light:bg-red-100/60 space-y-1.5 rounded-lg bg-red-950/20 px-2.5 py-2'>
            {area.accessClosed && (
              <p className='light:text-red-700 flex items-start gap-1.5 text-[12px] leading-snug text-red-400'>
                <AlertTriangle size={12} className='mt-0.5 shrink-0' />
                <span>{area.accessClosed}</span>
              </p>
            )}
            {area.noDogsAllowed && <NoDogsAllowed />}
            {area.accessInfo && (
              <p className='light:text-amber-700 text-[12px] leading-snug text-amber-400/80'>{area.accessInfo}</p>
            )}
          </div>
        )}

        {/* Comment */}
        {(area.comment ?? '').trim().length > 0 && (
          <div className='text-[13px] leading-relaxed text-slate-300'>
            <Markdown content={area.comment ?? ''} />
          </div>
        )}
      </div>
    </div>
  );
};

const Areas = () => {
  const { data } = useAreas();
  const meta = useMeta();
  const [showForDevelopers, setShowForDevelopers] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [flyToId, setFlyToId] = useState<number | null>(null);
  const areas = data ?? [];

  // Always call useArea hook (unconditionally) to avoid "Rendered more hooks" error
  const { data: selectedArea, isLoading: selectedAreaLoading } = useArea(selectedAreaId ?? 0);

  const handleMarkerClick = useCallback((marker: MarkerDef) => {
    if ('id' in marker && marker.id) {
      setSelectedAreaId(marker.id);
      setFlyToId(marker.id);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedAreaId(null);
  }, []);

  const handleAreaListItemClick = useCallback((areaId: number) => {
    setSelectedAreaId(areaId);
    setFlyToId(areaId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!data) {
    return <Loading />;
  }

  const hasDeveloperAreas = areas.some((a) => a.forDevelopers);
  const filteredData = areas.filter((a) =>
    hasDeveloperAreas ? Boolean(a.forDevelopers) === showForDevelopers : !a.forDevelopers,
  );

  const areasByRegion = filteredData.reduce((acc, area) => {
    const regionName = area.regionName?.trim() || 'Unknown region';
    const existing = acc.get(regionName) ?? [];
    existing.push(area);
    acc.set(regionName, existing);
    return acc;
  }, new Map<string, (typeof filteredData)[number][]>());
  const groupedRegions = [...areasByRegion.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const showRegionGrouping = groupedRegions.length > 1;

  const markers = filteredData
    .filter((a) => a.coordinates)
    .map((a) => {
      return {
        id: a.id ?? 0,
        coordinates: {
          latitude: a.coordinates?.latitude ?? 0,
          longitude: a.coordinates?.longitude ?? 0,
        },
        label: a.name ?? '',
        url: '/area/' + (a.id ?? 0),
      };
    });

  // Find the selected marker position for highlighting
  const selectedMarker = selectedAreaId ? markers.find((m) => m.id === selectedAreaId) : null;
  const activeMarkerPosition: [number, number] | null = selectedMarker
    ? [selectedMarker.coordinates.latitude, selectedMarker.coordinates.longitude]
    : null;

  return (
    <div className='w-full min-w-0'>
      <title>{`Areas | ${meta?.title}`}</title>
      <meta name='description' content={`${data.length} areas for climbing.`} />

      <Card flush className='min-w-0 overflow-hidden border-0'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <div className='absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 sm:top-5 sm:right-5'>
            {meta.isAdmin && (
              <Link
                to={`/area/edit/-1`}
                title='Add area'
                aria-label='Add area'
                data-ph-action='add'
                className={cn(
                  designContract.controls.pageHeaderIconButton,
                  designContract.controls.pageHeaderIconButtonAdd,
                )}
              >
                <Plus className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.5} />
              </Link>
            )}
          </div>

          <SectionHeader title='Areas' icon={MapIcon} subheader={`${filteredData.length} areas`} />

          {hasDeveloperAreas ? (
            <div className='mb-3 flex flex-wrap items-center gap-2'>
              <div className='bg-surface-raised border-surface-border/60 inline-flex h-8 items-center gap-1 rounded-full border p-0.5 pl-2 shadow-sm'>
                <span className='type-micro shrink-0 text-slate-300'>Dataset:</span>
                <button
                  type='button'
                  onClick={() => setShowForDevelopers(false)}
                  className={cn(
                    'inline-flex h-6 items-center rounded-full px-2.5 text-[12px] leading-none font-medium transition-colors sm:text-[13px]',
                    !showForDevelopers
                      ? designContract.surfaces.segmentActiveBrandBorder
                      : designContract.surfaces.segmentInactiveInGroup,
                  )}
                >
                  Developed
                </button>
                <button
                  type='button'
                  onClick={() => setShowForDevelopers(true)}
                  className={cn(
                    'inline-flex h-6 items-center rounded-full px-2.5 text-[12px] leading-none font-medium transition-colors sm:text-[13px]',
                    showForDevelopers
                      ? designContract.surfaces.segmentActiveBrandBorder
                      : designContract.surfaces.segmentInactiveInGroup,
                  )}
                >
                  Developers
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Split layout: map on top, area panel below when selected */}
        <div className={cn('flex flex-col', selectedAreaId ? 'lg:flex-row' : '')}>
          {/* Map */}
          <div
            className={cn(
              'min-h-[320px] transition-all duration-300',
              selectedAreaId ? 'h-[40vh] lg:h-[65vh] lg:w-1/2' : 'h-[56vh] sm:h-[66vh] lg:h-[72vh]',
            )}
          >
            <Leaflet
              height='100%'
              markers={markers}
              defaultCenter={meta.defaultCenter}
              defaultZoom={meta.defaultZoom}
              showSatelliteImage={false}
              clusterMarkers={!showForDevelopers}
              flyToId={flyToId}
              onMarkerClick={handleMarkerClick}
              activeMarkerPosition={activeMarkerPosition}
            />
          </div>

          {/* Area Panel (shown below map on mobile, beside on desktop) */}
          {selectedAreaId && (
            <div
              className={cn(
                'border-surface-border bg-surface-card h-[40vh] border-t lg:h-[65vh] lg:w-1/2 lg:border-t-0 lg:border-l',
                designContract.typography.body,
              )}
            >
              {selectedAreaLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Loading />
                </div>
              ) : selectedArea ? (
                <AreaPanel area={selectedArea} onClose={handleClosePanel} />
              ) : null}
            </div>
          )}
        </div>

        {/* Area list below */}
        <div className='p-4 pt-3 sm:p-5 sm:pt-4'>
          {showRegionGrouping ? (
            <div className='space-y-4'>
              {groupedRegions.map(([regionName, areasInRegion]) => (
                <div key={regionName} className='bg-surface-card rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2'>
                  <div className='mb-1.5 text-[12px] font-semibold text-slate-200 sm:text-[13px]'>{regionName}</div>
                  <div className='type-micro text-slate-400'>
                    {areasInRegion.map((area, index) => (
                      <span key={area.id}>
                        {index > 0 && <span className={cn('mx-2', profileRowMiddleDotClass)}>·</span>}
                        <span className='inline-flex items-center gap-1'>
                          <button
                            type='button'
                            onClick={() => handleAreaListItemClick(area.id ?? 0)}
                            className='hover:text-brand hover:decoration-brand/50 inline font-normal text-slate-300 underline-offset-[3px] transition-colors hover:underline'
                          >
                            {area.name}
                          </button>
                          <LockSymbol lockedAdmin={!!area.lockedAdmin} lockedSuperadmin={!!area.lockedSuperadmin} />
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='type-micro text-slate-400'>
              {filteredData.map((area, index) => (
                <span key={area.id}>
                  {index > 0 && <span className={cn('mx-2', profileRowMiddleDotClass)}>·</span>}
                  <span className='inline-flex items-center gap-1'>
                    <button
                      type='button'
                      onClick={() => handleAreaListItemClick(area.id ?? 0)}
                      className='hover:text-brand hover:decoration-brand/50 inline font-normal text-slate-300 underline-offset-[3px] transition-colors hover:underline'
                    >
                      {area.name}
                    </button>
                    <LockSymbol lockedAdmin={!!area.lockedAdmin} lockedSuperadmin={!!area.lockedSuperadmin} />
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Areas;
