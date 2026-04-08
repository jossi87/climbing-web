/** Replace `/` and `&` between people with commas; leaves existing commas as-is. */
export function normalizeFaPeopleSeparators(fa: string): string {
  return fa
    .trim()
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+&\s+/g, ', ');
}

export function compactFaPeopleNames(fa: string): string {
  const normalized = normalizeFaPeopleSeparators(fa).trim();
  if (!normalized) return '';
  const people = normalized
    .split(/\s*(?:,|\/|&|\band\b|\bog\b)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return people
    .map((person) =>
      person
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
    )
    .filter(Boolean)
    .join(',');
}

export function compactFaYear(faDate?: string | null): string {
  if (!faDate || faDate.length < 4) return '';
  return `-${faDate.slice(2, 4)}`;
}
