import { useMeta } from '../meta';
import { ChevronDown, Lock, Eye } from 'lucide-react';
import { cn } from '../../../lib/utils';

type VisibilityValue = { lockedSuperadmin: boolean; lockedAdmin: boolean };

type CustomProps = {
  value: VisibilityValue;
  onChange: (val: VisibilityValue) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
};

const lockedOptions = [
  { value: 0, text: 'Visible for everyone' },
  { value: 1, text: 'Only visible for administrators' },
] as const;

const superAdminOptions = [
  ...lockedOptions,
  {
    value: 2,
    text: 'Only visible for super administrators',
  },
] as const;

export const VisibilitySelector = ({
  value: incomingValue,
  onChange,
  className,
  disabled,
}: Omit<CustomProps, 'label'>) => {
  const meta = useMeta();

  const options = meta.isSuperAdmin ? superAdminOptions : meta.isAdmin ? lockedOptions : [];
  const currentValue = incomingValue.lockedSuperadmin ? 2 : incomingValue.lockedAdmin ? 1 : 0;

  if (options.length === 0) return null;

  return (
    <div className={cn('relative group', className)}>
      <select
        disabled={disabled}
        className={cn(
          'w-full appearance-none bg-surface-nav border border-surface-border rounded-lg py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-brand transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        value={currentValue}
        onChange={(e) => {
          const val = Number(e.target.value);
          onChange({
            lockedAdmin: val === 1,
            lockedSuperadmin: val === 2,
          });
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className='bg-surface-card'>
            {opt.text}
          </option>
        ))}
      </select>

      <div className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'>
        {currentValue === 0 ? (
          <Eye size={16} />
        ) : (
          <Lock size={16} className={currentValue === 2 ? 'text-red-500' : 'text-amber-500'} />
        )}
      </div>

      <div className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors'>
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

export const VisibilitySelectorField = ({ label, ...props }: CustomProps) => {
  return (
    <div className='space-y-2'>
      <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
        {label || 'Visibility'}
      </label>
      <VisibilitySelector {...props} />
    </div>
  );
};
