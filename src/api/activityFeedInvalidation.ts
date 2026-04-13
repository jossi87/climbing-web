import type { QueryClient } from '@tanstack/react-query';

/** Dispatched after successful writes that affect the global activity feed or frontpage tiles (see {@link invalidateActivityAndFrontpageQueries}). */
export const ACTIVITY_AND_FRONTPAGE_INVALIDATION_EVENT = 'brattelinjer/invalidate-activity-frontpage';

/**
 * Latest-activity (`/activity`) and frontpage stats / random media (`/frontpage/*`) must refetch after ticks, comments,
 * media, or area/sector/problem edits. Portaled menus and `consistencyAction: 'nop'` saves skip a full cache sweep.
 */
export function invalidateActivityAndFrontpageQueries(client: QueryClient) {
  return client.invalidateQueries({
    predicate: (q) => {
      const key = q.queryKey;
      if (!Array.isArray(key) || typeof key[0] !== 'string') return false;
      const prefix = key[0];
      return prefix === '/activity' || prefix === '/frontpage/stats' || prefix === '/frontpage/random_media';
    },
  });
}
