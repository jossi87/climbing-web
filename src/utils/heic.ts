/**
 * HEIC/HEIF helpers.
 *
 * iPhones (and newer Android phones) capture photos as HEIC, but neither the backend
 * (`com.buldreinfo.beans.StorageType` has no HEIC entry and `ImageService` decodes uploads
 * with `ImageIO`, which cannot read HEIF) nor most desktop browsers can handle it. The file is
 * therefore converted to JPEG in the browser before it is posted.
 *
 * Detection must not rely on `File.type` alone: browsers on Windows report an empty MIME type
 * for `.heic`/`.heif` files (Windows/Chrome has no MIME association for the extension), so the
 * file name is the reliable signal.
 */
const HEIC_MIME_TYPES = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']);
const HEIC_EXTENSION = /\.(heic|heif)$/i;

/** ISO-BMFF `ftyp` brands of a HEIC container: HEVC-compressed, which libheif reads. */
const HEIC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs']);
/** AVIF brands: ISO-BMFF as well, but AV1-compressed and NOT decodable by the wasm libheif build. */
const AVIF_BRANDS = new Set(['avif', 'avis']);

type HeifContainerKind = 'heic' | 'heif' | 'avif' | 'unknown';

/** The wasm decoder module, fetched lazily by {@link loadLibheif} on the first conversion. */
type LibheifModule = import('libheif-js/libheif-wasm/libheif-bundle.mjs').HeifModule;

/** Shown to the user when every decoder failed; says what to do instead of what went wrong. */
const CONVERSION_FAILURE_MESSAGE: Record<HeifContainerKind, string> = {
  heic: 'This HEIC image could not be converted. Export it as JPEG (iPhone: Settings → Camera → Formats → Most Compatible) and try again.',
  heif: 'This HEIF image could not be converted. Export it as JPEG and try again.',
  avif: 'This file is an AVIF image, not a HEIC. Export it as JPEG and try again.',
  unknown: 'This file is not a readable image. Export it as JPEG and try again.',
};

/**
 * A HEIC/HEIF image that no decoder in the browser could read.
 *
 * Carries a `message` that is safe to render in the UI (it is advice, not a stack trace) and the
 * decoder errors in `details` for logging.
 */
export class HeicConversionError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'HeicConversionError';
    this.details = details;
  }
}

/** User-facing reason for a failed conversion — safe to render next to the file name. */
export function heicConversionFailureReason(error: unknown): string {
  if (error instanceof HeicConversionError) return error.message;
  return messageFor(error) || 'Could not be read';
}

/** JPEG name for the converted file, so the API can derive `StorageType.JPG` from the suffix. */
export function jpegNameFor(fileName: string): string {
  if (HEIC_EXTENSION.test(fileName)) {
    return fileName.replace(HEIC_EXTENSION, '.jpeg');
  }
  return fileName ? `${fileName}.jpeg` : 'image.jpeg';
}

/** `true` when the file is a HEIC/HEIF image — matched by extension when the MIME type is unknown. */
export function isHeicFile(file: Pick<File, 'name' | 'type'>): boolean {
  return HEIC_EXTENSION.test(file.name) || HEIC_MIME_TYPES.has(file.type.toLowerCase());
}

/** Human-readable text for anything a decoder can throw — wasm and libheif errors are not always `Error`s. */
function messageFor(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const { message } = error as { message?: unknown };
    if (typeof message === 'string') return message;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

/**
 * Reads the ISO-BMFF `ftyp` box (first 32 bytes) so a failure can be explained precisely: files
 * named `.heic` are sometimes AVIF or another HEIF flavour that the wasm libheif build cannot decode.
 */
async function readContainerKind(file: File): Promise<HeifContainerKind> {
  let header: Uint8Array;
  try {
    header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  } catch {
    return 'unknown';
  }
  // Layout: 4 bytes box size, "ftyp", 4 bytes major brand, 4 bytes minor version, then brands.
  const boxType = String.fromCharCode(...header.subarray(4, 8));
  if (header.length < 16 || boxType !== 'ftyp') return 'unknown';
  const brands = new Set([String.fromCharCode(...header.subarray(8, 12))]);
  for (let offset = 16; offset + 4 <= header.length; offset += 4) {
    brands.add(String.fromCharCode(...header.subarray(offset, offset + 4)));
  }
  if ([...brands].some((brand) => HEIC_BRANDS.has(brand))) return 'heic';
  if ([...brands].some((brand) => AVIF_BRANDS.has(brand))) return 'avif';
  if (brands.has('mif1') || brands.has('msf1') || brands.has('heif')) return 'heif';
  return 'unknown';
}

/** libheif-js is a ~2 MB wasm module, so it is fetched the first time a HEIC is actually converted. */
let libheifPromise: Promise<LibheifModule> | undefined;

async function loadLibheif(): Promise<LibheifModule> {
  libheifPromise ??= import('libheif-js/libheif-wasm/libheif-bundle.mjs').then(async ({ default: createLibheif }) => {
    const instantiated = await createLibheif();
    // Emscripten hands back either the module or a `{ default: module }` wrapper.
    return 'HeifDecoder' in instantiated ? instantiated : instantiated.default;
  });
  try {
    return await libheifPromise;
  } catch (error) {
    // Do not cache a failed chunk fetch: the next upload should get another try.
    libheifPromise = undefined;
    throw error;
  }
}

/**
 * Fallback decoder for containers the wasm decoder cannot read (AVIF: `libheif-js` is built
 * without an AV1 codec). Chrome/Safari can decode those natively — with the OS codec pack too —
 * and `createImageBitmap` applies the container orientation while it is at it.
 */
async function convertWithBrowser(file: File, quality: number): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('createImageBitmap is not supported by this browser');
  }
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = createCanvas(bitmap.width, bitmap.height);
    const context = get2dContext(canvas);
    context.drawImage(bitmap, 0, 0);
    return await canvasToJpeg(canvas, quality);
  } finally {
    if (typeof bitmap.close === 'function') bitmap.close();
  }
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('could not create a 2d canvas context');
  return context;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('the canvas could not encode the image as JPEG'));
      },
      'image/jpeg',
      quality,
    );
  });
}

/** Frees wasm-side memory; a failure here must never turn a converted image into a failed one. */
function freeQuietly(resource: { free: () => void }): void {
  try {
    resource.free();
  } catch {
    /* already released */
  }
}

/**
 * Decodes the container with `libheif` compiled to WebAssembly.
 *
 * This is the decoder the `heic2any` package bundles as well, but there it is a 2020 build:
 * `heic2any@0.0.4` cannot even parse current iPhone containers (they carry `tmap` tone-map items,
 * `MiHB`/`MiPr` brands and 10-bit auxiliary images) and fails every such file with the unhelpful
 * "ERR_LIBHEIF format not supported". `libheif-js` tracks upstream libheif, so it reads them.
 */
async function convertWithLibheif(file: File, quality: number): Promise<Blob> {
  const libheif = await loadLibheif();
  const images = new libheif.HeifDecoder().decode(new Uint8Array(await file.arrayBuffer()));
  if (!images.length) {
    throw new Error('libheif found no image in the container');
  }
  // One container can hold several images (burst/live photos): the primary one is the photo.
  const image =
    images.find((candidate) => candidate.is_primary()) ??
    images.reduce((largest, candidate) =>
      candidate.get_width() * candidate.get_height() > largest.get_width() * largest.get_height() ? candidate : largest,
    );
  try {
    const width = image.get_width();
    const height = image.get_height();
    const canvas = createCanvas(width, height);
    const context = get2dContext(canvas);
    // `display` fills an `ImageData` with RGBA, which can go straight onto the canvas.
    const imageData = context.createImageData(width, height);
    await new Promise<void>((resolve, reject) => {
      image.display(imageData, (displayed) => {
        if (displayed) resolve();
        else reject(new Error('libheif could not render the image data'));
      });
    });
    context.putImageData(imageData, 0, 0);
    return await canvasToJpeg(canvas, quality);
  } finally {
    for (const candidate of images) freeQuietly(candidate);
  }
}

/**
 * Convert a HEIC/HEIF image into a JPEG `Blob`.
 *
 * `libheif` runs first because every HEIF tool uses it and it needs no OS codec; the browser
 * decoder is the safety net for containers the wasm build lacks a codec for.
 */
async function convertToJpegBlob(file: File, quality: number): Promise<Blob> {
  const details: string[] = [];
  try {
    return await convertWithLibheif(file, quality);
  } catch (error) {
    details.push(`libheif: ${messageFor(error)}`);
    console.warn(`libheif could not decode ${file.name}, retrying with the browser decoder`, error);
  }

  try {
    return await convertWithBrowser(file, quality);
  } catch (error) {
    details.push(`browser: ${messageFor(error)}`);
  }

  throw new HeicConversionError(CONVERSION_FAILURE_MESSAGE[await readContainerKind(file)], details);
}

/** Convert a HEIC/HEIF image into a JPEG `File`, or throw a {@link HeicConversionError}. */
export async function convertHeicToJpeg(file: File, quality = 0.8): Promise<File> {
  const jpegBlob = await convertToJpegBlob(file, quality);
  return new File([jpegBlob], jpegNameFor(file.name), { type: 'image/jpeg' });
}
