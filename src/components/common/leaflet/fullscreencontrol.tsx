import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.fullscreen";

// https://github.com/brunob/leaflet.fullscreen/issues/92 <--Use leaflet.fullscreen 1.6.0, newer will not work on Safari
export default function FullscreenControl() {
  const map = useMap();
  useEffect(() => {
    const L = require('leaflet')
    const fullscreen = L.control.fullscreen();
    fullscreen.addTo(map);
  }, [map]);
  return null;
}