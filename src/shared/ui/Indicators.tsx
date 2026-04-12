import { Star, Lock, LockKeyhole } from 'lucide-react';
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
          'ml-0.5 inline-flex h-4 min-w-[1.25rem] shrink-0 items-center justify-center rounded border px-[3px] leading-none',
          /* Dark: rose chip — strong border + fill, not “error red” */
          'border-rose-500/55 bg-rose-950/60 text-rose-50',
          /* Light: soft tint + readable ink */
          'light:border-rose-600/55 light:bg-rose-100 light:text-rose-950',
          superadminClassName,
        )}
      >
        <LockKeyhole
          size={11}
          strokeWidth={lockIconStroke}
          className='light:text-rose-800 shrink-0 text-rose-200'
          aria-hidden
        />
      </span>
    );
  if (lockedAdmin)
    return (
      <span
        title='Admin lock'
        className={cn(
          'ml-0.5 inline-flex h-4 min-w-[1.25rem] shrink-0 items-center justify-center rounded border px-[3px] leading-none',
          /* Dark: violet chip — distinct from brand gold */
          'border-violet-400/55 bg-violet-950/55 text-violet-50',
          'light:border-violet-600/50 light:bg-violet-100 light:text-violet-950',
          adminClassName,
        )}
      >
        <Lock
          size={11}
          strokeWidth={lockIconStroke}
          className='light:text-violet-800 shrink-0 text-violet-200'
          aria-hidden
        />
      </span>
    );
  return null;
};

/** Lucide `StarHalf` is stroke-only for the left outline — clip a filled `Star` for a real half-fill. */
function StarHalfFilled({
  size,
  filledClass,
  outlineClass,
}: {
  size: number;
  filledClass: string;
  outlineClass: string;
}) {
  return (
    <span className='relative inline-block shrink-0 align-[-0.125em]' style={{ width: size, height: size }} aria-hidden>
      <Star
        size={size}
        strokeWidth={2.5}
        fill='none'
        stroke='currentColor'
        className={cn('pointer-events-none absolute top-0 left-0', outlineClass)}
      />
      <span className='pointer-events-none absolute top-0 left-0 h-full w-[50%] overflow-hidden'>
        <Star size={size} fill='currentColor' stroke='currentColor' className={cn(filledClass, 'min-w-0')} />
      </span>
    </span>
  );
}

export const Stars = ({
  numStars = -1,
  includeStarOutlines = true,
  size = 14,
  muted = false,
}: {
  numStars?: number;
  /** When true, empty slots show a light outline so the row reads as 3 stars (default). */
  includeStarOutlines?: boolean;
  size?: number;
  /** Dense lists: softer star ink (avoid whole-row opacity). */
  muted?: boolean;
}) => {
  if (numStars === -1) return null;
  const fullStars = Math.floor(numStars);
  const hasHalfStar = numStars % 1 !== 0;
  const stars = [];
  const filledClass = 'stars-rating-filled';
  const outlineClass = 'stars-rating-empty';

  for (let i = 0; i < 3; i++) {
    if (i < fullStars)
      stars.push(<Star key={i} size={size} fill='currentColor' stroke='currentColor' className={filledClass} />);
    else if (i === fullStars && hasHalfStar)
      stars.push(<StarHalfFilled key={i} size={size} filledClass={filledClass} outlineClass={outlineClass} />);
    else if (includeStarOutlines)
      stars.push(
        <Star key={i} size={size} strokeWidth={2.5} fill='none' stroke='currentColor' className={outlineClass} />,
      );
  }
  return (
    <div className={cn('stars-rating inline-flex gap-0.5', muted ? 'stars-rating--muted items-end' : 'items-center')}>
      {stars}
    </div>
  );
};
