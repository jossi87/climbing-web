/** Separates adjacent text in the same profile/activity row (middle dot, not between icons). */
export function ProfileRowTextSep() {
  return (
    <>
      {' '}
      <span className='text-slate-500/55' aria-hidden>
        ·
      </span>{' '}
    </>
  );
}
