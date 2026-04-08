import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Breadcrumb trail (left, grows) + actions (**always** top-right). Trail wraps in the left column; slightly smaller
 * {@link designContract.controls.pageHeaderIconButton} frees horizontal space so wrapped lines use nearly full width.
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
    <div
      className={cn(
        'mb-4 flex min-w-0 flex-row items-start gap-x-1.5 gap-y-1 sm:gap-x-2 sm:gap-y-1.5 md:gap-x-3',
        className,
      )}
    >
      <div className='min-w-0 flex-1 pt-0.5 pr-0 sm:pr-1.5 md:pr-2'>{breadcrumb}</div>
      {hasActions ? (
        <div className='flex shrink-0 flex-wrap items-start justify-end gap-x-px gap-y-px sm:gap-x-1 sm:gap-y-0.5 sm:pt-0.5'>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
