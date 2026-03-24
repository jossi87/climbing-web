import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LocateControl } from 'leaflet.locatecontrol';

export default function Locate() {
  const map = useMap();
  useEffect(() => {
    const lc = new LocateControl({
      position: 'topleft',
      keepCurrentZoomLevel: true,
      flyTo: true,
      showPopup: false,
    });
    lc.addTo(map);
    return () => {
      map.removeControl(lc);
    };
  }, [map]);

  return null;
}
