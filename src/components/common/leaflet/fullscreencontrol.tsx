import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import FullScreen from 'leaflet.fullscreen';

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

  return (
    <style>{`
      @import url("https://unpkg.com/leaflet.fullscreen/dist/Control.FullScreen.css");

      :root {
        --fullscreen-icon-enter: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6'/%3E%3C/svg%3E");
        --fullscreen-icon-exit: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7'/%3E%3C/svg%3E");
      }

      .leaflet-control-fullscreen-button {
        background-size: 18px 18px !important;
      }
    `}</style>
  );
}
