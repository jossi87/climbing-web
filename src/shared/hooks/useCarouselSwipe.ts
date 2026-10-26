import { useCallback, useEffect, useRef } from 'react';

/** Horizontal travel that commits a swipe. Matches the front page media card so both feel the same. */
const COMMIT_DISTANCE_PX = 48;
/** Travel before a drag is claimed as a swipe — below this every touch is still a tap. */
const CLAIM_DISTANCE_PX = 12;
/** A drag that is this much more vertical than horizontal belongs to the page, not to the carousel. */
const VERTICAL_DOMINANCE = 1.25;
/** Above this browser pinch-zoom the user is inspecting the media, so gestures stay native. */
const PAGE_ZOOM_BLOCK_SCALE = 1.05;
/** Bottom strip of a `<video>` where the native control bar owns horizontal drags (seeking). */
const VIDEO_CONTROLS_STRIP_PX = 56;
/** Clicks synthesised after a swipe arrive within this window and must not activate anything. */
const CLICK_SUPPRESSION_MS = 350;

export type CarouselSwipeDirection = 'prev' | 'next';

export type CarouselSwipeOptions = {
  /**
   * Master switch. False for a single-item carousel and for media that owns its own gestures
   * (the 360° viewer pans with every drag).
   */
  enabled: boolean;
  /** Live horizontal offset while a swipe drag is in progress. */
  onDrag?: (deltaX: number) => void;
  /**
   * Called once the fingers are up. `null` means "do not navigate — snap back", which also covers
   * abandoned drags (a short drag, `touchcancel`, a second finger turning the gesture into a pinch).
   */
  onSwipe?: (direction: CarouselSwipeDirection | null) => void;
};

type Gesture = {
  /** A finger is down and this gesture may still become a swipe. */
  active: boolean;
  /** Locked in as a horizontal carousel swipe; `onDrag` is being reported. */
  claimed: boolean;
  /** Never swipe this gesture (multi-touch, page zoom, native video controls, disabled carousel). */
  ignored: boolean;
  startX: number;
  startY: number;
};

/** Fresh idle gesture. A factory rather than a shared constant: handlers mutate the object they hold. */
const idleGesture = (): Gesture => ({ active: false, claimed: false, ignored: false, startX: 0, startY: 0 });

/**
 * True while the browser has pinch-zoomed the page.
 *
 * Browsers report the factor on `visualViewport`; `undefined` on desktop Chrome without zoom. Exported
 * because `MediaModal` has to act on it in CSS as well: while the page is zoomed, dragging pans the
 * magnified image and must stay a native two-axis pan, so the stage may not claim the horizontal axis.
 */
export function isPagePinchZoomed(): boolean {
  const scale = window.visualViewport?.scale;
  return scale != null && scale > PAGE_ZOOM_BLOCK_SCALE;
}

/**
 * The native `<video>` control bar sits along the bottom edge and owns horizontal drags there (the
 * seek handle). Those drags must not page the carousel, so a gesture starting in that strip is skipped.
 */
function startsOnNativeVideoControls(event: TouchEvent): boolean {
  const target = event.target;
  if (!(target instanceof HTMLVideoElement)) return false;
  const touch = event.touches[0];
  if (!touch) return false;
  return touch.clientY >= target.getBoundingClientRect().bottom - VIDEO_CONTROLS_STRIP_PX;
}

/**
 * Swallow the click synthesised after a swipe. Without this a swipe that ends on a topo route would
 * also open that problem, and a swipe that ends on the image would close the modal.
 * The listener removes itself on first use, so only the click belonging to this gesture is dropped —
 * a tap the user makes straight afterwards still works.
 */
function suppressFollowingClick(element: HTMLElement) {
  const swallow = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
    element.removeEventListener('click', swallow, { capture: true });
  };
  element.addEventListener('click', swallow, { capture: true });
  window.setTimeout(() => element.removeEventListener('click', swallow, { capture: true }), CLICK_SUPPRESSION_MS);
}

/**
 * Horizontal swipe-to-navigate for the media carousel.
 *
 * Bind the returned ref to the element that wraps the slide (the stage) rather than to the media
 * element itself: the same gesture then works over a raster image, an inline topo `<svg>` and a
 * `<video>`, instead of depending on whichever element happens to be under the finger.
 *
 * ```tsx
 * const stageRef = useCarouselSwipe({ enabled: carouselSize > 1, onDrag, onSwipe });
 * return <div ref={stageRef} className='touch-swipe-stage'>…slide…</div>;
 * ```
 *
 * Design notes:
 * - Listeners are native and **capture phase**, so a child that stops propagation (topo route taps,
 *   player overlays, native controls) cannot hide the gesture from the carousel.
 * - Nothing is ever `preventDefault`ed: pinch-zoom and vertical panning keep working, and horizontal
 *   drags are taken from the browser by `touch-action` on the stage instead (`.touch-swipe-stage`).
 * - Zoom is evaluated per gesture (not latched in state), so a stale scale can never detach the
 *   handlers for good.
 */
export function useCarouselSwipe({ enabled, onDrag, onSwipe }: CarouselSwipeOptions) {
  const onDragRef = useRef(onDrag);
  const onSwipeRef = useRef(onSwipe);
  const enabledRef = useRef(enabled);
  onDragRef.current = onDrag;
  onSwipeRef.current = onSwipe;
  enabledRef.current = enabled;

  const gestureRef = useRef<Gesture>(idleGesture());
  const detachRef = useRef<(() => void) | null>(null);

  const stageRef = useCallback((element: HTMLDivElement | null) => {
    detachRef.current?.();
    detachRef.current = null;
    if (!element) return;

    const abandon = () => {
      const gesture = gestureRef.current;
      gestureRef.current = idleGesture();
      if (gesture.claimed) onSwipeRef.current?.(null);
    };

    const handleStart = (event: TouchEvent) => {
      if (!enabledRef.current) {
        // `abandon` snaps back a drag that was already in flight (e.g. the carousel was disabled while
        // the finger was down) instead of leaving the slide parked at its last offset.
        abandon();
        return;
      }
      const touch = event.touches[0];
      // Two fingers down: a pinch (zoom) — never a carousel swipe, and undo a drag already in flight.
      if (event.touches.length > 1 || !touch) {
        abandon();
        gestureRef.current = { ...idleGesture(), ignored: true };
        return;
      }
      gestureRef.current = {
        active: true,
        claimed: false,
        ignored: isPagePinchZoomed() || startsOnNativeVideoControls(event),
        startX: touch.clientX,
        startY: touch.clientY,
      };
    };

    const handleMove = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!gesture.active || gesture.ignored) return;
      const touch = event.touches[0];
      if (event.touches.length > 1 || !touch) {
        abandon();
        gestureRef.current = { ...idleGesture(), ignored: true };
        return;
      }

      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;
      if (!gesture.claimed) {
        const horizontal = Math.abs(deltaX);
        const vertical = Math.abs(deltaY);
        // Vertical intent wins: hand the rest of this gesture to the page instead of half-swiping.
        if (vertical > horizontal * VERTICAL_DOMINANCE) {
          if (vertical > CLAIM_DISTANCE_PX) gesture.ignored = true;
          return;
        }
        if (horizontal < CLAIM_DISTANCE_PX || horizontal <= vertical) return;
        gesture.claimed = true;
      }
      onDragRef.current?.(deltaX);
    };

    const handleEnd = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!gesture.active) return;
      // `touchend` still lists the fingers that remain down; wait for the last one to lift.
      if (event.touches.length > 0) return;
      gestureRef.current = idleGesture();
      if (!gesture.claimed) return;

      const touch = event.changedTouches[0];
      const deltaX = touch ? touch.clientX - gesture.startX : 0;
      suppressFollowingClick(element);
      // A pinch that started during the drag re-zoomed the page: that gesture belongs to the browser.
      const committed = Math.abs(deltaX) >= COMMIT_DISTANCE_PX && !isPagePinchZoomed();
      onSwipeRef.current?.(committed ? (deltaX < 0 ? 'next' : 'prev') : null);
    };

    element.addEventListener('touchstart', handleStart, { capture: true, passive: true });
    element.addEventListener('touchmove', handleMove, { capture: true, passive: true });
    element.addEventListener('touchend', handleEnd, { capture: true, passive: true });
    element.addEventListener('touchcancel', abandon, { capture: true, passive: true });

    detachRef.current = () => {
      element.removeEventListener('touchstart', handleStart, { capture: true });
      element.removeEventListener('touchmove', handleMove, { capture: true });
      element.removeEventListener('touchend', handleEnd, { capture: true });
      element.removeEventListener('touchcancel', abandon, { capture: true });
    };
  }, []);

  useEffect(
    () => () => {
      detachRef.current?.();
      detachRef.current = null;
    },
    [],
  );

  return stageRef;
}
