import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Breadcrumb trail (left, grows) + actions (right, top-aligned). Single row at all breakpoints
 * so actions stay in the upper-right; trail wraps inside the left column when space is tight.
 */
export function PageCardBreadcrumbRow({
  breadcrumb,
  actions,
  className,
}: {
  breadcrumb: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const hasActions = actions != null && actions !== false;
  return (
    <div className={cn('mb-4 flex min-w-0 flex-row items-start gap-x-3 gap-y-2 sm:gap-x-4', className)}>
      <div className='min-w-0 flex-1 pt-0.5 pr-1 sm:pr-2'>{breadcrumb}</div>
      {hasActions ? (
        <div className='flex shrink-0 flex-wrap items-start justify-end gap-x-1.5 gap-y-1.5 sm:gap-x-2 sm:pt-0.5'>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
