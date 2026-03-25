import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Search as SearchIcon } from 'lucide-react';
import { getMediaFileUrl, useSearch } from '../../../api';
import { useMeta } from '../Meta/context';
import { LockSymbol } from '../Widgets/Widgets';
import { cn } from '../../../lib/utils';
import { SearchInput, Card } from '../../ui';
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

const SearchBox = () => {
  const navigate = useNavigate();
  const { isBouldering } = useMeta();
  const { search, isPending, data } = useSearch();
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

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
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => value.length > 0 && setIsOpen(true)}
      />

      {isOpen && data && data.length > 0 && (
        <div className='absolute z-100 mt-2 w-full min-w-[320px]'>
          <Card flush className='animate-in fade-in max-h-[70vh] overflow-y-auto p-1 shadow-2xl'>
            {(data as SearchResult[]).map((result) => {
              const mediaId = Number(result?.mediaId) || 0;
              const versionStamp = result?.mediaVersionStamp || 0;
              const imageSrc = mediaId > 0 ? getMediaFileUrl(mediaId, versionStamp, false, { minDimension: 48 }) : null;

              return (
                <button
                  key={result.url || result.externalUrl}
                  onClick={() => handleSelect(result)}
                  className={designContract.controls.listRow}
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
