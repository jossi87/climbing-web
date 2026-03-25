import { type ReactNode } from 'react';

export const Timeline = ({ children }: { children: ReactNode }) => (
  <div className='before:bg-surface-border relative space-y-8 pb-2 before:absolute before:inset-0 before:left-2 before:h-full before:w-px'>
    {children}
  </div>
);

export const TimelineItem = ({
  year,
  title,
  description,
  children,
}: {
  year: string;
  title: string;
  description: string;
  children?: ReactNode;
}) => (
  <div className='group relative pl-8'>
    <div className='bg-surface-card border-surface-border group-hover:border-brand absolute top-1.5 left-0 z-10 h-4 w-4 rounded-full border-2 transition-colors' />
    <div className='flex items-baseline gap-3'>
      <span className='text-sm font-semibold tracking-tight'>{year}</span>
      <span className='truncate text-xs font-medium text-slate-500'>{title}</span>
    </div>
    <p className='mt-1 text-xs leading-relaxed text-slate-400'>{description}</p>
    {children && <div className='mt-3 flex flex-wrap gap-2'>{children}</div>}
  </div>
);
