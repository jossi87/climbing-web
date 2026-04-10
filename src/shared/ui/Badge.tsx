import { type ElementType, type ReactNode } from 'react';
import { designContract } from '../../design/contract';
import { cn } from '../../lib/utils';

/** Non-interactive meta chips — stay compact. */
const staticBadgeClasses =
  'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-sm border border-white/10 bg-surface-raised px-1.5 align-middle text-[10px] font-black tracking-tighter text-slate-500 uppercase leading-none';

/**
 * Links: slightly larger type + normal tracking so uppercase stays sharp; {@link designContract.surfaces.badgeLinkHover}
 * for hover/focus (About history, map links, etc.).
 */
const linkBadgeClasses = cn(
  'group inline-flex h-[1.75rem] min-w-[1.5rem] items-center justify-center gap-1 rounded-md border border-white/12 bg-surface-raised px-2.5 align-middle text-[11px] font-bold uppercase leading-none tracking-wide text-slate-400 antialiased',
  designContract.surfaces.badgeLinkHover,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-border/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card',
);

export const Badge = ({
  children,
  icon: Icon,
  href,
  className,
}: {
  children: ReactNode;
  icon?: ElementType;
  href?: string;
  className?: string;
}) => {
  return href ? (
    <a href={href} target='_blank' rel='noreferrer' className={cn(linkBadgeClasses, className)}>
      {Icon && (
        <Icon
          size={12}
          strokeWidth={2}
          className='shrink-0 text-slate-400 transition-colors group-hover:text-slate-200'
          aria-hidden
        />
      )}
      {children}
    </a>
  ) : (
    <span className={cn(staticBadgeClasses, className)}>
      {Icon && <Icon size={10} className='mr-1' />}
      {children}
    </span>
  );
};
