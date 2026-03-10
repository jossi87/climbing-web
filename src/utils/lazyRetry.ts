import { lazy as reactLazy } from 'react';
import * as Sentry from '@sentry/react';

/**
 * This was heavily inspired by this blog post: https://www.codemzy.com/blog/fix-chunkloaderror-react
 */
const lazyRetry = function (
  componentImport: Parameters<typeof reactLazy>[0],
  componentName: string,
) {
  const key = `retry-lazy-refreshed/${componentName}`;

  return new Promise<Awaited<ReturnType<typeof componentImport>>>((resolve, reject) => {
    const refreshTime: number = (() => {
      const data = window.sessionStorage.getItem(key);
      if (!data) {
        return 0;
      }

      const timestamp = +data;
      if (Number.isNaN(timestamp)) {
        return 0;
      }

      return timestamp;
    })();

    componentImport()
      .then((component) => {
        window.sessionStorage.removeItem(key);
        resolve(component);
      })
      .catch((error) => {
        if (refreshTime) {
          const extra: Record<string, unknown> = {
            componentName,
          };

          for (let i = 0; i < sessionStorage.length; i += 1) {
            const itemKey = sessionStorage.key(i);
            if (!itemKey || !itemKey.startsWith('retry-lazy-refreshed/')) {
              continue;
            }

            extra[itemKey] = sessionStorage.getItem(itemKey);
          }

          Sentry.captureException(error, {
            extra,
          });
          reject(error);
        } else {
          Sentry.captureMessage('Failed to load chunk', {
            extra: {
              componentName,
              error,
            },
          });
          window.sessionStorage.setItem(key, String(Date.now())); // we are now going to refresh
          window.location.reload(); // refresh the page
        }
      });
  });
};

export const lazy = function (
  componentImport: Parameters<typeof reactLazy>[0],
  componentName: string,
) {
  return reactLazy(() => lazyRetry(componentImport, componentName));
};
