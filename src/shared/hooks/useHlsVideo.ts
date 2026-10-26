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
  /**
   * Pin a rendition by index, or -1 to hand control back to adaptive ("Auto"), which hls.js accepts here too.
   * Takes effect from the next segment (hls.js `nextLevel`), so playback is never interrupted. No-op on the
   * native path.
   */
  setLevel: (index: number) => void;
};

/**
 * A failure that stopped the stream, flattened to what a player UI needs: which stage failed and on which URL.
 * Produced from hls.js's error payload, or from the element's own `MediaError` on the paths where hls.js is not
 * driving it (native Safari playback, or a browser without MSE at all).
 */
export type VideoPlaybackError = {
  /** hls.js error type — `network` / `media` / `other` — or `media` for the element's own `MediaError`. */
  type: string;
  /** hls.js `ErrorDetails` name (e.g. `manifestLoadError`), or the element's `MediaError.code` name. */
  details: string;
  /** URL at fault: the fragment being fetched, or the playlist itself. */
  url?: string;
};

/**
 * Adaptive-playback state, the quality control, and the failure/retry affordance a player needs to explain a stream
 * that will not start.
 */
export type HlsPlayback = HlsQuality & {
  /** Fatal error that stopped the current stream, or null while it is healthy. */
  error: VideoPlaybackError | null;
  /**
   * Load the current stream again from scratch. After a fatal error hls.js has stopped loading and offers no resume,
   * so a fresh player — and, on the native path, a fresh `load()` — is the only recovery.
   */
  retry: () => void;
  /**
   * Fetch this stream's segments and buffer them. Only the master playlist is downloaded before this is called (see
   * the lazy-loading note on {@link useHlsVideo}), so a caller that keeps a poster up until the user asks for
   * playback has to call it from the gesture that starts it — nothing else will. Safe to call repeatedly, and a
   * no-op on the native path, where the element loads its own source.
   */
  startLoad: () => void;
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
  /** Fatal error for this stream, or null while it is healthy. Cleared by `retry`. */
  error: VideoPlaybackError | null;
};

/**
 * The part of hls.js's error payload worth reporting. A stream that never starts otherwise leaves no trace at all:
 * hls.js swallows its own diagnostics unless `debug` is enabled, so the console stays clean while the element sits
 * on 0:00. `type` tells network from media from parsing, `details` names the case, and the URL says which rung is
 * at fault; `fatal` separates "playback is over" from "the player worked around it".
 */
type HlsErrorData = {
  fatal: boolean;
  type: string;
  details: string;
  url?: string;
  frag?: { url: string };
};

/** `MediaError.code` → name, so a failure on the native path reads like an hls.js `details` string. */
const MEDIA_ERROR_CODES: Record<number, string> = {
  1: 'MEDIA_ERR_ABORTED',
  2: 'MEDIA_ERR_NETWORK',
  3: 'MEDIA_ERR_DECODE',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
};

const EMPTY_STATE: HlsQualityState = { src: null, levels: [], activeIndex: null, isAuto: true, error: null };

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
 * Loading is lazy: attaching the source costs one master playlist, and `startLoad` is what pulls the fragments. A
 * caller that keeps a poster up until the user asks for playback therefore spends nothing on a movie that is swiped
 * straight past, while still getting the rendition list the manifest carries.
 *
 * Returns the available renditions plus the one currently playing, so callers can surface a quality control.
 */
export function useHlsVideo(videoRef: RefObject<HTMLVideoElement | null>, src: string | null): HlsPlayback {
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<HlsQualityState>(EMPTY_STATE);
  /** Bumped by `retry` to build the stream again from scratch. */
  const [attempt, setAttempt] = useState(0);
  /** Set once a caller asked for the stream, so a player rebuilt by `retry` knows it still has to load. */
  const wantsLoadRef = useRef(false);
  /** The URL those settings belong to — a different movie is a different request. */
  const loadedSrcRef = useRef<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    /**
     * Another movie's URL means another movie's answer: nobody has asked to watch this one yet. A retry keeps the
     * same URL and therefore keeps the flag, which is the point of it (see below).
     */
    if (loadedSrcRef.current !== src) {
      loadedSrcRef.current = src;
      wantsLoadRef.current = false;
    }

    /**
     * Where hls.js is not driving the element there is nothing in between to notice a failure, so the element's own
     * `error` event is the only signal that the playlist could not be loaded. Reported in the same shape as an hls.js
     * error, so callers need a single failure branch.
     */
    const onElementError = () => {
      const mediaError = video.error;
      const details = mediaError ? (MEDIA_ERROR_CODES[mediaError.code] ?? `code ${mediaError.code}`) : 'unknown';
      setState((prev) => (prev.src === src ? { ...prev, error: { type: 'media', details } } : prev));
    };

    // Prefer hls.js (MSE) wherever it is available. On Windows, Chrome reports a truthy "maybe" for the native
    // HLS MIME type even though `<video src="*.m3u8">` will not actually play, so checking `canPlayType` first
    // silently handed the raw playlist to the element and the video stayed black. Only rely on the element's own
    // HLS support where MSE is unavailable — i.e. Safari / iOS WebViews.
    if (Hls.isSupported()) {
      // The optimistic bandwidth seed (see INITIAL_BANDWIDTH_ESTIMATE_BPS) belongs to a first, hopeful attempt. A
      // retry only ever happens after that attempt died, so it gets hls.js's own conservative default instead —
      // otherwise the retry would confidently pick the very rung that just failed.
      const hls = new Hls({
        // Nothing is buffered until `startLoad`: the manifest alone is what a stage showing a poster needs (it is
        // where the rendition list comes from), and a movie nobody has asked to watch has no business pulling
        // fragments over a phone's data connection.
        autoStartLoad: false,
        ...(attempt === 0 ? { abrEwmaDefaultEstimate: INITIAL_BANDWIDTH_ESTIMATE_BPS } : {}),
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      // A retry replaces a player that died, but not the fact that someone asked to watch this movie: without this
      // the replacement would sit on an empty buffer forever. (Calling `startLoad` before the manifest arrives is
      // fine — hls.js remembers it and starts as soon as the playlist is parsed.)
      if (wantsLoadRef.current) hls.startLoad();

      const onManifestParsed = () => {
        setState({
          src,
          levels: hls.levels.map((level, index) => ({ index, label: levelLabel(level) })),
          activeIndex: null,
          isAuto: hls.autoLevelEnabled,
          error: null,
        });
      };
      const onLevelSwitched = (_event: unknown, data: { level: number }) => {
        setState((prev) =>
          prev.src === src ? { ...prev, activeIndex: data.level, isAuto: hls.autoLevelEnabled } : prev,
        );
      };
      // Without this listener a stream that never starts is invisible: hls.js reports nothing to the console on its
      // own, so a broken fragment simply leaves the element on 0:00. Logging the error and the URL it happened on is
      // what makes such a report diagnosable.
      const onError = (_event: unknown, data: HlsErrorData) => {
        const diagnostic = { type: data.type, details: data.details, url: data.frag?.url ?? data.url, src };
        if (data.fatal) {
          console.error('[hls] fatal error, playback stopped', diagnostic);
          // hls.js has stopped loading and will not resume on its own, and the element is left on its last frame.
          // Reporting it lets the player offer a reload instead of sitting on a frozen picture.
          setState((prev) => (prev.src === src ? { ...prev, error: diagnostic } : prev));
        } else {
          console.warn('[hls] recovered from error', diagnostic);
        }
      };
      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hls.on(Hls.Events.LEVEL_SWITCHED, onLevelSwitched);
      hls.on(Hls.Events.ERROR, onError);

      return () => {
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.off(Hls.Events.LEVEL_SWITCHED, onLevelSwitched);
        hls.off(Hls.Events.ERROR, onError);
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // No hls.js: Safari (and iOS WebViews) play HLS natively, and anywhere else the element simply gets the raw
    // playlist and fails on its own (see the MIME-type note above). Either way nothing sits in between to notice,
    // so the element's `error` event is watched instead.
    video.src = src;
    video.addEventListener('error', onElementError);
    return () => {
      video.removeEventListener('error', onElementError);
      video.removeAttribute('src');
      video.load();
    };
  }, [videoRef, src, attempt]);

  const setLevel = useCallback((index: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    // -1 hands control back to ABR; any other value pins that rendition. Reflect the choice immediately;
    // LEVEL_SWITCHED then confirms the rendition the player actually settled on.
    //
    // Deliberately `nextLevel` and not `currentLevel`. hls.js implements the latter as an "immediate" switch:
    // it aborts the in-flight fragment and flushes the buffer from 0 to infinity, i.e. it throws away the very
    // segment being played, and hls.js documents the consequence itself — "playback will interrupt at least
    // shortly to re-buffer and re-sync eventually". What that looked like here was a frozen picture with the
    // audio still running until playback was nudged by a pause/play. `nextLevel` instead picks the first safe
    // switch point ("without interrupting playback... flush parts of buffer (outside currently played fragment
    // region)"), and its back-buffer cleanup keeps a second of video before the current fragment on purpose,
    // "to avoid video freezing, that could happen if we flush keyframe of current video". Good enough here
    // because the ladder's rungs are cut on the same segment boundaries, so the next segment simply arrives at
    // the newly chosen quality.
    hls.nextLevel = index;
    setState((prev) => ({
      ...prev,
      isAuto: index === -1,
      activeIndex: index === -1 ? prev.activeIndex : index,
    }));
  }, []);

  const retry = useCallback(() => {
    // Clear the failure and re-run the effect: its cleanup tears the current attachment down and the new attempt
    // starts from an empty state (`EMPTY_STATE` again on the next render, because `state.src` is stamped per stream
    // and a retry of the same URL keeps it).
    setState((prev) => (prev.error ? { ...prev, error: null } : prev));
    setAttempt((n) => n + 1);
  }, []);

  const startLoad = useCallback(() => {
    // Remembered even when there is no player yet (a caller can ask before the attach effect has run): the effect
    // checks the flag and starts the buffer as soon as it exists.
    wantsLoadRef.current = true;
    hlsRef.current?.startLoad();
  }, []);

  // Until the current stream reports its own manifest, expose a clean adaptive state rather than the previous one.
  const current = state.src === src ? state : EMPTY_STATE;
  return {
    levels: current.levels,
    activeIndex: current.activeIndex,
    isAuto: current.isAuto,
    setLevel,
    error: current.error,
    retry,
    startLoad,
  };
}
