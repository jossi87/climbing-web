/**
 * Tailwind class fragments using arbitrary `rgb(…)` — matches the usual `slate-*` scale & `index.css` light remaps.
 *
 * ESLint (`no-restricted-syntax`) forbids `text-slate-{700,800,900}` and `text-white` inside JSX `className="…"`
 * string literals. Prefer `className={cn(..., twInk.…)}` or compose into {@link designContract}.
 */
export const twInk = {
  lightHoverSlate900: 'light:hover:text-[rgb(15_23_42)]',
  lightTextSlate900: 'light:text-[rgb(15_23_42)]',
  lightGroupHoverSlate900: 'light:group-hover:text-[rgb(15_23_42)]',
  lightTextSlate800: 'light:text-[rgb(30_41_59)]',
  /** Secondary body / descriptions on white cards — between 800 and 900 for comfortable long reads. */
  lightTextSlate700: 'light:text-[rgb(51_65_85)]',
  lightHoverSlate800: 'light:hover:text-[rgb(30_41_59)]',
  lightGroupHoverSlate700: 'light:group-hover:text-[rgb(51_65_85)]',
  lightGroupHoverSlate800: 'light:group-hover:text-[rgb(30_41_59)]',
  /** ~slate-50 — hover text on dark chrome (`text-white` is restricted). */
  chromeNearWhite: 'text-[rgb(248_250_252)]',
  groupHoverChromeNearWhite: 'group-hover:text-[rgb(248_250_252)]',
  chromeNearWhite92: 'text-[rgba(248,250,252,0.92)]',
  chromeNearWhite88: 'text-[rgba(248,250,252,0.88)]',
  /** Pure white — header shell focus/hover (`text-white` is restricted). */
  groupFocusWithinChromeWhite: 'group-focus-within:text-[rgb(255_255_255)]',
  hoverChromeWhite: 'hover:text-[rgb(255_255_255)]',
  focusVisibleRingWhite38: 'focus-visible:ring-[rgba(255,255,255,0.38)]',
} as const;

/**
 * Light theme only: full-width graphite band under the sticky header so `backdrop-filter` samples charcoal,
 * not the pale page canvas (`App.tsx`). Z-index between body and `main`; same tint as header glass base.
 * Scrolling white cards (`bg-surface-card`) are dimmed globally via `--header-glass-backdrop-brightness` on
 * `.app-shell-header-glass-blur` in `index.css`.
 */
export const appShellLightBackdropStripClass =
  'pointer-events-none fixed top-0 right-0 left-0 z-[45] hidden h-13 bg-[rgb(19_21_26)] light:block';
