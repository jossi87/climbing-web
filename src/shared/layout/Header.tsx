import { useState, useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Download, LogOut, Trash2, Users, Code, HelpCircle, LogIn, Loader2 } from 'lucide-react';
import { useMeta } from '../components/Meta/context';
import SearchBox from '../components/SearchBox/SearchBox';
import { Avatar } from '../ui';
import { cn } from '../../lib/utils';
import { downloadUsersTicks, useAccessToken } from '../../api';

type DropdownItemProps = {
  to: string;
  icon: ElementType;
  children: ReactNode;
  onClick: () => void;
  className?: string;
};

const Header = () => {
  const { isSuperAdmin, isAuthenticated, authenticatedName, mediaId, mediaVersionStamp } = useMeta();
  const { isLoading, loginWithRedirect, logout } = useAuth0();
  const accessToken = useAccessToken();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isDownloadingTicks, setIsDownloadingTicks] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));
  const lastScrollYRef = useRef(0);

  const isDesktop = viewport.width >= 1024;
  const isTallEnough = viewport.height >= 900;
  const shouldStickHeader = !isDesktop || isTallEnough;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 64) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateViewport = () =>
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.account-dropdown-container')) setIsAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const DropdownItem = ({ to, icon: Icon, children, onClick, className }: DropdownItemProps) => {
    const isActive =
      to === '/user'
        ? location.pathname === '/user' || location.pathname === '/user/'
        : location.pathname === to || location.pathname.startsWith(`${to}/`);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          'mx-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] leading-snug font-medium transition-colors sm:text-[13px]',
          isActive
            ? 'bg-surface-hover ring-brand/45 text-slate-50 ring-1'
            : 'hover:bg-surface-raised-hover text-slate-300 hover:text-slate-50',
          className,
        )}
      >
        <Icon size={16} strokeWidth={2} className={cn('shrink-0', isActive ? 'text-slate-200' : 'text-slate-400')} />{' '}
        {children}
      </Link>
    );
  };

  const renderUserMenu = () => {
    if (isLoading) return null;
    return isAuthenticated ? (
      <div className='account-dropdown-container relative'>
        <Avatar
          name={authenticatedName}
          mediaId={mediaId}
          mediaVersionStamp={mediaVersionStamp}
          size='tiny'
          onClick={() => setIsAccountOpen(!isAccountOpen)}
          className={cn(
            'cursor-pointer transition-all',
            isAccountOpen ? 'ring-brand/60 ring-2' : 'ring-1 ring-white/10 hover:ring-white/20',
          )}
        />
        {isAccountOpen && (
          <div className='bg-surface-card border-surface-border animate-in fade-in zoom-in-95 absolute top-full right-0 z-70 mt-3 w-[min(18rem,calc(100vw-1.25rem))] overflow-hidden rounded-xl border py-2 shadow-2xl ring-1 ring-white/10 duration-150 sm:w-64'>
            <div className='border-surface-border/50 px-3 pt-1 pb-2.5'>
              <p className='truncate text-[13px] font-semibold text-slate-100 sm:text-sm'>
                {authenticatedName || 'Profile'}
              </p>
            </div>
            <div className='border-surface-border/40 border-t pt-1'>
              <DropdownItem to='/user' icon={User} onClick={() => setIsAccountOpen(false)}>
                Profile
              </DropdownItem>
              <DropdownItem to='/settings' icon={Settings} onClick={() => setIsAccountOpen(false)}>
                Settings
              </DropdownItem>

              <button
                type='button'
                onClick={() => {
                  setIsDownloadingTicks(true);
                  downloadUsersTicks(accessToken).finally(() => setIsDownloadingTicks(false));
                  setIsAccountOpen(false);
                }}
                className='hover:bg-surface-raised-hover mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] leading-snug font-medium text-slate-300 transition-colors hover:text-slate-50 sm:text-[13px]'
              >
                {isDownloadingTicks ? (
                  <Loader2 size={16} className='shrink-0 animate-spin text-slate-400' />
                ) : (
                  <Download size={16} strokeWidth={2} className='shrink-0 text-slate-400' />
                )}
                Export ascents to Excel
              </button>

              <div className='border-surface-border/35 mx-2 my-1 border-t' />

              <a
                href='/pdf/20230525_administrator_doc.pdf'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:bg-surface-raised-hover mx-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] leading-snug font-medium text-slate-300 transition-colors hover:text-slate-50 sm:text-[13px]'
              >
                <HelpCircle size={16} strokeWidth={2} className='shrink-0 text-slate-400' /> Help
              </a>

              {isSuperAdmin && (
                <>
                  <DropdownItem to='/permissions' icon={Users} onClick={() => setIsAccountOpen(false)}>
                    Permissions
                  </DropdownItem>
                  <DropdownItem to='/swagger' icon={Code} onClick={() => setIsAccountOpen(false)}>
                    Swagger
                  </DropdownItem>
                  <DropdownItem to='/trash' icon={Trash2} onClick={() => setIsAccountOpen(false)}>
                    Trash
                  </DropdownItem>
                </>
              )}

              <div className='border-surface-border/35 mx-2 my-1 border-t' />
              <button
                type='button'
                onClick={() => logout({ logoutParams: { returnTo: window.origin } })}
                className='mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] leading-snug font-medium text-red-400 transition-colors hover:bg-red-500/12 hover:text-red-300 sm:text-[13px]'
              >
                <LogOut size={16} strokeWidth={2} className='shrink-0' /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    ) : (
      <button
        onClick={() => loginWithRedirect()}
        className='border-brand/50 bg-surface-raised text-brand hover:border-brand hover:bg-surface-hover flex items-center gap-2 rounded border px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] normal-case transition-colors active:scale-95'
      >
        <LogIn size={14} /> <span>Sign in</span>
      </button>
    );
  };

  return (
    <nav
      className={cn(
        'border-surface-border/70 bg-surface-card z-50 w-full border-b transition-[transform,background-color] duration-300',
        shouldStickHeader ? 'sticky top-0' : 'relative',
        !isVisible && '-translate-y-full lg:translate-y-0',
      )}
    >
      <div className='max-w-container mx-auto h-13 px-4'>
        <div className='flex h-full items-center justify-between gap-x-4'>
          <div className='flex h-full min-w-0 flex-1 items-center gap-4'>
            <Link
              to='/'
              className='group focus-visible:ring-offset-surface-card focus-visible:ring-brand/45 relative flex h-full shrink-0 items-center rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            >
              <img
                src='/png/logo_70x62.png'
                alt=''
                className='h-auto w-7 brightness-0 invert transition-[transform,filter] duration-300 ease-out will-change-transform group-hover:scale-[1.06] group-hover:drop-shadow-[0_0_12px_rgba(226,232,240,0.22)] group-active:scale-100'
              />
              <span className='sr-only'>Home</span>
              {isHome && <div className='bg-brand absolute right-0 bottom-0 left-0 h-0.5 rounded-t' />}
            </Link>
            <div className='w-full min-w-0 flex-1 lg:max-w-sm xl:max-w-md'>
              <SearchBox />
            </div>
          </div>

          <div className='flex h-full items-center gap-3'>
            <div className='my-auto flex h-6 items-center'>{renderUserMenu()}</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
