import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Camera } from 'lucide-react';
import { type ReactNode } from 'react';

const createLucideIcon = (icon: ReactNode, color = '#ffffff') => {
  return L.divIcon({
    html: renderToString(
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '28px',
          height: '28px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: color,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {icon}
      </div>,
    ),
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createDotIcon = (fill: string) =>
  L.divIcon({
    html: renderToString(
      <div
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: fill,
          borderRadius: '50%',
          border: '1.5px solid rgba(15, 23, 42, 0.85)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.35), 0 2px 6px rgba(0,0,0,0.45)',
        }}
      />,
    ),
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

const createParkingIcon = () =>
  L.divIcon({
    html: renderToString(
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '22px',
          height: '22px',
          backgroundColor: 'rgba(12, 18, 28, 0.9)',
          borderRadius: '50%',
          border: '1px solid rgba(59, 130, 246, 0.45)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.45)',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            lineHeight: 1,
            color: '#3b82f6',
          }}
        >
          P
        </span>
      </div>,
    ),
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const createRockIcon = () =>
  L.divIcon({
    html: renderToString(
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '22px',
          height: '22px',
          backgroundColor: 'rgba(12, 18, 28, 0.9)',
          borderRadius: '50%',
          border: '1px solid rgba(148, 163, 184, 0.4)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.45)',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            lineHeight: 1,
            color: '#cbd5e1',
          }}
        >
          ◈
        </span>
      </div>,
    ),
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const markerBlueIcon = createDotIcon('#3b82f6');
const markerRedIcon = createDotIcon('#ef4444');
const parkingIcon = createParkingIcon();
const rockIcon = createRockIcon();
const weatherIcon = createLucideIcon(<Camera size={14} />, '#cbd5e1');

export { markerBlueIcon, markerRedIcon, parkingIcon, weatherIcon, rockIcon };
