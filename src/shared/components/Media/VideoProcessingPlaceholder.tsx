import { Film } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Props = {
  /** Smaller type + icon for activity grid tiles */
  compact?: boolean;
  className?: string;
};

/**
 * Shown when a file-video poster URL fails (usually while the video is still being processed server-side).
 * Copy focuses on **video** processing, not thumbnails.
 */
export function VideoProcessingPlaceholder({ compact = false, className }: Props) {
  return (
    <div
      className={cn(
        'media-modal-dark-chrome flex h-full min-h-0 w-full flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 text-center',
        compact ? 'gap-1 px-1 py-0.5' : 'gap-1.5 px-2 py-1',
        className,
      )}
    >
      <Film className='text-slate-500' size={compact ? 22 : 28} aria-hidden />
      <p className={cn('leading-tight font-semibold text-slate-200', compact ? 'text-[10px]' : 'text-[11px]')}>
        Processing video
      </p>
      <p
        className={cn(
          'max-w-[13rem] leading-snug text-slate-400 sm:max-w-[15rem]',
          compact ? 'text-[10px] leading-snug sm:text-[11px]' : 'text-[11px] sm:text-[12px]',
        )}
      >
        This video is still being processed in the background. It will be ready soon — refresh the page if the preview
        stays empty.
      </p>
    </div>
  );
}
