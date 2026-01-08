import { createContext, useContext, useMemo } from 'react';
import type { Metadata } from './defaultMeta';

export const MetaContext = createContext<Metadata | undefined>(undefined);

export const useMeta = (): Metadata => {
  const metadata = useContext(MetaContext);
  if (!metadata) {
    throw new Error('useMeta() can only be used inside of <MetaProvider />');
  }
  return metadata;
};

export const useGrades = () => {
  const { grades } = useMeta();
  return useMemo(() => {
    const easyToHard = grades.map(({ grade }) => grade);
    const indexMapping = grades.reduce<Record<string, number>>(
      (acc, { grade }, i) => ({ ...acc, [grade]: i }),
      {},
    );
    const idToGrade = grades.reduce<Record<number, string>>(
      (acc, { grade, id }) => ({ ...acc, [id]: grade }),
      {},
    );
    return { easyToHard, mapping: indexMapping, idToGrade };
  }, [grades]);
};

export const useFaYears = () => {
  return useMeta().faYears;
};
