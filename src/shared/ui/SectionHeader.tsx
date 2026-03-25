import { type ElementType } from 'react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Props = {
  title: string;
  icon: ElementType;
  subheader?: string;
};

export const SectionHeader = ({ title, icon: Icon, subheader }: Props) => (
  <div className='mb-6 flex items-start gap-4'>
    <div className='bg-brand/10 border-brand/20 text-brand rounded-lg border p-2.5'>
      <Icon size={20} />
    </div>
    <div>
      <h3 className={cn(designContract.typography.title, 'leading-none')}>{title}</h3>
      {subheader && <p className={cn('mt-2 leading-none', designContract.typography.label)}>{subheader}</p>}
    </div>
  </div>
);
