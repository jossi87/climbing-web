import type { components } from '../../@types/buldreinfo/swagger';
import { saveFile } from '../../utils/saveFile';
import { buildXlsx, type XlsxCell, type XlsxSheet } from '../../utils/xlsx';
import { startingAltitudeOf } from './startingAltitude';

/**
 * The export button's client-side path: writes the rows the filter leaves (what the list is showing) as a workbook,
 * instead of asking the API for the whole catalogue.
 *
 * The sheet mirrors the API's own `/toc/xlsx` export (`MetaController.writeSheetToc`) — same tab name, same column
 * labels, same discipline-dependent FA/FFA columns, same file name pattern — so both downloads read alike. What it
 * adds is `ASCENTS`, and what it fills in is `STARTING_ALTITUDE` (the map elevation where a problem has no registered
 * one, see {@link startingAltitudeOf}). What it does not have is the second sheet with the individual pitches of
 * multi-pitch routes: that data comes from a separate API call (`/toc/pitches`) and is not part of the filtered list.
 */

type Toc = components['schemas']['Toc'];
type TocProblem = components['schemas']['TocProblem'];

/** Tab name of the API's export; the filtered workbook is that same sheet, narrowed. */
const SHEET_NAME = 'TOC';

const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Column widths in Excel's character units, by column label. Without them every column opens at the default width,
 * which hides exactly the two long columns (the URL and the description).
 */
const COLUMN_WIDTHS: Record<string, number> = {
  REGION: 18,
  URL: 48,
  AREA: 22,
  SECTOR: 22,
  NR: 6,
  NAME: 30,
  GRADE: 9,
  FA_YEAR: 9,
  LENGTH_METER: 14,
  STARTING_ALTITUDE: 18,
  TYPE: 22,
  PITCHES: 9,
  FA_USER: 18,
  FFA_USER: 18,
  FFA_YEAR: 10,
  STARS: 7,
  ASCENTS: 9,
  DESCRIPTION: 60,
};

export type TocExportOptions = {
  /** Bouldering rows carry only the first free ascent and no pitch count — the split the API export makes too. */
  isBouldering: boolean;
  /** Absolute origin `TocProblem.url` is relative to, so the URL column is clickable outside the site. */
  origin: string;
};

/**
 * Column order of the API's sheet (the order it writes its labels in), plus `ASCENTS` right before the description.
 * A row is filled label by label, so this list is the one place the layout is decided.
 */
const columnsOf = (isBouldering: boolean): string[] => [
  'REGION',
  'URL',
  'AREA',
  'SECTOR',
  'NR',
  'NAME',
  'GRADE',
  'FA_YEAR',
  'LENGTH_METER',
  'STARTING_ALTITUDE',
  'TYPE',
  ...(isBouldering ? [] : ['PITCHES']),
  'FA_USER',
  ...(isBouldering ? [] : ['FFA_USER', 'FFA_YEAR']),
  'STARS',
  'ASCENTS',
  'DESCRIPTION',
];

/** `TocProblem.url` is a site path (`/problem/123/name`); the export needs a target that works from a spreadsheet. */
const absoluteUrl = (origin: string, path: string | undefined): string => {
  const relative = path ?? '';
  return relative.startsWith('/') ? `${origin}${relative}` : `${origin}/${relative}`;
};

/**
 * One row, keyed by column label.
 *
 * The FA/FFA columns follow the discipline: a boulder rarely has a separate aid ascent, so the API's bouldering sheet
 * writes the first *free* ascent into `FA_YEAR`/`FA_USER` and skips the `FFA_*` pair, while routes get both. `null`
 * leaves the cell empty, which is what an unknown year/altitude should read as.
 *
 * `STARTING_ALTITUDE` is the number the list shows, not just the registered field: a problem without one falls back to
 * its map elevation ({@link startingAltitudeOf}), which is what the altitude filter already matches on — a downloaded
 * row can therefore carry a value in a column the API's own sheet would leave empty. It stays a plain number (no `~`)
 * so the column sorts and sums in Excel; the `~` on the page means "read from the map", which the empty registered
 * value already implies.
 */
const problemRecord = (
  problem: TocProblem,
  context: { region: string; area: string; sector: string; options: TocExportOptions },
): Record<string, XlsxCell> => {
  const { region, area, sector, options } = context;
  const { isBouldering, origin } = options;
  const url = absoluteUrl(origin, problem.url);
  const startingAltitude = startingAltitudeOf(problem);

  return {
    REGION: region,
    URL: { text: url, href: url },
    AREA: area,
    SECTOR: sector,
    NR: problem.nr ?? null,
    NAME: problem.name ?? '',
    GRADE: problem.grade ?? '',
    FA_YEAR: (isBouldering ? problem.ffaYear : problem.faYear) ?? null,
    LENGTH_METER: problem.lengthMeter ?? null,
    STARTING_ALTITUDE: startingAltitude?.meters ?? null,
    // “Boulder (Outdoor)”, the same label the list and the API's sheet use.
    TYPE: problem.t ? `${problem.t.type ?? ''} (${problem.t.subType ?? ''})` : '',
    ...(isBouldering ? {} : { PITCHES: Math.max(problem.numPitches ?? 1, 1) }),
    FA_USER: (isBouldering ? problem.ffaUser : problem.faUser) ?? null,
    ...(isBouldering ? {} : { FFA_USER: problem.ffaUser ?? null, FFA_YEAR: problem.ffaYear ?? null }),
    STARS: problem.stars ?? null,
    ASCENTS: problem.numTicks ?? null,
    DESCRIPTION: problem.description ?? '',
  };
};

/**
 * The workbook's only sheet: a header row plus one row per problem, in list order (region → area → sector → problem),
 * so the workbook reads like the page does.
 *
 * `filteredData` is what the caller passes in — this function never sees the unfiltered catalogue, which is what makes
 * the export match the screen.
 */
export const buildFilteredTocSheet = (data: Toc, options: TocExportOptions): XlsxSheet => {
  const columns = columnsOf(options.isBouldering);
  const rows: XlsxCell[][] = [columns];

  for (const region of data.regions ?? []) {
    for (const area of region.areas ?? []) {
      for (const sector of area.sectors ?? []) {
        for (const problem of sector.problems ?? []) {
          const record = problemRecord(problem, {
            region: region.name ?? '',
            area: area.name ?? '',
            sector: sector.name ?? '',
            options,
          });
          rows.push(columns.map((label) => record[label] ?? null));
        }
      }
    }
  }

  return {
    name: SHEET_NAME,
    rows,
    widths: columns.map((label) => COLUMN_WIDTHS[label] ?? null),
  };
};

/**
 * `20261028-134501_TOC.xlsx` — the name the API's export produces (`FilenameUtil.generateFilename`), so a filtered
 * workbook and a full one sit next to each other in the download folder under the same pattern.
 */
const filenameOf = (now: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}_TOC.xlsx`;
};

/** Writes the filtered table of contents to the user's downloads folder — no server round-trip, no auth token. */
export const downloadFilteredTocXlsx = (data: Toc, options: TocExportOptions): void => {
  saveFile(buildXlsx([buildFilteredTocSheet(data, options)]), filenameOf(new Date()), XLSX_MIME_TYPE);
};
