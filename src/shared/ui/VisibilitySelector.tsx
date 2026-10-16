import { useMeta } from '../components/Meta';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Lock, LockKeyhole, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

type VisibilityValue = { lockedSuperadmin: boolean; lockedAdmin: boolean };

type CustomProps = {
  value: VisibilityValue;
  onChange: (val: VisibilityValue) => void;
  className?: string;
  selectClassName?: string;
  disabled?: boolean;
  label?: string;
  labelClassName?: string;
};

const lockedOptions = [
  { value: 0, textKey: 'visibility.everyone' },
  { value: 1, textKey: 'visibility.admins' },
] as const;

const superAdminOptions = [
  ...lockedOptions,
  {
    value: 2,
    textKey: 'visibility.superAdmins',
  },
] as const;

export const VisibilitySelector = ({
  value: incomingValue,
  onChange,
  className,
  selectClassName,
  disabled,
}: Omit<CustomProps, 'label'>) => {
  const { t } = useTranslation();
  const meta = useMeta();

  const options = meta.isSuperAdmin ? superAdminOptions : meta.isAdmin ? lockedOptions : [];
  const currentValue = incomingValue.lockedSuperadmin ? 2 : incomingValue.lockedAdmin ? 1 : 0;

  if (options.length === 0) return null;

  return (
    <div className={cn('group relative', className)}>
      <select
        disabled={disabled}
        className={cn(
          'bg-surface-nav border-surface-border focus:border-brand-border h-10 w-full cursor-pointer appearance-none rounded-lg border px-10 text-sm transition-colors focus:ring-0 focus:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
          selectClassName,
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
            {t(opt.textKey)}
          </option>
        ))}
      </select>

      <div className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500'>
        {currentValue === 0 ? <Eye size={16} /> : null}
        {currentValue === 1 ? <Lock size={16} className='light:text-violet-700 text-violet-400' /> : null}
        {currentValue === 2 ? <LockKeyhole size={16} className='light:text-rose-700 text-rose-400' /> : null}
      </div>

      <div className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-slate-300'>
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

export const VisibilitySelectorField = ({ label, labelClassName, ...props }: CustomProps) => {
  const { t } = useTranslation();
  return (
    <div className='space-y-2'>
      <label className={cn('mb-1 ml-1 block text-[12px] font-medium text-slate-400 sm:text-[13px]', labelClassName)}>
        {label || t('visibility.label')}
      </label>
      <VisibilitySelector {...props} />
    </div>
  );
};
