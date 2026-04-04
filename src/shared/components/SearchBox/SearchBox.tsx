import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, Map, MapPin, MapPinned, Search as SearchIcon, User, type LucideIcon } from 'lucide-react';
import { getMediaFileUrl, useSearch } from '../../../api';
import { LockSymbol } from '../../ui/Indicators';
import { cn } from '../../../lib/utils';
import { SearchInput, Card, avatarFallbackColors, avatarInitialsFromName } from '../../ui';
import { designContract } from '../../../design/contract';

type SearchResult = {
  title: string;
  description?: string;
  url: string;
  externalUrl?: string;
  mediaId?: number;
  mediaVersionStamp?: number;
  lockedAdmin?: boolean;
  lockedSuperadmin?: boolean;
  pageViews?: number;
};

type SearchEntityKind = 'area' | 'sector' | 'problem' | 'user' | 'unknown';

/**
 * Search API often returns problem titles as `Name (grade)`. Match problem lists elsewhere
 * by showing the grade with {@link designContract.typography.grade} instead of parentheses.
 */
function splitSearchProblemTitle(title: string): { name: string; grade: string | null } {
  const t = title.trim();
  const m = t.match(/^(.*)\s+\(([^)]+)\)\s*$/);
  if (!m) return { name: t, grade: null };
  const inner = m[2].trim();
  if (inner.length === 0 || inner.length > 18) return { name: t, grade: null };
  if (/,/.test(inner)) return { name: t, grade: null };
  return { name: m[1].trim(), grade: inner };
}

function getSearchEntityKind(result: SearchResult): SearchEntityKind {
  if (result.externalUrl) return 'unknown';
  const u = result.url ?? '';
  if (u.startsWith('/area/')) return 'area';
  if (u.startsWith('/sector/')) return 'sector';
  if (u.startsWith('/problem/')) return 'problem';
  if (u.startsWith('/user/')) return 'user';
  return 'unknown';
}

/** Icons for non-user hits without a photo (users get colorful initials instead). */
function getSearchFallbackMeta(kind: SearchEntityKind): { Icon: LucideIcon; label: string } {
  switch (kind) {
    case 'area':
      return { Icon: Map, label: 'Area' };
    case 'sector':
      return { Icon: MapPinned, label: 'Sector' };
    case 'problem':
      return { Icon: MapPin, label: 'Problem' };
    case 'user':
      return { Icon: User, label: 'User' };
    default:
      return { Icon: SearchIcon, label: 'Result' };
  }
}

const SEARCH_THUMB_PX = 44;

const FALLBACK_THUMB_CLASS = 'border-white/5 bg-surface-nav group-hover:border-brand/30 transition-colors';
const FALLBACK_ICON_CLASS = 'shrink-0 text-slate-500 group-hover:text-slate-400';

const SearchBox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { search, isPending, data } = useSearch();
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  /** When true, the next `pathname` change came from picking a search result — keep the query for more picks. */
  const skipClearOnNextPathnameRef = useRef(false);
  const results = (data ?? []) as SearchResult[];

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  useEffect(() => {
    if (skipClearOnNextPathnameRef.current) {
      skipClearOnNextPathnameRef.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      setValue('');
      setIsOpen(false);
      setActiveIndex(-1);
    }, 0);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim().length > 0) {
        search({ value });
        setIsOpen(true);
        setActiveIndex(0);
      } else {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (result.externalUrl) {
      window.open(result.externalUrl, '_blank');
      return;
    }
    skipClearOnNextPathnameRef.current = true;
    navigate(result.url);
  };

  return (
    <div ref={containerRef} className='relative w-full'>
      <SearchInput
        placeholder={isMobile ? 'Search...' : 'Search areas, sectors, problems or users...'}
        value={value}
        isPending={isPending}
        onChange={(e) => {
          setValue(e.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (value.length > 0) {
            setIsOpen(true);
            setActiveIndex(0);
          }
        }}
        onKeyDown={(e) => {
          if (!isOpen || results.length === 0) {
            if (e.key === 'Escape') setIsOpen(false);
            return;
          }

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min((i === -1 ? 0 : i) + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max((i === -1 ? results.length - 1 : i) - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const chosenIndex = Math.min(Math.max(activeIndex === -1 ? 0 : activeIndex, 0), results.length - 1);
            const chosen = results[chosenIndex];
            if (chosen) handleSelect(chosen);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            setActiveIndex(-1);
          }
        }}
      />

      {isOpen && results.length > 0 && (
        <div className='absolute z-100 mt-2 w-full min-w-[320px]'>
          <Card flush className='animate-in fade-in max-h-[70vh] overflow-y-auto p-1 shadow-2xl'>
            {results.map((result, idx) => {
              const mediaId = Number(result?.mediaId) || 0;
              const versionStamp = result?.mediaVersionStamp || 0;
              const imageSrc = mediaId > 0 ? getMediaFileUrl(mediaId, versionStamp, false, { minDimension: 48 }) : null;
              const entityKind = getSearchEntityKind(result);
              const problemTitle =
                entityKind === 'problem' && !result.externalUrl
                  ? splitSearchProblemTitle(result.title ?? '')
                  : { name: result.title ?? '', grade: null as string | null };
              const fallbackMeta = getSearchFallbackMeta(entityKind);
              const FallbackIcon = fallbackMeta.Icon;
              const userInitialsFallback = entityKind === 'user' && !result.externalUrl && !imageSrc;

              return (
                <button
                  key={result.url || result.externalUrl}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    designContract.controls.listRow,
                    idx === activeIndex && 'bg-brand/10 border-brand/30 border',
                  )}
                >
                  <div
                    title={
                      result.externalUrl
                        ? 'External link'
                        : imageSrc
                          ? undefined
                          : userInitialsFallback
                            ? `${result.title ?? 'User'} (no photo)`
                            : `${fallbackMeta.label} (no photo)`
                    }
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-colors',
                      result.externalUrl || imageSrc
                        ? FALLBACK_THUMB_CLASS
                        : userInitialsFallback
                          ? 'group-hover:border-brand/30 border-white/12'
                          : FALLBACK_THUMB_CLASS,
                    )}
                    style={userInitialsFallback ? avatarFallbackColors(result.title) : undefined}
                  >
                    {result.externalUrl ? (
                      <ExternalLink size={18} className='group-hover:text-brand text-slate-500' />
                    ) : imageSrc ? (
                      <img src={imageSrc} className='h-full w-full object-cover' alt='' />
                    ) : userInitialsFallback ? (
                      <span
                        className='pointer-events-none flex h-full w-full items-center justify-center leading-none font-light tracking-wide uppercase antialiased'
                        style={{ fontSize: SEARCH_THUMB_PX * 0.33 }}
                      >
                        {avatarInitialsFromName(result.title)}
                      </span>
                    ) : (
                      <FallbackIcon size={20} strokeWidth={2} className={FALLBACK_ICON_CLASS} />
                    )}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-baseline justify-between gap-2'>
                      <div
                        className={cn(
                          'type-body min-w-0 truncate',
                          result.externalUrl ? 'font-semibold italic opacity-80' : 'font-semibold',
                        )}
                      >
                        {result.externalUrl ? (
                          result.title
                        ) : (
                          <>
                            {problemTitle.name}
                            {problemTitle.grade ? (
                              <>
                                {' '}
                                <span className={cn(designContract.typography.grade, 'font-normal text-slate-500')}>
                                  {problemTitle.grade}
                                </span>
                              </>
                            ) : null}
                          </>
                        )}
                        <LockSymbol lockedAdmin={!!result.lockedAdmin} lockedSuperadmin={!!result.lockedSuperadmin} />
                      </div>
                      {result.pageViews && (
                        <span className='text-xs font-medium text-slate-500 tabular-nums'>{result.pageViews}</span>
                      )}
                    </div>
                    {result.description && (
                      <div className='truncate text-sm text-slate-400 group-hover:text-slate-300'>
                        {result.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
