import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Globe,
  List,
  Database,
  AlertTriangle,
  BarChart3,
  Camera,
  Info,
  User,
  LogOut,
  ChevronDown,
  Trash2,
  Users,
  Code,
  HelpCircle,
  LogIn,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useMeta } from './common/meta/context';
import SearchBox from './common/search-box/search-box';
import { Avatar } from './ui/Avatar/Avatar';
import { NavItem } from './ui/NavItem';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

const Header = () => {
  const {
    isSuperAdmin,
    isAuthenticated,
    authenticatedName,
    mediaId,
    mediaVersionStamp,
    isBouldering,
    sites,
  } = useMeta();
  const { isLoading, loginWithRedirect, logout } = useAuth0();
  const location = useLocation();

  const activeSite = sites?.find((s) => s.active);
  const isHome = location.pathname === '/';

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node))
        setIsRegionOpen(false);
      if (!(e.target as Element).closest('.account-dropdown-container')) setIsAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupRegions = sites?.filter((s) => s.group === activeSite?.group) || [];
  const allGroups = Array.from(new Set(sites?.map((s) => s.group) || []));

  const renderUserMenu = () => {
    if (isLoading) return null;
    return isAuthenticated ? (
      <div className='relative w-full'>
        <Avatar
          name={authenticatedName}
          mediaId={mediaId}
          mediaVersionStamp={mediaVersionStamp}
          size='tiny'
          onClick={() => setIsAccountOpen(!isAccountOpen)}
          className={cn(
            'cursor-pointer ring-offset-2 ring-offset-surface-nav transition-all',
            isAccountOpen ? 'ring-2 ring-brand' : 'ring-1 ring-surface-border',
          )}
        />
        {isAccountOpen && (
          <div className='absolute top-full right-0 mt-3 w-64 bg-surface-card border border-surface-border rounded-xl shadow-2xl py-2 z-70 animate-in fade-in zoom-in-95 duration-200'>
            <div className='px-4 py-3 border-b border-surface-border text-left'>
              <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest block'>
                Signed in as
              </span>
              <div className='text-sm font-bold text-slate-200 truncate text-left'>
                {authenticatedName}
              </div>
            </div>
            <Link
              to='/user'
              onClick={() => setIsAccountOpen(false)}
              className='flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-surface-hover hover:text-slate-200 transition-colors'
            >
              <User size={14} /> Profile
            </Link>
            {isSuperAdmin && (
              <>
                <Link
                  to='/permissions'
                  onClick={() => setIsAccountOpen(false)}
                  className='flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-surface-hover hover:text-slate-200 transition-colors'
                >
                  <Users size={14} /> Permissions
                </Link>
                <Link
                  to='/swagger'
                  onClick={() => setIsAccountOpen(false)}
                  className='flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-surface-hover hover:text-slate-200 transition-colors'
                >
                  <Code size={14} /> Swagger
                </Link>
                <Link
                  to='/trash'
                  onClick={() => setIsAccountOpen(false)}
                  className='flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-surface-hover hover:text-slate-200 transition-colors'
                >
                  <Trash2 size={14} /> Trash
                </Link>
              </>
            )}
            <div className='h-px bg-surface-border my-2' />
            <a
              href='/pdf/20230525_administrator_doc.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-surface-hover hover:text-slate-200 transition-colors'
            >
              <HelpCircle size={14} /> Help
            </a>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.origin } })}
              className='w-full flex items-center gap-3 px-4 py-2 text-xs font-bold hover:bg-red-500/10 text-red-500 transition-colors text-left'
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>
    ) : (
      <button
        onClick={() => loginWithRedirect()}
        className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-all'
      >
        <LogIn size={16} className='text-brand' /> <span className='hidden sm:inline'>Sign in</span>
      </button>
    );
  };

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full border-b border-surface-border bg-surface-nav/70 backdrop-blur-xl transition-transform duration-300 ease-in-out',
        !isVisible && '-translate-y-full lg:translate-y-0',
      )}
    >
      <div className='max-w-container mx-auto px-4'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between min-h-16 py-3 lg:py-0 gap-y-3 gap-x-6'>
          <div className='flex items-center gap-3 sm:gap-4 w-full lg:w-auto lg:flex-1 min-w-0'>
            <Link to='/' className='shrink-0 relative py-1'>
              <img
                src='/png/logo_70x62.png'
                alt='Logo'
                className={cn(
                  'w-8 h-auto transition-all duration-300',
                  isHome ? 'opacity-100' : 'opacity-40 hover:opacity-100',
                )}
              />
              {isHome && (
                <div className='absolute -bottom-3 lg:-bottom-5.25 left-0 right-0 h-[2.5px] bg-brand rounded-full shadow-brand' />
              )}
            </Link>
            <div className='flex-1 lg:max-w-md min-w-30'>
              <SearchBox />
            </div>
            <div className='account-dropdown-container flex lg:hidden shrink-0 items-center'>
              {renderUserMenu()}
            </div>
          </div>

          <div className='flex flex-wrap items-center w-full lg:w-auto justify-start lg:justify-end gap-1 sm:gap-2'>
            {activeSite && (
              <div className='relative shrink-0' ref={regionRef}>
                <button
                  onClick={() => setIsRegionOpen(!isRegionOpen)}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border',
                    isRegionOpen
                      ? 'bg-brand text-white border-brand shadow-brand'
                      : 'bg-surface-nav border-surface-border text-slate-500 hover:text-slate-300 hover:bg-surface-hover',
                  )}
                >
                  <Globe size={13} />
                  <span className='whitespace-nowrap'>{activeSite.name}</span>
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform opacity-40', isRegionOpen && 'rotate-180')}
                  />
                </button>

                {isRegionOpen && (
                  <div className='absolute top-full left-0 mt-2 w-64 bg-surface-card border border-surface-border rounded-xl shadow-2xl py-2 z-70 overflow-hidden max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200'>
                    <div className='px-4 py-2 border-b border-surface-border mb-1'>
                      <span className='text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]'>
                        {activeSite.group} REGIONS
                      </span>
                    </div>
                    {groupRegions.map((site) => (
                      <a
                        key={site.url}
                        href={site.url}
                        className={cn(
                          'flex items-center justify-between px-4 py-2 text-xs font-bold transition-colors',
                          site.active
                            ? 'bg-brand/10 text-brand'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover',
                        )}
                      >
                        {site.name} {site.active && <Check size={14} />}
                      </a>
                    ))}
                    <div className='px-4 py-2 border-y border-surface-border my-1 bg-surface-nav/50'>
                      <span className='text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]'>
                        ALL SITES
                      </span>
                    </div>
                    {allGroups.map((group) => (
                      <Link
                        key={group}
                        to={`/sites/${group.toLowerCase()}`}
                        onClick={() => setIsRegionOpen(false)}
                        className='flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300 hover:bg-surface-hover transition-colors'
                      >
                        {group} <ExternalLink size={12} className='opacity-30' />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <NavItem to='/areas' icon={List} label='Areas' />
            <NavItem to='/problems' icon={Database} label={isBouldering ? 'Problems' : 'Routes'} />
            {!isBouldering && <NavItem to='/dangerous' icon={AlertTriangle} label='Dangerous' />}
            <NavItem to='/graph' icon={BarChart3} label='Graph' />
            <NavItem to='/webcams' icon={Camera} label='Webcams' />
            <NavItem to='/about' icon={Info} label='About' />

            <div className='account-dropdown-container hidden lg:flex shrink-0 items-center border-l border-surface-border pl-4 ml-1'>
              {renderUserMenu()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
