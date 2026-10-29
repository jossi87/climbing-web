/**
 * Hands bytes to the browser as a file download — the client-side counterpart of the API's file endpoints (which answer
 * a request with `Content-Disposition` and let `downloadFileWithProgress` save the blob).
 *
 * Same object-URL trick: the anchor is clicked synchronously, so the blob is already claimed by the download before the
 * URL is revoked; leaving it alive would leak the blob for the lifetime of the page.
 */
export const saveFile = (data: Uint8Array<ArrayBuffer>, filename: string, mimeType: string): void => {
  const url = window.URL.createObjectURL(new Blob([data], { type: mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};
