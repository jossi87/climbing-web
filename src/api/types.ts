import type { ConsistencyAction } from '../shared/providers/DataReloader';

export type FetchOptions = Partial<Parameters<typeof fetch>[1]> & {
  consistencyAction?: ConsistencyAction;
};
