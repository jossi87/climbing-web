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
import { BreadcrumbSection, BreadcrumbDivider, Breadcrumb } from 'semantic-ui-react';

type Props = Pick<TocProps, 'areas'>;

const useMapZoom = () => {
  const map = useMap();
  const [zoom, setZoom] = useState(0);

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
                const { lat: centerLat, lng: centerLng } = sectorBounds.getCenter();
                lat = centerLat;
                lng = centerLng;
              }
            } else if (
              sector.parking &&
              typeof sector.parking.latitude === 'number' &&
              typeof sector.parking.longitude === 'number'
            ) {
              lat = sector.parking.latitude;
              lng = sector.parking.longitude;
            }
          }

          if (!lat || !lng) {
            continue;
          }

          markers.push({
            coordinates: { latitude: lat, longitude: lng },
            label: problem.name,
            url: `/problem/${problem.id}`,
            html: (
              <>
                <Breadcrumb>
                  <BreadcrumbSection link>
                    <Link to={`/area/${area.id}`}>{area.name}</Link>
                    <LockSymbol
                      lockedAdmin={area.lockedAdmin}
                      lockedSuperadmin={area.lockedSuperadmin}
                    />
                  </BreadcrumbSection>
                  <BreadcrumbDivider />
                  <BreadcrumbSection link>
                    <Link to={`/sector/${sector.id}`}>{sector.name}</Link>
                    <LockSymbol
                      lockedAdmin={sector.lockedAdmin}
                      lockedSuperadmin={sector.lockedSuperadmin}
                    />
                  </BreadcrumbSection>
                  <br />
                  <BreadcrumbSection link>
                    {`#${problem.nr} `}
                    <Link to={`/problem/${problem.id}`}>
                      <b>{problem.name}</b>
                    </Link>{' '}
                    {problem.grade}
                  </BreadcrumbSection>
                </Breadcrumb>
              </>
            ),
          });
        }
      }
    }

    return markers;
  }, [areas]);
};

const ProblemMarkers = ({ areas }: Props) => {
  const markers: MarkerDef[] = useMarkers(areas);

  return (
    <MarkerClusterGroup key={markers.length}>
      <Markers opacity={0.6} markers={markers} addEventHandlers={false} flyToId={null} />
    </MarkerClusterGroup>
  );
};

const ProblemClusters = ({ areas }: Props) => {
  const zoom = useMapZoom();

  const markers: MarkerDef[] = useMarkers(areas);

  if (zoom > 12) {
    return null;
  }

  return (
    <MarkerClusterGroup key={markers.length}>
      <Markers opacity={0.6} markers={markers} addEventHandlers={false} flyToId={null} />
    </MarkerClusterGroup>
  );
};

const SectorOutlines = ({ areas }: Props) => {
  const map = useMap();
  const zoom = useMapZoom();

  const outlines: ComponentProps<typeof Leaflet>['outlines'] = useMemo(() => {
    const out: ComponentProps<typeof Leaflet>['outlines'] = [];
    for (const area of areas) {
      for (const sector of area.sectors ?? []) {
        if ((sector.outline ?? []).length == 0) {
          continue;
        }

        out.push({
          outline: sector.outline ?? [],
          url: `/sector/${sector.id}`,
          label: sector.name,
        });
      }
    }
    return out;
  }, [areas]);

  useEffect(() => {
    const bounds = new LatLngBounds([]);
    for (const outline of outlines) {
      for (const c of outline.outline ?? []) {
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
    <Leaflet defaultCenter={defaultCenter} defaultZoom={defaultZoom}>
      <SectorOutlines areas={areas} />
      {isBouldering && <ProblemMarkers areas={areas} />}
      {!isBouldering && <ProblemClusters areas={areas} />}
    </Leaflet>
  );
};
