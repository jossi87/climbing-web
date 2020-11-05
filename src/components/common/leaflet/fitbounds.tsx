import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function FitBounds({ autoZoom }) {
  const map = useMap();
  useEffect(() => {
    if (autoZoom) {
      let bounds = map.getBounds();
      map.fitBounds(bounds.pad(0.032), {maxZoom: 21}); // Test padding on Sirevåg - Holmavatn
    }
  }, [map]);

  return null;
}