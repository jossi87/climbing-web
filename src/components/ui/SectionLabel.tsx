import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const SectionLabel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block',
      className,
    )}
  >
    {children}
  </span>
);
