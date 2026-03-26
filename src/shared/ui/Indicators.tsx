import { Star, StarHalf, Lock, LockKeyhole } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LockSymbol = ({
  lockedAdmin = false,
  lockedSuperadmin = false,
  adminClassName,
  superadminClassName,
}: {
  lockedAdmin?: boolean;
  lockedSuperadmin?: boolean;
  adminClassName?: string;
  superadminClassName?: string;
}) => {
  if (lockedSuperadmin)
    return (
      <span
        className={cn(
          'border-brand/45 bg-brand/8 text-brand/80 ml-0.5 inline-flex h-[14px] items-center rounded border px-1 leading-none',
          superadminClassName,
        )}
      >
        <LockKeyhole size={8} />
      </span>
    );
  if (lockedAdmin)
    return (
      <span
        className={cn(
          'bg-surface-nav/40 ml-0.5 inline-flex h-[14px] items-center rounded border border-white/15 px-1 leading-none text-slate-400',
          adminClassName,
        )}
      >
        <Lock size={8} />
      </span>
    );
  return null;
};

export const Stars = ({
  numStars = -1,
  includeStarOutlines = false,
  size = 14,
}: {
  numStars?: number;
  includeStarOutlines?: boolean;
  size?: number;
}) => {
  if (numStars === -1) return null;
  const fullStars = Math.floor(numStars);
  const hasHalfStar = numStars % 1 !== 0;
  const stars = [];

  for (let i = 0; i < 3; i++) {
    if (i < fullStars) stars.push(<Star key={i} size={size} className='fill-slate-100 text-slate-100' />);
    else if (i === fullStars && hasHalfStar)
      stars.push(<StarHalf key={i} size={size} className='fill-slate-100 text-slate-100' />);
    else if (includeStarOutlines) stars.push(<Star key={i} size={size} className='text-slate-500/85 opacity-90' />);
  }
  return <div className='inline-flex items-center gap-0.5'>{stars}</div>;
};
