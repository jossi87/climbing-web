import { Ban } from 'lucide-react';

/** Landowner restriction — one line + icon (area / sector / problem access blocks). */
export function NoDogsAllowed() {
  return (
    <p className='flex items-center gap-2.5 text-[13px] leading-snug text-pretty sm:text-[14px]'>
      <Ban size={16} strokeWidth={2.25} className='shrink-0 text-amber-400/95' aria-hidden />
      <span className='min-w-0 text-orange-100'>
        <span className='font-semibold'>No dogs allowed</span>
        <span className='font-normal text-orange-200/90'> (landowner request)</span>
      </span>
    </p>
  );
}
