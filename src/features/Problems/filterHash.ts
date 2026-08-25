import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

/**
 * Filter-state <-> URL hash serialization.
 *
 * Format: `'2' + lz-string(JSON.stringify(obj))`.
 *   - lz-string's `compressToEncodedURIComponent` output avoids `/`, `=` and
 *     whitespace and is safe to embed in a URL fragment, is synchronous, and
 *     the library is dependency-free.
 *   - The leading `2` is a version marker so the format can evolve without
 *     ambiguity.
 *
 * Note: the previous json-url-based format is intentionally not decodable
 * anymore; any old shared filter link is treated as invalid.
 */

const HASH_VERSION = '2';

export function encodeFilterHash(obj: Record<string, unknown>): string {
  if (Object.keys(obj).length === 0) return '';
  return HASH_VERSION + compressToEncodedURIComponent(JSON.stringify(obj));
}

export function decodeFilterHash(hash: string): Record<string, unknown> | null {
  const clean = hash.replace(/^#/, '');
  if (!clean || !clean.startsWith(HASH_VERSION)) return null;

  try {
    const json = decompressFromEncodedURIComponent(clean.slice(HASH_VERSION.length));
    if (json === null) return null;
    const parsed: unknown = JSON.parse(json);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
