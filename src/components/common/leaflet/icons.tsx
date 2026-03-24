import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Camera, MapPin, CircleParking, Mountain } from 'lucide-react';
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

const markerBlueIcon = createLucideIcon(
  <MapPin size={14} fill='#3b82f6' color='white' />,
  '#3b82f6',
);
const markerRedIcon = createLucideIcon(
  <MapPin size={14} fill='#ef4444' color='white' />,
  '#ef4444',
);
const parkingIcon = createLucideIcon(<CircleParking size={16} />, '#94a3b8');
const rockIcon = createLucideIcon(<Mountain size={14} />, '#94a3b8');
const weatherIcon = createLucideIcon(<Camera size={14} />, '#cbd5e1');

export { markerBlueIcon, markerRedIcon, parkingIcon, weatherIcon, rockIcon };
