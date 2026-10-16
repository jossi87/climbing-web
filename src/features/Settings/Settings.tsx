import { useMeta } from '../../shared/components/Meta/context';
import { useTranslation } from 'react-i18next';
import ProfileSettings from '../../shared/components/Profile/ProfileSettings';

const Settings = () => {
  const { t } = useTranslation();
  const meta = useMeta();

  return (
    <>
      <title>{t('meta.pageTitle', { page: t('header.settings'), site: meta?.title ?? '' })}</title>
      <meta name='description' content={t('settings.metaDescription')} />
      <ProfileSettings />
    </>
  );
};

export default Settings;
