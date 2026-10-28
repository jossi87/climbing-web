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
 * Download, parse and start the SDK. Idempotent: the deferred boot and the "an error already happened" path below
 * race, and only the first caller wins.
 *
 * Starting it also wires `init` before any `captureException` callback runs — both hang off the same module promise,
 * so the `init` callback (registered first) is always flushed first.
 */
function startSentry() {
  if (sentryStarted) return;
  sentryStarted = true;

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
 * Start error/trace reporting **after** the page has loaded.
 *
 * `@sentry/react` is the single largest chunk in the build (448 KB raw / 148 KB brotli) and it is not needed to
 * render anything, so loading it during startup only delayed the first contentful paint: the previous
 * `requestIdleCallback(boot, { timeout: 4000 })` fired its timeout *inside* the LCP window on a slow device, because a
 * busy main thread never goes idle. Waiting for `load` and then for an idle slot keeps the SDK off the critical path
 * while still reporting everything `load` and later — and `captureSentryException`/`captureSentryMessage` boot the
 * SDK immediately, so an error thrown before that is never dropped.
 *
 * Trade-off: `browserTracingIntegration` no longer records the initial pageload transaction (it starts after `load`
 * has fired). Navigation and interaction spans, breadcrumbs and every error report are unaffected.
 */
export function initSentry(environment?: string) {
  if (typeof window === 'undefined' || sentryInitRequested) return;
  sentryInitRequested = true;
  sentryEnvironment = environment;

  const schedule = () => {
    if ('requestIdleCallback' in window) {
      (
        window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout?: number }) => number }
      ).requestIdleCallback(startSentry, { timeout: 5000 });
    } else {
      globalThis.setTimeout(startSentry, 2000);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
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
