import { type ElementType, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Props = {
  title: string;
  icon: ElementType;
  subheader?: string;
  /** Sentence-style line under the title (e.g. contact / help text with links) */
  description?: ReactNode;
  /** Extra lines under the subheader (e.g. access / restrictions) */
  detail?: ReactNode;
  className?: string;
};

export const SectionHeader = ({ title, icon: Icon, subheader, description, detail, className }: Props) => (
  <div className={cn('mb-6 flex items-start gap-4', className)}>
    <div className='shrink-0 pt-0.5 text-slate-100' aria-hidden>
      <Icon size={22} strokeWidth={2} className='text-slate-100' />
    </div>
    <div className='min-w-0 flex-1'>
      <h3 className={cn(designContract.typography.title, 'leading-none')}>{title}</h3>
      {subheader && <p className={cn('mt-2 leading-none', designContract.typography.label)}>{subheader}</p>}
      {description && <p className={cn('mt-2 text-slate-400', designContract.typography.detailBody)}>{description}</p>}
      {detail && <div className={cn('mt-3 min-w-0 space-y-2', designContract.typography.detailBody)}>{detail}</div>}
    </div>
  </div>
);
