import * as Sentry from '@sentry/react';

export const neverGuard = <T,>(value: never, def: T): T => {
  if (process.env.REACT_APP_ENV === 'development') {
    throw new Error(`Impossible situation occurred: ${value}`);
  }
  Sentry.captureMessage('neverGuard executed', { extra: { value } });
  return def;
};
