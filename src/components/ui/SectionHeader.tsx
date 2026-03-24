import { type ElementType } from 'react';

type Props = {
  title: string;
  icon: ElementType;
  subheader?: string;
};

export const SectionHeader = ({ title, icon: Icon, subheader }: Props) => (
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
);
