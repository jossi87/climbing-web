import { type ReactNode, type ElementType } from 'react';
import { type LucideProps, Check, Trash2, Info, Star, Save, Map } from 'lucide-react';

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
    <div className='flex flex-row flex-wrap-reverse items-end gap-4 mb-4'>
      {header && (
        <div className='flex items-center gap-3'>
          {Icon && (
            <div className='p-2 bg-brand/10 rounded-lg text-brand'>
              <Icon size={24} />
            </div>
          )}
          <div className='min-w-0'>
            <h2 className='text-xl font-black text-white tracking-tight leading-none truncate'>
              {header}
            </h2>
            {subheader && (
              <div className='text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 whitespace-nowrap'>
                {subheader}
              </div>
            )}
          </div>
        </div>
      )}

      <div className='flex grow justify-end mb-2'>
        <div className='inline-flex items-center rounded-lg bg-surface-nav border border-surface-border p-1 gap-1 shadow-sm'>
          {children}
        </div>
      </div>
    </div>
  );
};
