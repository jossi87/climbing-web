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
      if (sectorRef.current.polygonCoords) {
        for (const latlng of parsePolyline(sectorRef.current.polygonCoords)) {
          bounds.extend(latlng);
        }
      }

      if (sectorRef.current.polyline) {
        for (const latlng of parsePolyline(sectorRef.current.polyline)) {
          bounds.extend(latlng);
        }
      }

      if (sectorRef.current.lat && sectorRef.current.lng) {
        bounds.extend([sectorRef.current.lat, sectorRef.current.lng]);
      }
    } else if (areaRef.current) {
      if (areaRef.current.lat && areaRef.current.lng) {
        bounds.extend([areaRef.current.lat, areaRef.current.lng]);
      }
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }
  }, [map]);

  return null;
};
