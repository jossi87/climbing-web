import { type ElementType, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

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
  const content = (
    <>
      {Icon && <Icon size={10} className='mr-1' />}
      {children}
    </>
  );

  const baseClasses =
    'inline-flex h-4 items-center justify-center rounded-sm border border-white/10 bg-surface-raised px-1.5 align-middle text-[8px] font-black tracking-tighter text-slate-500 uppercase leading-none';

  return href ? (
    <a href={href} target='_blank' rel='noreferrer' className={cn(baseClasses, className)}>
      {content}
    </a>
  ) : (
    <span className={cn(baseClasses, className)}>{content}</span>
  );
};
