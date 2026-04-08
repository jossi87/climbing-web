/** Replace `/` and `&` between people with commas; leaves existing commas as-is. */
export function normalizeFaPeopleSeparators(fa: string): string {
  return fa
    .trim()
    .replace(/\s*\/\s*/g, ', ')
    .replace(/\s+&\s+/g, ', ');
}
