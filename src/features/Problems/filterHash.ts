import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { flatten, unflatten } from 'flat';

/**
 * Filter-state <-> URL hash serialization.
 *
 * Format: `'2' + lz-string(JSON.stringify(obj))`.
 *   - lz-string's `compressToEncodedURIComponent` output avoids `/`, `=` and
 *     whitespace and is safe to embed in a URL fragment, is synchronous, and
 *     the library is dependency-free.
 *   - The leading `2` is a version marker so the format can evolve without
 *     ambiguity.
 *   - `obj` is the minimal flattened diff between the current filter selection and the
 *     unfiltered defaults, see {@link filterDiff} / {@link applyFilterDiff}. An unfiltered
 *     page therefore encodes to an empty string.
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

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * Minimal flattened diff between a filter selection and the unfiltered defaults.
 *
 * Only entries that differ from `defaults` are kept, so the unfiltered selection produces an
 * empty diff. Nested maps (region/area ids, types, sector orientations, …) are compared after
 * flattening, which is what makes a single toggled entry show up as `filterRegionIds.123`.
 * Empty objects are dropped as well, so an unfiltered map never ends up in the URL.
 *
 * Inverse of {@link applyFilterDiff}: `applyFilterDiff(filterDiff(x, d), d)` deep-equals `x` for
 * the selections this app produces, i.e. ones whose object-valued fields keep the key set of the
 * default (the filter form only toggles keys, it never removes them — `filterPitches` is the one
 * field with a non-empty default). Keeps every field in sync with the one place that knows the
 * defaults, so sharing can never silently skip a filter field.
 */
export function filterDiff(
  filter: Record<string, unknown>,
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  const flatDefaults = flatten(defaults) as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(flatten(filter) as Record<string, unknown>).filter(([key, value]) => {
      if (isPlainObject(value)) {
        return Object.keys(value).length > 0;
      }

      return value !== undefined && value !== (flatDefaults[key] ?? false);
    }),
  );
}

/**
 * Rebuilds a nested filter selection from a {@link filterDiff} result.
 *
 * A hash is user-controlled input, so entries whose top-level field is not a known filter field
 * are ignored. `defaults` is what defines "known", which is why callers must pass the full
 * default selection (`DEFAULT_INITIAL_FILTER` — typed as `FilterInputs`, so the compiler keeps it
 * complete). Object-valued fields are completed with their default entries to give a decoded
 * selection the same shape as the selection it was encoded from (a diff only carries the entries
 * that deviate, e.g. `filterPitches` without its `false` entries).
 */
export function applyFilterDiff(
  diff: Record<string, unknown>,
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  const knownDiff = Object.fromEntries(
    Object.entries(diff).filter(([key]) => Object.prototype.hasOwnProperty.call(defaults, key.split('.')[0] ?? key)),
  );

  const selection = unflatten(knownDiff, { object: true }) as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(selection).map(([key, value]) => {
      const fallback = defaults[key];

      return [key, isPlainObject(value) && isPlainObject(fallback) ? { ...fallback, ...value } : value];
    }),
  );
}
