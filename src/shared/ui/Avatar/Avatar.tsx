import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { getMediaFileUrl } from '../../../api/utils';
import { cn } from '../../../lib/utils';

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
        'border-surface-border bg-surface-hover flex shrink-0 items-center justify-center overflow-hidden rounded-full border transition-all select-none',
        onClick && 'hover:border-brand/50 cursor-pointer',
        className,
      )}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
    >
      {mid === 0 ? (
        <span
          className='pointer-events-none flex h-full w-full items-center justify-center leading-none font-bold tracking-tighter text-slate-500 uppercase'
          style={{ fontSize: pixelSize * 0.4 }}
        >
          {initials}
        </span>
      ) : (
        <img
          src={getMediaFileUrl(mid, mediaVersionStamp ?? 0, false, { targetWidth: pixelSize })}
          alt={name ?? ''}
          loading='lazy'
          width={pixelSize}
          height={pixelSize}
          className='pointer-events-none h-full w-full object-cover'
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
            className='bg-surface-nav ring-surface-hover flex items-center justify-center rounded-full text-[8px] font-bold text-slate-500 ring-2'
            style={{ width: SIZE_MAP[size], height: SIZE_MAP[size] }}
          >
            +{items.length - max}
          </div>
        )}
      </div>
      {statusIcon && (
        <div
          className={cn(
            'bg-surface-card absolute -right-1 -bottom-1 z-10 flex items-center justify-center rounded-full border border-white/12 p-px shadow-sm',
            'ring-brand/35 ring-1',
          )}
        >
          <span className='inline-flex items-center justify-center text-slate-100 drop-shadow-sm'>{statusIcon}</span>
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
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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
