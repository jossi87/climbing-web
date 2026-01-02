import { ReactNode } from 'react';
import { useData } from '../../../api';
import { DEFAULT_META, Metadata } from './defaultMeta';
import { MetaContext } from './context';

type Props = {
  children: ReactNode;
};

export const MetaProvider = ({ children }: Props) => {
  const { data: meta } = useData<Metadata>(`/meta`, {
    select: (data) => {
      data.faYears.sort((a, b) => a - b);
      return data;
    },
  });

  return <MetaContext.Provider value={meta || DEFAULT_META}>{children}</MetaContext.Provider>;
};
