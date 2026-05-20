import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Image, Video } from 'lucide-react';
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
 * Modal that lets users pick a video frame to use as the thumbnail.
 *
 * **How it works (intuitive):**
 * - Seek to the desired frame using the **video player's native controls** (play, pause, scrub the timeline).
 * - The current position is shown below the video.
 * - Click **Set thumbnail** to save that frame.
 *
 * There is no separate slider — the video player itself is the picker.
 */
const VideoThumbnailPicker = ({ m, onClose, onSave }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [saving, setSaving] = useState(false);

  const mediaId = mediaIdentityId(m.identity);
  const videoUrl = getMediaFileUrl(mediaId, mediaIdentityVersionStamp(m.identity), true);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  }, []);

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
          <div className='flex flex-col gap-4'>
            {/* Instructional text */}
            <div className='flex items-start gap-2.5 rounded-xl border border-sky-500/25 bg-sky-500/8 px-3.5 py-2.5 sm:px-4 sm:py-3'>
              <Video size={16} className='mt-0.5 shrink-0 text-sky-400' />
              <p className='text-[13px] leading-snug text-slate-300 sm:text-[14px]'>
                <strong className='text-slate-100'>Seek</strong> in the video below to find the frame you want as the
                thumbnail, then click <strong className='text-slate-100'>Set thumbnail</strong>.
              </p>
            </div>

            {/* Video player */}
            <div className='bg-surface-nav border-surface-border overflow-hidden rounded-xl border'>
              <video
                ref={videoRef}
                src={videoUrl}
                className='block max-h-[50vh] w-full sm:max-h-[55vh]'
                controls
                preload='metadata'
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />
            </div>

            {/* Current position indicator */}
            {duration > 0 && (
              <div className='bg-surface-raised flex items-center justify-between gap-3 rounded-xl border border-white/8 px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <span className={cn(fieldLabelClass)}>Selected frame</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex h-7 items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 font-mono text-[13px] font-semibold text-slate-100 tabular-nums shadow-inner'>
                    <Image size={13} className='text-slate-400' />
                    {formatTime(currentTime)}
                  </div>
                  <span className='text-[12px] text-slate-500'>/ {formatTime(duration)}</span>
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
