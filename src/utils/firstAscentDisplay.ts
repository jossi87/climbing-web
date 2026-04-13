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

/** Prefer a 4-digit year from the segment text; otherwise use `faDate` (for `-YY`). */
function compactYearSegment(yearDigits: string | undefined, faDate?: string | null): string {
  if (yearDigits && yearDigits.length >= 4) return compactFaYear(yearDigits);
  return compactFaYear(faDate);
}

/** Pulls a 4-digit year from the end of a segment (e.g. "Name 2017"). */
function extractNamesAndYear(segment: string): { names: string; yearDigits?: string } {
  let s = segment.trim();
  const yearMatch = s.match(/\b((?:19|20)\d{2})\s*$/);
  if (yearMatch?.index != null) {
    const yearDigits = yearMatch[1];
    s = s.slice(0, yearMatch.index).trim().replace(/\.+$/, '').trim();
    return { names: s, yearDigits };
  }
  s = s.replace(/\.+$/, '').trim();
  return { names: s };
}

type FaFfaPair = {
  fa?: { names: string; yearDigits?: string };
  ffa?: { names: string; yearDigits?: string };
};

/** When `fa` contains both FA and FFA (… `FFA:` …), split into labeled compact parts. */
function tryParseFaAndFfa(fa: string): FaFfaPair | null {
  const normalized = normalizeFaPeopleSeparators(fa).trim();
  if (!/\bFFA\s*:/i.test(normalized)) return null;

  const ffaIdx = normalized.search(/\bFFA\s*:/i);
  const before = normalized.slice(0, ffaIdx).trim();
  const after = normalized
    .slice(ffaIdx)
    .replace(/^\s*FFA\s*:\s*/i, '')
    .trim();

  const beforeStripped = before.replace(/^\s*FA\s*:\s*/i, '').trim();
  const faPart = extractNamesAndYear(beforeStripped);
  const ffaPart = extractNamesAndYear(after);

  const hasFa = !!faPart.names;
  const hasFfa = !!ffaPart.names;
  if (!hasFa && !hasFfa) return null;
  if (!hasFfa) return null;

  const out: FaFfaPair = {};
  if (hasFa) out.fa = faPart;
  out.ffa = ffaPart;
  return out;
}

/**
 * Compact first-ascent line for problem lists: initials and optional `-YY` year.
 * When the API string includes both FA and `FFA:`, renders `FA: …, FFA: …` with `-YY` per side:
 * inline 4-digit year in that segment if present, otherwise `faDate`.
 * Otherwise matches legacy `compactFaPeopleNames` + `compactFaYear(faDate)`.
 */
export function compactFaDisplayLine(faRaw: string, faDate?: string | null): string {
  const fa = faRaw.trim();
  const dual = tryParseFaAndFfa(fa);
  if (dual?.ffa) {
    const parts: string[] = [];
    if (dual.fa?.names) {
      const ini = compactFaPeopleNames(dual.fa.names);
      parts.push(`FA: ${ini}${compactYearSegment(dual.fa.yearDigits, faDate)}`);
    }
    {
      const ini = compactFaPeopleNames(dual.ffa.names);
      parts.push(`FFA: ${ini}${compactYearSegment(dual.ffa.yearDigits, faDate)}`);
    }
    return parts.join(', ');
  }

  if (!fa) return compactFaYear(faDate);
  return `${compactFaPeopleNames(fa)}${compactFaYear(faDate)}`;
}
