import { useCallback, useRef, useState, useEffect, type FC, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { List } from 'lucide-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { getMediaFileUrl, mediaIdentityId, mediaIdentityVersionStamp } from '../../../api';
import { useHlsVideo, type HlsQuality } from '../../hooks/useHlsVideo';
import { VideoPlaybackOverlay, type VideoOverlayPhase } from './VideoPlaybackOverlay';
import { cn } from '../../../lib/utils';

type Props = {
  media: components['schemas']['Media'];
  /**
   * Start the movie without waiting for a tap. Off by default: the stage then keeps the poster up with its play disc
   * on it, and dismissing that disc is the tap that starts playback — inside the gesture the browser's autoplay
   * policy demands. A request raised later has no gesture behind it, and an element with no media yet can drop one
   * outright, which is why a single tap used to be so easy to lose (see `playIntentRef`).
   */
  autoPlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** If set, seek to the chapter matching this problem ID on start */
  optProblemId?: number | null;
  /**
   * Poster (thumbnail JPEG) the element shows until the first frame is decoded. Keeps the stage from going black
   * while a movie starts on a slow connection — normally the very image the caller displayed before swapping in
   * this player.
   */
  poster?: string;
  /**
   * Receives the HLS quality state (available renditions + the one playing) so a parent — e.g. the media
   * modal toolbar — can render the quality control. Called with `null` when this player tears down.
   */
  onQualityChange?: (quality: HlsQuality | null) => void;
};

type MediaProblem = components['schemas']['MediaProblem'];

/**
 * How long the tap's `play()` is given to take before it is checked once more.
 *
 * Long enough that a request the element did accept has already cleared `paused` (which it does synchronously), short
 * enough to be invisible next to a stream start-up. See `requestPlayback`.
 */
const PLAY_RECHECK_MS = 350;

/**
 * Format milliseconds to a display string like "1:23" or "1:02:34".
 */
function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const VideoPlayer: FC<Props> = ({
  media,
  autoPlay = false,
  className,
  style,
  optProblemId,
  poster,
  onQualityChange,
}) => {
  const { t } = useTranslation();
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [showChapters, setShowChapters] = useState(false);
  const [hoveredChapter, setHoveredChapter] = useState<MediaProblem | null>(null);
  const [hoveredChapterIndex, setHoveredChapterIndex] = useState(-1);
  const [hoverX, setHoverX] = useState(0);
  const [isHoveringSeekbar, setIsHoveringSeekbar] = useState(false);

  /**
   * Playback state for the start-up overlay. All of it is reported by the element rather than inferred from hls.js:
   * only the element knows when a frame is really on screen, and a stream can be fetched, buffered and still leave
   * the stage black while the decoder catches up.
   */
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  /**
   * Whether anyone has asked for playback yet. Until they have, nothing but the manifest has been fetched and the
   * poster is the whole stage, so there is no load in progress to report — see `overlayPhase`.
   */
  const [playRequested, setPlayRequested] = useState(autoPlay);
  /**
   * Playback somebody asked for that the element has not managed to start yet.
   *
   * Set by the tap that asks for it, cleared only once a frame is actually running. It has to outlive the call:
   * a `play()` issued before the element has a byte of media behind it is dropped outright — native HLS on iOS
   * is the usual offender, and a movie that was mounted a moment ago (the one just swiped to) is always in that
   * state — and none of that reaches us: no rejection, no event, `paused` simply stays `true`. Re-asking on the
   * element's own "I can play now" events is what turns that one tap into playback. Without it the tap looked
   * ignored and the movie needed a second one, by which time data had arrived.
   */
  const playIntentRef = useRef(autoPlay);
  /**
   * Mirror of `playRequested` for the tap handlers. One tap can reach them twice (`pointerup`, then the `click` that
   * follows it), and the second must not ask hls.js to start the stream again — `startLoad()` restarts the load.
   */
  const playRequestedRef = useRef(autoPlay);
  /** Pending "did the element take that request?" check — see `requestPlayback`. */
  const playRecheckRef = useRef(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chaptersContainerRef = useRef<HTMLDivElement>(null);
  const hasSetTimestampRef = useRef<number | null>(null);

  /**
   * The modal swaps `media` in place instead of remounting this player — only the `<video>` element is keyed by the
   * media id — so the start-up signals above would otherwise follow from one movie into the next and silence the
   * overlay while the new one loads. Reset them during render, the same way `Media.tsx` clears its URL override, so
   * the divergence is gone before React commits rather than after a flash of the previous movie's state.
   */
  const mediaId = mediaIdentityId(media.identity);
  const startupMediaIdRef = useRef(mediaId);
  if (startupMediaIdRef.current !== mediaId) {
    startupMediaIdRef.current = mediaId;
    setHasStarted(false);
    setIsPlaying(false);
    setIsWaiting(false);
    setIsReady(false);
    setHasEnded(false);
    // A different movie has not been asked for yet: the stage goes back to that movie's poster and play disc.
    setPlayRequested(autoPlay);
    playIntentRef.current = autoPlay;
    playRequestedRef.current = autoPlay;
  }

  const chapters: MediaProblem[] = (media.problems ?? [])
    .slice()
    .sort((a, b) => (a.milliseconds ?? 0) - (b.milliseconds ?? 0));

  // Only show chapter UI if there are multiple chapters, or a single chapter that doesn't start at 0
  const hasMeaningfulChapters = chapters.length > 1 || (chapters.length === 1 && (chapters[0].milliseconds ?? 0) > 0);

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDurationMs(videoRef.current.duration * 1000);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTimeMs(videoRef.current.currentTime * 1000);
    }
  };

  const handleSeeked = () => {
    if (videoRef.current) {
      setCurrentTimeMs(videoRef.current.currentTime * 1000);
    }
  };

  const handleStart = () => {
    if (hasSetTimestampRef.current !== mediaIdentityId(media.identity) && chapters.length > 0 && videoRef.current) {
      hasSetTimestampRef.current = mediaIdentityId(media.identity);

      // Find the chapter matching optProblemId, or fall back to the first chapter
      let targetMs: number;
      if (optProblemId != null) {
        const matchingChapter = chapters.find((ch) => ch.problemId === optProblemId);
        targetMs = matchingChapter?.milliseconds ?? chapters[0].milliseconds ?? 0;
      } else {
        targetMs = chapters[0].milliseconds ?? 0;
      }

      if (targetMs > 0) {
        videoRef.current.currentTime = targetMs / 1000;
      }
    }
  };

  const seekToChapter = (ms: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = ms / 1000;
    }
  };

  // Find the current chapter index based on currentTimeMs
  const currentChapterIndex = (() => {
    if (chapters.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < chapters.length; i++) {
      const chMs = chapters[i].milliseconds ?? 0;
      if (currentTimeMs >= chMs) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  })();

  // Auto-scroll the chapters list to the currently active chapter
  useEffect(() => {
    if (showChapters && chaptersContainerRef.current && currentChapterIndex >= 0) {
      const container = chaptersContainerRef.current;
      const activeButton = container.querySelector<HTMLButtonElement>(`[data-chapter-index="${currentChapterIndex}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [showChapters, currentChapterIndex]);

  useEffect(() => {
    return () => {
      hasSetTimestampRef.current = null;
    };
  }, []);

  const currentChapter = currentChapterIndex >= 0 ? chapters[currentChapterIndex] : null;

  // Movies are served as an HLS master playlist; hls.js fetches the manifest/segments (Safari plays it natively).
  const videoSrc = getMediaFileUrl(mediaIdentityId(media.identity), mediaIdentityVersionStamp(media.identity), true);
  const {
    levels,
    activeIndex,
    isAuto,
    setLevel,
    error: playbackError,
    retry,
    startLoad,
  } = useHlsVideo(videoRef, videoSrc);

  /**
   * Ask the element to play, and remember that somebody did.
   *
   * `play()` comes first and alone: it is the one call that has to happen inside the gesture that asked for it,
   * so nothing — the stream request included — may get the chance to throw or stall ahead of it. A refusal is
   * reported instead of swallowed, because a silent one is indistinguishable from the tap never arriving; the
   * request itself stays outstanding in `playIntentRef` and is re-asked as soon as the element can honour it.
   */
  const requestPlayback = useCallback(() => {
    playIntentRef.current = true;
    const video = videoRef.current;
    if (!video) return;
    // `play()` clears `paused` outright, so the playing state is claimed now and the element hands it back if it
    // pauses (or the refusal below does): that keeps the overlay on the spinner for the moment between the tap and
    // the element's own `play` event, instead of showing "tap to play" over a stream that is on its way.
    setIsPlaying(true);
    void video.play().catch((error: unknown) => {
      // Nothing to undo beyond that claim: what the stage shows follows the element's own events. When the browser
      // really does refuse (no gesture, data saver) the overlay reports it and the next tap asks again.
      setIsPlaying(false);
      console.warn('[video] play() was not accepted', error);
    });
    // Nothing is guaranteed to happen after a request that went nowhere — an element that is dropped *with* data
    // ready has no further media event to hang the retry below on — so the request is checked once instead of being
    // left for the user to notice. An accepted or pending `play()` has already cleared `paused`, and `playing` has
    // cleared the intent, so a request that did take is never repeated and a pause the user asked for is never undone.
    window.clearTimeout(playRecheckRef.current);
    playRecheckRef.current = window.setTimeout(() => {
      // The stage may have moved to another movie in the meantime; that element is gone and has its own request.
      if (videoRef.current !== video) return;
      if (!playIntentRef.current || !video.paused || video.ended) return;
      void video.play().catch(() => {
        // Refused again: the overlay says so, and the next tap asks again.
      });
    }, PLAY_RECHECK_MS);
  }, []);

  /** The recheck above must not outlive the player. */
  useEffect(() => () => window.clearTimeout(playRecheckRef.current), []);

  /**
   * Re-ask for playback whenever the element reports that it could play.
   *
   * This is what makes one tap enough. The request is recorded before the element has media behind it (see
   * `playIntentRef`), the browser drops it without a trace, and the first data event afterwards is the moment it
   * can be honoured — no second tap, no waiting for the user to notice.
   *
   * Keyed by media because the `<video>` is replaced per movie; `playing` — the event that ends the request — is
   * what clears the intent, so a pause the user asked for is never overruled here.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const askAgain = () => {
      if (!playIntentRef.current || !video.paused || video.ended) return;
      // Same claim as `requestPlayback`: data has arrived and the request is being re-issued, so the stage is loading,
      // not waiting for a tap. `pause` or a refusal puts it back.
      setIsPlaying(true);
      void video.play().catch(() => {
        // Still not playable: the overlay says so, and another data event will ask again.
        setIsPlaying(false);
      });
    };
    video.addEventListener('loadedmetadata', askAgain);
    video.addEventListener('loadeddata', askAgain);
    video.addEventListener('canplay', askAgain);
    return () => {
      video.removeEventListener('loadedmetadata', askAgain);
      video.removeEventListener('loadeddata', askAgain);
      video.removeEventListener('canplay', askAgain);
    };
  }, [mediaId]);

  /**
   * `autoPlay` is a caller saying playback was asked for before this player existed, so the request is served from
   * here. `startLoad` is part of that: the hook buffers nothing until it is called, and an empty element never fires
   * `loadedmetadata` on its own, so waiting for that event (how this used to start) would now wait forever.
   *
   * No state is set here on purpose — `playRequested` already starts out as `autoPlay`, and the element reports the
   * outcome through `play`/`playing` (or the warning above) like any other attempt.
   */
  useEffect(() => {
    if (!autoPlay) return;
    requestPlayback();
    startLoad();
  }, [autoPlay, requestPlayback, startLoad, mediaId]);

  // Report the quality state up; the control itself is rendered by the parent's toolbar (see `MediaModal`).
  // The cleanup reports `null` so the control disappears when this player goes away (modal switched to an image).
  useEffect(() => {
    onQualityChange?.({ levels, activeIndex, isAuto, setLevel });
  }, [onQualityChange, levels, activeIndex, isAuto, setLevel]);

  useEffect(() => {
    return () => onQualityChange?.(null);
  }, [onQualityChange]);

  /**
   * What the stage shows while the element is not simply playing. `null` leaves it completely uncovered, so healthy
   * playback keeps the native controls — and their hit area — to itself.
   *
   * `idle` is the state before anything has been asked of the player: the poster is still the whole picture and the
   * disc on it *is* the way in, so nothing may cover the picture and nothing may pretend to be loading.
   *
   * `blocked` is the case worth spelling out: before the first frame, a paused element that already has data means
   * the browser refused the autoplay and is waiting for a gesture (an accepted `play()` clears `paused` right away).
   * Showing that as "loading" is the ambiguity this overlay exists to remove, and showing it as "pause" is what used
   * to make a start-up tap stop the movie.
   */
  const overlayPhase: VideoOverlayPhase | null = playbackError
    ? 'error'
    : !hasStarted
      ? !playRequested
        ? 'idle' // Nothing asked for yet: the poster is up, so the stage owes the play disc, not a spinner.
        : isReady && !isPlaying
          ? 'blocked'
          : 'loading'
      : isPlaying
        ? isWaiting
          ? 'buffering'
          : null
        : hasEnded
          ? null // The clip is over: the native control bar already offers the replay.
          : 'paused';

  /**
   * The only thing a tap during start-up may do. Deliberately `play()` and never `pause()`: while the first fragment
   * is in flight the element's own control already reads "pause", so a tap that toggled it would stop the very movie
   * the user was trying to start.
   *
   * The `play()` is raised first, inside the tap, and the stream is requested after it: the gesture is what makes
   * the browser accept the first, while the request is what makes it possible at all. The request is also
   * remembered (`playIntentRef`), because an element with no media yet drops the call instead of queueing it.
   */
  const ensurePlaying = () => {
    requestPlayback();
    // The first ask also fetches the stream (the hook buffers nothing before it); after that a tap only resumes
    // playback, and re-asking would tell hls.js to start over.
    if (playRequestedRef.current) return;
    playRequestedRef.current = true;
    setPlayRequested(true);
    startLoad();
  };

  return (
    <div className={cn('group relative', className)} style={style}>
      <video
        key={mediaId}
        ref={videoRef}
        className='h-full w-full'
        /*
         * No native controls until the first frame: before that they advertise a play/pause state the user cannot
         * trust (and the start-up overlay covers them anyway). From the first frame on they are the app's controls,
         * exactly as they always were.
         */
        controls={hasStarted && !playbackError}
        autoPlay={autoPlay}
        playsInline
        poster={poster}
        onLoadedMetadata={() => {
          handleDurationChange();
          const video = videoRef.current;
          // Attempt autoplay once metadata is loaded
          if (autoPlay && video) {
            // `play()` clears `paused` outright, so claim the playing state now; the refusal below — or the element's
            // own `pause` — hands it back, and the overlay then offers the tap that autoplay policies demand.
            setIsPlaying(true);
            void video.play().catch(() => {
              // Autoplay refused (no gesture yet, data saver): the overlay reports it instead of a silent spinner.
              setIsPlaying(false);
            });
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onSeeked={() => {
          handleSeeked();
          // `seeking`/`waiting` report a gap in the data; `seeked` says the element is supplied again.
          setIsWaiting(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setHasEnded(false);
          handleStart();
        }}
        onPlaying={() => {
          // The first `playing` event is the moment a frame is on screen — what every "is it loading?" question is
          // really about. Only the element knows that, which is why the overlay is driven from here.
          setHasStarted(true);
          setIsPlaying(true);
          setIsWaiting(false);
          // Playback is running, so the outstanding request has been honoured: from now on a pause is the user's.
          playIntentRef.current = false;
        }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsWaiting(true)}
        onSeeking={() => setIsWaiting(true)}
        onCanPlay={() => {
          setIsReady(true);
          setIsWaiting(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setHasEnded(true);
        }}
        onClick={(e: MouseEvent) => e.stopPropagation()}
      />

      <VideoPlaybackOverlay phase={overlayPhase} onEnsurePlayback={ensurePlaying} onRetry={retry} />

      {/* Chapter overlay button (top-left, above native controls) — matches media modal toolbar icon style */}
      {hasMeaningfulChapters && (
        <button
          type='button'
          onClick={() => setShowChapters(!showChapters)}
          title={t('media.chapters')}
          aria-label={t('media.chapters')}
          className={cn(
            'absolute top-3 left-3 z-10',
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-[0_4px_28px_rgba(0,0,0,0.55)] ring-1 transition-all active:scale-95 sm:h-11 sm:w-11',
            'cursor-pointer select-none',
            showChapters
              ? 'btn-brand-solid ring-1 ring-black/20'
              : 'ring-surface-border/50 bg-slate-900 text-[#e2e8f0] hover:bg-slate-800 hover:text-[#f1f5f9]',
          )}
        >
          <List size={17} strokeWidth={2} />
        </button>
      )}

      {/* Current chapter name indicator — only for meaningful chapters */}
      {currentChapter && hasMeaningfulChapters && !showChapters && !isHoveringSeekbar && (
        <div className='pointer-events-none absolute top-3 left-14 z-10 max-w-[60%] truncate rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-[#f1f5f9] shadow-lg sm:left-16'>
          {currentChapter.problemName ?? t('media.chapterFallback', { number: currentChapterIndex + 1 })}
          {currentChapter.problemGrade ? ` (${currentChapter.problemGrade})` : ''}
        </div>
      )}

      {/* Chapter list overlay */}
      {showChapters && chapters.length > 0 && (
        <div
          className='absolute inset-0 z-20 flex items-start justify-center bg-black/60 pt-16 backdrop-blur-sm'
          onClick={() => setShowChapters(false)}
        >
          <div
            ref={chaptersContainerRef}
            className='mx-4 max-h-[60%] w-full max-w-md overflow-y-auto rounded-2xl bg-[#0f172a] p-2 shadow-2xl ring-1 ring-white/10'
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='px-3 py-2 text-sm font-bold text-[#e2e8f0]'>{t('media.chapters')}</h3>
            <div className='divide-y divide-white/5'>
              {chapters.map((ch, i) => {
                const chMs = ch.milliseconds ?? 0;
                const isActive = i === currentChapterIndex;
                return (
                  <button
                    key={`${ch.problemId ?? 'ch'}-${i}`}
                    type='button'
                    data-chapter-index={i}
                    onClick={() => {
                      seekToChapter(chMs);
                      setShowChapters(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5',
                      isActive && 'bg-white/8',
                    )}
                  >
                    {/* Chapter number badge */}
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                        isActive ? 'bg-brand type-on-accent' : 'bg-white/10 text-[#94a3b8]',
                      )}
                    >
                      {i + 1}
                    </span>

                    {/* Chapter info */}
                    <div className='min-w-0 flex-1'>
                      <p className={cn('truncate text-sm font-medium', isActive ? 'text-[#f8fafc]' : 'text-[#cbd5e1]')}>
                        {ch.problemName ?? t('media.chapterFallback', { number: i + 1 })}
                      </p>
                      {ch.problemGrade && <p className='text-xs text-[#64748b]'>{ch.problemGrade}</p>}
                    </div>

                    {/* Timestamp */}
                    <span className='shrink-0 text-xs text-[#64748b] tabular-nums'>{formatMs(chMs)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chapter markers — small dots at the bottom edge of the video.
          The container is always pointer-events-none so it never blocks the native video controls.
          On desktop (sm+): the individual marker buttons are pointer-events-auto so they are clickable
          with hover tooltips. On mobile: markers are inert visual indicators only. */}
      {hasMeaningfulChapters && durationMs > 0 && (
        <div
          className='pointer-events-none absolute inset-x-0 bottom-0 z-10'
          style={{ height: '60px' }}
          onMouseLeave={() => {
            setIsHoveringSeekbar(false);
            setHoveredChapter(null);
            setHoveredChapterIndex(-1);
          }}
        >
          {chapters.map((ch, i) => {
            const chMs = ch.milliseconds ?? 0;
            const pct = durationMs > 0 ? (chMs / durationMs) * 100 : 0;
            if (pct < 0 || pct > 100) return null;
            const isHovered = i === hoveredChapterIndex;
            return (
              <button
                key={`marker-${i}`}
                type='button'
                onMouseEnter={() => {
                  setIsHoveringSeekbar(true);
                  setHoveredChapter(ch);
                  setHoveredChapterIndex(i);
                  setHoverX(pct);
                }}
                onClick={() => seekToChapter(chMs)}
                className='pointer-events-none absolute -translate-x-1/2 sm:pointer-events-auto'
                style={{
                  left: `${pct}%`,
                  bottom: '40px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isHovered ? 'rgb(255 255 255)' : 'rgba(255, 255, 255, 0.6)',
                  boxShadow: isHovered ? '0 0 6px rgba(255,255,255,0.6)' : '0 0 2px rgba(0,0,0,0.5)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label={t('media.seekToChapter', {
                  chapter: ch.problemName ?? t('media.chapterFallback', { number: i + 1 }),
                  time: formatMs(chMs),
                })}
              />
            );
          })}

          {/* Hover tooltip — desktop only */}
          {hoveredChapter && (
            <div
              className='pointer-events-none absolute z-30 -translate-x-1/2'
              style={{
                left: `${hoverX}%`,
                bottom: '60px',
              }}
            >
              <div className='rounded-lg bg-[#0f172a] px-2.5 py-1.5 whitespace-nowrap shadow-2xl ring-1 ring-white/15'>
                <p className='text-xs font-semibold text-[#f1f5f9]'>
                  {hoveredChapter.problemName ?? t('media.chapterFallback', { number: hoveredChapterIndex + 1 })}
                  {hoveredChapter.problemGrade && (
                    <span className='ml-1.5 font-normal text-[#94a3b8]'>{hoveredChapter.problemGrade}</span>
                  )}
                </p>
                <p className='text-[11px] text-[#94a3b8] tabular-nums'>{formatMs(hoveredChapter.milliseconds ?? 0)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
