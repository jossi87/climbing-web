/**
 * A tiny ZIP writer — just enough of the container format to hand the browser a real `.xlsx` (see `xlsx.ts`).
 *
 * Entries are **stored** (method 0, no compression): a table-of-contents export is a handful of small XML parts, and
 * deflate would mean shipping a compressor for a few kilobytes of savings. Every spreadsheet app opens a stored archive
 * exactly like a deflated one.
 *
 * No ZIP64: sizes and offsets are 32-bit, which holds up to 4 GB — far more than this will ever write.
 */

export type ZipEntry = {
  /** Path inside the archive (`xl/worksheets/sheet1.xml`) — forward slashes, no leading slash. */
  name: string;
  data: Uint8Array<ArrayBuffer>;
};

const encoder = new TextEncoder();

const SIG_LOCAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_END = 0x06054b50;
/** ZIP 2.0 — the version whose flags and records are written here. */
const VERSION = 20;
/** Bit 11 of the general-purpose flags: file names are UTF-8. They are ASCII today; the flag is what states it. */
const FLAG_UTF8 = 0x0800;
/** Method 0 — stored, no compression. */
const METHOD_STORE = 0;
/**
 * Fixed DOS timestamp (1980-01-01 00:00, the earliest the format can express) instead of “now”: nothing reads it, and a
 * constant keeps the same input from producing different bytes on every download.
 */
const DOS_TIME = 0;
const DOS_DATE = 0x0021;

/** CRC-32 (IEEE 802.3), the checksum every ZIP entry carries. The 256-entry table is built on first use. */
let crcTable: Uint32Array | null = null;

const crcTableOf = (): Uint32Array => {
  if (!crcTable) {
    const table = new Uint32Array(256);
    for (let index = 0; index < table.length; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[index] = value;
    }
    crcTable = table;
  }
  return crcTable;
};

const crc32 = (data: Uint8Array): number => {
  const table = crcTableOf();
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

/**
 * Packs the entries into a ZIP archive: one local header + data per entry, the central directory, and the end record.
 * Order is preserved (the first entry is what an app shows first when it cares).
 */
export const createZip = (entries: ZipEntry[]): Uint8Array<ArrayBuffer> => {
  const files = entries.map((entry) => ({
    name: encoder.encode(entry.name),
    data: entry.data,
    crc: crc32(entry.data),
  }));

  // 30 + name per local header, 46 + name per central directory record, 22 for the end record.
  const size = files.reduce(
    (total, file) => total + 30 + file.name.length + 46 + file.name.length + file.data.length,
    22,
  );
  const out = new Uint8Array(size);
  const view = new DataView(out.buffer);
  let offset = 0;

  const u16 = (value: number): void => {
    view.setUint16(offset, value, true);
    offset += 2;
  };
  const u32 = (value: number): void => {
    view.setUint32(offset, value, true);
    offset += 4;
  };
  const bytes = (value: Uint8Array): void => {
    out.set(value, offset);
    offset += value.length;
  };

  const localOffsets: number[] = [];
  for (const file of files) {
    localOffsets.push(offset);
    u32(SIG_LOCAL);
    u16(VERSION);
    u16(FLAG_UTF8);
    u16(METHOD_STORE);
    u16(DOS_TIME);
    u16(DOS_DATE);
    u32(file.crc);
    u32(file.data.length); // compressed size — the same, since nothing is compressed
    u32(file.data.length); // uncompressed size
    u16(file.name.length);
    u16(0); // extra field length
    bytes(file.name);
    bytes(file.data);
  }

  const directoryOffset = offset;
  files.forEach((file, index) => {
    u32(SIG_CENTRAL);
    u16(VERSION); // version made by
    u16(VERSION); // version needed to extract
    u16(FLAG_UTF8);
    u16(METHOD_STORE);
    u16(DOS_TIME);
    u16(DOS_DATE);
    u32(file.crc);
    u32(file.data.length);
    u32(file.data.length);
    u16(file.name.length);
    u16(0); // extra field length
    u16(0); // comment length
    u16(0); // number of the disk this entry starts on
    u16(0); // internal file attributes
    u32(0); // external file attributes
    u32(localOffsets[index]);
    bytes(file.name);
  });

  // Measured before the end record starts: readers locate the directory by subtracting this size from the record's
  // position, so it has to be the directory's own length.
  const directorySize = offset - directoryOffset;

  u32(SIG_END);
  u16(0); // number of this disk
  u16(0); // disk holding the central directory
  u16(files.length); // entries on this disk
  u16(files.length); // entries in total
  u32(directorySize); // central directory size
  u32(directoryOffset); // central directory offset
  u16(0); // archive comment length

  return out;
};
