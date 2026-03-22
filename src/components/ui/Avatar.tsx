import { useState } from 'react';
import { getMediaFileUrl } from '../../api/utils';
import { cn } from '../../lib/utils';

type AvatarSize = 'mini' | 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge' | 'massive';

type AvatarProps = {
  name?: string;
  mediaId?: number;
  mediaVersionStamp?: number;
  size?: AvatarSize;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

const SIZE_MAP: Record<AvatarSize, number> = {
  mini: 24,
  tiny: 40,
  small: 80,
  medium: 150,
  large: 300,
  big: 450,
  huge: 600,
  massive: 800,
};

export function Avatar({
  name,
  mediaId,
  mediaVersionStamp,
  size = 'mini',
  className,
  onClick,
}: AvatarProps) {
  const pixelSize = SIZE_MAP[size] || 24;
  const mid = mediaId ?? 0;

  const initials =
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  return (
    <div
      className={cn(
        'shrink-0 rounded-full overflow-hidden border border-surface-border bg-surface-hover flex items-center justify-center transition-all',
        onClick && 'cursor-pointer hover:border-brand/50',
        className,
      )}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
    >
      {mid === 0 ? (
        <span
          className='font-bold text-slate-500 uppercase tracking-tighter select-none pointer-events-none'
          style={{ fontSize: pixelSize * 0.4 }}
        >
          {initials}
        </span>
      ) : (
        <img
          src={getMediaFileUrl(mid, mediaVersionStamp ?? 0, false, { targetWidth: pixelSize })}
          alt={name ?? ''}
          loading='lazy'
          className='w-full h-full object-cover pointer-events-none'
        />
      )}
    </div>
  );
}

export function ClickableAvatar(props: AvatarProps) {
  const [open, setOpen] = useState(false);
  const mid = props.mediaId ?? 0;

  return (
    <>
      <Avatar
        {...props}
        onClick={(e) => {
          if (mid !== 0) setOpen(true);
          if (props.onClick) props.onClick(e);
        }}
      />

      {open && mid !== 0 && (
        <div
          className='fixed inset-0 z-100 flex items-center justify-center p-4 bg-surface-nav/90 backdrop-blur-sm'
          onClick={() => setOpen(false)}
        >
          <div className='relative max-w-4xl max-h-full' onClick={(e) => e.stopPropagation()}>
            <img
              src={getMediaFileUrl(mid, props.mediaVersionStamp ?? 0, false)}
              alt={props.name ?? ''}
              className='rounded-lg shadow-2xl border border-surface-border max-h-[90vh] object-contain'
            />
            <button
              className='absolute -top-10 right-0 text-slate-400 hover:text-white font-bold uppercase text-xs tracking-widest transition-colors'
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Avatar;
