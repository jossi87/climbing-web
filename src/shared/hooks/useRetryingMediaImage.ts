import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_ATTEMPTS = 2;
const BASE_RETRY_DELAY_MS = 2000;

/**
 * Retries loading a media image a bounded number of times before giving up.
 *
 * Media tiles are served by an on-demand generation pipeline: the first request for a
 * given size blocks until the variant is generated and cached in S3. If that request is
 * aborted (server briefly busy, mobile network switch, user navigated away) the `<img>`
 * fires `error` even though the variant now exists. Re-mounting the element a moment
 * later (via `key`) usually succeeds instead of leaving a broken tile or a placeholder.
 *
 * Usage:
 * ```tsx
 * const retry = useRetryingMediaImage();
 * if (retry.showPlaceholder) return <Placeholder />;
 * return retry.isRetrying ? <div /> : <img key={retry.key} src={src} onError={retry.onError} />;
 * ```
 */
export function useRetryingMediaImage() {
  const [attempt, setAttempt] = useState(0);
  const [errored, setErrored] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const timerRef = useRef<number | null>(null);

  const onError = useCallback(() => {
    setErrored(true);
  }, []);

  useEffect(() => {
    if (!errored || gaveUp) return;
    const delay = BASE_RETRY_DELAY_MS * (attempt + 1);
    timerRef.current = window.setTimeout(() => {
      if (attempt + 1 >= MAX_ATTEMPTS) setGaveUp(true);
      else setAttempt((a) => a + 1);
      setErrored(false);
    }, delay);
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [errored, attempt, gaveUp]);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  return {
    /** Bind as `key` on the `<img>`: bumping it remounts the element and re-requests the URL. */
    key: attempt,
    /** Bind as `onError`. */
    onError,
    /** True once all retries are exhausted — render the permanent placeholder instead of the image. */
    showPlaceholder: gaveUp,
    /** True while waiting to retry — hide the broken image (show a neutral tile) for the short wait. */
    isRetrying: errored && !gaveUp,
  };
}
