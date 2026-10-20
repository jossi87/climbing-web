import { createContext, useContext, useMemo } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';

export type Grade = {
  id: number;
  grade: string;
  labelMajor?: string;
  labelCompact?: string;
  weight?: number;
  color?: string;
};

export type GradeSystem = {
  id: number;
  name: string;
  grades: Grade[];
};

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
  /** The user's stored UI language preference; unset until they pick one. */
  languagePreference?: string;
  mediaIdentity?: components['schemas']['MediaIdentity'];
  title: string;
  /**
   * Every grade system the backend knows. Content opened from another region carries that region's grade system id,
   * so id lookups must resolve here even when the active region does not declare the system.
   */
  allGradeSystems: GradeSystem[];
  /** Ids of `allGradeSystems` declared by the active region; region-wide selectors must only offer these. */
  regionGradeSystemIds: number[];
  faYears: number[];
  defaultZoom: number;
  defaultCenter: { lat: number; lng: number };
  /** Default UI language of the region being viewed — not guaranteed to be one this bundle ships a catalog for. */
  defaultLanguage: string;
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
    id: number;
    discipline: string;
    isBouldering: boolean;
    isRopeClimbing: boolean;
    isIceClimbing: boolean;
    name: string;
    url: string;
    outline: components['schemas']['Coordinates'][];
    active: boolean;
  }[];
  /** Base maps offered by the active region (`region_map`); exactly one entry has `isDefault`. */
  maps: {
    id: number;
    name: string;
    url: string;
    attribution: string;
    maxZoom: number;
    isDefault: boolean;
  }[];
  compassDirections: {
    id: number;
    direction: string;
  }[];
  /** Every language the backend can serve; `LanguageSelect` intersects it with the shipped catalogs. */
  languages: {
    id: number;
    code: string;
    name: string;
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

/** Grade systems declared for the requesting region. */
export const useGradeSystems = () => {
  const { allGradeSystems, regionGradeSystemIds } = useMeta();
  return useMemo(
    () => allGradeSystems.filter((system) => regionGradeSystemIds.includes(system.id)),
    [allGradeSystems, regionGradeSystemIds],
  );
};

/**
 * The grade system with the given id — `undefined` for a mixed list (`0`) or an unknown id.
 *
 * Resolves from the complete catalogue so content from another region works too.
 */
export const useGradeSystem = (gradeSystemId: number | undefined) => {
  const allGradeSystems = useMeta().allGradeSystems;
  return useMemo(() => allGradeSystems.find((system) => system.id === gradeSystemId), [allGradeSystems, gradeSystemId]);
};

/**
 * Grade domain used to filter/sort a list.
 *
 * Pass the grade system id of the rows when they are known to share one (single-system list, or the area/sector
 * being edited). Without it — a region-wide list that may mix several systems — all grades of the region are
 * merged, deduplicated by grade label and ordered by weight, which keeps each system's own order intact.
 *
 * A positive id always means exactly that system; an unknown id yields an empty domain instead of widening to the
 * region's grades.
 */
export const useGrades = (gradeSystemId?: number) => {
  const gradeSystems = useGradeSystems();
  const scopedSystemId = gradeSystemId !== undefined && gradeSystemId > 0 ? gradeSystemId : undefined;
  const scopedSystem = useGradeSystem(scopedSystemId);

  return useMemo(() => {
    const easyToHard: string[] = [];
    const mapping: Record<string, number> = {};
    const idToGrade: Record<number, string> = {};
    const color: Record<string, string> = {};
    const weight: Record<string, number> = {};

    const grades = (scopedSystemId ? (scopedSystem ? [scopedSystem] : []) : gradeSystems)
      .flatMap((entry) => entry.grades)
      .filter(({ grade }) => grade !== undefined)
      .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

    for (const grade of grades) {
      const label = grade.grade!;
      /** Only the merged domain needs de-duplication; one system may legitimately repeat a label. */
      if (!scopedSystemId && mapping[label] !== undefined) continue;
      easyToHard.push(label);
      mapping[label] = easyToHard.length - 1;
      idToGrade[grade.id!] = label;
      color[label] = grade.color ?? '';
      weight[label] = grade.weight ?? 0;
    }

    return { easyToHard, mapping, idToGrade, color, weight };
  }, [gradeSystems, scopedSystem, scopedSystemId]);
};

export const useFaYears = () => {
  return useMeta().faYears;
};
