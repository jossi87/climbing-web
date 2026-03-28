import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Search as SearchIcon } from 'lucide-react';
import { getMediaFileUrl, useSearch } from '../../../api';
import { useMeta } from '../Meta/context';
import { LockSymbol } from '../../ui/Indicators';
import { cn } from '../../../lib/utils';
import { SearchInput, Card } from '../../ui';
import { designContract } from '../../../design/contract';

const SEARCH_QUERY_KEY = 'climbing-web-search-query';

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

const SearchBox = () => {
  const navigate = useNavigate();
  const { isBouldering } = useMeta();
  const { search, isPending, data } = useSearch();
  const [value, setValue] = useState(() =>
    typeof window !== 'undefined' ? (sessionStorage.getItem(SEARCH_QUERY_KEY) ?? '') : '',
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
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
    sessionStorage.setItem(SEARCH_QUERY_KEY, value);
  }, [value]);

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
    if (result.externalUrl) window.open(result.externalUrl, '_blank');
    else navigate(result.url);
  };

  return (
    <div ref={containerRef} className='relative w-full'>
      <SearchInput
        placeholder={
          isMobile
            ? 'Search...'
            : isBouldering
              ? 'Search areas, sectors, problems or users...'
              : 'Search areas, sectors, routes or users...'
        }
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

              return (
                <button
                  key={result.url || result.externalUrl}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    designContract.controls.listRow,
                    idx === activeIndex && 'bg-brand/10 border-brand/30 border',
                  )}
                >
                  <div className='bg-surface-nav group-hover:border-brand/30 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/5 transition-colors'>
                    {result.externalUrl ? (
                      <ExternalLink size={18} className='group-hover:text-brand text-slate-500' />
                    ) : imageSrc ? (
                      <img src={imageSrc} className='h-full w-full object-cover' alt='' />
                    ) : (
                      <SearchIcon size={18} className='group-hover:text-brand text-slate-600' />
                    )}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-baseline justify-between gap-2'>
                      <div
                        className={cn('type-body truncate font-semibold', result.externalUrl && 'italic opacity-80')}
                      >
                        {result.title}
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
