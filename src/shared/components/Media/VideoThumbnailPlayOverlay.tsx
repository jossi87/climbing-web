import { Play } from 'lucide-react';

/**
 * Play affordance on video poster thumbnails (Activity + problem media). No dimming of the image — the
 * control alone signals video. Rim uses dark + light rings so it stays visible on bright photos (plain
 * `ring-white/*` disappears on light thumbnails in daylight).
 */
export function VideoThumbnailPlayOverlay() {
  return (
    <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-black/70 shadow-[0_4px_20px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,0,0,0.55),0_0_0_3px_rgba(255,255,255,0.92)] backdrop-blur-[2px] transition-transform duration-300 group-hover:scale-105'>
        <Play
          size={14}
          fill='currentColor'
          stroke='currentColor'
          className='ml-0.5'
          style={{ color: '#ffffff' }}
          aria-hidden
        />
      </div>
    </div>
  );
}
