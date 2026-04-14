type SentryModule = typeof import('@sentry/react');

let sentryPromise: Promise<SentryModule> | null = null;
let sentryInitRequested = false;

function loadSentry(): Promise<SentryModule> {
  sentryPromise ??= import('@sentry/react');
  return sentryPromise;
}

export function initSentry(environment?: string) {
  if (typeof window === 'undefined' || sentryInitRequested) return;
  sentryInitRequested = true;

  const boot = () => {
    void loadSentry()
      .then(({ init, browserTracingIntegration }) => {
        init({
          dsn: 'https://32152968271f46afa0efa8608b252e42@o4505452714786816.ingest.sentry.io/4505452716556288',
          integrations: [browserTracingIntegration()],
          environment: environment ?? 'unknown',
          tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        });
      })
      .catch(() => undefined);
  };

  if ('requestIdleCallback' in window) {
    (
      window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout?: number }) => number }
    ).requestIdleCallback(boot, { timeout: 4000 });
  } else {
    globalThis.setTimeout(boot, 1200);
  }
}

export function captureSentryException(error: unknown, extra?: Record<string, unknown>) {
  void loadSentry()
    .then(({ captureException }) => {
      captureException(error, extra ? { extra } : undefined);
    })
    .catch(() => undefined);
}

export function captureSentryMessage(message: string, extra?: Record<string, unknown>) {
  void loadSentry()
    .then(({ captureMessage }) => {
      captureMessage(message, extra ? { extra } : undefined);
    })
    .catch(() => undefined);
}
