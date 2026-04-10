import { Play } from 'lucide-react';
import { cn } from '../../../lib/utils';

/** `compact` — activity feed (~85px) tiles; `default` — problem/area media grid; `modal` — poster in fullscreen viewer */
export type VideoPlayOverlaySize = 'compact' | 'default' | 'modal';

const discBase =
  'flex shrink-0 items-center justify-center rounded-full bg-black/48 ring-1 transition-[transform,background-color,box-shadow] duration-300 ease-out group-hover:bg-black/58 group-hover:ring-white/30';

const sizeStyles: Record<VideoPlayOverlaySize, { box: string; play: number; stroke: number; playClass?: string }> = {
  /** ~24px — small share of 80–85px activity thumbs */
  compact: {
    box: cn(
      discBase,
      'h-6 w-6 backdrop-blur-sm ring-white/18',
      'shadow-[0_3px_12px_rgba(0,0,0,0.32)]',
      'group-hover:scale-[1.06] group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.38)]',
    ),
    play: 10,
    stroke: 2,
    playClass: 'ml-px',
  },
  /** ~28px — readable on larger grid tiles without covering the frame */
  default: {
    box: cn(
      discBase,
      'h-7 w-7 backdrop-blur-sm ring-white/22',
      'shadow-[0_5px_18px_rgba(0,0,0,0.34)]',
      'group-hover:scale-[1.05] group-hover:shadow-[0_6px_22px_rgba(0,0,0,0.4)]',
    ),
    play: 12,
    stroke: 2.25,
    playClass: 'ml-px',
  },
  /** Larger tap target on fullscreen poster */
  modal: {
    box: cn(
      discBase,
      'h-10 w-10 backdrop-blur-md ring-white/22',
      'shadow-[0_8px_32px_rgba(0,0,0,0.42)]',
      'group-hover:scale-[1.05] group-hover:shadow-[0_10px_38px_rgba(0,0,0,0.48)]',
    ),
    play: 16,
    stroke: 2.25,
    playClass: 'ml-0.5',
  },
};

/**
 * Frosted disc + play. White glyph in both themes (`.video-play-icon` in `index.css`).
 */
export function VideoPlayOverlayDisc({ size = 'default' }: { size?: VideoPlayOverlaySize }) {
  const s = sizeStyles[size];
  return (
    <div className={s.box}>
      <Play
        size={s.play}
        strokeWidth={s.stroke}
        fill='currentColor'
        className={cn('video-play-icon', s.playClass)}
        aria-hidden
      />
    </div>
  );
}

/**
 * Play affordance on video poster thumbnails (Activity + problem media).
 */
export function VideoThumbnailPlayOverlay({ size = 'default' }: { size?: VideoPlayOverlaySize }) {
  return (
    <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
      <VideoPlayOverlayDisc size={size} />
    </div>
  );
}
