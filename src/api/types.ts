import type { ConsistencyAction } from '../shared/providers/DataReloader';

export type FetchOptions = Partial<Parameters<typeof fetch>[1]> & {
  consistencyAction?: ConsistencyAction;
  /** When set, successful non-GET responses also invalidate `/activity` + `/frontpage/*` queries. */
  invalidateActivityFeed?: boolean;
  /**
   * When set, transient network failures (`TypeError: Failed to fetch`, e.g. a
   * mobile device switching between cellular and WiFi mid-request) are retried
   * with exponential backoff. Only enable this for operations that are safe to
   * retry (idempotent, or where a duplicate is acceptable) — the request may
   * have reached the server even though the response was lost.
   */
  retryOnNetworkError?: boolean;
};
