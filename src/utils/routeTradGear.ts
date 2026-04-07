/**
 * Route “type” labels in lists vs problem detail — see {@link formatRouteTypeLabel}.
 * Heuristic: trad gear when the combined label reads as Trad, Mixed, Aid (incl. Aid/Trad).
 */
export function formatRouteTypeLabel(type?: string | null, subType?: string | null): string {
  const t = (type ?? '').trim();
  const sRaw = (subType ?? '').trim();
  const s = sRaw === '.' ? '' : sRaw;
  if (!t && !s) return '';
  if (!t) return s;
  if (!s) return t;
  return `${t} - ${s}`;
}

/** Compact list lines sometimes only expose one string (e.g. activity feed). */
export function climbingRouteUsesPassiveGear(label: string): boolean {
  const h = label.toLowerCase();
  if (!h.trim()) return false;
  if (/\b(trad|tradisjonell)\b/.test(h) || h.includes('tradisjon')) return true;
  if (/\b(mixed|mix)\b/.test(h) || h.includes('blandet')) return true;
  if (/\baid\b/.test(h)) return true;
  if (/aid\s*\/\s*trad|trad\s*\/\s*aid/.test(h)) return true;
  return false;
}

/** Tooltip / marker line: `typeLabel` plus pitch count when multipitch (lists + TOC). */
export function formatPassiveGearMarkerLine(typeLabel: string, numPitches?: number | null): string {
  const n = numPitches ?? 0;
  if (n <= 1) return typeLabel;
  return `${typeLabel} · ${n} pitches`;
}
