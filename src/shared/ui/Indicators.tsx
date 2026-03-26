import { Star, StarHalf, Lock, UserRoundCheck } from 'lucide-react';
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
  if (lockedSuperadmin) return <UserRoundCheck size={14} className={cn('text-brand/60 inline', superadminClassName)} />;
  if (lockedAdmin) return <Lock size={14} className={cn('inline text-slate-600', adminClassName)} />;
  return null;
};

export const Stars = ({
  numStars = -1,
  includeStarOutlines = false,
}: {
  numStars?: number;
  includeStarOutlines?: boolean;
}) => {
  if (numStars === -1) return null;
  const fullStars = Math.floor(numStars);
  const hasHalfStar = numStars % 1 !== 0;
  const stars = [];

  for (let i = 0; i < 3; i++) {
    if (i < fullStars) stars.push(<Star key={i} size={14} className='fill-slate-100 text-slate-100' />);
    else if (i === fullStars && hasHalfStar)
      stars.push(<StarHalf key={i} size={14} className='fill-slate-100 text-slate-100' />);
    else if (includeStarOutlines) stars.push(<Star key={i} size={14} className='text-slate-500/85 opacity-90' />);
  }
  return <div className='inline-flex items-center gap-0.5'>{stars}</div>;
};
