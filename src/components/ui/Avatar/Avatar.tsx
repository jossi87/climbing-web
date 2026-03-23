import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { getMediaFileUrl } from '../../../api/utils';
import { cn } from '../../../lib/utils';

const AvatarModal = lazy(() => import('./AvatarModal'));

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
  tiny: 32,
  small: 40,
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
        'shrink-0 rounded-full overflow-hidden border border-surface-border bg-surface-hover flex items-center justify-center transition-all select-none',
        onClick && 'cursor-pointer hover:border-brand/50',
        className,
      )}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
    >
      {mid === 0 ? (
        <span
          className='font-bold text-slate-500 uppercase tracking-tighter pointer-events-none'
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
          className='w-full h-full object-cover pointer-events-none'
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
      <div className={cn('flex', size === 'mini' || size === 'tiny' ? '-space-x-3' : '-space-x-4')}>
        {items.slice(0, max).map((item, i) => (
          <ClickableAvatar
            key={item.mediaId || i}
            {...item}
            size={size}
            className={cn('ring-2 ring-surface-card rounded-full', item.className)}
          />
        ))}
        {items.length > max && (
          <div
            className='bg-surface-nav text-slate-500 font-bold text-[8px] flex items-center justify-center rounded-full ring-2 ring-surface-card'
            style={{ width: SIZE_MAP[size], height: SIZE_MAP[size] }}
          >
            +{items.length - max}
          </div>
        )}
      </div>
      {statusIcon && (
        <div className='absolute -bottom-1 -right-1 bg-surface-card rounded-full p-px border border-surface-border shadow-sm flex items-center justify-center z-10'>
          {statusIcon}
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
            <AvatarModal
              mid={mid}
              name={props.name}
              stamp={props.mediaVersionStamp}
              onClose={closeModal}
            />
          </Suspense>,
          document.body,
        )}
    </>
  );
}

export default Avatar;
