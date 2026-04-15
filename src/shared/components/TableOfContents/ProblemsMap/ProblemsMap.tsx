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

const ProblemClusters = ({ areas, showElevation }: Props & { showElevation: boolean }) => {
  const zoom = useMapZoom();
  const markers = useMarkers(areas);

  if (zoom > 12) return null;

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
            {!isBouldering && <ProblemClusters areas={areas} showElevation={showElevation} />}
          </>
        )}
      </Leaflet>
    </div>
  );
};
