import { type ReactNode } from 'react';

export const Timeline = ({ children }: { children: ReactNode }) => (
  <div className='relative space-y-8 before:absolute before:inset-0 before:left-2 before:w-px before:bg-surface-border before:h-full pb-2'>
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
  <div className='relative pl-8 group'>
    <div className='absolute left-0 top-1.5 w-4 h-4 rounded-full bg-surface-card border-2 border-surface-border group-hover:border-brand transition-colors z-10' />
    <div className='flex items-baseline gap-3'>
      <span className='font-black text-white text-sm tracking-tight'>{year}</span>
      <span className='text-xs text-slate-500 font-medium truncate'>{title}</span>
    </div>
    <p className='text-xs text-slate-400 mt-1 leading-relaxed'>{description}</p>
    {children && <div className='flex flex-wrap gap-2 mt-3'>{children}</div>}
  </div>
);
