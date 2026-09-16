import type { components } from '../@types/buldreinfo/swagger';

/**
 * Leaflet center (`{ lat, lng }`) for a `Coordinates` payload — `undefined` when the payload is not geolocated.
 *
 * Used to let the map fall back to the parent area's coordinates on the area / sector / problem pages: an area
 * may have coordinates while its sectors and problems have none. Callers keep their own fallback when the
 * relevant coordinates are missing (parking → outline → area → app default).
 */
export function getCoordinatesCenter(
  coordinates?: components['schemas']['Coordinates'] | null,
): { lat: number; lng: number } | undefined {
  if (coordinates == null || coordinates.latitude == null || coordinates.longitude == null) return undefined;
  return { lat: coordinates.latitude, lng: coordinates.longitude };
}
