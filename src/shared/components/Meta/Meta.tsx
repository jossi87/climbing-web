import type { ReactNode } from 'react';
import { useData } from '../../../api';
import { type Metadata } from './context';
import { MetaContext } from './context';

type Props = {
  children: ReactNode;
};

/**
 * Module level on purpose: an inline `select` is a new function on every render, so React Query re-ran it each time.
 *
 * `languages` is optional in the response schema, so normalise it to `[]`: consumers read it as a non-nullable list
 * (see `Metadata`).
 */
const selectNormalisedMeta = (data: Metadata) => {
  if (!data.languages) {
    data.languages = [];
  }
  if (data.faYears) {
    data.faYears.sort((a, b) => a - b);
  }
  return data;
};

export const MetaProvider = ({ children }: Props) => {
  const { data: meta, isPending } = useData<Metadata>(`/meta`, {
    select: selectNormalisedMeta,
    staleTime: Infinity,
  });

  if (isPending || !meta) {
    return null;
  }

  return <MetaContext.Provider value={meta}>{children}</MetaContext.Provider>;
};
