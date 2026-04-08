import { Ban } from 'lucide-react';
import { designContract } from '../../../design/contract';
import { cn } from '../../../lib/utils';

/** Landowner restriction — one line + icon (area / sector / problem access blocks). */
export function NoDogsAllowed() {
  return (
    <p className={cn('flex items-center gap-2.5 text-pretty', designContract.typography.body)}>
      <Ban size={16} strokeWidth={2.25} className='access-no-dogs-icon shrink-0' aria-hidden />
      <span className='min-w-0 font-normal'>
        <span className='access-no-dogs-title'>No dogs allowed</span>
        <span className='access-no-dogs-sub'> (landowner request)</span>
      </span>
    </p>
  );
}
