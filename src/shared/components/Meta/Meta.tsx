import type { ReactNode } from 'react';
import { useData } from '../../../api';
import { type Metadata } from './context';
import { MetaContext } from './context';

type Props = {
  children: ReactNode;
};

export const MetaProvider = ({ children }: Props) => {
  const { data: meta, isPending } = useData<Metadata>(`/meta`, {
    select: (data) => {
      if (data.faYears) {
        data.faYears.sort((a, b) => a - b);
      }
      return data;
    },
    staleTime: Infinity,
  });

  if (isPending || !meta) {
    return null;
  }

  return <MetaContext.Provider value={meta}>{children}</MetaContext.Provider>;
};
