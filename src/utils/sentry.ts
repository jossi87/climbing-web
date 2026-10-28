type SentryModule = typeof import('@sentry/react');

let sentryPromise: Promise<SentryModule> | null = null;
let sentryInitRequested = false;
let sentryStarted = false;
let sentryEnvironment: string | undefined;

function loadSentry(): Promise<SentryModule> {
  sentryPromise ??= import('@sentry/react');
  return sentryPromise;
}

/**
 * Download, parse and start the SDK. Idempotent: several triggers (a captured error, an uncaught one, the
 * interaction warm-up) race here, and only the first caller pays for it.
 *
 * Starting it also wires `init` before any `captureException` callback runs — both hang off the same module promise,
 * so the `init` callback (registered first) is always flushed first. Our own global listeners come off here: once
 * `init` has run, the SDK's `GlobalHandlers` integration installs the same pair, and leaving both in place would
 * report every uncaught error twice.
 */
function startSentry() {
  if (sentryStarted) return;
  sentryStarted = true;
  if (typeof window !== 'undefined') {
    // Only the browser installed them; keeps this module callable from a prerender/SSR pass.
    stopWatchingForErrors();
    stopWatchingForInteraction();
  }

  void loadSentry()
    .then(({ init, browserTracingIntegration }) => {
      init({
        dsn: 'https://32152968271f46afa0efa8608b252e42@o4505452714786816.ingest.sentry.io/4505452716556288',
        integrations: [browserTracingIntegration()],
        environment: sentryEnvironment ?? 'unknown',
        tracesSampleRate: sentryEnvironment === 'production' ? 0.1 : 1.0,
      });
    })
    .catch(() => undefined);
}

/**
 * A request that only needs the SDK **if something goes wrong**.
 *
 * `@sentry/react` is the single largest chunk in the build (448 KB raw / 148 KB brotli) and renders nothing, so
 * booting it at startup — or right after `load`, as this module used to — still cost every visit ~135 KB of transfer:
 * an idle-timeout boot fires inside the LCP window on a slow device, and PageSpeed's *unused JavaScript* audit counts
 * every script in the trace, however late it was fetched. It flagged 104 KB of the SDK as never executed, which is
 * simply true — an anonymous frontpage visit executes none of the token, PKCE or transport code.
 *
 * So the SDK is now pulled by **evidence that we need it**, from three triggers that all funnel into
 * {@link startSentry}:
 *
 * 1. `captureSentryException` / `captureSentryMessage` — the app's own reporting calls (failed mutations, editor
 *    errors, chunk load failures). They boot it before the report is sent, so a captured error is never dropped.
 * 2. Uncaught `error` / `unhandledrejection` — the listeners installed below. We do not wait for the SDK to report
 *    these: the listener boots it *and* sends the event through the same queue, so the first uncaught error of a
 *    session is reported instead of being lost while a chunk downloads.
 * 3. First real interaction (`pointerdown` / `keydown` / `touchstart`), deferred to an idle slot. Nobody interacts
 *    with a page they are only measuring — Lighthouse and PageSpeed never do — so this keeps the SDK out of the
 *    measured window while a real visitor still gets breadcrumbs and tracing from their first tap onwards.
 *
 * Trade-offs, both deliberate: the initial pageload transaction is no longer traced (`browserTracingIntegration`
 * cannot see a pageload that happened before `init`), and interactions before the SDK lands have no breadcrumbs.
 * That is worth 135 KB on every page view; if tracing from the first byte ever becomes a hard requirement, the fix
 * is to put `@sentry/react` back in the entry chunk and pay exactly those bytes again.
 */
export function initSentry(environment?: string) {
  if (typeof window === 'undefined' || sentryInitRequested) return;
  sentryInitRequested = true;
  sentryEnvironment = environment;

  window.addEventListener('error', onWindowError, true);
  window.addEventListener('unhandledrejection', onUnhandledRejection);
  watchForInteraction();
}

/** Uncaught errors, plus script/resource load failures. */
function onWindowError(event: ErrorEvent) {
  // The capture phase also sees resource errors, which arrive as a plain `Event` and carry nothing reportable.
  if (!(event instanceof ErrorEvent)) return;
  captureSentryException(event.error ?? event.message, { source: 'window.error' });
}

function onUnhandledRejection(event: PromiseRejectionEvent) {
  captureSentryException(event.reason, { source: 'unhandledrejection' });
}

function stopWatchingForErrors() {
  window.removeEventListener('error', onWindowError, true);
  window.removeEventListener('unhandledrejection', onUnhandledRejection);
}

/**
 * Boot the SDK in an idle slot after the visitor proves they are *using* the page, not measuring it.
 *
 * Scroll is deliberately absent: it fires during load in some embedded browsers and on programmatic scrolls. All
 * three listeners are `once` and removed by the first one that fires, so a burst of taps cannot queue several boots.
 */
const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const;

function watchForInteraction() {
  for (const type of INTERACTION_EVENTS) {
    window.addEventListener(type, onFirstInteraction, { once: true, passive: true });
  }
}

function stopWatchingForInteraction() {
  for (const type of INTERACTION_EVENTS) {
    window.removeEventListener(type, onFirstInteraction);
  }
}

function onFirstInteraction() {
  stopWatchingForInteraction();
  if (sentryStarted) return;

  if ('requestIdleCallback' in window) {
    (
      window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout?: number }) => number }
    ).requestIdleCallback(startSentry, { timeout: 5000 });
  } else {
    globalThis.setTimeout(startSentry, 2000);
  }
}

export function captureSentryException(error: unknown, extra?: Record<string, unknown>) {
  startSentry();
  void loadSentry()
    .then(({ captureException }) => {
      captureException(error, extra ? { extra } : undefined);
    })
    .catch(() => undefined);
}

export function captureSentryMessage(message: string, extra?: Record<string, unknown>) {
  startSentry();
  void loadSentry()
    .then(({ captureMessage }) => {
      captureMessage(message, extra ? { extra } : undefined);
    })
    .catch(() => undefined);
}
