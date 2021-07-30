import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.fullscreen";

// leaflet.fullscreen 2.0.0 does not work: https://github.com/brunob/leaflet.fullscreen/issues/81
// The quick fix to include screenfull crashes on iPhone (screenfull not supported on Safari): Error message: undefined is not an object (evaluating 'screenfull.raw.fullscreenchange') [mail from palgra@yahoo.com 2021.07.29 - 12:25]
export default function FullscreenControl() {
  const map = useMap();
  useEffect(() => {
    const L = require('leaflet')
    const fullscreen = L.control.fullscreen();
    fullscreen.addTo(map);
  }, [map]);
  return null;
}