import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { LocateControl } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";

export default function Locate() {
  const map = useMap();
  useEffect(() => {
    const lc = new LocateControl();
    lc.addTo(map);
  }, [map]);

  return null;
}
