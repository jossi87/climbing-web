/**
 * **In-card header row** shared by `Activity.tsx` and the `ActivityFrontpageSuspenseFallback`. The header lives
 * **inside** the `Card flush` shell now (matching `/graph`, `/about`, `/webcams`), so this class only handles the
 * row-level layout — no breakout / outer margin (the surrounding card supplies the panel and the inner divider
 * separates the toolbar from the feed below).
 *
 * Layout:
 *   - `< md`: column stack (title above, chip cluster below), `items-start` so the title isn't centered.
 *   - `md+`: row layout, `items-center justify-between` — `SectionHeader` left, chips right.
 *
 * Padding mirrors the Webcams / Graph header band: `px-4 pt-4 pb-3` on phones, `sm:px-5 sm:pt-5 sm:pb-4` from the
 * `sm` breakpoint up. `pb-*` is one notch tighter than `pt-*` because a divider follows immediately below.
 */
export const activityFrontpageToolbarClassName =
  'flex flex-col items-start gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 md:flex-row md:items-center md:justify-between';

/** Hairline divider between the in-card header row and the feed list (matches `FrontpagePanels` `dividerClass`). */
export const activityToolbarDividerClassName = 'border-surface-border/40 border-t';
