import type { ReactNode } from 'react';
import { useData } from '../../../api';
import { DEFAULT_META, type Metadata } from './defaultMeta';
import { MetaContext } from './context';

type Props = {
  children: ReactNode;
};

export const MetaProvider = ({ children }: Props) => {
  const { data: meta } = useData<Metadata>(`/meta`, {
    select: (data) => {
      if (data.faYears) {
        data.faYears.sort((a, b) => a - b);
      }
      return data;
    },
    staleTime: Infinity,
  });
  const contextValue = meta ?? DEFAULT_META;
  return <MetaContext.Provider value={contextValue}>{children}</MetaContext.Provider>;
};
