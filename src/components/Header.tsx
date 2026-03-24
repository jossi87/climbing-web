import { useState, useRef, useEffect, type ElementType, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Globe,
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
import { Avatar, SectionLabel } from './ui';
import { cn } from '../lib/utils';

type DropdownItemProps = {
  to: string;
  icon: ElementType;
  children: ReactNode;
  onClick: () => void;
  className?: string;
};

const Header = () => {
  const { isSuperAdmin, isAuthenticated, authenticatedName, mediaId, mediaVersionStamp, sites } =
    useMeta();
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
      if (currentScrollY < 10) setIsVisible(true);
      else if (currentScrollY > lastScrollY && currentScrollY > 80) setIsVisible(false);
      else if (currentScrollY < lastScrollY) setIsVisible(true);
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

  const DropdownItem = ({ to, icon: Icon, children, onClick, className }: DropdownItemProps) => (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors',
        className,
      )}
    >
      <Icon size={14} /> {children}
    </Link>
  );

  const renderUserMenu = () => {
    if (isLoading) return null;
    return isAuthenticated ? (
      <div className='relative account-dropdown-container'>
        <Avatar
          name={authenticatedName}
          mediaId={mediaId}
          mediaVersionStamp={mediaVersionStamp}
          size='tiny'
          onClick={() => setIsAccountOpen(!isAccountOpen)}
          className={cn(
            'cursor-pointer transition-all',
            isAccountOpen ? 'ring-2 ring-brand' : 'ring-1 ring-white/10 hover:ring-white/20',
          )}
        />
        {isAccountOpen && (
          <div className='absolute top-full right-0 mt-3 w-56 bg-surface-card border border-surface-border rounded shadow-2xl py-1 z-70 animate-in fade-in zoom-in-95 duration-150'>
            <div className='px-4 py-3 border-b border-white/5 text-left mb-1'>
              <SectionLabel className='mb-0.5 text-slate-500'>Account</SectionLabel>
              <div className='text-xs font-bold text-slate-200 truncate'>{authenticatedName}</div>
            </div>

            <DropdownItem to='/user' icon={User} onClick={() => setIsAccountOpen(false)}>
              Profile
            </DropdownItem>

            {isSuperAdmin && (
              <>
                <DropdownItem
                  to='/permissions'
                  icon={Users}
                  onClick={() => setIsAccountOpen(false)}
                >
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

            <div className='h-px bg-white/5 my-1' />

            <a
              href='/pdf/20230525_administrator_doc.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors'
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
        className='flex items-center gap-2 px-3 py-1.5 bg-brand hover:brightness-110 text-surface-dark text-[10px] font-black uppercase tracking-widest rounded transition-all active:scale-95 shadow-brand'
      >
        <LogIn size={14} /> <span>Sign in</span>
      </button>
    );
  };

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full border-b border-surface-border bg-surface-nav/80 backdrop-blur-xl transition-transform duration-300',
        !isVisible && '-translate-y-full lg:translate-y-0',
      )}
    >
      <div className='max-w-container mx-auto px-4 h-12'>
        <div className='flex items-center justify-between h-full gap-x-4'>
          <div className='flex items-center gap-4 flex-1 min-w-0 h-full'>
            <Link to='/' className='shrink-0 relative flex items-center h-full'>
              <img
                src='/png/logo_70x62.png'
                alt='Logo'
                className={cn(
                  'w-6 h-auto transition-all',
                  isHome ? 'opacity-100' : 'opacity-40 hover:opacity-100',
                )}
              />
              {isHome && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t shadow-brand' />
              )}
            </Link>
            <div className='flex-1 max-w-xl min-w-32'>
              <SearchBox />
            </div>
          </div>

          <div className='flex items-center gap-3 h-full'>
            {activeSite && (
              <div className='relative shrink-0 flex items-center h-full' ref={regionRef}>
                <button
                  onClick={() => setIsRegionOpen(!isRegionOpen)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-colors',
                    isRegionOpen
                      ? 'bg-white/5 text-slate-100'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
                  )}
                >
                  <Globe size={12} />
                  <span className='hidden sm:inline whitespace-nowrap'>{activeSite.name}</span>
                  <ChevronDown
                    size={11}
                    className={cn('transition-transform opacity-40', isRegionOpen && 'rotate-180')}
                  />
                </button>
                {isRegionOpen && (
                  <div className='absolute top-full right-0 mt-2 w-56 bg-surface-card border border-surface-border rounded shadow-2xl py-1 z-70 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150'>
                    <div className='px-4 py-2 border-b border-white/5 mb-1'>
                      <SectionLabel className='text-slate-500'>
                        {activeSite.group} REGIONS
                      </SectionLabel>
                    </div>
                    {groupRegions.map((site) => (
                      <a
                        key={site.url}
                        href={site.url}
                        className={cn(
                          'flex items-center justify-between px-4 py-2 text-xs font-bold transition-colors',
                          site.active
                            ? 'bg-brand/10 text-brand'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                        )}
                      >
                        {site.name} {site.active && <Check size={14} />}
                      </a>
                    ))}
                    <div className='px-4 py-2 border-y border-white/5 my-1 bg-white/2'>
                      <SectionLabel className='text-slate-600'>ALL SITES</SectionLabel>
                    </div>
                    {allGroups.map((group) => (
                      <Link
                        key={group}
                        to={`/sites/${group.toLowerCase()}`}
                        onClick={() => setIsRegionOpen(false)}
                        className='flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors'
                      >
                        {group} <ExternalLink size={10} className='opacity-30' />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className='border-l border-white/10 pl-3 flex items-center h-6 my-auto'>
              {renderUserMenu()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
