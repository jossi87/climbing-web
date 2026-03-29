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
          'ml-0.5 inline-flex h-[14px] items-center rounded border border-red-400/45 bg-red-500/18 px-1 leading-none text-red-200',
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
          'ml-0.5 inline-flex h-[14px] items-center rounded border border-amber-300/45 bg-amber-400/18 px-1 leading-none text-amber-100',
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
  muted = false,
}: {
  numStars?: number;
  includeStarOutlines?: boolean;
  size?: number;
  /** Softer fills for dense lists (e.g. sector problem rows). */
  muted?: boolean;
}) => {
  if (numStars === -1) return null;
  const fullStars = Math.floor(numStars);
  const hasHalfStar = numStars % 1 !== 0;
  const stars = [];
  const filledClass = muted ? 'fill-slate-500/90 text-slate-500' : 'fill-slate-100 text-slate-100';
  const outlineClass = muted ? 'text-slate-600/75 opacity-80' : 'text-slate-500/85 opacity-90';

  for (let i = 0; i < 3; i++) {
    if (i < fullStars) stars.push(<Star key={i} size={size} className={filledClass} />);
    else if (i === fullStars && hasHalfStar) stars.push(<StarHalf key={i} size={size} className={filledClass} />);
    else if (includeStarOutlines) stars.push(<Star key={i} size={size} className={outlineClass} />);
  }
  return <div className='inline-flex items-center gap-0.5'>{stars}</div>;
};
