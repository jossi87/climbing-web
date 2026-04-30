import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { getMediaFileUrl } from '../../../api/utils';

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
      className='bg-surface-dark animate-in fade-in fixed inset-0 z-9999 flex h-screen w-screen flex-col items-center justify-center p-4 transition-all duration-200'
      onClick={onClose}
    >
      <div className='relative flex max-h-[85vh] max-w-5xl flex-col items-center' onClick={(e) => e.stopPropagation()}>
        <img
          src={getMediaFileUrl(mid, stamp ?? 0, false)}
          alt={name ?? ''}
          className='border-surface-border h-auto max-h-full w-auto max-w-full cursor-pointer rounded-xl border object-contain shadow-2xl'
          onClick={onClose}
        />
        {name ? <div className='mt-5 text-center text-base font-semibold text-slate-100 sm:text-lg'>{name}</div> : null}
        <div className='mt-4 flex items-center gap-3'>
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
