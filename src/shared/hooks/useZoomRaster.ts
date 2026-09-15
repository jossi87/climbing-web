import { useEffect, useMemo, useState } from 'react';
import { pickMediaRasterTier } from '../../api';

/** Let the zoom gesture settle before asking for a bigger raster (variants are generated server-side). */
const UPGRADE_DELAY_MS = 250;

/**
 * Live `visualViewport.scale` — the browser's own pinch-zoom factor.
 *
 * On mobile the browser zooms the whole page, which magnifies the editing surface without changing any
 * layout size. Folding this into the raster request keeps those magnified pixels sharp instead of
 * leaving the user with the same blurry raster they had before pinching (`MediaModal` reads the same
 * value to suspend its swipe handlers while pinch-zoomed).
 */
function useVisualViewportScale(): number {
  const [scale, setScale] = useState(() => (typeof window === 'undefined' ? 1 : (window.visualViewport?.scale ?? 1)));

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const sync = () => setScale(viewport.scale);
    sync();
    viewport.addEventListener('resize', sync);
    return () => viewport.removeEventListener('resize', sync);
  }, []);

  return scale;
}

/**
 * Raster width to request for the current zoom level — `0` means "keep using the standard web image"
 * (the parameterless URL), so plain viewing never generates extra variants.
 *
 * The editors render the photo into a surface that can be zoomed far past the screen size; without this
 * the browser would stretch the 2560 px web image over a 6000 px surface and every line placement would
 * be guesswork. Only ever upgrades, and only after the gesture settles, so a wheel run fires a single
 * request for its final size rather than one per notch.
 */
export function useZoomRaster({
  renderWidth,
  originalWidth,
  zoomed,
  enabled = true,
  resolveUrl,
}: {
  /** CSS pixel width the editing surface is currently rendered at. */
  renderWidth: number;
  /** Original image width — asking for more than this only redirects to the untouched original. */
  originalWidth: number;
  /** Only fetch bigger rasters while actually zoomed in. */
  zoomed: boolean;
  /** Set to false for cropped regions: those are already served at native resolution. */
  enabled?: boolean;
  /**
   * URL for a given `targetWidth` (usually `getMediaFileUrl(id, stamp, false, { targetWidth })`).
   * Must be stable (wrap it in `useCallback`). When provided, the variant is downloaded and decoded
   * before the surface switches over to it, so the current raster stays visible during the fetch
   * instead of flashing black.
   */
  resolveUrl?: (targetWidth: number) => string;
}): number {
  const [upgraded, setUpgraded] = useState(0);
  const viewportScale = useVisualViewportScale();

  const desired = useMemo(() => {
    if (!enabled || !zoomed || renderWidth <= 0) return 0;
    const devicePixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    const needed = renderWidth * devicePixelRatio * Math.max(viewportScale, 1);
    return pickMediaRasterTier(Math.round(needed), originalWidth);
  }, [enabled, zoomed, renderWidth, originalWidth, viewportScale]);

  useEffect(() => {
    // Never downgrade: zooming back out (and in again) must not re-request smaller variants.
    const next = Math.max(upgraded, desired);
    if (next === upgraded || next <= 0) return;
    let cancelled = false;
    const swap = () => {
      if (!cancelled) setUpgraded(next);
    };
    // Wait for the gesture to settle first: a wheel run should request one variant, not one per notch.
    const timer = window.setTimeout(() => {
      const url = resolveUrl?.(next);
      if (!url) {
        swap();
        return;
      }
      const preload = new Image();
      preload.onload = swap;
      preload.onerror = swap;
      preload.src = url;
    }, UPGRADE_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [desired, upgraded, resolveUrl]);

  // Cropped regions get their pixels from the crop itself, so they never ask for a resized variant.
  // (The editors remount when a new crop is applied, which resets the upgrade state with them.)
  return enabled ? upgraded : 0;
}
