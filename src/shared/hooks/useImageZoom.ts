import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefCallback } from 'react';
import { useLocalStorage } from '../../utils/use-local-storage';

/** Remembered preference: does a plain (unmodified) wheel zoom the surface or scroll/pan it? */
const WHEEL_ZOOMS_STORAGE_KEY = 'topoEditorWheelZooms';

/** Image pixels per CSS pixel when zoomed all the way in — past 100 % the raster is magnified. */
const DEFAULT_MAX_OVERSAMPLE = 4;
/** Hard cap on the rendered CSS width, so a huge photo at max zoom can't create an absurd scroll area. */
const MAX_RENDER_WIDTH_PX = 16000;
/**
 * Hard cap on the rendered CSS height. Matters for panorama-shaped photos, where 4 image px per CSS
 * px would otherwise blow the surface up in the *other* direction.
 */
const MAX_RENDER_HEIGHT_PX = 16000;
/** Wheel delta → zoom factor. Trackpads send small deltas and mice large ones; `exp()` keeps both usable. */
const WHEEL_ZOOM_SENSITIVITY = 0.0025;
/** Firefox reports wheel deltas in lines, and some devices in pages — normalise both to pixels. */
const WHEEL_DELTA_LINE_PX = 33;
const WHEEL_DELTA_PAGE_PX = 100;
/** Zoom factor per `+` / `-` key press and per toolbar button press. */
const BUTTON_ZOOM_STEP = 1.4;
/** Below this the surface still counts as "fitted" — guards against float noise (and scrollbar widths). */
const ZOOMED_EPSILON = 1.001;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type UseImageZoomOptions = {
  /** Image pixel width (the editing surface' `viewBox` width). */
  imageWidth: number;
  imageHeight: number;
  /** How far past 1:1 the user may zoom, in image pixels per CSS pixel. Defaults to 4. */
  maxOversample?: number;
};

/** Pointer movement (CSS px) that turns a press into a drag. Mirrors the editors' own drag guard. */
const PAN_THRESHOLD_PX = 6;
/** Elements that own their own drag gestures — a press on one of these never starts a pan. */
const DRAG_OWNED_SELECTOR = '[data-point-index],[data-overlay-handle]';

export type ImageZoom = {
  /**
   * Attach to the scrollable wrapper around the editing surface. A *callback* ref, so the observer is
   * attached when the node actually mounts — the media editor renders a spinner until its payload
   * arrives, so a ref object would still be null in a mount-only effect.
   */
  containerRef: RefCallback<HTMLDivElement>;
  /** CSS pixel width for the editing surface; `0` until the container has been measured (use 100 % then). */
  renderWidth: number;
  /** Render width relative to the fit width (`1` = fitted to the container). */
  zoom: number;
  /** Render width relative to the image's own pixels — `48` = 48 % of native, `100` = 1:1. */
  percentOfNative: number;
  /** Image user units per CSS pixel: the bridge between screen-space sizes and SVG coordinates. */
  unitPerCssPx: number;
  isZoomed: boolean;
  /** True while the user is dragging the surface around with the mouse/pen. */
  isPanning: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  /** True when a plain wheel zooms the surface (the default); false when it scrolls/pans instead. */
  wheelZooms: boolean;
  toggleWheelZoom: () => void;
};

/**
 * Zoom + pan for a topo editing surface (an `<svg viewBox="0 0 imageW imageH">` stretched to a fixed
 * CSS width).
 *
 * The surface is the only thing that scales — the surrounding page keeps its own type size — so the
 * wheel magnifies photo pixels instead of running the browser's page zoom. Plain wheel zooms by default
 * ({@link ImageZoom.wheelZooms}), `Ctrl`/`⌘` + wheel and trackpad pinches always zoom, `Shift` + wheel
 * keeps its native horizontal-pan meaning and `Alt`/`Option` + wheel always scrolls natively.
 *
 * The wheel is claimed *only when it actually zooms*: at fit and at maximum zoom it falls through to the
 * page, so the surface can never trap ordinary scrolling. `touch-action` stays untouched and touch/pen
 * pointers are ignored, so the browser still owns mobile pinch-zoom and panning.
 *
 * Zoom is anchored under the cursor: the point below the pointer stays put, which is what makes
 * zooming in on a hold feel right.
 *
 * Everything is expressed relative to the *fit* width, so consuming code only needs:
 * ```tsx
 * const zoom = useImageZoom({ imageWidth: w, imageHeight: h });
 * <div ref={zoom.containerRef} className={zoom.isZoomed ? 'overflow-auto' : 'overflow-hidden'}>
 *   <svg style={{ width: zoom.renderWidth > 0 ? zoom.renderWidth : '100%', maxWidth: 'none' }}>
 * ```
 */
export function useImageZoom({
  imageWidth,
  imageHeight,
  maxOversample = DEFAULT_MAX_OVERSAMPLE,
}: UseImageZoomOptions): ImageZoom {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [fitWidth, setFitWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [wheelZooms, setWheelZooms] = useLocalStorage(WHEEL_ZOOMS_STORAGE_KEY, true);
  const [isPanning, setIsPanning] = useState(false);
  /** Mirrors `zoom` for the native wheel listener and ResizeObserver callbacks (never stale). */
  const zoomRef = useRef(1);
  /** Scroll position to restore once the surface has been resized — set by the zoom that is running. */
  const anchorRef = useRef<{ fracX: number; fracY: number; x: number; y: number } | null>(null);

  const imageW = Math.max(imageWidth, 1);
  const imageH = Math.max(imageHeight, 1);
  const maxRenderWidth = Math.round(
    Math.min(MAX_RENDER_WIDTH_PX, imageW * maxOversample, (MAX_RENDER_HEIGHT_PX * imageW) / imageH),
  );
  const maxZoom = fitWidth > 0 ? Math.max(maxRenderWidth / fitWidth, 1) : 1;
  const renderWidth = fitWidth > 0 ? clamp(fitWidth * zoom, fitWidth, maxRenderWidth) : 0;

  /** Read by the wheel/keyboard listeners through refs, so those can stay stable. */
  const maxZoomRef = useRef(maxZoom);
  maxZoomRef.current = maxZoom;
  const renderWidthRef = useRef(renderWidth);
  renderWidthRef.current = renderWidth;
  const wheelZoomsRef = useRef(wheelZooms);
  wheelZoomsRef.current = wheelZooms;

  const measureFit = useCallback(() => {
    const el = nodeRef.current;
    if (!el) return;
    const next = Math.round(el.clientWidth);
    if (next > 0) setFitWidth((prev) => (prev === next ? prev : next));
  }, []);

  /**
   * Callback ref for the surface wrapper. The node is kept in state as well, because the media editor
   * only renders its surface *after* its payload arrives — a mount-only effect would still see `null`
   * and never attach the observer or the wheel listener.
   */
  const attachContainer = useCallback<RefCallback<HTMLDivElement>>((node) => {
    nodeRef.current = node;
    setContainer(node);
  }, []);

  /** Measure + observe the surface whenever it (re)mounts. Layout timing, so no flash of `100 %`. */
  useLayoutEffect(() => {
    if (!container) return;
    measureFit();
    const observer = new ResizeObserver(() => {
      // Only re-measure while fitted. Zoomed in, the overflow scrollbar shaves pixels off
      // `clientWidth`; feeding that back would shrink the fit width and make the zoom ratio drift.
      if (zoomRef.current <= ZOOMED_EPSILON) measureFit();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, measureFit]);

  /**
   * `point` is relative to the container's visible box (cursor position, or the middle of the view) —
   * whatever sits under it stays fixed while the surface is resized. Returns whether the zoom actually
   * changed, so the wheel handler can hand the event back to the browser when it didn't.
   */
  const zoomAt = useCallback((point: { x: number; y: number } | null, factor: number) => {
    const el = nodeRef.current;
    const current = zoomRef.current;
    const next = clamp(current * factor, 1, maxZoomRef.current);
    if (!el || next === current) return false;

    const from = renderWidthRef.current || el.clientWidth;
    const x = point?.x ?? el.clientWidth / 2;
    const y = point?.y ?? el.clientHeight / 2;
    anchorRef.current = {
      fracX: from > 0 ? (el.scrollLeft + x) / from : 0,
      fracY: from > 0 ? (el.scrollTop + y) / from : 0,
      x,
      y,
    };
    zoomRef.current = next;
    setZoom(next);
    return true;
  }, []);

  /** Runs after the surface has been resized but before paint, so the anchored point never jumps. */
  useLayoutEffect(() => {
    const el = nodeRef.current;
    const anchor = anchorRef.current;
    if (!el || !anchor || renderWidth <= 0) return;
    anchorRef.current = null;
    el.scrollLeft = Math.max(0, anchor.fracX * renderWidth - anchor.x);
    el.scrollTop = Math.max(0, anchor.fracY * renderWidth - anchor.y);
  }, [zoom, renderWidth]);

  const zoomIn = useCallback(() => zoomAt(null, BUTTON_ZOOM_STEP), [zoomAt]);
  const zoomOut = useCallback(() => zoomAt(null, 1 / BUTTON_ZOOM_STEP), [zoomAt]);

  const zoomToFit = useCallback(() => {
    anchorRef.current = { fracX: 0, fracY: 0, x: 0, y: 0 };
    zoomRef.current = 1;
    setZoom(1);
    // `clientWidth` grows once the scrollbar is gone; re-measure next frame so a window resize that
    // happened while zoomed is picked up.
    window.requestAnimationFrame(measureFit);
  }, [measureFit]);

  useEffect(() => {
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // `Shift` keeps its native horizontal-pan meaning, and `Alt`/`Option` is an escape hatch that
      // always scrolls natively — regardless of how the plain wheel is configured.
      if (e.shiftKey || e.altKey) return;
      // `Ctrl`/`⌘` + wheel (and a trackpad pinch, which browsers report as Ctrl + wheel) always zooms.
      if (!e.ctrlKey && !e.metaKey && !wheelZoomsRef.current) return;

      const delta = e.deltaY * (e.deltaMode === 1 ? WHEEL_DELTA_LINE_PX : e.deltaMode === 2 ? WHEEL_DELTA_PAGE_PX : 1);
      const rect = container.getBoundingClientRect();
      const zoomed = zoomAt(
        { x: e.clientX - rect.left, y: e.clientY - rect.top },
        Math.exp(-delta * WHEEL_ZOOM_SENSITIVITY),
      );
      // Claim the wheel *only* when it changed the zoom: at fit and at maximum zoom it keeps scrolling
      // the page, so the surface can never trap ordinary scrolling.
      if (zoomed) e.preventDefault();
    };

    // Native listener: React delegates `wheel` passively, so `preventDefault()` there is a no-op.
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [container, zoomAt]);

  const toggleWheelZoom = useCallback(() => setWheelZooms((prev) => !prev), [setWheelZooms]);

  /**
   * Set when a pan finishes. Browsers fire a `click` after a drag, and the editors' click handlers treat
   * that as a tap (they add a point/overlay), so the click that belongs to a pan must be swallowed here.
   * The flag is cleared on the next press: a click always belongs to the gesture that just ended.
   */
  const suppressClickRef = useRef(false);

  /**
   * Drag-to-pan with the mouse (and pen, and the middle button). A plain click on the photo has no
   * other meaning in the editors — adding a point is a *tap*, and the editors already ignore presses
   * that move more than a few pixels — so dragging the surface is free real estate on desktop, which
   * otherwise forces the scroll wheel or the scrollbars.
   *
   * Touch pointers are left alone: the browser already pans them natively, and stealing the gesture
   * would break scroll/pan on mobile.
   */
  useEffect(() => {
    if (!container) return;

    /** Press that may become a pan; only promoted once it moves past the drag threshold. */
    let candidate: { pointerId: number; x: number; y: number; left: number; top: number } | null = null;
    let panning = false;

    /**
     * Capture-phase click blocker: stops React's `onClick` on the surface (and anything else) from
     * seeing the click that follows a pan. Relying on the editors' own "drag, not tap" flags is not
     * enough — a flag left over from an earlier gesture (e.g. the user released a point drag outside
     * the photo) would be *consumed* by the pan's pointer-up, and the pan's click would then add a point.
     */
    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClickRef.current) return;
      suppressClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    };

    const onPointerDown = (e: PointerEvent) => {
      suppressClickRef.current = false;
      if (e.pointerType === 'touch') return;
      if (e.button !== 0 && e.button !== 1) return;
      // Markers, hit rings and floating toolbars own their own drags.
      if ((e.target as Element | null)?.closest?.(DRAG_OWNED_SELECTOR)) return;
      if (e.target === container) {
        // The scrollbar band is part of the container — leave that drag to the browser.
        const rect = container.getBoundingClientRect();
        if (e.clientX > rect.left + container.clientWidth || e.clientY > rect.top + container.clientHeight) return;
      }
      // Middle-click drag would otherwise start Chrome's auto-scroll on top of our pan.
      if (e.button === 1) e.preventDefault();
      candidate = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        left: container.scrollLeft,
        top: container.scrollTop,
      };
      panning = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!candidate || e.pointerId !== candidate.pointerId) return;
      const dx = e.clientX - candidate.x;
      const dy = e.clientY - candidate.y;
      if (!panning) {
        if (Math.hypot(dx, dy) < PAN_THRESHOLD_PX) return;
        panning = true;
        setIsPanning(true);
      }
      // No pointer capture on purpose: the editors' own pointer listeners must keep firing so their
      // drag guard suppresses the click that would otherwise add a point after a pan.
      container.scrollLeft = candidate.left - dx;
      container.scrollTop = candidate.top - dy;
    };

    const finish = (e: PointerEvent) => {
      if (!candidate || e.pointerId !== candidate.pointerId) return;
      candidate = null;
      if (panning) {
        panning = false;
        setIsPanning(false);
        suppressClickRef.current = true;
      }
    };

    container.addEventListener('click', onClickCapture, true);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    return () => {
      container.removeEventListener('click', onClickCapture, true);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
    };
  }, [container]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      // Never steal keys from the path input or the pitch/crop selects.
      if (target && (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))) return;
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        zoomToFit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomIn, zoomOut, zoomToFit]);

  return {
    containerRef: attachContainer,
    renderWidth,
    zoom,
    percentOfNative: renderWidth > 0 ? (renderWidth / imageW) * 100 : 0,
    unitPerCssPx: renderWidth > 0 ? imageW / renderWidth : 1,
    isZoomed: zoom > ZOOMED_EPSILON,
    isPanning,
    canZoomIn: zoom < maxZoom - 0.001,
    canZoomOut: zoom > ZOOMED_EPSILON,
    zoomIn,
    zoomOut,
    zoomToFit,
    wheelZooms,
    toggleWheelZoom,
  };
}
