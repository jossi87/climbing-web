import { captureSentryMessage } from './sentry';

export const neverGuard = <T,>(value: never, def: T): T => {
  if (import.meta.env.DEV) {
    throw new Error(`Impossible situation occurred: ${value}`);
  }
  captureSentryMessage('neverGuard executed', { value: String(value) });
  return def;
};
