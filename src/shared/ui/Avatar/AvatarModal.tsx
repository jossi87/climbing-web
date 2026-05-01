import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { getMediaFileUrl } from '../../../api/utils';

/**
 * **Layout strategy** — viewport-sized backdrop, three vertically-stacked sections inside a `max-w-5xl` column:
 *
 *   1. Image wrapper: `flex-1 min-h-0` — fills *remaining* vertical space after the footer claims its natural size,
 *      and `min-h-0` lets the wrapper shrink below the image's intrinsic content size (without it, flex children
 *      refuse to shrink below their content). The `<img>` inside uses `max-h-full max-w-full object-contain` to
 *      scale down to fit while preserving aspect ratio.
 *   2. Optional name caption (centered, shrink-0).
 *   3. Action buttons (View profile / Close, shrink-0).
 *
 * **Why this isn't `max-h-[85vh]` on a single flex-col container** (the previous version) — `max-h: %` on a flex
 * child evaluates to `none` when the containing block has auto height (CSS spec), so `max-h-full` on the `<img>`
 * was silently ignored when the parent was sized by content. Tall images rendered at natural height, overflowed
 * the column, and pushed the buttons below the viewport. Wrapping the image in a `flex-1 min-h-0` div gives the
 * image a containing block with a *definite* height (the remaining space inside the column), so `max-h-full` is
 * now respected and the image scales down on small screens.
 */
export default function AvatarModal({
  mid,
  name,
  userId,
  stamp,
  onClose,
}: {
  mid: number;
  name?: string;
  /** When set (>0), the modal renders a "View profile" link to `/user/{userId}`. */
  userId?: number;
  stamp?: number;
  onClose: () => void;
}) {
  const hasUser = (userId ?? 0) > 0;

  return (
    <div
      className='bg-surface-dark animate-in fade-in fixed inset-0 z-9999 flex flex-col items-center justify-center p-4 transition-all duration-200'
      onClick={onClose}
    >
      <div
        className='relative flex h-full w-full max-w-5xl flex-col items-center justify-center gap-5'
        onClick={(e) => e.stopPropagation()}
      >
        {/*
          `flex-1 min-h-0` makes this wrapper claim the remaining height after the name + buttons measure their
          natural size. The min-0 floor is critical — without it, the flex item would refuse to shrink below the
          image's intrinsic height and the column would overflow downward, hiding the buttons.
        */}
        <div className='flex min-h-0 w-full flex-1 items-center justify-center'>
          <img
            src={getMediaFileUrl(mid, stamp ?? 0, false)}
            alt={name ?? ''}
            className='border-surface-border max-h-full max-w-full cursor-pointer rounded-xl border object-contain shadow-2xl'
            onClick={onClose}
          />
        </div>
        {name ? (
          <div className='shrink-0 text-center text-base font-semibold text-slate-100 sm:text-lg'>{name}</div>
        ) : null}
        <div className='flex shrink-0 items-center gap-3'>
          {hasUser ? (
            <Link
              to={`/user/${userId}`}
              onClick={onClose}
              className='btn-brand-solid border-brand-border inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-all hover:opacity-90'
            >
              <User size={12} strokeWidth={2.25} />
              View profile
            </Link>
          ) : null}
          <button
            className='bg-surface-hover hover:bg-surface-border border-surface-border rounded-full border px-8 py-2.5 text-[11px] font-bold tracking-widest text-slate-200 uppercase transition-all'
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
