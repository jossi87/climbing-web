import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

/** Shared row for “Neighbours” / boulder “On rock” in problem overview. */
export const problemSurroundingsRowClass = cn(
  designContract.typography.body,
  'flex min-w-0 flex-col gap-1 text-[14px] leading-normal text-slate-300 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-1 sm:text-sm',
);

export const problemSurroundingsLeadClass =
  'block text-[15px] font-medium leading-snug tracking-tight text-slate-50 sm:inline-flex sm:shrink-0 sm:items-baseline sm:text-sm';
