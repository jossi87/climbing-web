import { createContext, useContext, useMemo } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';

/**
 * Non-nullable version of the swagger Meta schema.
 * The provider only renders children once the API response is available,
 * so consumers never deal with optional fields or loading state.
 *
 * `mediaIdentity` is kept optional since not all users have a profile picture.
 */
export type Metadata = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userId?: number;
  authenticatedName: string;
  themePreference?: string;
  mediaIdentity?: components['schemas']['MediaIdentity'];
  title: string;
  grades: {
    id: number;
    grade: string;
    labelCompact?: string;
    color?: string;
  }[];
  faYears: number[];
  defaultZoom: number;
  defaultCenter: { lat: number; lng: number };
  isBouldering: boolean;
  isClimbing: boolean;
  isIce: boolean;
  url: string;
  types: {
    id: number;
    type: string;
    subType: string;
  }[];
  regions: {
    group: string;
    name: string;
    url: string;
    outline: components['schemas']['Coordinates'][];
    active: boolean;
  }[];
  compassDirections: {
    id: number;
    direction: string;
  }[];
};

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
