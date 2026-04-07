import { Ban } from 'lucide-react';

/** Landowner restriction — one line + icon (area / sector / problem access blocks). */
export function NoDogsAllowed() {
  return (
    <p className='flex items-center gap-2.5 text-[13px] leading-snug text-pretty sm:text-[14px]'>
      <Ban size={16} strokeWidth={2.25} className='access-no-dogs-icon shrink-0' aria-hidden />
      <span className='min-w-0'>
        <span className='access-no-dogs-title font-semibold'>No dogs allowed</span>
        <span className='access-no-dogs-sub font-normal'> (landowner request)</span>
      </span>
    </p>
  );
}
