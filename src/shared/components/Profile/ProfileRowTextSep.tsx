import { cn } from '../../../lib/utils';

/** Middle dot: slightly stronger in light mode to improve scan rhythm in long ascent rows. */
export const profileRowMiddleDotClass = 'text-slate-300/95 light:text-slate-600';

/**
 * Separates adjacent text in the same profile/activity row (middle dot).
 * Horizontal margin only — avoids `{' '}` + lock wrappers stacking into uneven gaps before `·`.
 */
export function ProfileRowTextSep() {
  return (
    <span className={cn(profileRowMiddleDotClass, 'mx-1.5 inline sm:mx-2')} aria-hidden>
      ·
    </span>
  );
}
