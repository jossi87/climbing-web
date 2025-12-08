import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.fullscreen/dist/Control.FullScreen.css';
import 'leaflet.fullscreen';

export default function FullscreenControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((L.Control as any).Fullscreen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fsControl = new (L.Control as any).Fullscreen({
        position: 'topleft',
      });
      fsControl.addTo(map);

      return () => {
        map.removeControl(fsControl);
      };
    }
    return;
  }, [map]);

  return null;
}
