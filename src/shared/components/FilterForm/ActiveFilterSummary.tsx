import { Trash2, X } from 'lucide-react';
import {
  activityFilterChipBase,
  activityFilterChipOff,
  activityFilterChipOn,
} from '../../../design/activityFilterChips';
import { activeFilterText, describeActiveFilters } from '../../../features/Problems/filterSummary';
import { cn } from '../../../lib/utils';
import { useMeta } from '../Meta';
import { useFilter } from './context';

/**
 * The active filter as removable chips, shown in the problems **header** beside the Filter/Download buttons.
 *
 * The panel is collapsed by default, so this row — one pill per active filter, each dismissing *only*
 * itself — plus the header's “Showing n routes” line are what say the panel holds something.
 *
 * Deliberately no “Edit filter” chip (the header's own Filter toggle is that button) and no wrapper box: the
 * row is just chips plus the single bulk escape, “Clear all”.
 */
export const ActiveFilterSummary = () => {
  const meta = useMeta();
  const filter = useFilter();
  const { dispatch } = filter;

  const activeFilters = describeActiveFilters(filter, meta);
  if (!activeFilters.length) {
    return null;
  }

  return (
    <div role='group' aria-label='Active filter' className='flex flex-wrap items-center gap-2'>
      {activeFilters.map(({ id, label, value, clear }) => {
        const text = activeFilterText({ label, value });
        return (
          <button
            key={id}
            type='button'
            onClick={() => dispatch(clear)}
            title={`Remove filter — ${text}`}
            aria-label={`Remove filter — ${text}`}
            className={cn(activityFilterChipBase, activityFilterChipOn, 'group max-w-full')}
          >
            {label && <span className='shrink-0 text-slate-400'>{`${label}:`}</span>}
            <span className='min-w-0 truncate'>{value}</span>
            <X
              size={11}
              strokeWidth={2.5}
              aria-hidden
              className='shrink-0 text-slate-500 transition-colors group-hover:text-slate-200'
            />
          </button>
        );
      })}

      <button
        type='button'
        onClick={() => dispatch({ action: 'reset', section: 'all' })}
        className={cn(activityFilterChipBase, activityFilterChipOff)}
      >
        <Trash2 size={12} strokeWidth={2} aria-hidden className='shrink-0' />
        Clear all
      </button>
    </div>
  );
};
