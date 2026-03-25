import { useMeta } from '../../shared/components/Meta/context';
import ProfileSettings from '../../shared/components/Profile/ProfileSettings';
import { Card, SectionHeader } from '../../shared/ui';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const meta = useMeta();

  return (
    <>
      <title>{`Settings | ${meta?.title}`}</title>
      <meta name='description' content='Account settings' />
      <Card flush className='border-0 sm:border'>
        <div className='p-4 sm:p-6'>
          <SectionHeader title='Settings' icon={SettingsIcon} subheader='Manage your account preferences' />
        </div>
      </Card>
      <ProfileSettings />
    </>
  );
};

export default Settings;
