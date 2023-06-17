import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.fullscreen";

export default function FullscreenControl() {
  const map = useMap();
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require("leaflet");
    const fullscreen = L.control.fullscreen();
    fullscreen.addTo(map);
  }, [map]);
  return null;
}
