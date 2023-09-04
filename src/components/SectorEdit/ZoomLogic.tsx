import { latLngBounds } from "leaflet";
import { useRef, useEffect } from "react";
import { useMap } from "react-leaflet";
import { components } from "../../@types/buldreinfo/swagger";
import { parsePolyline } from "../../utils/polyline";

type Props = {
  area: components["schemas"]["Area"];
  sector: components["schemas"]["Sector"];
};

export const ZoomLogic = ({
  area: loadedArea,
  sector: loadedSector,
}: Props) => {
  const map = useMap();
  const sectorRef = useRef(loadedSector);
  const areaRef = useRef(loadedArea);

  useEffect(() => {
    const bounds = latLngBounds([]);
    if (sectorRef.current) {
      if (sectorRef.current.outline?.length > 0) {
        for (const coordinates of sectorRef.current.outline) {
          bounds.extend([coordinates.latitude, coordinates.longitude]);
        }
      }

      if (sectorRef.current.polyline) {
        for (const latlng of parsePolyline(sectorRef.current.polyline)) {
          bounds.extend(latlng);
        }
      }

      if (sectorRef.current.parking) {
        bounds.extend([
          sectorRef.current.parking.latitude,
          sectorRef.current.parking.longitude,
        ]);
      }
    } else if (areaRef.current) {
      if (areaRef.current.coordinates) {
        bounds.extend([
          areaRef.current.coordinates.latitude,
          areaRef.current.coordinates.longitude,
        ]);
      }
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }
  }, [map]);

  return null;
};
