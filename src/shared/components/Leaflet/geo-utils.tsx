import type { components } from '../../../@types/buldreinfo/swagger';

export function getDistanceWithUnit(trail: components['schemas']['Trail']) {
  const m = trail.distance ?? 0;
  if (m > 1000) {
    return Math.round(m / 100) / 10 + 'km';
  }
  return Math.round(m) + 'm';
}

type ParsedCoordinates = {
  latitude: number;
  longitude: number;
  elevation: number;
  elevationSource: 'GPX' | 'TCX' | undefined;
}[];

type CoordinateParser = (input: string) => ParsedCoordinates | null;

const convertGpxToCoordinates: CoordinateParser = (gpx) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpx, 'text/xml');
  const children = xmlDoc.querySelectorAll('trkpt');
  const coords: ParsedCoordinates = [];
  for (let i = 0; i < children.length; i++) {
    const trkpt = children[i];
    const latitude = +(trkpt.getAttribute('lat') ?? 0);
    const longitude = +(trkpt.getAttribute('lon') ?? 0);
    let elevation = 0;
    trkpt.childNodes.forEach((c) => {
      if (c.nodeName === 'ele') {
        elevation = parseFloat(c.firstChild?.nodeValue ?? '0');
      }
    });
    // First pass: remove consecutive points that are within 10m (deduplication)
    if (
      coords.length === 0 ||
      i === children.length - 1 ||
      calculateDistanceBetweenCoordinates(
        coords[coords.length - 1].latitude || 0,
        coords[coords.length - 1].longitude ?? 0,
        latitude ?? 0,
        longitude ?? 0,
      ) > 10
    ) {
      coords.push({
        latitude,
        longitude,
        elevation,
        elevationSource: elevation > 0 ? ('GPX' as const) : undefined,
      });
    }
  }
  if (coords.length < 2) {
    return null;
  }
  // Second pass: Ramer-Douglas-Peucker simplification with 5m threshold
  return simplifyRdp(coords, 5);
};

const convertTcxToCoordinates: CoordinateParser = (gpx: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpx, 'text/xml');
  const children = xmlDoc.querySelectorAll('Trackpoint');
  const coords: ParsedCoordinates = [];
  for (let i = 0; i < children.length; i++) {
    const trackpoint = children[i];
    let latitude = 0;
    let longitude = 0;
    let elevation = 0;
    trackpoint.childNodes.forEach((c) => {
      if (c.nodeName === 'Position') {
        const position = c;
        position.childNodes.forEach((cPos) => {
          if (cPos.nodeName === 'LatitudeDegrees') {
            latitude = parseFloat(cPos.firstChild?.nodeValue ?? '0');
          } else if (cPos.nodeName === 'LongitudeDegrees') {
            longitude = parseFloat(cPos.firstChild?.nodeValue ?? '0');
          }
        });
      } else if (c.nodeName === 'AltitudeMeters') {
        elevation = parseFloat(c.firstChild?.nodeValue ?? '0');
      }
    });
    if (latitude > 0 && longitude > 0) {
      if (
        coords.length === 0 ||
        i === children.length - 1 ||
        calculateDistanceBetweenCoordinates(
          coords[coords.length - 1].latitude,
          coords[coords.length - 1].longitude,
          latitude,
          longitude,
        ) > 10
      ) {
        coords.push({
          latitude,
          longitude,
          elevation,
          elevationSource: elevation > 0 ? 'TCX' : undefined,
        });
      }
    }
  }
  if (coords.length < 2) {
    return null;
  }
  // Second pass: Ramer-Douglas-Peucker simplification with 5m threshold
  return simplifyRdp(coords, 5);
};

export const parsers: Record<string, CoordinateParser> = {
  gpx: convertGpxToCoordinates,
  tcx: convertTcxToCoordinates,
} as const;

/**
 * Ramer-Douglas-Peucker polyline simplification.
 * Keeps points whose perpendicular distance from the simplified line exceeds `epsilonMeters`.
 * Always keeps the first and last point.
 */
function simplifyRdp(coords: ParsedCoordinates, epsilonMeters: number): ParsedCoordinates {
  if (coords.length <= 2) return coords;

  // Find the point with the maximum perpendicular distance from the line segment (first, last)
  let dMax = 0;
  let index = 0;
  const first = coords[0];
  const last = coords[coords.length - 1];

  for (let i = 1; i < coords.length - 1; i++) {
    const d = perpendicularDistance(
      coords[i].latitude,
      coords[i].longitude,
      first.latitude,
      first.longitude,
      last.latitude,
      last.longitude,
    );
    if (d > dMax) {
      index = i;
      dMax = d;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (dMax > epsilonMeters) {
    const left = simplifyRdp(coords.slice(0, index + 1), epsilonMeters);
    const right = simplifyRdp(coords.slice(index), epsilonMeters);
    // Concatenate, removing duplicate point at the join
    return left.slice(0, -1).concat(right);
  }

  // All points between first and last are within epsilon → keep only endpoints
  return [first, last];
}

/**
 * Perpendicular distance of point p from the line through p1-p2.
 * Uses the Haversine-equivalent planar approximation (valid for short distances).
 */
function perpendicularDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    // p1 and p2 are the same point → distance from p to p1
    return calculateDistanceBetweenCoordinates(px, py, x1, y1);
  }
  // Projection parameter t of p onto the line
  const t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  // Clamp t to [0, 1] to get the closest point on the segment
  const clampedT = Math.max(0, Math.min(1, t));
  const closestLat = x1 + clampedT * dx;
  const closestLng = y1 + clampedT * dy;
  return calculateDistanceBetweenCoordinates(px, py, closestLat, closestLng);
}

export function calculateDistanceBetweenCoordinates(
  lat1: number | string,
  lng1: number | string,
  lat2: number | string,
  lng2: number | string,
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(+lat2 - +lat1); // deg2rad below
  const dLon = deg2rad(+lng2 - +lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c * 1000; // Distance in meter
  return d;
}

function deg2rad(deg: number | string) {
  return +deg * (Math.PI / 180);
}
