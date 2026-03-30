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
    <div className={cn('mb-4 flex min-w-0 flex-row items-start gap-x-2 gap-y-1.5 sm:gap-x-4 sm:gap-y-2', className)}>
      <div className='min-w-0 flex-1 pt-0.5 pr-0.5 sm:pr-2'>{breadcrumb}</div>
      {hasActions ? (
        <div className='flex shrink-0 flex-wrap items-start justify-end gap-x-1 gap-y-1 sm:gap-x-2 sm:gap-y-1.5 sm:pt-0.5'>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
