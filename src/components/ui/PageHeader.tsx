import { type LucideIcon } from 'lucide-react';

type InfoItem = {
  label: string | number;
  highlight?: boolean;
};

type Props = {
  title: string;
  icon: LucideIcon;
  subheader?: string;
  stats?: InfoItem[];
};

export const PageHeader = ({ title, icon: Icon, subheader, stats }: Props) => (
  <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-4 sm:px-0'>
    <div className='flex items-center gap-4'>
      <div className='p-2.5 bg-brand/10 rounded-lg border border-brand/20 text-brand shadow-sm'>
        <Icon size={20} />
      </div>
      <div>
        <h1 className='text-3xl font-black text-slate-200 tracking-tight leading-none'>{title}</h1>

        {(subheader || stats) && (
          <div className='flex items-center flex-wrap gap-2 mt-2'>
            {subheader && (
              <p className='text-[10px] text-slate-500 font-bold uppercase tracking-widest italic'>
                {subheader}
              </p>
            )}

            {subheader && stats && stats.length > 0 && (
              <span className='h-1 w-1 rounded-full bg-surface-border' />
            )}

            {stats?.map((stat, i) => (
              <div key={i} className='flex items-center gap-2'>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    stat.highlight ? 'text-brand' : 'text-slate-500'
                  }`}
                >
                  {stat.label}
                </span>
                {i < stats.length - 1 && (
                  <span className='h-1 w-1 rounded-full bg-surface-border' />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
