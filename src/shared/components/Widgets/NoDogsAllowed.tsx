import { CircleX, PawPrint } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../i18n/useLanguage';
import { designContract } from '../../../design/contract';
import { cn } from '../../../lib/utils';

/** Landowner restriction — one line mirroring the sign on site: the ban, then the duty behind it. */
export function NoDogsAllowed() {
  const { t } = useTranslation();
  const { active } = useLanguage();
  return (
    <p
      className={cn(
        'border-access-danger/45 bg-access-danger/12 text-access-danger flex items-center gap-2.5 rounded-md border px-2.5 py-1.5 text-pretty',
        designContract.typography.body,
      )}
    >
      <span
        className='access-no-dogs-icon relative inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center'
        aria-hidden
      >
        <PawPrint size={17} strokeWidth={2.2} />
        <CircleX size={11} strokeWidth={2.5} className='bg-surface absolute -right-1 -bottom-1 rounded-full px-[1px]' />
      </span>
      <span className='min-w-0 font-semibold'>
        <span lang={active}>
          <span className='access-no-dogs-title'>{t('dogWarning.title')}</span>
        </span>
        <span aria-hidden className='access-no-dogs-sub px-1.5'>
          |
        </span>
        <span lang={active}>
          <span className='access-no-dogs-title'>{t('dogWarning.allYearLeash')}</span>
        </span>
      </span>
    </p>
  );
}
