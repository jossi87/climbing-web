import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ExternalLink, Loader2 } from 'lucide-react';
import { getMediaFileUrl, useSearch } from './../../../api';
import { useMeta } from '../meta/context';
import { LockSymbol } from '../widgets/widgets';
import { cn } from './../../../lib/utils';

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
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim().length > 0) {
        search({ value });
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setValue('');
    if (result.externalUrl) {
      window.open(result.externalUrl, '_blank');
    } else {
      navigate(result.url);
    }
  };

  const placeholderText = isBouldering
    ? 'Search for areas, sectors, problems or users...'
    : 'Search for areas, sectors, routes or users...';

  return (
    <div ref={containerRef} className='relative w-full'>
      <div className='relative group'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          {isPending ? (
            <Loader2 size={18} className='text-brand animate-spin' />
          ) : (
            <SearchIcon
              size={18}
              className='text-slate-400 group-focus-within:text-brand transition-colors'
            />
          )}
        </div>
        <input
          type='text'
          className='block w-full bg-surface-nav border border-surface-border rounded-md py-1.5 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/40 transition-all'
          placeholder={placeholderText}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => value.length > 0 && setIsOpen(true)}
        />
      </div>

      {isOpen && data && data.length > 0 && (
        <div className='absolute z-100 mt-2 w-full bg-surface-card border border-surface-border rounded-md shadow-2xl py-2 overflow-hidden max-h-100 overflow-y-auto'>
          {(data as SearchResult[]).map((result) => {
            const mediaId = Number(result?.mediaId) || 0;
            const versionStamp = result?.mediaVersionStamp || 0;
            const imageSrc =
              mediaId > 0
                ? getMediaFileUrl(mediaId, versionStamp, false, { minDimension: 45 })
                : null;
            return (
              <button
                key={result.url || result.externalUrl || Math.random()}
                onClick={() => handleSelect(result)}
                className='w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-hover transition-colors text-left group'
              >
                <div className='shrink-0 w-11 h-11 bg-surface-nav rounded-md overflow-hidden flex items-center justify-center border border-surface-border group-hover:border-brand/30 transition-colors'>
                  {result.externalUrl ? (
                    <ExternalLink size={20} className='text-slate-500' />
                  ) : imageSrc ? (
                    <img src={imageSrc} className='w-full h-full object-cover' alt='' />
                  ) : (
                    <SearchIcon size={20} className='text-slate-700' />
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-2'>
                    <div
                      className={cn(
                        'text-sm font-bold truncate transition-colors group-hover:text-brand',
                        result.externalUrl ? 'italic text-slate-400' : 'text-white',
                      )}
                    >
                      {result.title}
                      <LockSymbol
                        lockedAdmin={!!result.lockedAdmin}
                        lockedSuperadmin={!!result.lockedSuperadmin}
                      />
                    </div>
                    {result.pageViews && (
                      <span className='text-[10px] font-mono text-slate-500'>
                        {result.pageViews}
                      </span>
                    )}
                  </div>
                  {result.description && (
                    <div className='text-xs text-slate-500 truncate italic group-hover:text-slate-400 transition-colors'>
                      {result.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
