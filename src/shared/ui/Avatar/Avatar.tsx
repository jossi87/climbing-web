import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { getMediaFileUrl } from '../../../api/utils';
import { cn } from '../../../lib/utils';
import { avatarFallbackColors, avatarInitialsFromName } from './avatarFallback';

const AvatarModal = lazy(() => import('./AvatarModal'));

type AvatarSize = 'micro' | 'mini' | 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge' | 'massive';

type AvatarProps = {
  name?: string;
  mediaId?: number;
  mediaVersionStamp?: number;
  size?: AvatarSize;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

const SIZE_MAP: Record<AvatarSize, number> = {
  micro: 18,
  mini: 24,
  tiny: 32,
  small: 40,
  medium: 150,
  large: 300,
  big: 450,
  huge: 600,
  massive: 800,
};

export function Avatar({ name, mediaId, mediaVersionStamp, size = 'mini', className, onClick }: AvatarProps) {
  const pixelSize = SIZE_MAP[size] || 24;
  const mid = mediaId ?? 0;
  const initials = avatarInitialsFromName(name);
  const fallbackStyle = mid === 0 ? avatarFallbackColors(name) : undefined;
  /** ~2× for retina; capped so we don’t request huge originals on modal-sized avatars. */
  const mediaTargetWidth = Math.min(2048, Math.round(pixelSize * 2));

  return (
    <div
      className={cn(
        'border-surface-border flex shrink-0 items-center justify-center overflow-hidden rounded-full border transition-all select-none',
        mid === 0 ? 'border-white/12' : 'bg-surface-hover',
        onClick && 'hover:border-brand-border cursor-pointer',
        className,
      )}
      style={{ width: pixelSize, height: pixelSize, ...fallbackStyle }}
      onClick={onClick}
    >
      {mid === 0 ? (
        <span
          className='pointer-events-none flex h-full w-full items-center justify-center leading-none font-light tracking-wide uppercase antialiased'
          style={{ fontSize: pixelSize * 0.33 }}
        >
          {initials}
        </span>
      ) : (
        <img
          src={getMediaFileUrl(mid, mediaVersionStamp ?? 0, false, { targetWidth: mediaTargetWidth })}
          alt={name ?? ''}
          loading='lazy'
          width={pixelSize}
          height={pixelSize}
          className='pointer-events-none h-full w-full object-cover'
          decoding='async'
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  items,
  size = 'mini',
  statusIcon,
  max = 3,
}: {
  items: AvatarProps[];
  size?: AvatarSize;
  statusIcon?: React.ReactNode;
  max?: number;
}) {
  return (
    <div className='relative flex items-center'>
      <div className={cn('flex', size === 'micro' || size === 'mini' || size === 'tiny' ? '-space-x-3' : '-space-x-4')}>
        {items.slice(0, max).map((item, i) => (
          <ClickableAvatar
            key={item.mediaId || i}
            {...item}
            size={size}
            className={cn('ring-surface-hover rounded-full ring-2', item.className)}
          />
        ))}
        {items.length > max && (
          <div
            className='flex items-center justify-center rounded-full border border-white/10 bg-slate-700 text-[10px] font-bold text-slate-200 ring-2 ring-slate-900'
            style={{ width: SIZE_MAP[size], height: SIZE_MAP[size] }}
          >
            +{items.length - max}
          </div>
        )}
      </div>
      {statusIcon && (
        <div
          className={cn(
            'border-brand-border/50 bg-surface-card absolute -right-px -bottom-px z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border',
          )}
        >
          {/* No drop-shadow / ring — they soften tiny Lucide glyphs; hairline border stays crisp. */}
          <span className='inline-flex items-center justify-center text-slate-200 [&_svg]:block [&_svg]:shrink-0'>
            {statusIcon}
          </span>
        </div>
      )}
    </div>
  );
}

export function ClickableAvatar(props: AvatarProps) {
  const [open, setOpen] = useState(false);
  const mid = props.mediaId ?? 0;
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, closeModal]);

  return (
    <>
      <Avatar
        {...props}
        onClick={(e) => {
          if (mid !== 0) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }
          props.onClick?.(e);
        }}
      />
      {open &&
        mid !== 0 &&
        createPortal(
          <Suspense fallback={null}>
            <AvatarModal mid={mid} name={props.name} stamp={props.mediaVersionStamp} onClose={closeModal} />
          </Suspense>,
          document.body,
        )}
    </>
  );
}

export default Avatar;
