import { useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';

/** Travel (px) still counted as a tap: enough for a wobbling finger, far too little for a swipe. */
const TAP_SLOP_PX = 10;

/**
 * One gesture produces a `pointerup` *and* a `click`. Whatever the first one already answered is not asked again
 * inside this window, so a single tap can never act twice.
 */
const ACTIVATION_WINDOW_MS = 400;

export type TapActivationOptions = {
  /** Called once per completed tap. */
  onTap: () => void;
  /**
   * Treat a `click` with no press behind it as a tap of its own. Right for a focusable control — a keyboard or
   * assistive technology activating a `<button>` produces exactly that click — and wrong for a surface where a click
   * can also arrive from a gesture that started somewhere else: the click a carousel swipe leaves behind lands on
   * whatever is under the finger once the page has turned, and dismissing a photo on it would close the viewer the
   * user just swiped to. Off by default for that reason.
   */
  activateOnClick?: boolean;
};

export type TapActivationHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void;
};

/**
 * Answer a **tap** on `pointerup` instead of on `click`.
 *
 * `click` alone is the obvious choice and the one every other control uses, but it is not always what arrives. A tap
 * competes with the gesture machinery around it: `useCarouselSwipe` arms a click-suppressor for the click the browser
 * synthesises after a committed swipe, the media itself is remounted by that page turn, and a browser that moved its
 * own slop a few pixels hands the tap over as a `pointerup` with no click at all. Any of those looks identical to the
 * user — the first tap did nothing and the second one worked — however correct the handler behind the `click` is.
 *
 * `pointerup` is the same gesture with none of that in the way, so it is what activates here:
 *
 * - A press that travelled more than {@link TAP_SLOP_PX} is a drag (a swipe, a pan, a zoom) and never a tap. That is
 *   the test the callers used to make with state (`wasSwiping`, `offsetX`) which a fresh mount had already reset.
 * - A gesture that ever had two pointers down is a pinch and never a tap.
 * - The click that follows an answered tap is swallowed in the capture phase, so a control stacked under the same
 *   coordinates (the dimmer that dismisses a modal, the stage behind the media) cannot act on one gesture twice.
 */
export function useTapActivation({ onTap, activateOnClick = false }: TapActivationOptions): TapActivationHandlers {
  const pressRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const pointersDownRef = useRef(0);
  const lastActivationRef = useRef(0);

  const activate = (): boolean => {
    const now = Date.now();
    if (now - lastActivationRef.current < ACTIVATION_WINDOW_MS) return false;
    lastActivationRef.current = now;
    onTap();
    return true;
  };

  return {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      pointersDownRef.current += 1;
      pressRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    },
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
      const press = pressRef.current;
      // Read before decrementing: a second finger was down during this gesture, so it is a pinch, not a tap.
      const pinched = pointersDownRef.current > 1;
      pointersDownRef.current = Math.max(0, pointersDownRef.current - 1);
      pressRef.current = null;
      // Only the pointer that went down here, and only if it stayed put: a swipe is not a tap.
      if (!press || press.id !== event.pointerId || pinched) return;
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > TAP_SLOP_PX) return;
      activate();
    },
    // A cancelled pointer (the browser took the gesture for a scroll, or a pinch) never was a tap.
    onPointerCancel: () => {
      pressRef.current = null;
      pointersDownRef.current = 0;
    },
    onClickCapture: (event: ReactMouseEvent<HTMLElement>) => {
      // The tap was already answered on `pointerup`: this is that gesture's click, not a second tap. Swallowing it in
      // the capture phase keeps it away from every handler above as well as the one on this element.
      if (Date.now() - lastActivationRef.current < ACTIVATION_WINDOW_MS) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
      // A click with no press behind it is a tap of its own only where the caller asked for that (a focusable
      // control); everywhere else it may be the click a swipe left behind and must be left alone.
      if (activateOnClick && activate()) event.stopPropagation();
    },
  };
}
