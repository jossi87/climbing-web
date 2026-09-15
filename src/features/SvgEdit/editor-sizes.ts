/**
 * Screen-space sizing for the topo editors.
 *
 * Both editors draw the whole photo inside a single `<svg viewBox="0 0 w h">` that is stretched to the
 * container — and, when zoomed in, far beyond it. Everything sized as a fraction of `w` therefore
 * scales with the *photo* instead of the screen: point dots become 2 px radii on a phone at fit and
 * 38 px when zoomed 4x. These helpers express sizes in CSS pixels and convert them back into SVG user
 * units, so the editing chrome keeps a constant physical size on every device and at every zoom level.
 *
 * Two distinct policies:
 * - {@link chromeUu} — everything with a physical size on screen: dots, handles, hit areas, floating
 *   toolbars. Clamped to a CSS-pixel range, so it is comfortable at fit on a phone and still small
 *   enough for fine work when zoomed in.
 * - {@link cappedUu} — geometry that also ends up in the *published* topo (route line, labels, bolts,
 *   sibling routes). It keeps today's fit-time look, but may not grow more than
 *   {@link editorChrome.productionGrowth}-fold when zoomed in, so it can't turn into a billboard.
 */
export type EditorSizeScale = {
  /** Image user units per CSS pixel (`w / renderWidth`). */
  unitPerCssPx: number;
  /** Rendered width relative to the fit width (`1` = fitted to the container). */
  zoom: number;
};

export const editorChrome = {
  /** Route vertex dots (green when active). */
  vertexR: { min: 4, max: 6 },
  /** The end point carries the anchor marker, so it stays a touch bigger. */
  vertexAnchorR: { min: 5, max: 8 },
  /**
   * Invisible drag target around a vertex — generous for touch, but *also* capped: an uncapped radius
   * would swallow the neighbourhood when zoomed in, making it impossible to add a point next to one.
   */
  vertexHitR: { min: 18, max: 26 },
  cubicR: { min: 5, max: 7 },
  cubicStroke: { min: 1.5, max: 2.2 },
  cubicGuideStroke: { min: 1.2, max: 2 },
  /** Invisible drag target around a cubic control point. */
  cubicHitR: { min: 16, max: 22 },
  toolbarHeight: { min: 20, max: 26 },
  toolbarStroke: { min: 1, max: 1.5 },
  /** Invisible drag target around a bolt/trad rappel icon (square side length). */
  rappelHit: { min: 40, max: 52 },
  /**
   * Read-only sibling topo (other routes' dashed lines + their number badges). Sized in screen space so
   * it reads exactly like the published topo when the photo fills the screen, instead of turning into
   * giant black number plates once the user zooms in.
   */
  readOnly: {
    lineStroke: { min: 2, max: 3 },
    dash: { min: 4, max: 7 },
    anchorDotR: { min: 3, max: 5 },
    /** Number plate and its text stay close in size, so the digits fill the plate on every screen. */
    badgeR: { min: 10, max: 13 },
    badgeFontSize: { min: 10, max: 13 },
    badgeAnchorR: { min: 3, max: 4.5 },
  },
  /** How much bigger than its fit-time on-screen size a production-visible element may get when zoomed. */
  productionGrowth: 2,
} as const;

/** Hover/active boost for drag markers: the small dot grows so it is obvious what is being grabbed. */
export const hoverGrowth = 1.6;

const unitsPerCssPx = (scale: EditorSizeScale) => Math.max(scale.unitPerCssPx, 1e-6);

/** CSS pixels → SVG user units. */
export const cssPx = (scale: EditorSizeScale, value: number) => value * unitsPerCssPx(scale);

/** Current on-screen size (CSS px) of a length expressed in user units. */
export const screenCssPx = (scale: EditorSizeScale, value: number) => value / unitsPerCssPx(scale);

/**
 * Editing chrome: keep the *screen* size inside `[minCss, maxCss]`, whatever the zoom level is.
 * `relativeUu` is the historical size (e.g. `0.005 * w`) so the range only has to describe the bounds.
 */
export const chromeUu = (scale: EditorSizeScale, relativeUu: number, minCss: number, maxCss: number) =>
  cssPx(scale, Math.min(Math.max(screenCssPx(scale, relativeUu), minCss), maxCss));

/**
 * Factor for production-visible geometry: `1` at fit, shrinking as the user zooms in so the element
 * never grows more than `growth`-fold on screen. Multiply both raw user-unit sizes and the
 * `scale` arguments of {@link Descent} / {@link Rappel} with it.
 */
export const productionClamp = (zoom: number, growth: number = editorChrome.productionGrowth) =>
  Math.min(1, growth / Math.max(zoom, 1));

/** Production-visible length in user units, growth-capped for the current zoom. */
export const cappedUu = (scale: EditorSizeScale, relativeUu: number, growth: number = editorChrome.productionGrowth) =>
  relativeUu * productionClamp(scale.zoom, growth);
