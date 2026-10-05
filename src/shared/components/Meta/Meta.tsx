import type { ReactNode } from 'react';
import { useData } from '../../../api';
import { type Metadata } from './context';
import { MetaContext } from './context';

type Props = {
  children: ReactNode;
};

/** Module level on purpose: an inline `select` is a new function on every render, so React Query re-ran it each time. */
const selectSortedFaYears = (data: Metadata) => {
  if (data.faYears) {
    data.faYears.sort((a, b) => a - b);
  }
  return data;
};

export const MetaProvider = ({ children }: Props) => {
  const { data: meta, isPending } = useData<Metadata>(`/meta`, {
    select: selectSortedFaYears,
    staleTime: Infinity,
  });

  if (isPending || !meta) {
    return null;
  }

  return <MetaContext.Provider value={meta}>{children}</MetaContext.Provider>;
};
