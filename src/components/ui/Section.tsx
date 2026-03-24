import { type ReactNode, type ElementType } from 'react';
import { Card } from './Card';

type Props = {
  title: string;
  icon: ElementType;
  subheader?: string;
  children: ReactNode;
  className?: string;
};

export const Section = ({ title, icon: Icon, subheader, children, className }: Props) => (
  <Card className={className}>
    <div className='flex items-start gap-4 mb-6'>
      <div className='p-2.5 bg-brand/10 rounded-lg border border-brand/20 text-brand'>
        <Icon size={20} />
      </div>
      <div>
        <h3 className='text-xl font-bold text-white tracking-tight leading-none'>{title}</h3>
        {subheader && (
          <p className='text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest italic leading-none'>
            {subheader}
          </p>
        )}
      </div>
    </div>
    <div className='text-sm text-slate-300 leading-relaxed'>{children}</div>
  </Card>
);
