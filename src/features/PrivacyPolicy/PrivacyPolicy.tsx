import { useMeta } from '../../shared/components/Meta/context';
import { Trans, useTranslation } from 'react-i18next';
import { FileText, Shield } from 'lucide-react';
import {
  BRV_PLATFORM_AGREEMENT_DATE_LABEL,
  BRV_PLATFORM_AGREEMENT_PDF,
  BRV_WEBSITE_URL,
} from '../../constants/legalLinks';
import { Card, SectionHeader, TextLink } from '../../shared/ui';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const meta = useMeta();

  return (
    <>
      <title>{t('meta.pageTitle', { page: t('privacy.title'), site: meta?.title ?? '' })}</title>
      <meta name='description' content={t('privacy.title')} />
      <Card>
        <SectionHeader title={t('privacy.title')} icon={Shield} subheader={t('privacy.subheader')} />
        <div className='space-y-8 text-slate-300'>
          <p className='type-body'>{t('privacy.intro')}</p>

          <section className='space-y-3'>
            <h3 className='type-label'>{t('privacy.introductionTitle')}</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>{t('privacy.introVisitors')}</li>
              <li className='type-body'>{t('privacy.introStorage')}</li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h3 className='type-label'>{t('privacy.personalDataTitle')}</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>{t('privacy.account')}</li>
              <li className='type-body'>{t('privacy.saved')}</li>
              <li className='type-body'>{t('privacy.helps')}</li>
              <li className='type-body'>{t('privacy.noSelling')}</li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h3 className='type-label'>{t('privacy.regionalTitle')}</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>
                <Trans
                  i18nKey='privacy.agreement'
                  values={{ date: BRV_PLATFORM_AGREEMENT_DATE_LABEL }}
                  components={{
                    brv: <TextLink href={BRV_WEBSITE_URL} children={null} />,
                    pdf: (
                      <TextLink href={BRV_PLATFORM_AGREEMENT_PDF} title={t('about.collaboration.norwegianPdf')}>
                        <span className='inline-flex items-center gap-1'>
                          {t('about.collaboration.readPdf')}
                          <FileText className='h-3.5 w-3.5 shrink-0 opacity-90' strokeWidth={2} aria-hidden />
                        </span>
                      </TextLink>
                    ),
                  }}
                />
              </li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h3 className='type-label'>{t('privacy.deletingTitle')}</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>{t('privacy.deletingMost')}</li>
              <li className='type-body'>
                <Trans
                  i18nKey='privacy.deletingContact'
                  components={{ mail: <TextLink href='mailto:jostein.oygarden@gmail.com' children={null} /> }}
                />
              </li>
            </ul>
          </section>
        </div>
      </Card>
    </>
  );
};

export default PrivacyPolicy;
