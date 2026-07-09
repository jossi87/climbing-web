/**
 * Returns a Google Maps directions URL that works on both desktop and mobile.
 * On mobile devices, this opens the Google Maps app.
 * On desktop, it opens the Google Maps website.
 */
export function googleMapsSearchUrl(lat: number | string | undefined, lng: number | string | undefined): string {
  if (lat == null || lng == null) return '#';
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
