import { useParams, useNavigate } from 'react-router-dom';
import { Loading } from './common/widgets/widgets';
import { useMeta } from './common/meta/context';
import { useProfile } from '../api';
import { useAuth0 } from '@auth0/auth0-react';
import ProfileStatistics from './common/profile/profile-statistics';
import { ClickableAvatar } from './ui/Avatar/Avatar';
import ProfileTodo from './common/profile/profile-todo';
import ProfileMedia from './common/profile/profile-media';
import ProfileSettings from './common/profile/profile-settings';
import { User, Bookmark, Images, Camera, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

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
        <div className='bg-surface-card border border-surface-border rounded-2xl p-12 text-center space-y-4'>
          <AlertTriangle size={48} className='mx-auto text-red-500/50' />
          <h2 className='text-2xl font-black uppercase text-white tracking-tight'>
            {error ? '404' : 'Not Found'}
          </h2>
          <p className='text-slate-500 font-bold uppercase tracking-widest text-sm'>
            {error ? String(error) : 'Profile not found'}
          </p>
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
    ...(isAuthenticated && loggedInProfile
      ? [{ id: Page.settings, label: 'Settings', icon: Settings }]
      : []),
  ];

  return (
    <div className='max-w-container mx-auto px-4 py-8 space-y-8'>
      <title>{`${fullName} | ${meta?.title}`}</title>
      <meta
        name='description'
        content='Profile with public ascents, media, and other statistics.'
      />

      <div className='flex flex-col items-center gap-4 pb-2'>
        <ClickableAvatar
          name={fullName}
          mediaId={profile.mediaId}
          mediaVersionStamp={profile.mediaVersionStamp}
          size='large'
        />
        <div className='text-center'>
          <h1 className='text-2xl font-black uppercase tracking-tight text-white'>
            {profile.firstname} {profile.lastname}
          </h1>
          <p className='text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1'>
            Climber Profile
          </p>
        </div>
      </div>

      <div className='flex flex-wrap justify-center bg-surface-nav/30 border border-surface-border p-1 rounded-xl'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChanged(item.id)}
              className={cn(
                'flex flex-col sm:flex-row items-center gap-2 px-5 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                isActive
                  ? 'bg-brand text-white shadow-lg shadow-brand/20'
                  : 'text-slate-500 hover:text-white hover:bg-surface-hover',
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
          <ProfileTodo
            userId={profile.id ?? 0}
            defaultCenter={meta.defaultCenter}
            defaultZoom={meta.defaultZoom}
          />
        )}
        {activePage === Page.media && <ProfileMedia userId={profile.id ?? 0} captured={false} />}
        {activePage === Page.captured && <ProfileMedia userId={profile.id ?? 0} captured={true} />}
        {activePage === Page.settings && <ProfileSettings />}
      </div>
    </div>
  );
};

export default Profile;
