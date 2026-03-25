import { useParams, useNavigate } from 'react-router-dom';
import { Loading } from '../../shared/components/Widgets/Widgets';
import { useMeta } from '../../shared/components/Meta/context';
import { useProfile } from '../../api';
import { useAuth0 } from '@auth0/auth0-react';
import ProfileStatistics from '../../shared/components/Profile/ProfileStatistics';
import { ClickableAvatar } from '../../shared/ui/Avatar/Avatar';
import ProfileTodo from '../../shared/components/Profile/ProfileTodo';
import ProfileMedia from '../../shared/components/Profile/ProfileMedia';
import ProfileSettings from '../../shared/components/Profile/ProfileSettings';
import { User, Bookmark, Images, Camera, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

enum Page {
  user = 'user',
  todo = 'todo',
  media = 'media',
  captured = 'captured',
  settings = 'settings',
}

const Profile = () => {
  const { userId, page } = useParams();
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useProfile(userId ? +userId : -1);
  const { isAuthenticated } = useAuth0();
  const activePage = (page as Page) ?? Page.user;
  const meta = useMeta();

  function onPageChanged(newPage: Page) {
    navigate(`/user/${profile?.id ?? -1}/${newPage}`);
  }

  if (isLoading) return <Loading />;

  if (error || !profile) {
    return (
      <div className='max-w-container mx-auto px-4 py-20'>
        <div className={cn(designContract.surfaces.card, 'space-y-4 p-12 text-center')}>
          <AlertTriangle size={48} className='mx-auto text-red-500/50' />
          <h2 className='type-h1'>{error ? '404' : 'Not Found'}</h2>
          <p className={designContract.typography.label}>{error ? String(error) : 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  const loggedInProfile = !!(profile.userRegions && profile.userRegions.length > 0);
  const fullName = [profile.firstname ?? '', profile.lastname ?? ''].filter(Boolean).join(' ');

  const navItems = [
    { id: Page.user, label: 'User', icon: User },
    { id: Page.todo, label: 'Todo', icon: Bookmark },
    { id: Page.media, label: 'Media', icon: Images },
    { id: Page.captured, label: 'Captured', icon: Camera },
    ...(isAuthenticated && loggedInProfile ? [{ id: Page.settings, label: 'Settings', icon: Settings }] : []),
  ];

  return (
    <div className='max-w-container mx-auto space-y-8 px-4 py-6'>
      <title>{`${fullName} | ${meta?.title}`}</title>
      <meta name='description' content='Profile with public ascents, media, and other statistics.' />

      <div className='flex flex-col items-center gap-4 pb-2'>
        <ClickableAvatar
          name={fullName}
          mediaId={profile.mediaId}
          mediaVersionStamp={profile.mediaVersionStamp}
          size='large'
        />
        <div className='text-center'>
          <h1 className='type-h1'>
            {profile.firstname} {profile.lastname}
          </h1>
          <p className={cn('mt-1', designContract.typography.label)}>Climber Profile</p>
        </div>
      </div>

      <div className='bg-surface-nav/30 border-surface-border flex flex-wrap justify-center rounded-xl border p-1'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChanged(item.id)}
              className={cn(
                designContract.controls.navPill,
                isActive ? 'bg-brand shadow-brand/20 shadow-lg' : 'hover:bg-surface-hover opacity-70 hover:opacity-100',
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className='animate-in fade-in slide-in-from-bottom-2 duration-500'>
        {activePage === Page.user && (
          <ProfileStatistics
            userId={profile.id ?? 0}
            emails={profile.emails ?? []}
            lastActivity={profile.lastActivity ?? ''}
            canDownload={loggedInProfile}
          />
        )}
        {activePage === Page.todo && (
          <ProfileTodo userId={profile.id ?? 0} defaultCenter={meta.defaultCenter} defaultZoom={meta.defaultZoom} />
        )}
        {activePage === Page.media && <ProfileMedia userId={profile.id ?? 0} captured={false} />}
        {activePage === Page.captured && <ProfileMedia userId={profile.id ?? 0} captured={true} />}
        {activePage === Page.settings && <ProfileSettings />}
      </div>
    </div>
  );
};

export default Profile;
