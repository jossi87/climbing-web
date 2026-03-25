import { type ReactNode, type ElementType } from 'react';
import { type LucideProps, Check, Trash2, Info, Star, Save, Map } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

const ICON_MAP: Record<string, ElementType<LucideProps>> = {
  checkmark: Check,
  trash: Trash2,
  info: Info,
  star: Star,
  save: Save,
  map: Map,
};

type Props = {
  icon?: string | ElementType<LucideProps>;
  header?: string;
  subheader?: ReactNode;
  children?: ReactNode | ReactNode[];
};

export const HeaderButtons = ({ header, subheader, icon, children }: Props) => {
  const Icon = typeof icon === 'string' ? ICON_MAP[icon] : icon;

  return (
    <div className='mb-4 flex flex-row flex-wrap-reverse items-end gap-4'>
      {header && (
        <div className='flex items-center gap-3'>
          {Icon && (
            <div className='bg-brand/10 text-brand rounded-lg p-2'>
              <Icon size={24} />
            </div>
          )}
          <div className='min-w-0'>
            <h2 className={cn(designContract.typography.title, 'truncate leading-none')}>{header}</h2>
            {subheader && (
              <div className={cn('mt-1 whitespace-nowrap', designContract.typography.label)}>{subheader}</div>
            )}
          </div>
        </div>
      )}

      <div className='mb-2 flex grow justify-end'>
        <div className='bg-surface-nav border-surface-border inline-flex items-center gap-1 rounded-lg border p-1 shadow-sm'>
          {children}
        </div>
      </div>
    </div>
  );
};
