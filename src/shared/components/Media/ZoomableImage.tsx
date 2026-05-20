import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getMediaFileUrl, getMediaFileUrlSrcSet, mediaIdentityId, mediaIdentityVersionStamp } from '../../../api';
import type { components } from '../../../@types/buldreinfo/swagger';

/**
 * Full-size image viewer.
 *
 * Shows the image at its original resolution with native scroll to pan.
 * Click X or the background to go back to the normal modal view.
 */
type Props = {
  m: components['schemas']['Media'];
  onExitZoom: () => void;
};

export const ZoomableImage = ({ m, onExitZoom }: Props) => {
  const [loaded, setLoaded] = useState(false);

  // Hide body scrollbar while zoom overlay is active
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── image src (high-res) ──────────────────────────────────────────────
  const midId = mediaIdentityId(m.identity);
  const stamp = mediaIdentityVersionStamp(m.identity);
  const targetWidth = Math.max(m.width ?? 0, 2560);
  const src = getMediaFileUrl(midId, stamp, false, { targetWidth });
  const srcSet = getMediaFileUrlSrcSet(midId, stamp, Math.max(m.width ?? 0, targetWidth));

  return (
    <div className='fixed inset-0 z-[300] flex items-start justify-center bg-black/95' onClick={onExitZoom}>
      {/* Close button */}
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          onExitZoom();
        }}
        className='absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-[#f8fafc] shadow-lg ring-1 ring-white/20 transition-all hover:bg-red-700 active:scale-95'
        aria-label='Exit zoom'
      >
        <X size={20} strokeWidth={2} />
      </button>

      {/* Loading indicator */}
      {!loaded && (
        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
          <Loader2 className='animate-spin text-[#f8fafc]/60' size={40} strokeWidth={1.5} />
        </div>
      )}

      {/* Full-size image with native scroll */}
      <div className='h-full w-full overflow-auto' onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          srcSet={srcSet}
          sizes={`${Math.max(m.width ?? 2560, 2560)}px`}
          alt=''
          draggable={false}
          className='block select-none'
          style={{
            width: m.width ? `${m.width}px` : 'auto',
            height: 'auto',
            maxWidth: 'none',
            maxHeight: 'none',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
};
