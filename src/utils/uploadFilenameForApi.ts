/**
 * Maps multipart field names and JSON `NewMedia.name` for uploads.
 * Mobile browsers often provide extension-less names (e.g. UUID); the API infers storage type from the suffix.
 */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpeg',
  'image/jpg': '.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
};

function hasLikelyFileExtension(filename: string): boolean {
  return /\.[a-z0-9]{2,5}$/i.test(filename);
}

export function uploadFilenameForApi(file: File): string {
  const sanitized = file.name.replace(/[^-a-z0-9.]/gi, '_');
  if (hasLikelyFileExtension(sanitized)) {
    return sanitized;
  }
  const mime = file.type?.toLowerCase() ?? '';
  const fromMime = mime && MIME_TO_EXT[mime];
  if (fromMime) {
    return `${sanitized}${fromMime}`;
  }
  if (mime.startsWith('image/')) {
    return `${sanitized}.jpeg`;
  }
  if (mime.startsWith('video/')) {
    return `${sanitized}.mp4`;
  }
  /*
   * Last resort — mobile browsers (iOS Safari, Android Chrome) sometimes report an empty
   * `file.type` for photos picked from the camera roll, and the file name is a bare UUID
   * without any extension. Without a suffix the server's StorageType.fromFilename() throws
   * "Unsupported file extension". Default to .jpeg because the overwhelming majority of
   * camera-roll uploads are JPEG.
   */
  return `${sanitized}.jpeg`;
}
