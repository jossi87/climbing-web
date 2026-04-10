import type { LucideIcon } from 'lucide-react';
import { Camera, Check, ChevronDown, Filter, MessageSquare, Plus } from 'lucide-react';
import { designContract } from '../../../design/contract';
import { activityFilterChipBase, activityFilterChipOn } from '../../../design/activityFilterChips';
import { cn } from '../../../lib/utils';
import { Card, SectionLabel } from '../../ui';
import { activityFrontpageToolbarClassName } from './activityFrontpageToolbar';

/** Mirrors {@link ActivityFeedMetaRow}: story flex-1 + time on the far right; optional second row like stars/comment. */
export const ActivitySkeleton = () => (
  <div className='min-h-[3.5rem] animate-pulse bg-transparent px-4 py-3 md:min-h-[4rem] md:px-5 md:py-2.5'>
    <div className='flex items-start gap-3 md:gap-3'>
      {/* Match {@link Avatar} size `small` (40px) at all breakpoints */}
      <div className='skeleton-bar h-10 w-10 shrink-0 rounded-full pt-0.5' />
      <div className='min-w-0 flex-1 space-y-1.5 pt-0.5'>
        <div className='flex w-full min-w-0 flex-row items-start justify-between gap-3 sm:gap-4 md:gap-6'>
          <div className='min-w-0 flex-1 space-y-1.5'>
            <div className='skeleton-bar h-3 max-w-[min(100%,22rem)] rounded md:h-3.5' />
            <div className='skeleton-bar-muted h-3 w-[58%] rounded md:h-3.5' />
          </div>
          <div
            className='skeleton-bar-muted h-2.5 w-[2.75rem] shrink-0 self-start rounded pt-0.5 md:h-3 md:w-[3.25rem]'
            aria-hidden
          />
        </div>
        <div className='skeleton-bar-muted h-2.5 max-w-[12rem] rounded' aria-hidden />
      </div>
    </div>
  </div>
);

/** Same layout as {@link Activity} filter chips (defaults on) so lazy-hydration does not jump the column. */
function ToolbarChipPlaceholder({
  icon: Icon,
  label,
  labelNarrow,
}: {
  icon: LucideIcon;
  label: string;
  labelNarrow?: string;
}) {
  return (
    <div className={cn(activityFilterChipBase, activityFilterChipOn)} aria-hidden>
      <Icon size={12} strokeWidth={2} className='light:text-slate-950 shrink-0 text-slate-100' />
      <span className={cn(designContract.typography.uiCompact, 'light:text-slate-950 text-slate-100')}>
        {labelNarrow ? (
          <>
            <span className='sm:hidden'>{labelNarrow}</span>
            <span className='hidden sm:inline'>{label}</span>
          </>
        ) : (
          label
        )}
      </span>
    </div>
  );
}

/**
 * Reserves the Activity toolbar (label + chip row) while the feed chunk loads; the card-only fallback used to
 * mount the real toolbar later and pushed the feed + aside down ~one toolbar height.
 */
export const ActivityFrontpageSuspenseFallback = () => (
  <div className='w-full'>
    <div className={activityFrontpageToolbarClassName} aria-hidden>
      <SectionLabel className='hidden text-slate-400 md:block'>Latest activity</SectionLabel>

      <div className={designContract.layout.activityToolbarActionsFrontpage}>
        <div className='relative shrink-0'>
          <div className={cn(activityFilterChipBase, activityFilterChipOn, 'min-w-0 max-sm:max-w-[min(100%,8.5rem)]')}>
            <Filter size={12} className='shrink-0 text-slate-300' strokeWidth={2} />
            <span className={cn(designContract.typography.uiCompact, 'min-w-0 truncate text-slate-300')}>All</span>
            <ChevronDown size={10} className='shrink-0 text-slate-300' strokeWidth={2} />
          </div>
        </div>
        <ToolbarChipPlaceholder icon={Plus} label='FA' />
        <ToolbarChipPlaceholder icon={Check} label='Ticks' />
        <ToolbarChipPlaceholder icon={Camera} label='Media' />
        <ToolbarChipPlaceholder icon={MessageSquare} label='Comments' labelNarrow='Com' />
      </div>
    </div>
    <Card flush>
      {[...Array(10)].map((_, i) => (
        <ActivitySkeleton key={i} />
      ))}
    </Card>
  </div>
);
