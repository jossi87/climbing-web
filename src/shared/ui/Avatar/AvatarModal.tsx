import { getMediaFileUrl } from '../../../api/utils';

export default function AvatarModal({
  mid,
  name,
  stamp,
  onClose,
}: {
  mid: number;
  name?: string;
  stamp?: number;
  onClose: () => void;
}) {
  return (
    <div
      className='bg-surface-dark animate-in fade-in fixed inset-0 z-9999 flex h-screen w-screen flex-col items-center justify-center p-4 transition-all duration-200'
      onClick={onClose}
    >
      <div className='relative flex max-h-[85vh] max-w-5xl flex-col items-center'>
        <img
          src={getMediaFileUrl(mid, stamp ?? 0, false)}
          alt={name ?? ''}
          className='border-surface-border h-auto max-h-full w-auto max-w-full cursor-pointer rounded-xl border object-contain shadow-2xl'
        />
        <button
          className='bg-surface-hover hover:bg-surface-border border-surface-border mt-8 rounded-full border px-8 py-2.5 text-[11px] font-bold tracking-widest text-slate-200 uppercase transition-all'
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
