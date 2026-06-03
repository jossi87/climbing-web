import { Circle, Polyline, Tooltip, Marker } from 'react-leaflet';
import type { components } from '../../../@types/buldreinfo/swagger';
import { divIcon } from 'leaflet';

type TrailDef = {
  backgroundColor: string;
  background?: boolean;
  trail: components['schemas']['Trail'];
  label?: string;
};

type Props = {
  opacity: number;
  trails?: TrailDef[];
};

function renderTrail(trailDef: TrailDef, opacity: number) {
  const a = trailDef;
  const coords = (a.trail.path ?? []).map((c) => ({
    lat: c.latitude ?? 0,
    lng: c.longitude ?? 0,
    id: c.id,
    elevation: c.elevation ?? 0,
  }));
  if (coords.length === 1) {
    return <Circle color={a.backgroundColor} key={coords[0].id} center={[coords[0].lat, coords[0].lng]} radius={0.5} />;
  }
  let color = a.backgroundColor;
  let weight = 3;
  if (a.background) {
    color = 'red';
    weight = 1;
  }
  const positions = coords.map((c) => [c.lat, c.lng] as [number, number]);
  const key = a.trail.id ?? positions.map((p) => p[0] + ',' + p[1]).join(' -> ');
  return (
    <Polyline key={'trail-' + key} color={color} weight={weight} positions={positions}>
      {a.label && (
        <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
          {a.label}
        </Tooltip>
      )}
      {/* Render trail markers */}
      {(a.trail.markers ?? []).map((m, idx) => {
        if (!m.coordinates?.latitude || !m.coordinates?.longitude) return null;
        const markerIcon = divIcon({
          className: 'trail-marker-icon',
          html: `<div style="background:${color};width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        return (
          <Marker key={'marker-' + idx} position={[m.coordinates.latitude, m.coordinates.longitude]} icon={markerIcon}>
            {m.label && (
              <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
                {m.label}
              </Tooltip>
            )}
          </Marker>
        );
      })}
    </Polyline>
  );
}

export default function Polylines({ opacity, trails }: Props) {
  if (!trails) {
    return null;
  }
  return <>{(trails ?? []).map((a) => renderTrail(a, opacity))}</>;
}
