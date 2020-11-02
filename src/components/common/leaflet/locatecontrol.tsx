import { useEffect } from "react";
import { useLeaflet } from "react-leaflet";
import Locate from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";

export default function LocateControl() {
  const { map } = useLeaflet();
  useEffect(() => {
    // geo locate props
    const locateOptions = {
        enableHighAccuracy: true,
      position: 'topleft',
      maxZoom: 19,
      strings: {
          title: 'Show my location'
      },
      onActivate: () => {} // callback before engine starts retrieving locations
    }
    const lc = new Locate(locateOptions).addTo(map);
    lc.start();
  }, [map]);

  return null;
}