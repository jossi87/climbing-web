import { useQueryClient } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

export const DATA_MUTATION_EVENT = 'brattelinjer/refetch';

const HANDLERS = {
  nop: async (..._args: unknown[]) => {
    if (import.meta.env.REACT_APP_ENV === 'development') {
      console.warn('DataReloader: stubbed-out reload', ..._args);
    }
  },
  invalidate: (client: ReturnType<typeof useQueryClient>) =>
    client.invalidateQueries({ predicate: () => true }),
  refetch: (client: ReturnType<typeof useQueryClient>) =>
    client.refetchQueries({ predicate: () => true }),
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
export const DataReloader = ({ children }: { children: ReactNode }) => {
  const client = useQueryClient();
  useEffect(() => {
    const onEvent = (event: Event) => {
      const ce = event as CustomEvent | undefined;
      const mode = ce?.detail?.mode ?? 'nop';
      const key = (mode in HANDLERS ? mode : 'nop') as keyof typeof HANDLERS;
      HANDLERS[key]?.(client);
    };

    window.addEventListener(DATA_MUTATION_EVENT, onEvent as EventListener);
    return () => {
      window.removeEventListener(DATA_MUTATION_EVENT, onEvent as EventListener);
    };
  }, [client]);

  return children;
};
