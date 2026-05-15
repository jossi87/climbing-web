import { type ComponentProps, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Leaflet from '../../Leaflet/Leaflet';
import { useMeta } from '../../Meta';
import Markers, { type MarkerDef } from '../../Leaflet/markers';
import type { Props as TocProps } from '../TableOfContents';
import MarkerClusterGroup from '../../Leaflet/ReactLeafletMarkerCluster';
import { useMap } from 'react-leaflet';
import Polygons from '../../Leaflet/polygons';
import { LatLngBounds, type LeafletEventHandlerFn, latLngBounds } from 'leaflet';
import { LockSymbol } from '../../../ui/Indicators';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { designContract } from '../../../../design/contract';
import { tickProblemLinkWithStatus, tickWhenGrade } from '../../Profile/profileRowTypography';

type Props = Pick<TocProps, 'areas'>;

const useMapZoom = () => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom: LeafletEventHandlerFn = () => {
      setZoom(map.getZoom());
    };

    map.addEventListener('zoomend', onZoom);
    return () => {
      map.removeEventListener('zoomend', onZoom);
    };
  }, [map]);

  return zoom;
};

/**
 * Compute a single marker per area, placed at the centroid of all problems in that area.
 * Clicking the marker shows a popup listing all problems grouped by sector.
 */
const useAreaMarkers = (areas: Props['areas']): MarkerDef[] => {
  return useMemo(() => {
    const markers: MarkerDef[] = [];

    for (const area of areas) {
      // Collect all problems with coordinates in this area
      const problemsWithCoords: {
        id: number;
        nr: number;
        name: string;
        grade: string;
        lat: number;
        lng: number;
        broken: string;
        ticked?: boolean;
        todo?: boolean;
        sectorId: number;
        sectorName: string;
        sectorLockedAdmin: boolean;
        sectorLockedSuperadmin: boolean;
      }[] = [];

      for (const sector of area.sectors ?? []) {
        for (const problem of sector.problems ?? []) {
          let lat = 0;
          let lng = 0;

          if (!problem.coordinates) {
            if ((sector.outline ?? []).length > 0) {
              const sectorBounds = latLngBounds([]);
              for (const c of sector.outline ?? []) {
                if (typeof c.latitude === 'number' && typeof c.longitude === 'number') {
                  sectorBounds.extend([c.latitude, c.longitude]);
                }
              }
              if (sectorBounds.isValid()) {
                const center = sectorBounds.getCenter();
                lat = center.lat;
                lng = center.lng;
              }
            } else if (
              sector.parking &&
              typeof sector.parking.latitude === 'number' &&
              typeof sector.parking.longitude === 'number'
            ) {
              lat = sector.parking.latitude;
              lng = sector.parking.longitude;
            }
          } else if (
            typeof problem.coordinates.latitude === 'number' &&
            typeof problem.coordinates.longitude === 'number'
          ) {
            lat = problem.coordinates.latitude;
            lng = problem.coordinates.longitude;
          }

          if (!lat || !lng) continue;

          problemsWithCoords.push({
            id: problem.id ?? 0,
            nr: problem.nr ?? 0,
            name: problem.name ?? '',
            grade: problem.grade ?? '',
            lat,
            lng,
            broken: problem.broken ?? '',
            ticked: problem.ticked,
            todo: problem.todo,
            sectorId: sector.id ?? 0,
            sectorName: sector.name ?? '',
            sectorLockedAdmin: !!sector.lockedAdmin,
            sectorLockedSuperadmin: !!sector.lockedSuperadmin,
          });
        }
      }

      if (problemsWithCoords.length === 0) continue;

      // Compute centroid
      const sumLat = problemsWithCoords.reduce((sum, p) => sum + p.lat, 0);
      const sumLng = problemsWithCoords.reduce((sum, p) => sum + p.lng, 0);
      const centerLat = sumLat / problemsWithCoords.length;
      const centerLng = sumLng / problemsWithCoords.length;

      // Group problems by sector for the popup
      const sectorGroups = new Map<
        number,
        {
          name: string;
          lockedAdmin: boolean;
          lockedSuperadmin: boolean;
          problems: typeof problemsWithCoords;
        }
      >();
      for (const p of problemsWithCoords) {
        const existing = sectorGroups.get(p.sectorId);
        if (existing) {
          existing.problems.push(p);
        } else {
          sectorGroups.set(p.sectorId, {
            name: p.sectorName,
            lockedAdmin: p.sectorLockedAdmin,
            lockedSuperadmin: p.sectorLockedSuperadmin,
            problems: [p],
          });
        }
      }

      const popupContent = (
        <div className='max-h-[280px] min-w-48 space-y-3 overflow-y-auto py-1'>
          {Array.from(sectorGroups.entries()).map(([sectorId, group]) => (
            <div key={sectorId} className='space-y-1'>
              <div className='flex items-center gap-1'>
                <Link
                  to={`/sector/${sectorId}`}
                  className={cn(
                    designContract.typography.meta,
                    'font-medium underline-offset-2 transition-colors hover:underline',
                    'text-slate-400 hover:text-slate-200',
                  )}
                >
                  {group.name}
                </Link>
                <LockSymbol lockedAdmin={group.lockedAdmin} lockedSuperadmin={group.lockedSuperadmin} />
              </div>
              <div className='flex flex-col gap-0.5'>
                {group.problems.map((problem) => (
                  <div key={problem.id} className='flex items-center gap-1.5 pl-2'>
                    <Link
                      to={`/problem/${problem.id}`}
                      className={cn(
                        designContract.typography.body,
                        'buldreinfo-popup-primary-link font-medium underline-offset-2 transition-colors hover:underline',
                        tickProblemLinkWithStatus({
                          ticked: !!problem.ticked,
                          todo: !!problem.todo,
                          broken: !!problem.broken,
                        }),
                      )}
                    >
                      #{problem.nr} {problem.name}
                    </Link>
                    {problem.grade ? (
                      <span className='text-[11px] font-medium whitespace-nowrap text-slate-500 tabular-nums'>
                        {problem.grade}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

      markers.push({
        id: area.id ?? 0,
        coordinates: { latitude: centerLat, longitude: centerLng },
        label: `${area.name ?? ''} [${problemsWithCoords.length}]`,
        html: popupContent,
      } as MarkerDef);
    }

    return markers;
  }, [areas]);
};

const useMarkers = (areas: Props['areas']): MarkerDef[] => {
  return useMemo(() => {
    const markers: MarkerDef[] = [];

    for (const area of areas) {
      for (const sector of area.sectors ?? []) {
        let sectorBounds: LatLngBounds | null = null;
        for (const problem of sector.problems ?? []) {
          let lat = 0;
          let lng = 0;

          if (!problem.coordinates) {
            if ((sector.outline ?? []).length > 0) {
              if (!sectorBounds) {
                sectorBounds = latLngBounds([]);
                for (const c of sector.outline ?? []) {
                  if (typeof c.latitude === 'number' && typeof c.longitude === 'number') {
                    sectorBounds.extend([c.latitude, c.longitude]);
                  }
                }
              }
              if (sectorBounds && sectorBounds.isValid()) {
                const center = sectorBounds.getCenter();
                lat = center.lat;
                lng = center.lng;
              }
            } else if (
              sector.parking &&
              typeof sector.parking.latitude === 'number' &&
              typeof sector.parking.longitude === 'number'
            ) {
              lat = sector.parking.latitude;
              lng = sector.parking.longitude;
            }
          } else if (
            typeof problem.coordinates.latitude === 'number' &&
            typeof problem.coordinates.longitude === 'number'
          ) {
            lat = problem.coordinates.latitude;
            lng = problem.coordinates.longitude;
          }

          if (!lat || !lng) continue;

          markers.push({
            coordinates: { latitude: lat, longitude: lng },
            label: problem.name ?? '',
            url: `/problem/${problem.id}`,
            html: (
              <div className='buldreinfo-map-popup flex w-max max-w-full min-w-[13rem] flex-col gap-2.5 py-0.5 sm:min-w-[18rem] md:min-w-[22rem]'>
                <nav
                  className={cn(
                    'flex flex-wrap items-center gap-1.5',
                    designContract.typography.micro,
                    'text-slate-500',
                  )}
                >
                  <Link to={`/area/${area.id}`} className={designContract.typography.listLinkMuted}>
                    {area.name}
                  </Link>
                  <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
                  <ChevronRight size={10} className='shrink-0 text-slate-600' aria-hidden />
                  <Link to={`/sector/${sector.id}`} className={designContract.typography.listLinkMuted}>
                    {sector.name}
                  </Link>
                  <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
                </nav>
                <div className='border-surface-border/40 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-dashed pt-2.5'>
                  <span className={cn(tickWhenGrade, 'font-mono tabular-nums')}>#{problem.nr}</span>
                  <Link
                    to={`/problem/${problem.id}`}
                    className={cn(
                      designContract.typography.body,
                      designContract.typography.listEmphasis,
                      'buldreinfo-popup-primary-link transition-colors',
                      tickProblemLinkWithStatus({
                        ticked: !!problem.ticked,
                        todo: !!problem.todo,
                        broken: !!problem.broken,
                      }),
                    )}
                  >
                    {problem.name}
                  </Link>
                  <span className={cn(designContract.typography.grade)}>{problem.grade}</span>
                </div>
              </div>
            ),
          });
        }
      }
    }

    return markers;
  }, [areas]);
};

const ProblemMarkers = ({ areas, showElevation }: Props & { showElevation: boolean }) => {
  const markers = useMarkers(areas);
  return (
    <MarkerClusterGroup key={markers.length}>
      <Markers opacity={0.6} markers={markers} addEventHandlers={false} flyToId={null} showElevation={showElevation} />
    </MarkerClusterGroup>
  );
};

const AreaGroupedMarkers = ({ areas, showElevation }: Props & { showElevation: boolean }) => {
  const zoom = useMapZoom();
  const areaMarkers = useAreaMarkers(areas);
  const individualMarkers = useMarkers(areas);

  // Show area-level markers when zoomed out, individual markers when zoomed in
  const markers = zoom <= 12 ? areaMarkers : individualMarkers;

  return (
    <MarkerClusterGroup key={markers.length}>
      <Markers opacity={0.6} markers={markers} addEventHandlers={false} flyToId={null} showElevation={showElevation} />
    </MarkerClusterGroup>
  );
};

const SectorOutlines = ({ areas, showElevation }: Props & { showElevation: boolean }) => {
  const map = useMap();
  const zoom = useMapZoom();

  const outlines = useMemo(() => {
    const out: ComponentProps<typeof Polygons>['outlines'] = [];
    for (const area of areas) {
      for (const sector of area.sectors ?? []) {
        if ((sector.outline ?? []).length > 0) {
          out.push({
            outline: sector.outline ?? [],
            url: `/sector/${sector.id}`,
            label: sector.name ?? '',
          });
        }
      }
    }
    return out;
  }, [areas]);

  useEffect(() => {
    const bounds = latLngBounds([]);
    for (const outline of outlines) {
      for (const c of outline.outline) {
        if (typeof c.latitude === 'number' && typeof c.longitude === 'number') {
          bounds.extend([c.latitude, c.longitude]);
        }
      }
    }
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { duration: 0.5 });
    }
  }, [map, outlines]);

  return (
    <Polygons
      opacity={0.6}
      outlines={outlines.map(({ label, ...rest }) => ({
        ...rest,
        label: zoom > 12 ? label : undefined,
      }))}
      addEventHandlers={true}
      showElevation={showElevation}
    />
  );
};

export const ProblemsMap = ({ areas }: Props) => {
  const { defaultCenter, defaultZoom, isBouldering } = useMeta();

  return (
    <div className='relative z-0 h-[35vh] min-h-[220px] w-full overflow-hidden'>
      <Leaflet height='100%' defaultCenter={defaultCenter} defaultZoom={defaultZoom} showElevationControl={false}>
        {({ showElevation }) => (
          <>
            <SectorOutlines areas={areas} showElevation={showElevation} />
            {isBouldering && <ProblemMarkers areas={areas} showElevation={showElevation} />}
            {!isBouldering && <AreaGroupedMarkers areas={areas} showElevation={showElevation} />}
          </>
        )}
      </Leaflet>
    </div>
  );
};
