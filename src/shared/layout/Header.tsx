import { useState, useRef, useEffect, type ElementType, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Globe,
  User,
  Settings,
  Download,
  LogOut,
  ChevronDown,
  Trash2,
  Users,
  Code,
  HelpCircle,
  LogIn,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useMeta } from '../components/Meta/context';
import SearchBox from '../components/SearchBox/SearchBox';
import { Avatar, SectionLabel } from '../ui';
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
  const { isSuperAdmin, isAuthenticated, authenticatedName, mediaId, mediaVersionStamp, sites } = useMeta();
  const { isLoading, loginWithRedirect, logout } = useAuth0();
  const accessToken = useAccessToken();
  const location = useLocation();

  const activeSite = sites?.find((s) => s.active);
  const isHome = location.pathname === '/';

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isDownloadingTicks, setIsDownloadingTicks] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
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
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) setIsRegionOpen(false);
      if (!(e.target as Element).closest('.account-dropdown-container')) setIsAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupRegions = sites?.filter((s) => s.group === activeSite?.group) || [];
  const allGroups = Array.from(new Set(sites?.map((s) => s.group) || []));

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
          'flex items-center gap-3 px-4 py-2 text-xs font-semibold transition-colors',
          isActive ? 'bg-brand/10 text-brand' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
          className,
        )}
      >
        <Icon size={14} /> {children}
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
            isAccountOpen ? 'ring-brand ring-2' : 'ring-1 ring-white/10 hover:ring-white/20',
          )}
        />
        {isAccountOpen && (
          <div className='bg-surface-card border-surface-border animate-in fade-in zoom-in-95 absolute top-full right-0 z-70 mt-3 w-56 rounded border py-1 shadow-2xl duration-150'>
            <DropdownItem to='/user' icon={User} onClick={() => setIsAccountOpen(false)}>
              {authenticatedName || 'Profile'}
            </DropdownItem>
            <DropdownItem to='/settings' icon={Settings} onClick={() => setIsAccountOpen(false)}>
              Settings
            </DropdownItem>

            <button
              onClick={() => {
                setIsDownloadingTicks(true);
                downloadUsersTicks(accessToken).finally(() => setIsDownloadingTicks(false));
                setIsAccountOpen(false);
              }}
              className='flex w-full items-center gap-3 px-4 py-2 text-left text-xs font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200'
            >
              {isDownloadingTicks ? <Loader2 size={14} className='animate-spin' /> : <Download size={14} />}
              Export ascents to Excel
            </button>

            <div className='my-1 h-px bg-white/5' />

            <a
              href='/pdf/20230525_administrator_doc.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200'
            >
              <HelpCircle size={14} /> Help
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

            <div className='my-1 h-px bg-white/5' />
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.origin } })}
              className='flex w-full items-center gap-3 px-4 py-2 text-left text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10'
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>
    ) : (
      <button
        onClick={() => loginWithRedirect()}
        className='bg-surface-nav border-brand/45 text-brand/90 hover:border-brand/65 hover:text-brand flex items-center gap-2 rounded border px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] normal-case transition-colors active:scale-95'
      >
        <LogIn size={14} /> <span>Sign in</span>
      </button>
    );
  };

  return (
    <nav
      className={cn(
        'border-surface-border bg-surface-nav/75 z-50 w-full border-b backdrop-blur-xl transition-transform duration-300',
        shouldStickHeader ? 'sticky top-0' : 'relative',
        !isVisible && '-translate-y-full lg:translate-y-0',
      )}
    >
      <div className='max-w-container mx-auto h-13 px-4'>
        <div className='flex h-full items-center justify-between gap-x-4'>
          <div className='flex h-full min-w-0 flex-1 items-center gap-4'>
            <Link to='/' className='relative flex h-full shrink-0 items-center'>
              <img
                src='/png/logo_70x62.png'
                alt='Logo'
                className={cn('h-auto w-7 transition-all', isHome ? 'opacity-100' : 'opacity-40 hover:opacity-100')}
              />
              {isHome && <div className='bg-brand shadow-brand absolute right-0 bottom-0 left-0 h-0.5 rounded-t' />}
            </Link>
            <div className='max-w-xl min-w-32 flex-1'>
              <SearchBox />
            </div>
          </div>

          <div className='flex h-full items-center gap-3'>
            {activeSite && (
              <div className='relative flex h-full shrink-0 items-center' ref={regionRef}>
                <button
                  onClick={() => setIsRegionOpen(!isRegionOpen)}
                  className={cn(
                    'flex items-center gap-2 rounded px-2.5 py-1.5 transition-colors',
                    isRegionOpen ? 'bg-white/5 text-slate-200' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                  )}
                >
                  <Globe size={12} />
                  <span className='header-meta-text hidden whitespace-nowrap sm:inline'>{activeSite.name}</span>
                  <ChevronDown
                    size={11}
                    className={cn('opacity-40 transition-transform', isRegionOpen && 'rotate-180')}
                  />
                </button>
                {isRegionOpen && (
                  <div className='bg-surface-card border-surface-border animate-in fade-in slide-in-from-top-1 absolute top-full right-0 z-70 mt-2 max-h-[70vh] w-56 overflow-y-auto rounded border py-1 shadow-2xl duration-150'>
                    <div className='mb-1 border-b border-white/5 px-4 py-2'>
                      <SectionLabel className='text-slate-500'>{activeSite.group} REGIONS</SectionLabel>
                    </div>
                    {groupRegions.map((site) => (
                      <a
                        key={site.url}
                        href={site.url}
                        className={cn(
                          'flex items-center justify-between px-4 py-2 text-xs font-semibold transition-colors',
                          site.active
                            ? 'bg-brand/10 text-brand'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                        )}
                      >
                        {site.name} {site.active && <Check size={14} />}
                      </a>
                    ))}
                    <div className='my-1 border-y border-white/5 bg-white/2 px-4 py-2'>
                      <SectionLabel className='text-slate-600'>ALL SITES</SectionLabel>
                    </div>
                    {allGroups.map((group) => (
                      <Link
                        key={group}
                        to={`/sites/${group.toLowerCase()}`}
                        onClick={() => setIsRegionOpen(false)}
                        className='flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300'
                      >
                        {group} <ExternalLink size={10} className='opacity-30' />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className='my-auto flex h-6 items-center border-l border-white/10 pl-3'>{renderUserMenu()}</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
