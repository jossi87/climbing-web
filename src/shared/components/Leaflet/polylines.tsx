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
  const size = 10;
  const filterId = `arrow-shadow-${idx}`;
  // The SVG arrow points right (east, 90°) by default. The bearing() function returns
  // geographic degrees where 0 = north, 90 = east. We subtract 90 to convert from
  // geographic bearing to SVG rotation so the arrow follows the line direction.
  const rotation = angle - 90;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(${rotation}deg)">
    <defs>
      <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="0.5" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
    </defs>
    <!-- Arrow shaft -->
    <rect x="0" y="${size / 2 - 1}" width="${size * 0.55}" height="2" fill="${color}" opacity="0.5"/>
    <!-- Arrowhead -->
    <polygon points="${size},${size / 2} ${size * 0.45},0 ${size * 0.45},${size}" fill="${color}" opacity="0.5" filter="url(#${filterId})"/>
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
 * Build a segment key from two consecutive coordinates.
 * Direction is normalized (sorted) so A→B and B→A produce the same key.
 */
function segmentKey(
  a: { latitude?: number | null; longitude?: number | null },
  b: { latitude?: number | null; longitude?: number | null },
): string | null {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return null;
  return [a.latitude, a.longitude, b.latitude, b.longitude]
    .map((v) => v.toFixed(6))
    .sort()
    .join(',');
}

/**
 * Place direction arrows along a polyline to indicate travel direction.
 * Arrows are placed at evenly-spaced **distance** intervals along the trail,
 * so they are always well-distributed regardless of how uneven the coordinate
 * spacing is. Short trails get ~3 arrows, long trails get up to ~6.
 * Only rendered for non-background trails.
 *
 * `arrowedSegments` is a set of segment keys that have already had arrows
 * rendered by a previous trail. Segments in this set will not get arrows again.
 */
function DirectionArrows({
  positions,
  background,
  arrowedSegments,
}: {
  positions: [number, number][];
  background?: boolean;
  arrowedSegments: Set<string>;
}) {
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

    // Skip this arrow if the segment has already been arrowed by another trail
    const key = segmentKey({ latitude: from[0], longitude: from[1] }, { latitude: to[0], longitude: to[1] });
    if (key && arrowedSegments.has(key)) continue;

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

export default function Polylines({ opacity: _opacity, trails }: Props) {
  if (!trails) return null;

  // Build a set of all segment keys that appear in MORE THAN ONE trail.
  // These are the segments shared between sectors — we only want arrows
  // on the FIRST trail that covers them.
  const segmentCount = new Map<string, number>();
  for (const t of trails) {
    const path = t.trail.path ?? [];
    for (let i = 1; i < path.length; i++) {
      const sk = segmentKey(path[i - 1], path[i]);
      if (sk) segmentCount.set(sk, (segmentCount.get(sk) ?? 0) + 1);
    }
  }
  const sharedSegments = new Set<string>();
  for (const [key, count] of segmentCount) {
    if (count > 1) sharedSegments.add(key);
  }

  // Track which shared segments have already had arrows rendered by a PREVIOUS trail.
  // We populate this set AFTER rendering each trail's arrows, so the current trail's
  // own arrows are not affected.
  const alreadyArrowed = new Set<string>();

  return (
    <>
      {trails.map((a) => {
        const coords = (a.trail.path ?? []).map((c) => ({
          lat: c.latitude ?? 0,
          lng: c.longitude ?? 0,
          id: c.id,
          elevation: c.elevation ?? 0,
        }));
        if (coords.length === 1) {
          return (
            <Circle key={coords[0].id} color={a.backgroundColor} center={[coords[0].lat, coords[0].lng]} radius={0.5} />
          );
        }
        const color = a.background ? 'red' : a.backgroundColor;
        const weight = a.background ? 1 : 3;
        const positions = coords.map((c) => [c.lat, c.lng] as [number, number]);
        const key = a.trail.id ?? positions.map((p) => p[0] + ',' + p[1]).join(' -> ');
        const distanceLabel = getDistanceWithUnit(a.trail);
        const hasMedia = (a.trail.media ?? []).length > 0;
        const tooltipLabel = a.label && distanceLabel ? `${a.label} · ${distanceLabel}` : a.label || '';

        // Register this trail's shared segments AFTER rendering arrows,
        // so subsequent trails know they're already arrowed.
        // We use a ref-like pattern: push to a queue, process after render.
        const path = a.trail.path ?? [];
        const segmentsToRegister: string[] = [];
        for (let i = 1; i < path.length; i++) {
          const sk = segmentKey(path[i - 1], path[i]);
          if (sk && sharedSegments.has(sk)) segmentsToRegister.push(sk);
        }

        return (
          <Polyline key={'trail-' + key} color={color} weight={weight} positions={positions}>
            {tooltipLabel && (
              <Tooltip permanent className='buldreinfo-tooltip-compact buldreinfo-tooltip-semi'>
                {tooltipLabel}
                {hasMedia ? ' 📷' : ''}
              </Tooltip>
            )}
            {/* Direction arrows — skips shared segments already arrowed by PREVIOUS trails */}
            <DirectionArrows positions={positions} background={a.background} arrowedSegments={alreadyArrowed} />
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
            {/* Register segments after rendering so they affect only SUBSEQUENT trails */}
            <RegisterSegments segments={segmentsToRegister} target={alreadyArrowed} />
          </Polyline>
        );
      })}
    </>
  );
}

/**
 * A component that, when rendered, adds its segments to the target set.
 * This is used to register shared trail segments AFTER the current trail's
 * arrows have been rendered, so only subsequent trails are affected.
 */
function RegisterSegments({ segments, target }: { segments: string[]; target: Set<string> }) {
  for (const s of segments) target.add(s);
  return null;
}
