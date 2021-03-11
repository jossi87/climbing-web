import { useEffect } from "react";
import { useMap } from "react-leaflet";
import 'leaflet.fullscreen';
/**
 * https://github.com/brunob/leaflet.fullscreen/issues/81
 * screenfull necessary in leaflet.fullscreen 2.0.0
 * TODO Check if this can be removed later
 */
 import screenfull from 'screenfull';
 window.screenfull = screenfull; 

export default function FullscreenControl() {
  const map = useMap();
  useEffect(() => {
    const L = require('leaflet')
    const fullscreen = L.control.fullscreen();
    fullscreen.addTo(map);
  }, [map]);

  return null;
}