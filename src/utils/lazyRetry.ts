import { lazy as reactLazy } from 'react';
import * as Sentry from '@sentry/react';

const lazyRetry = function (
  componentImport: Parameters<typeof reactLazy>[0],
  componentName: string,
) {
  const key = `retry-lazy-refreshed/${componentName}`;

  return new Promise<Awaited<ReturnType<typeof componentImport>>>((resolve, reject) => {
    const data = window.sessionStorage.getItem(key);
    const refreshTime = data ? +data : 0;

    componentImport()
      .then((component) => {
        window.sessionStorage.removeItem(key);
        resolve(component);
      })
      .catch((error) => {
        if (refreshTime) {
          const extra: Record<string, unknown> = { componentName };
          for (let i = 0; i < sessionStorage.length; i += 1) {
            const itemKey = sessionStorage.key(i);
            if (itemKey?.startsWith('retry-lazy-refreshed/')) {
              extra[itemKey] = sessionStorage.getItem(itemKey);
            }
          }
          Sentry.captureException(error, { extra });
          reject(error);
        } else {
          Sentry.captureMessage('Failed to load chunk', {
            extra: { componentName, error },
          });
          window.sessionStorage.setItem(key, String(Date.now()));
          window.location.reload();
        }
      });
  });
};

export const lazy = (componentImport: Parameters<typeof reactLazy>[0], componentName: string) => {
  const Component = reactLazy(() => lazyRetry(componentImport, componentName));

  (Component as any).preload = componentImport;

  return Component as typeof Component & { preload: () => Promise<any> };
};
