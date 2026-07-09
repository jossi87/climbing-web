/**
 * Shares the given coordinates using the Web Share API (if available),
 * which allows the user to share to any app (Google Maps, Messages, etc.).
 * Falls back to copying the coordinates to clipboard.
 */
export async function shareCoordinates(lat: number, lng: number, label: string): Promise<void> {
  const coordStr = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: label,
        text: `${label}\n${coordStr}`,
        url: googleMapsUrl,
      });
      return;
    } catch (err) {
      // User cancelled or share failed – fall through to clipboard fallback
      if (err instanceof Error && err.name === 'AbortError') return;
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${label}: ${coordStr} — ${googleMapsUrl}`);
  } catch {
    // Clipboard not available either – do nothing
  }
}
