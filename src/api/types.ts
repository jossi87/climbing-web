import { ConsistencyAction } from '../components/DataReloader';

export type FetchOptions = Partial<Parameters<typeof fetch>[1]> & {
  consistencyAction?: ConsistencyAction;
};
