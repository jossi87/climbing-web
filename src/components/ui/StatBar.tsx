import { type ReactNode, type ElementType } from 'react';

export const StatBar = ({ children }: { children: ReactNode }) => (
  <div className='app-card grid grid-cols-2 sm:grid-cols-4 gap-px bg-surface-border/50 overflow-hidden shadow-xl mb-8 border-0 sm:border'>
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
  <div className='bg-surface-card p-5 flex flex-col items-center justify-center text-center group hover:bg-white/3 transition-all duration-300 h-full w-full'>
    <div className='text-slate-500 mb-2 group-hover:text-brand/80 transition-colors'>
      <Icon size={18} />
    </div>
    <div className='flex flex-col items-center min-w-0'>
      <span className='text-xl font-black text-slate-100 leading-none tabular-nums tracking-tight group-hover:text-white transition-colors'>
        {value}
      </span>
      <span className='text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1 group-hover:text-slate-400 transition-colors'>
        {label}
      </span>
    </div>
  </div>
);
