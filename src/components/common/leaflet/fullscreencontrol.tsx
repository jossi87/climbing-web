import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import FullScreen from 'leaflet.fullscreen';
import 'leaflet.fullscreen/dist/Control.FullScreen.css';

export default function FullscreenControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const fsControl = new FullScreen({
      position: 'topleft',
    });

    map.addControl(fsControl);

    return () => {
      map.removeControl(fsControl);
    };
  }, [map]);

  return null;
}
