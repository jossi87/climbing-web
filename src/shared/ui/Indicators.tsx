import { Star, StarHalf, Lock, UserRoundCheck } from 'lucide-react';

export const LockSymbol = ({
  lockedAdmin = false,
  lockedSuperadmin = false,
}: {
  lockedAdmin?: boolean;
  lockedSuperadmin?: boolean;
}) => {
  if (lockedSuperadmin) return <UserRoundCheck size={14} className='text-brand/60 inline' />;
  if (lockedAdmin) return <Lock size={14} className='inline text-slate-600' />;
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
