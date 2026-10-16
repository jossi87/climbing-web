import { useMeta } from '../../shared/components/Meta/context';
import { Trans, useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { Card, SectionHeader, TextLink } from '../../shared/ui';

const Donations = () => {
  const { t } = useTranslation();
  const meta = useMeta();

  return (
    <div className='w-full'>
      <title>{t('meta.pageTitle', { page: t('donations.title'), site: meta?.title ?? '' })}</title>
      <meta name='description' content={t('donations.title')} />

      <Card>
        <SectionHeader title={t('donations.title')} icon={Heart} subheader={t('donations.subheader')} />
        <div className='space-y-4'>
          <p className='type-body'>{t('donations.nonprofit')}</p>
          <p className='type-body'>
            <Trans
              i18nKey='donations.operatingCosts'
              components={{ brv: <TextLink href='https://brv.no' children={null} /> }}
            />
          </p>
          <p className='type-body'>
            <Trans
              i18nKey='donations.donate'
              components={{
                tpgo: <TextLink href='https://shop.tpgo.no/#/?countryCode=NO&companyIdent=986175830' children={null} />,
              }}
            />
          </p>
          <p className='type-body'>
            <Trans
              i18nKey='donations.membership'
              components={{ brvMembership: <TextLink href='https://brv.no/om-brv/medlemskap/' children={null} /> }}
            />
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Donations;
