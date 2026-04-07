import { useMeta } from '../../shared/components/Meta/context';
import ProfileSettings from '../../shared/components/Profile/ProfileSettings';

const Settings = () => {
  const meta = useMeta();

  return (
    <>
      <title>{`Settings | ${meta?.title}`}</title>
      <meta name='description' content='Account settings' />
      <ProfileSettings />
    </>
  );
};

export default Settings;
