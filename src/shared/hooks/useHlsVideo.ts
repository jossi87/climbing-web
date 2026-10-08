import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import Hls from 'hls.js';

/** A rendition (resolution) advertised by the master playlist. */
export type HlsLevel = {
  /** Index into the player's level list; hand to {@link HlsQuality.setLevel} to pin it. */
  index: number;
  /** Human-readable label, e.g. "720p". */
  label: string;
};

/** Adaptive-playback state exposed to the UI so it can both show and choose the current quality. */
export type HlsQuality = {
  /** Available renditions, lowest → highest. Empty on the native HLS path (Safari / iOS), where the OS owns this. */
  levels: HlsLevel[];
  /** Index of the rendition currently playing, or null until the player reports one. */
  activeIndex: number | null;
  /** True while the player picks the rendition itself (adaptive, i.e. "Auto"). */
  isAuto: boolean;
  /** Pin a rendition by index, or -1 to hand control back to adaptive ("Auto"). No-op on the native path. */
  setLevel: (index: number) => void;
};

/** Prefer the playlist's NAME (e.g. "720p"); fall back to the decoded height. */
function levelLabel(level: { name?: string; height?: number }): string {
  const name = level.name?.trim();
  if (name) {
    return name;
  }
  const height = level.height ?? 0;
  return height > 0 ? `${height}p` : 'Auto';
}

/** State is tagged with the `src` it describes, so switching movies never leaks the previous movie's renditions. */
type HlsQualityState = {
  src: string | null;
  levels: HlsLevel[];
  activeIndex: number | null;
  isAuto: boolean;
};

const EMPTY_STATE: HlsQualityState = { src: null, levels: [], activeIndex: null, isAuto: true };

/**
 * ABR's bandwidth estimate before a single segment has been downloaded. hls.js otherwise seeds this from the
 * first (lowest) rung of the ladder, so playback opened on 360p and only climbed once it had measured a
 * segment or two — most of a short clip. Seeding a fast-broadband figure makes the opening fragment load on
 * the best rung up to ~1080p straight away; real measurements replace the estimate after that first segment,
 * so a slow connection still drops back down within about a second.
 */
const INITIAL_BANDWIDTH_ESTIMATE_BPS = 10_000_000; // 10 Mbps

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
 *
 * Returns the available renditions plus the one currently playing, so callers can surface a quality control.
 */
export function useHlsVideo(videoRef: RefObject<HTMLVideoElement | null>, src: string | null): HlsQuality {
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<HlsQualityState>(EMPTY_STATE);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Prefer hls.js (MSE) wherever it is available. On Windows, Chrome reports a truthy "maybe" for the native
    // HLS MIME type even though `<video src="*.m3u8">` will not actually play, so checking `canPlayType` first
    // silently handed the raw playlist to the element and the video stayed black. Only rely on the element's own
    // HLS support where MSE is unavailable — i.e. Safari / iOS WebViews.
    if (Hls.isSupported()) {
      const hls = new Hls({ abrEwmaDefaultEstimate: INITIAL_BANDWIDTH_ESTIMATE_BPS });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      const onManifestParsed = () => {
        setState({
          src,
          levels: hls.levels.map((level, index) => ({ index, label: levelLabel(level) })),
          activeIndex: null,
          isAuto: hls.autoLevelEnabled,
        });
      };
      const onLevelSwitched = (_event: unknown, data: { level: number }) => {
        setState((prev) =>
          prev.src === src ? { ...prev, activeIndex: data.level, isAuto: hls.autoLevelEnabled } : prev,
        );
      };
      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hls.on(Hls.Events.LEVEL_SWITCHED, onLevelSwitched);

      return () => {
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.off(Hls.Events.LEVEL_SWITCHED, onLevelSwitched);
        hls.destroy();
        hlsRef.current = null;
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

  const setLevel = useCallback((index: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    // currentLevel = -1 hands control back to ABR; any other value pins that rendition. Reflect the choice
    // immediately; LEVEL_SWITCHED then confirms the rendition the player actually settled on.
    hls.currentLevel = index;
    setState((prev) => ({
      ...prev,
      isAuto: index === -1,
      activeIndex: index === -1 ? prev.activeIndex : index,
    }));
  }, []);

  // Until the current stream reports its own manifest, expose a clean adaptive state rather than the previous one.
  const current = state.src === src ? state : EMPTY_STATE;
  return { levels: current.levels, activeIndex: current.activeIndex, isAuto: current.isAuto, setLevel };
}
