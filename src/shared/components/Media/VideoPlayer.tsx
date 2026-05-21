import { useRef, useState, useEffect, type FC, type MouseEvent } from 'react';
import ReactPlayer from 'react-player';
import type { components } from '../../../@types/buldreinfo/swagger';
import { getMediaFileUrl, mediaIdentityId, mediaIdentityVersionStamp } from '../../../api';
import { cn } from '../../../lib/utils';

type Props = {
  media: components['schemas']['Media'];
  autoPlay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** If set, seek to the chapter matching this problem ID on start */
  optProblemId?: number | null;
};

type VideoChapter = components['schemas']['VideoChapter'];

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

const VideoPlayer: FC<Props> = ({ media, autoPlay = true, className, style, optProblemId }) => {
  const [isReady, setIsReady] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [showChapters, setShowChapters] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasSetTimestampRef = useRef<number | null>(null);

  const chapters: VideoChapter[] = media.chapters ?? [];

  // Only show chapter UI if there are multiple chapters, or a single chapter that doesn't start at 0
  const hasMeaningfulChapters = chapters.length > 1 || (chapters.length === 1 && (chapters[0].milliseconds ?? 0) > 0);

  const handleReady = () => {
    setIsReady(true);
  };

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

  useEffect(() => {
    return () => {
      hasSetTimestampRef.current = null;
    };
  }, []);

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

  const currentChapter = currentChapterIndex >= 0 ? chapters[currentChapterIndex] : null;

  return (
    <div className={cn('relative', className)} style={style}>
      <ReactPlayer
        key={mediaIdentityId(media.identity)}
        ref={videoRef}
        className='h-full w-full'
        src={getMediaFileUrl(mediaIdentityId(media.identity), mediaIdentityVersionStamp(media.identity), true)}
        controls
        width='100%'
        height='100%'
        playing={autoPlay && isReady}
        playsInline
        onReady={handleReady}
        onDurationChange={handleDurationChange}
        onTimeUpdate={handleTimeUpdate}
        onStart={handleStart}
        onClick={(e: MouseEvent) => e.stopPropagation()}
      />

      {/* Chapter overlay button (top-left, above native controls) */}
      {hasMeaningfulChapters && (
        <button
          type='button'
          onClick={() => setShowChapters(!showChapters)}
          className={cn(
            'absolute top-3 left-3 z-10 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition-all',
            showChapters
              ? 'bg-brand type-on-accent ring-2 ring-white/40'
              : 'bg-black/60 text-[#f1f5f9] hover:bg-black/80 hover:text-[rgb(255_255_255)]',
          )}
        >
          Chapters
        </button>
      )}

      {/* Current chapter name indicator */}
      {currentChapter && !showChapters && (
        <div className='pointer-events-none absolute top-3 left-24 z-10 max-w-[60%] truncate rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-[#f1f5f9] shadow-lg'>
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

      {/* Chapter markers on the progress bar - hardcoded hex to work in both light and dark themes */}
      {chapters.length > 0 && durationMs > 0 && (
        <div className='pointer-events-none absolute right-0 bottom-0 left-0 z-10' style={{ height: '40px' }}>
          {chapters.map((ch, i) => {
            const chMs = ch.milliseconds ?? 0;
            const pct = durationMs > 0 ? (chMs / durationMs) * 100 : 0;
            if (pct < 0 || pct > 100) return null;
            return (
              <div
                key={`marker-${i}`}
                className='absolute top-0 w-0.5'
                style={{
                  left: `${pct}%`,
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
