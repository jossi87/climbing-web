import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.fullscreen";

// Version 2.3.0 does not work in iPhone: https://github.com/brunob/leaflet.fullscreen/issues/99 - yields "undefined is not an object (evaluating 'this._screenfull.raw.fullscreenchange')". Keep v1.6.0
export default function FullscreenControl() {
  const map = useMap();
  useEffect(() => {
    const L = require('leaflet')
    const fullscreen = L.control.fullscreen();
    fullscreen.addTo(map);
  }, [map]);
  return null;
}