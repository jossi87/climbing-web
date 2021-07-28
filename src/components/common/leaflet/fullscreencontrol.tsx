import { useEffect } from "react";
import { useMap } from "react-leaflet";
import screenfull from 'screenfull';
import 'leaflet.fullscreen';

export default function FullscreenControl() {
  window.screenfull = screenfull; // Necessary to get leaflet.fullscreen 2.0.0 to work with react-leaflet 3.0.0 (https://github.com/brunob/leaflet.fullscreen/issues/81)
  const map = useMap();
  useEffect(() => {
    const L = require('leaflet')
    const fullscreen = L.control.fullscreen();
    fullscreen.addTo(map);
  }, [map]);

  return null;
}