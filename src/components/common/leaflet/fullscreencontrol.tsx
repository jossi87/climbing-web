import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.fullscreen";

export default function FullscreenControl() {
  const map = useMap();
  useEffect(() => {
    // Dirty hack (https://github.com/brunob/leaflet.fullscreen/issues/123)
    const fullscreen = (L as any).control.fullscreen();
    fullscreen.addTo(map);
  }, [map]);
  return null;
}
