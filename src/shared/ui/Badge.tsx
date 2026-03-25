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
    'inline-flex items-center justify-center px-1.5 h-4 rounded-sm bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-tighter align-middle leading-none';

  return href ? (
    <a href={href} target='_blank' rel='noreferrer' className={cn(baseClasses, className)}>
      {content}
    </a>
  ) : (
    <span className={cn(baseClasses, className)}>{content}</span>
  );
};
