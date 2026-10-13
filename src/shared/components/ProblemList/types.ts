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
  /** Profile lists only: discipline name shown in the filter; absent for sector / area lists. */
  discipline?: string;
  /** Discipline flags — order the filter instead of comparing {@link discipline} names. */
  isBouldering?: boolean;
  isRopeClimbing?: boolean;
  isIceClimbing?: boolean;
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
 * Matches sector type summaries: Projects (grade 0), Broken, else the label the list producer filled in from the
 * database (`routeTypeLabel` → `type.subtype`, or `type.type` when that subtype is blank).
 */
export function rowListTypeKey(row: Row): string {
  if (row.broken) return 'Broken';
  if (row.gradeWeight === 0) return 'Projects';
  return row.subType;
}
