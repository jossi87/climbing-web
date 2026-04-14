type SentryModule = typeof import('@sentry/react');

let sentryModulePromise: Promise<SentryModule> | null = null;
let sentryInitRequested = false;

function getSentry(): Promise<SentryModule> {
  sentryModulePromise ??= import('@sentry/react');
  return sentryModulePromise;
}

export function initSentry(environment?: string) {
  if (typeof window === 'undefined' || sentryInitRequested) return;
  sentryInitRequested = true;

  const start = () => {
    void getSentry()
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
      window as Window & { requestIdleCallback: (callback: () => void, opts?: { timeout?: number }) => number }
    ).requestIdleCallback(start, { timeout: 4500 });
  } else {
    globalThis.setTimeout(start, 1200);
  }
}

export function captureSentryException(error: unknown, context?: Record<string, unknown>) {
  void getSentry()
    .then(({ captureException }) => {
      captureException(error, context ? { extra: context } : undefined);
    })
    .catch(() => undefined);
}

export function captureSentryMessage(message: string, context?: Record<string, unknown>) {
  void getSentry()
    .then(({ captureMessage }) => {
      captureMessage(message, context ? { extra: context } : undefined);
    })
    .catch(() => undefined);
}
