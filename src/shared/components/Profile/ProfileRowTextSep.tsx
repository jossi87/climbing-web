import { cn } from '../../../lib/utils';

/** Middle dot: dark panels use soft sep; light mode uses solid slate-500 so `·` isn’t washed out (opacity + remap bugs). */
export const profileRowMiddleDotClass = 'text-slate-300/95 light:text-slate-500';

/**
 * Separates adjacent text in the same profile/activity row (middle dot).
 * Uses horizontal margin only — avoids `{' '}` + lock wrappers stacking into uneven gaps before `·`.
 */
export function ProfileRowTextSep() {
  return (
    <span className={cn(profileRowMiddleDotClass, 'mx-0.5 inline')} aria-hidden>
      ·
    </span>
  );
}
