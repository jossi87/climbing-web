/** Middle-dot color for area · sector · problem — lighter than body meta, softer than `tickCragLink` (slate-100). */
export const profileRowMiddleDotClass = 'text-slate-300/95';

/** Separates adjacent text in the same profile/activity row (middle dot, not between icons). */
export function ProfileRowTextSep() {
  return (
    <>
      {' '}
      <span className={profileRowMiddleDotClass} aria-hidden>
        ·
      </span>{' '}
    </>
  );
}
