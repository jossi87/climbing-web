/** Google Maps place/search URL (lat,lng). Prefer over legacy `/maps/search/?api=1&query=` which can misbehave. */
export function googleMapsSearchUrl(lat: number | string | undefined, lng: number | string | undefined): string {
  if (lat == null || lng == null) return '#';
  const q = `${lat},${lng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
}
