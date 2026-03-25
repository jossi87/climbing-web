import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
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
  <div className='mb-8 flex flex-col justify-between gap-6 px-4 sm:px-0 md:flex-row md:items-end'>
    <div className='flex items-center gap-4'>
      <div className='bg-brand/10 border-brand/20 text-brand rounded-lg border p-2.5 shadow-sm'>
        <Icon size={20} />
      </div>
      <div>
        <h1 className={cn(designContract.typography.title, 'leading-none')}>{title}</h1>

        {(subheader || stats) && (
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            {subheader && <p className={designContract.typography.label}>{subheader}</p>}

            {subheader && stats && stats.length > 0 && <span className='bg-surface-border h-1 w-1 rounded-full' />}

            {stats?.map((stat, i) => (
              <div key={i} className='flex items-center gap-2'>
                <span
                  className={`text-[10px] font-bold tracking-widest uppercase ${
                    stat.highlight ? 'text-brand' : 'text-slate-500'
                  }`}
                >
                  {stat.label}
                </span>
                {i < stats.length - 1 && <span className='bg-surface-border h-1 w-1 rounded-full' />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
