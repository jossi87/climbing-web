import React, { ComponentProps, useEffect, useMemo, useState } from "react";
import Leaflet from "../../leaflet/leaflet";
import { useMeta } from "../../meta";
import { parsePolyline } from "../../../../utils/polyline";
import Markers, { MarkerDef } from "../../leaflet/markers";
import type { Props as TocProps } from "../TableOfContents";
import MarkerClusterGroup from "../../leaflet/react-leaflet-markercluster";
import { useMap } from "react-leaflet";
import Polygons from "../../leaflet/polygons";
import { LatLngBounds, LeafletEventHandlerFn, latLngBounds } from "leaflet";

type Props = Pick<TocProps, "areas">;

const useMapZoom = () => {
  const map = useMap();
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    const onZoom: LeafletEventHandlerFn = () => {
      setZoom(map.getZoom());
    };

    map.addEventListener("zoomend", onZoom);
    return () => {
      map.removeEventListener("zoomend", onZoom);
    };
  }, [map]);

  return zoom;
};

const useMarkers = (areas: Props["areas"]): MarkerDef[] => {
  return useMemo(() => {
    const markers: MarkerDef[] = [];

    for (const area of areas) {
      for (const sector of area.sectors) {
        let sectorBounds: LatLngBounds;
        for (const problem of sector.problems) {
          let lat = 0;
          let lng = 0;

          if (!problem.lat || !problem.lng) {
            if (sector.polygonCoords) {
              if (!sectorBounds) {
                sectorBounds = latLngBounds([]);
                const parsedBounds = parsePolyline(sector.polygonCoords);
                for (const latlng of parsedBounds) {
                  sectorBounds.extend(latlng);
                }
              }
              const { lat: centerLat, lng: centerLng } =
                sectorBounds.getCenter();
              lat = centerLat;
              lng = centerLng;
            } else if (sector.lat && sector.lng) {
              lat = sector.lat;
              lng = sector.lng;
            }
          }

          if (!lat || !lng) {
            continue;
          }

          markers.push({
            lat,
            lng,
            label: problem.name,
            url: `/problem/${problem.id}`,
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
    <MarkerClusterGroup>
      <Markers
        opacity={0.6}
        markers={markers}
        addEventHandlers={false}
        flyToId={null}
      />
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
    <MarkerClusterGroup>
      <Markers
        opacity={0.6}
        markers={markers}
        addEventHandlers={false}
        flyToId={null}
      />
    </MarkerClusterGroup>
  );
};

const SectorOutlines = ({ areas }: Props) => {
  const map = useMap();
  const zoom = useMapZoom();

  const outlines: ComponentProps<typeof Leaflet>["outlines"] = useMemo(() => {
    const out = [];
    for (const area of areas) {
      for (const sector of area.sectors) {
        if (!sector.polygonCoords) {
          continue;
        }

        out.push({
          polygon: parsePolyline(sector.polygonCoords),
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
      for (const latlng of outline.polygon) {
        bounds.extend(latlng);
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
      addEventHandlers={false}
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
