/**
 * Shared wire format for the `?show=` preset on `/activity` (and any page that mounts the activity feed).
 *
 * **Why a preset?**
 * The frontpage panels (`FrontpageActivityPanels`) link "See more" → `/activity?show=fa` (etc.) so the destination page
 * lands with **only that category enabled**. The toggle state stays sticky after that — the user can flip filters back
 * on as normal, and their selection persists in `localStorage` (same keys as the chips).
 *
 * **Wire format**
 * - Single category: `?show=fa` — turns on `fa`, turns off the other three.
 * - Multiple categories: `?show=fa,media` — comma-separated; whatever is listed is on, everything else off.
 * - Unknown tokens are ignored. If no known categories are present the preset is a no-op (the URL is still cleaned up).
 *
 * **Lifecycle**
 * The feed applies the preset once on mount, then strips `show` from the URL with `replace` so back-button history isn't
 * polluted. The result is written to `localStorage` via the normal filter setters, so the preset effectively *becomes*
 * the user's preference until they toggle again.
 */
export const ACTIVITY_SHOW_PARAM = 'show';

export const ACTIVITY_SHOW_CATEGORIES = ['fa', 'ticks', 'media', 'comments'] as const;

export type ActivityShowCategory = (typeof ACTIVITY_SHOW_CATEGORIES)[number];

/** Build a `/activity?show=…` URL for a See-more link. Single category is most common. */
export function activityShowHref(categories: ActivityShowCategory | ActivityShowCategory[]): string {
  const list = Array.isArray(categories) ? categories : [categories];
  if (list.length === 0) return '/activity';
  return `/activity?${ACTIVITY_SHOW_PARAM}=${encodeURIComponent(list.join(','))}`;
}

/**
 * Parse `show=` into a strict `{ fa, ticks, media, comments }` flag map.
 *
 * Returns `null` (no override) when:
 * - the param is absent or empty, or
 * - none of the listed tokens match a known category (e.g. `?show=foo` — treat as if not specified).
 */
export function parseActivityShowParam(value: string | null | undefined): Record<ActivityShowCategory, boolean> | null {
  if (!value) return null;
  const tokens = new Set(
    value
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const hasKnown = ACTIVITY_SHOW_CATEGORIES.some((c) => tokens.has(c));
  if (!hasKnown) return null;
  return {
    fa: tokens.has('fa'),
    ticks: tokens.has('ticks'),
    media: tokens.has('media'),
    comments: tokens.has('comments'),
  };
}
