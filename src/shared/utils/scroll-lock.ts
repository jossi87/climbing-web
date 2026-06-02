import { useEffect } from 'react';

/**
 * Scroll-lock counter.
 *
 * Multiple components (MediaModal, ZoomableImage) may independently request the body/html
 * scrollbar to be hidden.  A simple save/restore of `document.body.style.overflow` in each
 * component is fragile because the saved value may already be `'hidden'` set by a parent
 * component, and restoring it on unmount would leave the page unscrollable.
 *
 * Instead we use a ref-counted approach: the first caller locks, the last caller unlocks.
 * This guarantees that scrollbars are restored only when **all** lock-holders have released.
 */

let lockCount = 0;
let prevBodyOverflow = '';
let prevHtmlOverflow = '';

/** Increment the scroll-lock counter.  Locks body/html overflow on the first call. */
export function lockScroll(): void {
  if (lockCount === 0) {
    prevBodyOverflow = document.body.style.overflow;
    prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  lockCount++;
}

/** Decrement the scroll-lock counter.  Restores overflow on the last call. */
export function unlockScroll(): void {
  if (lockCount === 0) {
    // Safety net – should not happen, but avoid negative counts.
    return;
  }
  lockCount--;
  if (lockCount === 0) {
    document.body.style.overflow = prevBodyOverflow;
    document.documentElement.style.overflow = prevHtmlOverflow;
  }
}

/**
 * React hook that locks scroll on mount and unlocks on unmount.
 * Safe to use in nested components – the scroll is only restored when
 * the last component using this hook unmounts.
 */
export function useScrollLock(): void {
  useEffect(() => {
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, []);
}
