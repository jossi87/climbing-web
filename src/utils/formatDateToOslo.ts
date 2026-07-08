/**
 * Converts a UTC date string (e.g. "2026-07-08 05:23:25") to Oslo local time
 * and returns a formatted string like "2026-07-08 07:23".
 *
 * The backend stores guestbook timestamps in UTC and sends them as strings.
 * Since all users are in Norway (Europe/Oslo), we convert to Oslo timezone.
 */
export function formatUtcDateToOslo(utcDateStr: string | null | undefined): string {
  if (!utcDateStr) return '';

  // Append 'Z' to indicate UTC if not already present
  const normalized =
    utcDateStr.includes('Z') || utcDateStr.includes('+') ? utcDateStr : utcDateStr.replace(' ', 'T') + 'Z';

  const date = new Date(normalized);
  if (isNaN(date.getTime())) return utcDateStr; // fallback to original if invalid

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}
