import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const DATA_MUTATION_EVENT = 'brattelinjer/refetch';

const HANDLERS = {
  nop: async (...args) => {
    if (process.env.REACT_APP_ENV === 'development') {
      console.debug('DataReloader: stubbed-out reload', ...args);
    }
  },
  invalidate: (client) => client.invalidateQueries({ predicate: () => true }),
  refetch: (client) => client.refetchQueries({ predicate: () => true }),
} as const;

export type ConsistencyAction = keyof typeof HANDLERS;

/**
 * Take a possibly-overly-conservative approach to data consistency: whenever
 * there's a {@code DATA_MUTATION_EVENT} broadcast, ensure that the cached data
 * is consistent, by whatever is requested in the event.
 *
 * This is a bit aggressive, but until we get the data consistency under
 * control, this is the simplest way to ensure that the UI remains correct. In
 * the future, we should be able to use {@code @tanstack/react-query}'s
 * functionalities to directly update the cache after mutations. However, that
 * day is not today, and the side-effects are too deeply-wired to invalidate
 * query-by-query.
 *
 * So, here we are!
 */
export const DataReloader = ({ children }: { children: React.ReactNode }) => {
  const client = useQueryClient();
  useEffect(() => {
    const onEvent = (event: CustomEvent) => {
      const mode = event?.detail?.mode ?? 'nop';
      HANDLERS[mode in HANDLERS ? mode : 'nop']?.(client);
    };

    window.addEventListener(DATA_MUTATION_EVENT, onEvent);
    return () => {
      window.removeEventListener(DATA_MUTATION_EVENT, onEvent);
    };
  }, [client]);

  return children;
};
