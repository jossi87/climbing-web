import { useEffect, type RefObject } from 'react';
import Hls from 'hls.js';

/**
 * Wires an adaptive HLS stream into a plain `<video>` element.
 *
 * The backend serves movies as an HLS master playlist, which only Safari plays natively. Everywhere else we hand
 * the URL to hls.js, which fetches the manifest/segments and feeds them to the element through Media Source
 * Extensions. The element's own event handlers (loadedmetadata, timeupdate, ...) keep working unchanged because
 * hls.js drives the same underlying element.
 *
 * A null `src` (for example while the editor is showing something other than a stored movie) leaves the element
 * untouched, and changing the URL tears the previous attachment down first.
 */
export function useHlsVideo(videoRef: RefObject<HTMLVideoElement | null>, src: string | null): void {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Prefer hls.js (MSE) wherever it is available. On Windows, Chrome reports a truthy "maybe" for the native
    // HLS MIME type even though `<video src="*.m3u8">` will not actually play, so checking `canPlayType` first
    // silently handed the raw playlist to the element and the video stayed black. Only rely on the element's own
    // HLS support where MSE is unavailable — i.e. Safari / iOS WebViews.
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }

    // Safari (and iOS WebViews) play HLS natively.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    }

    // Last resort: let the browser try the URL directly (it simply will not play where HLS is unsupported).
    video.src = src;
    return () => {
      video.removeAttribute('src');
      video.load();
    };
  }, [videoRef, src]);
}
