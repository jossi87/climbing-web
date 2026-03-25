import { useMeta } from '../components/Meta';
import { ChevronDown, Lock, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

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
    <div className={cn('group relative', className)}>
      <select
        disabled={disabled}
        className={cn(
          'bg-surface-nav border-surface-border focus:border-brand type-body w-full cursor-pointer appearance-none rounded-lg border py-2.5 pr-10 pl-10 transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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

      <div className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500'>
        {currentValue === 0 ? (
          <Eye size={16} />
        ) : (
          <Lock size={16} className={currentValue === 2 ? 'text-red-500' : 'text-amber-500'} />
        )}
      </div>

      <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-slate-300'>
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

export const VisibilitySelectorField = ({ label, ...props }: CustomProps) => {
  return (
    <div className='space-y-2'>
      <label className={cn('ml-1', designContract.typography.label)}>{label || 'Visibility'}</label>
      <VisibilitySelector {...props} />
    </div>
  );
};
