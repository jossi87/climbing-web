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

/**
 * Convert a HEIC/HEIF image into a JPEG `File`.
 *
 * A HEIC can hold several images (burst/live photos); `heic2any` then returns one JPEG per
 * image, and the first one is used — concatenating them (as an earlier implementation did)
 * produces a file no decoder can read.
 */
export async function convertHeicToJpeg(file: File, quality = 0.8): Promise<File> {
  const { default: heic2any } = await import('heic2any');
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality });
  const jpegBlobs = Array.isArray(result) ? result : [result];
  const jpegBlob = jpegBlobs[0];
  if (!jpegBlob) {
    throw new Error(`HEIC conversion produced no image for ${file.name}`);
  }
  return new File([jpegBlob], jpegNameFor(file.name), { type: 'image/jpeg' });
}
