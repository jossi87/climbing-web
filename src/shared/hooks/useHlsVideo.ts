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

    // Safari (and iOS WebViews) play HLS natively, so there is no reason to pull in hls.js there.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return () => {
        video.removeAttribute('src');
        video.load();
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
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
