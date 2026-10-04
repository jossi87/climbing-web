import { normalizeSubType } from '../../../utils/routeTradGear';

export type Row = {
  element: React.ReactNode;
  areaName: string;
  sectorName: string;
  name: string;
  nr: number | null;
  grade: string;
  gradeWeight: number;
  stars: number;
  numTicks: number;
  ticked: boolean;
  rock: string;
  subType: string;
  /**
   * Profile lists only: the discipline the row belongs to (`type.group` — 'Bouldering' | 'Climbing' | 'Ice').
   * When present, {@link ProblemList} offers a multi-select discipline filter (default: all). Lists without a
   * discipline (sector / area) simply render no such control.
   */
  discipline?: string;
  /** Multi-pitch route count (only exposed for user todo lists; used for the "Only multipitch" filter). */
  numPitches?: number;
  /** Sector/area lists: used with {@link rowListTypeKey} for Broken grouping. */
  broken?: boolean;
  num: number;
  fa: boolean;
  faDate: string | null;
  marker?: {
    coordinates: { latitude: number; longitude: number };
    label: string;
    url: string;
  };
};

/**
 * Matches sector type summaries: Projects (grade 0), Broken, else the subtype — or «Boulder» when the problem has no
 * subtype (`type.subType` is null for plain boulders, see {@link normalizeSubType}).
 */
export function rowListTypeKey(row: Row): string {
  if (row.broken) return 'Broken';
  if (row.gradeWeight === 0) return 'Projects';
  return normalizeSubType(row.subType) || 'Boulder';
}
