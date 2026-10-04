/**
 * The API spells “no subtype” in several ways: `null` / `''` when the problem’s `type.subtype` is unset, the literal
 * string `'null'` (the backend glues `type.subtype` onto the pitch prefix for profile ascents, so a plain boulder
 * arrives as `'null'`) and the legacy `'.'` placeholder from old imports. Anything else is a real subtype.
 */
export function normalizeSubType(subType?: string | null): string {
  const s = (subType ?? '').trim();
  return !s || s === '.' || s.toLowerCase() === 'null' ? '' : s;
}

/**
 * Route “type” labels in lists vs problem detail — see {@link formatRouteTypeLabel}.
 * Heuristic: trad gear when the combined label reads as Trad, Mixed, Aid (incl. Aid/Trad).
 */
export function formatRouteTypeLabel(type?: string | null, subType?: string | null): string {
  const t = (type ?? '').trim();
  const s = normalizeSubType(subType);
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
