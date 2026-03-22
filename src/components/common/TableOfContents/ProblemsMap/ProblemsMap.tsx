import { type ComponentProps, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Leaflet from '../../leaflet/leaflet';
import { useMeta } from '../../meta';
import Markers, { type MarkerDef } from '../../leaflet/markers';
import type { Props as TocProps } from '../TableOfContents';
import MarkerClusterGroup from '../../leaflet/react-leaflet-markercluster';
import { useMap } from 'react-leaflet';
import Polygons from '../../leaflet/polygons';
import { LatLngBounds, type LeafletEventHandlerFn, latLngBounds } from 'leaflet';
import { LockSymbol } from '../../../common/widgets/widgets';
import { ChevronRight } from 'lucide-react';

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
              <div className='flex flex-col gap-2 min-w-50 p-1'>
                <nav className='flex flex-wrap items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-500 uppercase'>
                  <Link
                    to={`/area/${area.id}`}
                    className='hover:text-brand transition-colors text-slate-400'
                  >
                    {area.name}
                  </Link>
                  <LockSymbol
                    lockedAdmin={area.lockedAdmin}
                    lockedSuperadmin={area.lockedSuperadmin}
                  />
                  <ChevronRight size={10} className='opacity-40' />
                  <Link
                    to={`/sector/${sector.id}`}
                    className='hover:text-brand transition-colors text-slate-400'
                  >
                    {sector.name}
                  </Link>
                  <LockSymbol
                    lockedAdmin={sector.lockedAdmin}
                    lockedSuperadmin={sector.lockedSuperadmin}
                  />
                </nav>
                <div className='flex items-center gap-1.5 pt-1 border-t border-slate-700/50'>
                  <span className='text-xs font-mono text-slate-500'>#{problem.nr}</span>
                  <Link
                    to={`/problem/${problem.id}`}
                    className='text-sm font-bold text-white hover:text-brand transition-colors'
                  >
                    {problem.name}
                  </Link>
                  <span className='text-xs font-mono text-slate-400 normal-case'>
                    [{problem.grade}]
                  </span>
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
    <div className='h-[60vh] w-full relative z-0'>
      <Leaflet defaultCenter={defaultCenter} defaultZoom={defaultZoom}>
        <SectorOutlines areas={areas} />
        {isBouldering && <ProblemMarkers areas={areas} />}
        {!isBouldering && <ProblemClusters areas={areas} />}
      </Leaflet>
    </div>
  );
};
