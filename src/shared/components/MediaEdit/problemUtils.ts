import type { components } from '../../../@types/buldreinfo/swagger';

type ProblemSearchResult = components['schemas']['ProblemSearchResult'];

/** Convert seconds → "M:SS" string. */
export function secondsToTimeStr(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Parse "M:SS" or "MM:SS" string → total seconds. Returns 0 on invalid input. */
export function timeStrToSeconds(str: string): number {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (!isNaN(m) && !isNaN(s) && m >= 0 && s >= 0 && s < 60) {
      return m * 60 + s;
    }
  }
  return 0;
}

/** Format a problem search result for display. */
export function formatProblemOption(p: ProblemSearchResult): string {
  const name = [p.problemName, p.grade].filter(Boolean).join(' · ');
  const location = [p.areaName, p.sectorName].filter(Boolean).join(' · ');
  return location ? `${name} (${location})` : name;
}
