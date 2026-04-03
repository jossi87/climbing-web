import type { components } from '../@types/buldreinfo/swagger';

type Redirect = components['schemas']['Redirect'];

/**
 * Maps API {@link Redirect} to a path for react-router `navigate()`.
 * - Returns a string when the app should navigate in-SPA.
 * - Returns `null` when a full-page navigation was started (external `redirectUrl`).
 * - Returns `undefined` when neither field yields a path (caller supplies a fallback).
 */
export function spaPathFromRedirectResponse(res: Redirect | undefined | null): string | null | undefined {
  if (!res) return undefined;
  const dest = res.destination?.trim();
  if (dest) return dest;

  const raw = res.redirectUrl?.trim();
  if (!raw) return undefined;

  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin === window.location.origin) {
      return url.pathname + url.search + url.hash;
    }
    window.location.assign(raw);
    return null;
  } catch {
    if (raw.startsWith('/')) return raw;
    return undefined;
  }
}
