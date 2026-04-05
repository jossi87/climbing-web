import { type ReactNode, type ElementType } from 'react';

export const StatBar = ({ children }: { children: ReactNode }) => (
  <div className='app-card bg-surface-border/50 mb-8 grid grid-cols-2 gap-px overflow-hidden border-0 shadow-xl sm:grid-cols-4 sm:border'>
    {children}
  </div>
);

export const StatItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
}) => (
  <div className='bg-surface-card group hover:bg-surface-raised flex h-full w-full flex-col items-center justify-center p-5 text-center transition-all duration-300'>
    <div className='group-hover:text-brand/80 mb-2 text-slate-500 transition-colors'>
      <Icon size={18} />
    </div>
    <div className='flex min-w-0 flex-col items-center'>
      <span className='text-xl leading-none font-black tracking-tight tabular-nums transition-colors'>{value}</span>
      <span className='mt-1 text-[9px] font-bold tracking-widest text-slate-500 uppercase transition-colors group-hover:text-slate-400'>
        {label}
      </span>
    </div>
  </div>
);
