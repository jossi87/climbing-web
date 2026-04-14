import { lazy as reactLazy, type ComponentType } from 'react';
import { captureSentryException, captureSentryMessage } from './sentry';

const lazyRetry = function <P>(componentImport: () => Promise<{ default: ComponentType<P> }>, componentName: string) {
  const key = `retry-lazy-refreshed/${componentName}`;

  return new Promise<{ default: ComponentType<P> }>((resolve, reject) => {
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
          captureSentryException(error, extra);
          reject(error);
        } else {
          captureSentryMessage('Failed to load chunk', { componentName, error: String(error) });
          window.sessionStorage.setItem(key, String(Date.now()));
          window.location.reload();
        }
      });
  });
};

export const lazy = <P>(componentImport: () => Promise<{ default: ComponentType<P> }>, componentName: string) => {
  const Component = reactLazy(() => lazyRetry(componentImport, componentName));

  const PreloadableComponent = Component as typeof Component & {
    preload: () => Promise<{ default: ComponentType<P> }>;
  };

  PreloadableComponent.preload = componentImport;

  return PreloadableComponent;
};
