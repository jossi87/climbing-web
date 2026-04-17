import { CircleX, PawPrint } from 'lucide-react';
import { designContract } from '../../../design/contract';
import { cn } from '../../../lib/utils';

/** Landowner restriction — one-line bilingual warning + icon. */
export function NoDogsAllowed() {
  return (
    <p
      className={cn(
        'border-access-danger/45 bg-access-danger/12 text-access-danger flex items-center gap-2.5 rounded-md border px-2.5 py-1.5 text-pretty',
        designContract.typography.body,
      )}
    >
      <span
        className='access-no-dogs-icon relative inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center'
        aria-hidden
      >
        <PawPrint size={17} strokeWidth={2.2} />
        <CircleX size={11} strokeWidth={2.5} className='bg-surface absolute -right-1 -bottom-1 rounded-full px-[1px]' />
      </span>
      <span className='min-w-0 font-semibold'>
        <span lang='en'>
          <span className='access-no-dogs-title'>No dogs allowed</span>
        </span>
        <span aria-hidden className='access-no-dogs-sub px-1.5'>
          |
        </span>
        <span lang='nb'>
          <span className='access-no-dogs-title'>Helårsbåndtvang</span>
        </span>
      </span>
    </p>
  );
}
