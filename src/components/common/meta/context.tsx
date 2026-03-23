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
    const easyToHard: string[] = [];
    const mapping: Record<string, number> = {};
    const idToGrade: Record<number, string> = {};
    for (let i = 0; i < grades.length; i++) {
      const { grade, id } = grades[i];
      easyToHard.push(grade);
      mapping[grade] = i;
      idToGrade[id] = grade;
    }

    return { easyToHard, mapping, idToGrade };
  }, [grades]);
};

export const useFaYears = () => {
  return useMeta().faYears;
};
