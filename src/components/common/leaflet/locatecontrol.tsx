import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { locate } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";

export default function LocateControl() {
  const map = useMap();
  useEffect(() => {
    // geo locate props
    const locateOptions = {
      watch: true,
      enableHighAccuracy: true,
      position: "topleft",
      maxZoom: 19,
      strings: {
        title: "Show my location",
      },
      iconElementTag: "i",
      icon: "black map marker alternate icon",
      onActivate: () => undefined, // callback before engine starts retrieving locations
    };
    const lc = new locate(locateOptions);
    lc.addTo(map);
  }, [map]);

  return null;
}
