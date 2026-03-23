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
      className='fixed inset-0 w-screen h-screen z-9999 flex flex-col items-center justify-center p-4 bg-surface-dark/95 transition-all animate-in fade-in duration-200'
      onClick={onClose}
    >
      <div
        className='relative max-w-5xl max-h-[85vh] flex flex-col items-center'
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getMediaFileUrl(mid, stamp ?? 0, false)}
          alt={name ?? ''}
          className='rounded-xl shadow-2xl border border-surface-border w-auto h-auto max-w-full max-h-full object-contain'
        />
        <button
          className='mt-8 px-8 py-2.5 bg-surface-hover hover:bg-surface-border text-slate-200 rounded-full font-bold uppercase text-[10px] tracking-widest transition-all border border-surface-border'
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
