import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const SectionLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('block text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase', className)}>
    {children}
  </span>
);
