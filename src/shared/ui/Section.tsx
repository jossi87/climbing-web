import { type ReactNode, type ElementType } from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Props = {
  title: string;
  icon: ElementType;
  subheader?: string;
  children: ReactNode;
  className?: string;
};

export const Section = ({ title, icon: Icon, subheader, children, className }: Props) => (
  <Card className={className}>
    <div className='mb-6 flex items-start gap-4'>
      <div className='bg-brand/10 border-brand/20 text-brand rounded-lg border p-2.5'>
        <Icon size={20} />
      </div>
      <div>
        <h3 className={cn(designContract.typography.subtitle, 'leading-none')}>{title}</h3>
        {subheader && <p className={cn('mt-2 leading-none', designContract.typography.label)}>{subheader}</p>}
      </div>
    </div>
    <div className={designContract.typography.body}>{children}</div>
  </Card>
);
