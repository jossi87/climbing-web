import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.fullscreen";

export default function FullscreenControl() {
  const map = useMap();
  useEffect(() => {
    const L = require('leaflet')
    const fullscreen = L.control.fullscreen();
    fullscreen.addTo(map);
  }, [map]);
  return null;
}