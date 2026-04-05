import { useParams, useNavigate } from 'react-router-dom';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { useProfile, useProfileStatistics } from '../../api';
import ProfileStatistics from '../../shared/components/Profile/ProfileStatistics';
import { ClickableAvatar } from '../../shared/ui/Avatar/Avatar';
import ProfileTodo from '../../shared/components/Profile/ProfileTodo';
import ProfileMedia from '../../shared/components/Profile/ProfileMedia';
import { LayoutDashboard, List, Bookmark, Images, Camera, AlertTriangle, Globe, Mail, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import {
  tabBarButtonClassName,
  tabBarIconClassName,
  tabBarStripContainerClassName,
  TAB_BAR_ICON_SIZE,
} from '../../design/tabBar';
import { Card } from '../../shared/ui';

enum Page {
  overview = 'overview',
  map = 'map',
  ascents = 'ascents',
  todo = 'todo',
  media = 'media',
  captured = 'captured',
}

const Profile = () => {
  const { userId, page } = useParams();
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useProfile(userId ? +userId : -1);
  const { data: profileStats } = useProfileStatistics(profile?.id ?? -1);
  const validPages = Object.values(Page);
  const rawPage = validPages.includes(page as Page) ? (page as Page) : Page.overview;
  const activePage = rawPage === Page.map ? Page.ascents : rawPage;
  const meta = useMeta();

  function onPageChanged(newPage: Page) {
    navigate(`/user/${profile?.id ?? -1}/${newPage}`);
  }

  if (isLoading) {
    return (
      <div className='w-full min-w-0'>
        <Card flush className='min-w-0 border-0'>
          <div className='animate-pulse' aria-busy aria-label='Loading profile'>
            <div className='p-4 sm:p-5'>
              {/* Avatar `small` (40px) + title + meta lines — no extra row (old skeleton mimicked non-existent chips). */}
              <div className='flex min-w-0 items-start gap-3'>
                <div className='skeleton-bar h-10 w-10 shrink-0 rounded-full' />
                <div className='min-w-0 flex-1 space-y-2'>
                  <div className='skeleton-bar h-7 max-w-[min(100%,16rem)] rounded-md' />
                  <div className='space-y-1.5 pt-0.5'>
                    <div className='skeleton-bar-muted h-3 max-w-md rounded' />
                    <div className='skeleton-bar-muted h-3 max-w-[min(100%,14rem)] rounded' />
                  </div>
                </div>
              </div>
            </div>
            <div className={tabBarStripContainerClassName('equal')}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className='skeleton-bar h-11 min-w-0 flex-1 rounded-none' />
              ))}
            </div>
          </div>
          <div className='p-4 sm:p-6'>
            <Loading inline />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className='w-full py-16 sm:py-20'>
        <div className={cn(designContract.surfaces.card, 'space-y-4 p-12 text-center')}>
          <AlertTriangle size={48} className='mx-auto text-red-500/50' />
          <h2 className='type-h1'>{error ? '404' : 'Not Found'}</h2>
          <p className={designContract.typography.label}>{error ? String(error) : 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  const fullName = [profile.firstname ?? '', profile.lastname ?? ''].filter(Boolean).join(' ');
  const regions = Array.from(new Set((profileStats?.ticks ?? []).map((t) => t.regionName).filter(Boolean))).sort();

  const navItems = [
    { id: Page.overview, label: 'Overview', icon: LayoutDashboard },
    { id: Page.ascents, label: 'Ascents', icon: List },
    { id: Page.todo, label: 'Todo', icon: Bookmark },
    { id: Page.media, label: 'Media', icon: Images },
    { id: Page.captured, label: 'Captured', icon: Camera },
  ];

  return (
    <div className='w-full min-w-0 space-y-0'>
      <title>{`${fullName} | ${meta?.title}`}</title>
      <meta name='description' content='Profile with public ascents, media, and other statistics.' />

      <Card flush className='min-w-0 border-0'>
        <div className='p-4 sm:p-5'>
          <div className='flex min-w-0 items-start gap-3'>
            <ClickableAvatar
              name={fullName}
              mediaId={profile.mediaId}
              mediaVersionStamp={profile.mediaVersionStamp}
              size='small'
            />
            <div className='min-w-0'>
              <h1 className='type-h1 truncate'>
                {profile.firstname} {profile.lastname}
              </h1>
              <div className='type-micro mt-2 grid min-w-0 grid-cols-1 gap-y-1.5 text-slate-400 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1.5'>
                {regions.length > 0 && (
                  <span className='inline-flex max-w-full min-w-0 items-center gap-1.5'>
                    <Globe size={12} className='shrink-0 text-slate-500' aria-hidden />
                    <span className='min-w-0 break-all'>{regions.join(', ')}</span>
                  </span>
                )}
                {(profile.emails ?? []).map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className={cn(
                      'group hover:text-brand inline-flex max-w-full min-w-0 items-center gap-1.5 font-normal text-slate-400 transition-colors',
                    )}
                  >
                    <Mail
                      size={12}
                      className='group-hover:text-brand shrink-0 text-slate-500 transition-colors'
                      aria-hidden
                    />
                    <span className='min-w-0 break-all'>{email}</span>
                  </a>
                ))}
                {profile.lastActivity && (
                  <span className='inline-flex max-w-full min-w-0 items-center gap-1.5'>
                    <Clock size={12} className='shrink-0 text-slate-500' aria-hidden />
                    <span className='min-w-0 break-words'>Active {profile.lastActivity}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={tabBarStripContainerClassName('equal')} role='tablist' aria-label='Profile sections'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type='button'
                role='tab'
                aria-selected={isActive}
                onClick={() => onPageChanged(item.id)}
                className={tabBarButtonClassName(isActive)}
              >
                <Icon
                  size={TAB_BAR_ICON_SIZE}
                  strokeWidth={isActive ? 2.3 : 2}
                  className={tabBarIconClassName(isActive)}
                />
                <span className='type-small block min-w-0 truncate leading-none sm:text-[12px]'>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            'animate-in fade-in slide-in-from-bottom-2 w-full min-w-0 overflow-x-hidden duration-500',
            'p-4 sm:p-6',
          )}
        >
          {activePage === Page.overview && <ProfileStatistics userId={profile.id ?? 0} view='overview' />}
          {activePage === Page.ascents && <ProfileStatistics userId={profile.id ?? 0} view='ascents' />}
          {activePage === Page.todo && (
            <ProfileTodo userId={profile.id ?? 0} defaultCenter={meta.defaultCenter} defaultZoom={meta.defaultZoom} />
          )}
          {activePage === Page.media && <ProfileMedia userId={profile.id ?? 0} captured={false} />}
          {activePage === Page.captured && <ProfileMedia userId={profile.id ?? 0} captured={true} />}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
