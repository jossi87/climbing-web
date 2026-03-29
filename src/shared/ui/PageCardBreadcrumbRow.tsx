import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Breadcrumb trail + optional actions.
 * Actions are **floated right** (`flex-nowrap`, one row). The trail should live in a **`display: block` `<nav>`**
 * whose segments are **inline-level** (`inline`, `inline-flex`, `inline-block` icons) so line boxes wrap beside the
 * float, then use **full width** below it. A single `flex` breadcrumb row does **not** get that behavior.
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
    <div className={cn('mb-4 flow-root min-w-0', className)}>
      {hasActions ? (
        <div className='float-right ml-3 flex shrink-0 flex-nowrap items-center justify-end gap-1 sm:gap-1.5'>
          {actions}
        </div>
      ) : null}
      <div className='min-w-0'>{breadcrumb}</div>
    </div>
  );
}
