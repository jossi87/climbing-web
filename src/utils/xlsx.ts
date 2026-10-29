import { createZip, type ZipEntry } from './zip';

/**
 * A minimal XLSX (SpreadsheetML) writer: a header row per sheet plus data rows, with a bold and frozen header, an
 * auto-filter over the used range, optional column widths, and clickable link cells.
 *
 * Written by hand rather than pulled from a spreadsheet library: the export needs exactly one kind of sheet, and such a
 * library would add hundreds of kilobytes to the bundle for one button. A reader only needs a ZIP holding a handful of
 * XML parts — `[Content_Types].xml`, package/workbook relationships, workbook, styles, worksheets.
 *
 * Text is written as **inline strings** (`t="inlineStr"`) instead of a shared-string table: one part less to keep in
 * sync with the cells, and every spreadsheet app reads them.
 */

/** One cell. `null`/`undefined`/`''` leaves the cell out of the row — a sparse row, which reads as empty. */
export type XlsxCell = string | number | null | undefined | { text: string; href: string };

export type XlsxSheet = {
  /** Tab name. Excel allows 31 characters and none of `[]:*?/\`; anything else is replaced (see `sheetNameOf`). */
  name: string;
  /**
   * Rows in order. **The first row is the header**: it is written bold, frozen, and its extent becomes the sheet's
   * auto-filter range.
   */
  rows: XlsxCell[][];
  /** Column widths in Excel's character units, by column index. A missing/`null` entry keeps the default width. */
  widths?: (number | null)[];
};

const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const NS_RELATIONSHIPS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const NS_PACKAGE_RELATIONSHIPS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';

const REL_OFFICE_DOCUMENT = `${NS_RELATIONSHIPS}/officeDocument`;
const REL_WORKSHEET = `${NS_RELATIONSHIPS}/worksheet`;
const REL_STYLES = `${NS_RELATIONSHIPS}/styles`;
const REL_HYPERLINK = `${NS_RELATIONSHIPS}/hyperlink`;

const CONTENT_TYPE_RELATIONSHIPS = 'application/vnd.openxmlformats-package.relationships+xml';
const CONTENT_TYPE_WORKBOOK = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml';
const CONTENT_TYPE_WORKSHEET = 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml';
const CONTENT_TYPE_STYLES = 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml';

/** SpreadsheetML is XML, so every text node and attribute value has to be escaped. */
const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

/**
 * Text safe to drop into the package: characters XML 1.0 cannot represent at all — the C0 control characters, which a
 * markdown description can still carry — are dropped first, then the five markup characters are escaped.
 *
 * The control characters are the *point* of the rule, hence the disable: a spreadsheet that carries one is not merely
 * ugly, Excel refuses to open it.
 */
const escapeXml = (value: string): string =>
  // eslint-disable-next-line no-control-regex
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);

/** `0` → `A`, `25` → `Z`, `26` → `AA`: the spreadsheet's bijective base-26 column names. */
const columnName = (index: number): string => {
  let name = '';
  for (let rest = index + 1; rest > 0; rest = Math.floor((rest - 1) / 26)) {
    name = String.fromCharCode(65 + ((rest - 1) % 26)) + name;
  }
  return name;
};

/** What Excel accepts as a tab name: at most 31 characters and none of `[]:*?/\`. */
const sheetNameOf = (name: string): string => name.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31) || 'Sheet';

/** Index into `styles.xml`'s `cellXfs`: `1` is the bold header format (index `0` is the default one). */
const STYLE_HEADER = 1;

type SheetParts = {
  xml: string;
  /** Relationship part listing the cell hyperlinks, or `null` when the sheet has none. */
  rels: string | null;
};

const buildSheet = (sheet: XlsxSheet): SheetParts => {
  const rows: string[] = [];
  /** Hyperlink targets in document order: the n-th one is `rId{n}` of this sheet's relationship part. */
  const links: { ref: string; href: string }[] = [];

  sheet.rows.forEach((cells, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const style = rowIndex === 0 ? ` s="${STYLE_HEADER}"` : '';
    const cellXml: string[] = [];

    cells.forEach((cell, cellIndex) => {
      const ref = `${columnName(cellIndex)}${rowNumber}`;

      if (typeof cell === 'number') {
        // `NaN`/`Infinity` have no cell representation, and an unknown value is already expressed by leaving it out.
        if (!Number.isFinite(cell)) return;
        cellXml.push(`<c r="${ref}"${style}><v>${cell}</v></c>`);
        return;
      }

      const text = typeof cell === 'string' ? cell : (cell?.text ?? '');
      if (!text) return;
      cellXml.push(`<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`);

      const href = typeof cell === 'string' || !cell ? null : cell.href;
      if (href) {
        links.push({ ref, href });
      }
    });

    // A row without cells is left out; the explicit `r` keeps the numbering of the rows around it intact.
    if (cellXml.length) {
      rows.push(`<row r="${rowNumber}">${cellXml.join('')}</row>`);
    }
  });

  const widths = sheet.widths
    ?.map((width, index) =>
      width ? `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>` : '',
    )
    .join('');
  const cols = widths ? `<cols>${widths}</cols>` : '';

  const hyperlinks = links.length
    ? `<hyperlinks>${links
        .map(({ ref }, index) => `<hyperlink ref="${ref}" r:id="rId${index + 1}"/>`)
        .join('')}</hyperlinks>`
    : '';

  // The filter covers the widest row, so narrowing by column works even when the last rows are sparse.
  const columnCount = Math.max(1, ...sheet.rows.map((cells) => cells.length));
  const range = `A1:${columnName(columnCount - 1)}${Math.max(1, sheet.rows.length)}`;

  // Element order follows the worksheet's schema sequence: views, format, cols, sheetData, autoFilter, hyperlinks.
  const xml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<worksheet xmlns="${NS_MAIN}" xmlns:r="${NS_RELATIONSHIPS}">` +
    '<sheetViews><sheetView workbookViewId="0">' +
    '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
    '</sheetView></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="15"/>' +
    cols +
    `<sheetData>${rows.join('')}</sheetData>` +
    `<autoFilter ref="${range}"/>` +
    hyperlinks +
    '</worksheet>';

  const rels = links.length
    ? '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      `<Relationships xmlns="${NS_PACKAGE_RELATIONSHIPS}">` +
      links
        .map(
          ({ href }, index) =>
            `<Relationship Id="rId${index + 1}" Type="${REL_HYPERLINK}" Target="${escapeXml(href)}" TargetMode="External"/>`,
        )
        .join('') +
      '</Relationships>'
    : null;

  return { xml, rels };
};

/**
 * Two cell formats — the default one and the bold header — plus the pair of fills Excel insists on finding in every
 * stylesheet (the parts are fixed: fonts, fills, borders, cellStyleXfs, cellXfs, cellStyles).
 */
const STYLES_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  `<styleSheet xmlns="${NS_MAIN}">` +
  '<fonts count="2">' +
  '<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font>' +
  '</fonts>' +
  '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="2">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  '</cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>';

/**
 * The workbook as `.xlsx` bytes. Every sheet becomes `xl/worksheets/sheet{n}.xml`, numbered from 1 in the order given
 * (the first sheet is what a reader opens on).
 */
export const buildXlsx = (sheets: XlsxSheet[]): Uint8Array<ArrayBuffer> => {
  const parts = sheets.map(buildSheet);
  const encoder = new TextEncoder();
  const text = (value: string): Uint8Array<ArrayBuffer> => encoder.encode(value);

  /** The styles part is the workbook's last relationship, after the sheets it describes. */
  const stylesRelationshipId = sheets.length + 1;

  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<Types xmlns="${NS_CONTENT_TYPES}">` +
    `<Default Extension="rels" ContentType="${CONTENT_TYPE_RELATIONSHIPS}"/>` +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    `<Override PartName="/xl/workbook.xml" ContentType="${CONTENT_TYPE_WORKBOOK}"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="${CONTENT_TYPE_STYLES}"/>` +
    sheets
      .map(
        (_, index) =>
          `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="${CONTENT_TYPE_WORKSHEET}"/>`,
      )
      .join('') +
    '</Types>';

  const rootRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<Relationships xmlns="${NS_PACKAGE_RELATIONSHIPS}">` +
    `<Relationship Id="rId1" Type="${REL_OFFICE_DOCUMENT}" Target="xl/workbook.xml"/>` +
    '</Relationships>';

  const workbook =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_RELATIONSHIPS}"><sheets>` +
    sheets
      .map(
        (sheet, index) =>
          `<sheet name="${escapeXml(sheetNameOf(sheet.name))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
      )
      .join('') +
    '</sheets></workbook>';

  const workbookRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    `<Relationships xmlns="${NS_PACKAGE_RELATIONSHIPS}">` +
    sheets
      .map(
        (_, index) =>
          `<Relationship Id="rId${index + 1}" Type="${REL_WORKSHEET}" Target="worksheets/sheet${index + 1}.xml"/>`,
      )
      .join('') +
    `<Relationship Id="rId${stylesRelationshipId}" Type="${REL_STYLES}" Target="styles.xml"/>` +
    '</Relationships>';

  const entries: ZipEntry[] = [
    { name: '[Content_Types].xml', data: text(contentTypes) },
    { name: '_rels/.rels', data: text(rootRels) },
    { name: 'xl/workbook.xml', data: text(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: text(workbookRels) },
    { name: 'xl/styles.xml', data: text(STYLES_XML) },
  ];

  parts.forEach((part, index) => {
    const sheetNumber = index + 1;
    entries.push({ name: `xl/worksheets/sheet${sheetNumber}.xml`, data: text(part.xml) });
    if (part.rels) {
      entries.push({ name: `xl/worksheets/_rels/sheet${sheetNumber}.xml.rels`, data: text(part.rels) });
    }
  });

  return createZip(entries);
};
