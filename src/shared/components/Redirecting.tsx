import { useTranslation } from 'react-i18next';

export const Redirecting = () => {
  const { t } = useTranslation();
  return (
    <div className='animate-in fade-in flex min-h-50 w-full flex-col items-center justify-center duration-500'>
      <div className='bg-surface-card border-surface-border rounded-xl border px-8 py-6 shadow-xl'>
        <div className='flex items-center gap-4'>
          <div className='border-t-brand h-5 w-5 animate-spin rounded-full border-2 border-slate-700' />
          <div className='flex flex-col'>
            <h3 className='type-label'>{t('status.redirecting')}</h3>
            <p className='mt-0.5 text-[11px] font-medium text-slate-500 italic'>{t('status.redirectingDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
