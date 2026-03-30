import { Star, StarHalf, Lock, LockKeyhole } from 'lucide-react';
import { cn } from '../../lib/utils';

const lockIconStroke = 2.35;

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
        title='Super-admin lock'
        className={cn(
          'ml-0.5 inline-flex h-4 min-w-[1.25rem] shrink-0 items-center justify-center rounded border border-red-400/65 bg-red-950/55 px-[3px] leading-none text-red-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]',
          superadminClassName,
        )}
      >
        <LockKeyhole size={11} strokeWidth={lockIconStroke} className='shrink-0 text-red-200' aria-hidden />
      </span>
    );
  if (lockedAdmin)
    return (
      <span
        title='Admin lock'
        className={cn(
          'ml-0.5 inline-flex h-4 min-w-[1.25rem] shrink-0 items-center justify-center rounded border border-amber-400/60 bg-amber-950/45 px-[3px] leading-none text-amber-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
          adminClassName,
        )}
      >
        <Lock size={11} strokeWidth={lockIconStroke} className='shrink-0 text-amber-200' aria-hidden />
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
  const outlineClass = muted ? 'fill-none text-slate-500/95' : 'fill-none text-slate-400/95';

  for (let i = 0; i < 3; i++) {
    if (i < fullStars) stars.push(<Star key={i} size={size} className={filledClass} />);
    else if (i === fullStars && hasHalfStar) stars.push(<StarHalf key={i} size={size} className={filledClass} />);
    else if (includeStarOutlines) stars.push(<Star key={i} size={size} strokeWidth={2.65} className={outlineClass} />);
  }
  return <div className='inline-flex items-center gap-0.5'>{stars}</div>;
};
