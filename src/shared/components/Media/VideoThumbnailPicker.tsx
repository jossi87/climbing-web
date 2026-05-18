import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Image } from 'lucide-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { getMediaFileUrl, mediaIdentityId, mediaIdentityVersionStamp } from '../../../api';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type Media = components['schemas']['Media'];

type Props = {
  m: Media;
  onClose: () => void;
  onSave: (mediaId: number, timestampSeconds: number) => void | Promise<void>;
};

/**
 * Modal that lets users seek through a video and pick a timestamp to use as the thumbnail.
 */
const VideoThumbnailPicker = ({ m, onClose, onSave }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [saving, setSaving] = useState(false);

  const mediaId = mediaIdentityId(m.identity);
  const videoUrl = getMediaFileUrl(mediaId, mediaIdentityVersionStamp(m.identity), true);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || isSeeking) return;
    setCurrentTime(videoRef.current.currentTime);
  }, [isSeeking]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const dur = video.duration || 0;
    setDuration(dur);

    // Seek to the current thumbnail position (or -10s from end if not set / negative)
    const raw = m.thumbnailSeconds;
    let targetTime: number;
    if (raw != null && raw >= 0) {
      targetTime = Math.min(raw, dur);
    } else {
      // Default: -10 seconds from end (or 0 if video is shorter than 10s)
      targetTime = Math.max(0, dur - 10);
    }
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  }, [m.thumbnailSeconds]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await Promise.resolve(onSave(mediaId, Math.floor(currentTime)));
      onClose();
    } catch (error) {
      console.warn(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const fieldLabelClass = cn(designContract.typography.label, 'text-slate-300');

  const modalPanelClass =
    'bg-surface-card border-surface-border flex min-h-0 w-full min-w-0 flex-col overflow-hidden shadow-2xl max-sm:flex-1 max-sm:rounded-none max-sm:border-0 sm:max-h-[min(94dvh,56rem)] sm:max-w-2xl sm:rounded-2xl sm:border';

  return createPortal(
    <div
      className='animate-in fade-in fixed inset-0 z-200 flex h-dvh min-h-dvh w-full bg-black/80 backdrop-blur-sm duration-200 max-sm:flex-col max-sm:p-0 sm:items-center sm:justify-center sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='video-thumbnail-picker-title'
    >
      <div className={modalPanelClass}>
        {/* Header */}
        <div className='border-surface-border bg-surface-raised flex shrink-0 items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 sm:pt-4'>
          <h3 id='video-thumbnail-picker-title' className='type-label flex min-w-0 items-center gap-2 text-slate-200'>
            <Image size={18} className='shrink-0 text-slate-400' />
            <span className='truncate'>Change thumbnail</span>
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='hover:bg-surface-raised-hover -mr-1 shrink-0 rounded-lg p-1.5 opacity-70 transition-colors hover:opacity-100'
            aria-label='Close'
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='min-h-0 overflow-y-auto overscroll-contain px-4 py-3.5 text-left max-sm:flex-1 sm:max-h-[calc(min(94dvh,56rem)-9.5rem)] sm:flex-none sm:px-6 sm:py-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5'>
            {/* Video player */}
            <div className='bg-surface-nav border-surface-border min-h-0 overflow-hidden rounded-xl border sm:min-w-0 sm:flex-1'>
              <video
                ref={videoRef}
                src={videoUrl}
                className='block max-h-[50vh] w-full sm:max-h-[55vh]'
                controls
                preload='metadata'
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onSeeked={() => setIsSeeking(false)}
                onSeeking={() => setIsSeeking(true)}
              />
            </div>

            {/* Seek slider */}
            {duration > 0 && (
              <div className='space-y-2 sm:w-56 sm:shrink-0 sm:self-stretch sm:pt-1'>
                <div className='flex items-center justify-between sm:flex-col sm:items-start sm:gap-1.5'>
                  <label className={cn('ml-1', fieldLabelClass)}>Thumbnail position</label>
                  <span className='type-small text-slate-400 tabular-nums'>{formatTime(currentTime)}</span>
                </div>
                <input
                  type='range'
                  min={0}
                  max={Math.floor(duration)}
                  step={1}
                  value={Math.floor(currentTime)}
                  onChange={handleSeek}
                  className='accent-brand w-full cursor-pointer sm:min-h-0 sm:flex-1'
                  aria-label='Seek to timestamp'
                />
                <div className='flex justify-between text-[11px] text-slate-500 tabular-nums'>
                  <span>0:00</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='bg-surface-raised border-surface-border flex shrink-0 justify-end gap-1.5 border-t px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-4 sm:py-4 sm:pb-4'>
          <button type='button' onClick={onClose} className='modal-action-cancel'>
            Cancel
          </button>
          <button
            type='button'
            onClick={() => void handleSave()}
            disabled={saving}
            className={cn(
              designContract.controls.savePrimaryModal,
              'disabled:bg-surface-hover rounded-lg shadow-sm disabled:opacity-50 max-sm:px-3 max-sm:py-2 max-sm:text-[10px] max-sm:tracking-wide',
            )}
          >
            {saving ? (
              <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
            ) : (
              <Image size={14} />
            )}
            Set thumbnail
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default VideoThumbnailPicker;
