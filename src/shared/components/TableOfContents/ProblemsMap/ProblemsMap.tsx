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
import { LockSymbol } from '../../Widgets/Widgets';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { designContract } from '../../../../design/contract';

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
              <div className='flex min-w-50 flex-col gap-2 p-1'>
                <nav className={cn('flex flex-wrap items-center gap-1.5', designContract.typography.label)}>
                  <Link to={`/area/${area.id}`} className='hover:text-brand text-slate-400 transition-colors'>
                    {area.name}
                  </Link>
                  <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} />
                  <ChevronRight size={10} className='opacity-40' />
                  <Link to={`/sector/${sector.id}`} className='hover:text-brand text-slate-400 transition-colors'>
                    {sector.name}
                  </Link>
                  <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
                </nav>
                <div className='flex items-center gap-1.5 border-t border-slate-700/50 pt-1'>
                  <span className='font-mono text-xs text-slate-500'>#{problem.nr}</span>
                  <Link
                    to={`/problem/${problem.id}`}
                    className='type-body hover:text-brand font-semibold transition-colors'
                  >
                    {problem.name}
                  </Link>
                  <span className='font-mono text-xs text-slate-400 normal-case'>[{problem.grade}]</span>
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

const ProblemMarkers = ({ areas }: Props) => {
  const markers = useMarkers(areas);
  return (
    <MarkerClusterGroup key={markers.length}>
      <Markers opacity={0.6} markers={markers} addEventHandlers={false} flyToId={null} />
    </MarkerClusterGroup>
  );
};

const ProblemClusters = ({ areas }: Props) => {
  const zoom = useMapZoom();
  const markers = useMarkers(areas);

  if (zoom > 12) return null;

  return (
    <MarkerClusterGroup key={markers.length}>
      <Markers opacity={0.6} markers={markers} addEventHandlers={false} flyToId={null} />
    </MarkerClusterGroup>
  );
};

const SectorOutlines = ({ areas }: Props) => {
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
    />
  );
};

export const ProblemsMap = ({ areas }: Props) => {
  const { defaultCenter, defaultZoom, isBouldering } = useMeta();

  return (
    <div className='relative z-0 h-[60vh] w-full'>
      <Leaflet defaultCenter={defaultCenter} defaultZoom={defaultZoom}>
        <SectorOutlines areas={areas} />
        {isBouldering && <ProblemMarkers areas={areas} />}
        {!isBouldering && <ProblemClusters areas={areas} />}
      </Leaflet>
    </div>
  );
};
