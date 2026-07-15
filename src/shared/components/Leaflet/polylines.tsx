import { Circle, Polyline, Tooltip, Marker } from 'react-leaflet';
import type { components } from '../../../@types/buldreinfo/swagger';
import { divIcon } from 'leaflet';
import { getDistanceWithUnit } from './geo-utils';

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

/**
 * Compute the bearing (in degrees) between two [lat, lng] points.
 */
function bearing(from: [number, number], to: [number, number]): number {
  const [lat1, lon1] = from.map((d) => (d * Math.PI) / 180);
  const [lat2, lon2] = to.map((d) => (d * Math.PI) / 180);
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Create a directional arrow icon (triangle) pointing in the direction of travel.
 */
function createArrowIcon(color: string, angle: number, idx: number) {
  const size = 16;
  const filterId = `arrow-shadow-${idx}`;
  // The SVG arrow points right (east, 90°) by default. The bearing() function returns
  // geographic degrees where 0 = north, 90 = east. We subtract 90 to convert from
  // geographic bearing to SVG rotation so the arrow follows the line direction.
  const rotation = angle - 90;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(${rotation}deg)">
    <defs>
      <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="rgba(0,0,0,0.6)"/>
      </filter>
    </defs>
    <!-- Arrow shaft -->
    <rect x="0" y="${size / 2 - 1.5}" width="${size * 0.55}" height="3" fill="${color}" opacity="0.9"/>
    <!-- Arrowhead -->
    <polygon points="${size},${size / 2} ${size * 0.45},0 ${size * 0.45},${size}" fill="${color}" opacity="0.9" filter="url(#${filterId})"/>
  </svg>`;
  return divIcon({
    className: 'trail-direction-arrow',
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2], // anchor at center so the arrow sits on the line
  });
}

/**
 * Haversine distance in meters between two [lat, lng] points.
 */
function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const [lat1, lon1] = a.map((d) => (d * Math.PI) / 180);
  const [lat2, lon2] = b.map((d) => (d * Math.PI) / 180);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Place direction arrows along a polyline to indicate travel direction.
 * Arrows are placed at evenly-spaced **distance** intervals along the trail,
 * so they are always well-distributed regardless of how uneven the coordinate
 * spacing is. Short trails get ~3 arrows, long trails get up to ~6.
 * Only rendered for non-background trails.
 */
function DirectionArrows({ positions, background }: { positions: [number, number][]; background?: boolean }) {
  if (background || positions.length < 2) return null;

  // Calculate cumulative distances along the trail
  const cumulativeDist: number[] = [0];
  for (let i = 1; i < positions.length; i++) {
    cumulativeDist.push(cumulativeDist[i - 1] + haversineDistance(positions[i - 1], positions[i]));
  }
  const totalLength = cumulativeDist[cumulativeDist.length - 1];
  if (totalLength <= 0) return null;

  // Always place arrows near the start (5%) and end (95%), plus evenly-spaced
  // arrows in between. Short trails get 3 arrows total, long trails get up to 6.
  const middleCount = Math.min(4, Math.max(1, Math.ceil(totalLength / 300)));
  const fractions = [0.05, ...Array.from({ length: middleCount }, (_, i) => (i + 1) / (middleCount + 1)), 0.95];

  const arrows: { position: [number, number]; angle: number }[] = [];
  for (const fraction of fractions) {
    const targetDist = fraction * totalLength;

    // Find the segment that contains this distance
    let segIdx = 1;
    while (segIdx < cumulativeDist.length - 1 && cumulativeDist[segIdx] < targetDist) {
      segIdx++;
    }

    const from = positions[segIdx - 1];
    const to = positions[segIdx];
    const angle = bearing(from, to);
    arrows.push({ position: to, angle });
  }

  return (
    <>
      {arrows.map((a, idx) => (
        <Marker
          key={'dir-' + idx}
          position={a.position}
          icon={createArrowIcon('#000000', a.angle, idx)}
          interactive={false}
        />
      ))}
    </>
  );
}

function renderTrail(trailDef: TrailDef, _opacity: number) {
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
  const distanceLabel = getDistanceWithUnit(a.trail);
  const hasMedia = (a.trail.media ?? []).length > 0;
  const tooltipLabel = a.label && distanceLabel ? `${a.label} · ${distanceLabel}` : a.label || '';
  return (
    <Polyline key={'trail-' + key} color={color} weight={weight} positions={positions}>
      {tooltipLabel && (
        <Tooltip permanent className='buldreinfo-tooltip-compact buldreinfo-tooltip-semi'>
          {tooltipLabel}
          {hasMedia ? ' 📷' : ''}
        </Tooltip>
      )}
      {/* Direction arrows along the trail */}
      <DirectionArrows positions={positions} background={a.background} />
      {/* Render trail markers (only for non-background trails, e.g. sector/problem pages) */}
      {!a.background &&
        (a.trail.markers ?? []).map((m, idx) => {
          if (!m.coordinates?.latitude || !m.coordinates?.longitude) return null;
          const markerIcon = divIcon({
            className: 'trail-marker-icon',
            html: `<div style="background:${color};width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          return (
            <Marker
              key={'marker-' + idx}
              position={[m.coordinates.latitude, m.coordinates.longitude]}
              icon={markerIcon}
            >
              {m.label && (
                <Tooltip permanent className='buldreinfo-tooltip-compact buldreinfo-tooltip-semi'>
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
