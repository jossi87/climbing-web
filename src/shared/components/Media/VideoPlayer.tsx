import { useRef, useState, useEffect, type FC, type MouseEvent } from 'react';
import { List } from 'lucide-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { getMediaFileUrl, mediaIdentityId, mediaIdentityVersionStamp } from '../../../api';
import { useHlsVideo, type HlsQuality } from '../../hooks/useHlsVideo';
import { VideoPlaybackOverlay, type VideoOverlayPhase } from './VideoPlaybackOverlay';
import { cn } from '../../../lib/utils';

type Props = {
  media: components['schemas']['Media'];
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
  autoPlay = true,
  className,
  style,
  optProblemId,
  poster,
  onQualityChange,
}) => {
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
  const { levels, activeIndex, isAuto, setLevel, error: playbackError, retry } = useHlsVideo(videoRef, videoSrc);

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
   * `blocked` is the case worth spelling out: before the first frame, a paused element that already has data means
   * the browser refused the autoplay and is waiting for a gesture (an accepted `play()` clears `paused` right away).
   * Showing that as "loading" is the ambiguity this overlay exists to remove, and showing it as "pause" is what used
   * to make a start-up tap stop the movie.
   */
  const overlayPhase: VideoOverlayPhase | null = playbackError
    ? 'error'
    : !hasStarted
      ? isReady && !isPlaying
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
   */
  const ensurePlaying = () => {
    void videoRef.current?.play().catch(() => {
      // Still refused (no gesture yet, data saver): the overlay stays up and the next tap tries again.
    });
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
          title='Chapters'
          aria-label='Chapters'
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
          {currentChapter.problemName ?? `Chapter ${currentChapterIndex + 1}`}
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
            <h3 className='px-3 py-2 text-sm font-bold text-[#e2e8f0]'>Chapters</h3>
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
                        {ch.problemName ?? `Chapter ${i + 1}`}
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
                aria-label={`Seek to ${ch.problemName ?? `Chapter ${i + 1}`} at ${formatMs(chMs)}`}
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
                  {hoveredChapter.problemName ?? `Chapter ${hoveredChapterIndex + 1}`}
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
