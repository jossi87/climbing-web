import { latLngBounds } from "leaflet";
import { useRef, useEffect } from "react";
import { useMap } from "react-leaflet";
import { components } from "../../@types/buldreinfo/swagger";
import { useMeta } from "../common/meta";

type Props = {
  area: components["schemas"]["Area"];
  sector: components["schemas"]["Sector"];
};

export const ZoomLogic = ({
  area: loadedArea,
  sector: loadedSector,
}: Props) => {
  const { defaultCenter } = useMeta();
  const map = useMap();
  const sectorRef = useRef(loadedSector);
  const areaRef = useRef(loadedArea);

  useEffect(() => {
    const bounds = latLngBounds([]);
    if (sectorRef.current) {
      if (sectorRef.current.outline?.length) {
        for (const coordinates of sectorRef.current.outline) {
          bounds.extend([
            coordinates.latitude ?? defaultCenter.lat,
            coordinates.longitude ?? defaultCenter.lng,
          ]);
        }
      }

      if (sectorRef.current.approach?.coordinates?.length) {
        for (const coordinates of sectorRef.current.approach.coordinates) {
          bounds.extend([
            coordinates.latitude ?? defaultCenter.lat,
            coordinates.longitude ?? defaultCenter.lng,
          ]);
        }
      }

      if (sectorRef.current.parking) {
        bounds.extend([
          sectorRef.current.parking.latitude ?? defaultCenter.lat,
          sectorRef.current.parking.longitude ?? defaultCenter.lng,
        ]);
      }
    } else if (areaRef.current) {
      if (areaRef.current.coordinates) {
        bounds.extend([
          areaRef.current.coordinates.latitude ?? defaultCenter.lat,
          areaRef.current.coordinates.longitude ?? defaultCenter.lng,
        ]);
      }
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }
  }, [defaultCenter.lat, defaultCenter.lng, map]);

  return null;
};
