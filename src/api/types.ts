import type { ConsistencyAction } from '../shared/providers/DataReloader';

export type FetchOptions = Partial<Parameters<typeof fetch>[1]> & {
  consistencyAction?: ConsistencyAction;
  /** When set, successful non-GET responses also invalidate `/activity` + `/frontpage/*` queries. */
  invalidateActivityFeed?: boolean;
};
