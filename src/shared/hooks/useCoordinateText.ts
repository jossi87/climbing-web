import { useState } from 'react';

/**
 * Parse a coordinate input — trims, accepts `,` as decimal (Norwegian convention), returns `undefined` for blank /
 * unparseable input.
 *
 * **Lenient by design**: `parseFloat('60.')` is `60`, so we don't reject a trailing dot mid-typing. The caller is
 * expected to keep the raw text in component state (see {@link useCoordinateText}) so that dot stays visible while
 * the parsed value already settles to a number.
 *
 * Module-level so the function identity is stable across renders — callers (the during-render sync inside
 * {@link useCoordinateText}, plus the consumers' onChange handlers) depend on the **value** the helper computes,
 * not on its identity, but keeping it module-level avoids `useCallback` ceremony if a future caller ever reaches
 * for it from a memoised context.
 */
export const parseCoordInput = (raw: string): number | undefined => {
  const t = raw.trim();
  if (t === '') return undefined;
  const n = parseFloat(t.replace(',', '.'));
  return Number.isNaN(n) ? undefined : n;
};

/** Numeric coord → input string (`undefined`/`null` → empty). Used for both initial state and external-sync resets. */
export const formatCoordValue = (v: number | null | undefined) => (v != null ? String(v) : '');

/**
 * **Single-coordinate input sanitizer.** Strips characters that can't appear in a finite signed decimal and
 * normalises locale-style commas to dots so what the user sees in the field is exactly what `parseFloat`
 * would consume.
 *
 * **Scope**: this is for *single-coordinate* inputs (one latitude or longitude per field). Multi-coordinate
 * fields like the polyline "Raw Data" input (`lat,lng;lat,lng…`) deliberately allow `,` and `;` as separators
 * and must **not** route through this sanitizer.
 *
 * Rules applied, in order:
 * 1. `,` → `.` — Norwegian locale convention; converting eagerly means the user sees the canonical form
 *    immediately rather than wondering whether the comma was accepted.
 * 2. Drop everything outside `[0-9.-]` — blocks accidental letters / whitespace / symbols from a paste, so
 *    `"asdf60.1"` becomes `"60.1"` instead of silently parsing to `NaN`.
 * 3. At most one **leading** `-` — keeps the sign anchor at the head of the string. `"60-5"` collapses to
 *    `"605"` rather than the misleading `"60-5"`, and `"--60"` collapses to `"-60"`.
 * 4. At most one `.` — `"60.5.6"` collapses to `"60.56"` (drop the second decimal point, not the trailing
 *    digits, so the user's typing intent is mostly preserved).
 *
 * The result is **idempotent** (`sanitize(sanitize(x)) === sanitize(x)`), which means {@link useCoordinateText}'s
 * during-render sync can re-feed `formatCoordValue` output through `setText` without surprise.
 */
export const sanitizeCoordInput = (raw: string): string => {
  let s = raw.replace(/,/g, '.');
  /*
   * `-` sits at the end of the character class so it's a literal dash (no need to escape it as `\-`,
   * which `no-useless-escape` would flag). `.` inside `[…]` is already literal, no escape needed either.
   */
  s = s.replace(/[^0-9.-]/g, '');
  if (s.length > 0) {
    const sign = s.startsWith('-') ? '-' : '';
    s = sign + s.slice(sign.length).replace(/-/g, '');
  }
  const firstDot = s.indexOf('.');
  if (firstDot >= 0) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
  }
  return s;
};

/**
 * **Raw-text adapter for coordinate (lat / lng) inputs.**
 *
 * ## Why this exists
 *
 * Lat/lng forms in this app store **numbers** (`data.coordinates.latitude`, `data.parking.longitude`, …) and parse
 * each keystroke through `parseFloat`. Binding the input `value` directly to `String(storedNumber)` therefore means
 * a number → string round-trip on every keystroke, which **strips trailing decimal points mid-typing**:
 *
 * ```
 *   "60"  → 60   → "60"   ✓
 *   "60." → 60   → "60"   ✗ (dot disappears, user can't continue typing decimals)
 *   "60.1234" → never reachable, because the dot was lost on the previous keystroke.
 * ```
 *
 * Same trap for leading `.` and `0.` (any number → string round-trip drops the formatting).
 *
 * ## What it does
 *
 * Holds **raw text state** as the source of truth while typing, while a guarded **during-render sync** (no
 * `useEffect` — see implementation comment for why) pulls from the externally-stored numeric value when (and
 * only when) the two **diverge** — e.g. a map click writes new coords straight to the data, or a "Remove
 * position" button clears them. The guard lets locale-style input (`"60,1234"` parses to the same number we
 * store as `60.1234`) and in-flight decimals (`"60."` parses to `60`, matching the stored `60`) survive across
 * re-renders without being rewritten.
 *
 * ## Usage
 *
 * ```ts
 * const lat = useCoordinateText(data.coordinates?.latitude);
 * // ...
 * <input
 *   value={lat.text}
 *   onChange={(e) => {
 *     lat.setText(e.target.value);
 *     setData((prev) => ({
 *       ...prev,
 *       coordinates: { ...prev.coordinates, latitude: parseCoordInput(e.target.value) },
 *     }));
 *   }}
 * />
 * ```
 *
 * The consumer owns the parsed-number write because each form has its own state shape (`data.coordinates`,
 * `data.parking`, reducer dispatch, …) — keeping the hook scoped to text + sync keeps it form-shape-agnostic.
 */
export function useCoordinateText(externalValue: number | null | undefined) {
  const [text, setText] = useState(() => formatCoordValue(externalValue));
  /*
   * Sync text → externalValue using the **"store information from previous render"** pattern, not `useEffect`:
   * https://react.dev/reference/react/useState#storing-information-from-previous-renders
   *
   * Why not `useEffect`? Calling `setState` synchronously inside an effect produces a cascading render
   * (React commits the stale text, then immediately schedules a second render to apply the synced text)
   * and is flagged by `react-hooks/set-state-in-effect`. The during-render pattern below lets React detect
   * the divergence **before** committing — same end result, no extra commit, no flash of stale text, no
   * rule violation.
   *
   * Mechanics:
   *   1. Track the previously-seen `externalValue` in its own state slot.
   *   2. On every render, compare it to the incoming `externalValue` with `Object.is` (so `NaN → NaN`
   *      doesn't loop — `Object.is(NaN, NaN)` is `true`, unlike `!==`).
   *   3. If they differ, "rebase" by writing both the new previous-value cell and (when the typed text
   *      diverges from the new number) the synced text. React notices these setStates during render and
   *      restarts the render with the new state before commit.
   *
   * The `parseCoordInput(text) === externalValue` guard is what preserves locale formatting and trailing
   * dots while typing — see top-of-hook comment for the full rationale.
   */
  const [lastExternalValue, setLastExternalValue] = useState(externalValue);
  if (!Object.is(lastExternalValue, externalValue)) {
    setLastExternalValue(externalValue);
    if (parseCoordInput(text) !== externalValue) {
      setText(formatCoordValue(externalValue));
    }
  }
  return { text, setText };
}
