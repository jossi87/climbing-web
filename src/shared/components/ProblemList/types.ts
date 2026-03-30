export type Row = {
  element: React.ReactNode;
  areaName: string;
  sectorName: string;
  name: string;
  nr: number | null;
  gradeNumber: number;
  stars: number;
  numTicks: number;
  ticked: boolean;
  rock: string;
  subType: string;
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

/** Matches sector type summaries: Projects (grade 0), Broken, else subtype or «Boulders». */
export function rowListTypeKey(row: Row): string {
  if (row.broken) return 'Broken';
  if (row.gradeNumber === 0) return 'Projects';
  return row.subType || 'Boulders';
}
