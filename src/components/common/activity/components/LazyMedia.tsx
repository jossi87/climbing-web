import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Film } from 'lucide-react';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { getMediaFileUrl } from '../../../../api';
import { cn } from '../../../../lib/utils';

export const LazyMedia = ({
  media,
  problemId,
}: {
  media: components['schemas']['ActivityMedia'][];
  problemId?: number;
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '300px 0px',
    threshold: 0,
  });

  return (
    <div
      ref={ref}
      className='grid grid-cols-4 sm:flex sm:flex-wrap gap-1 sm:gap-2 mt-3 min-h-12 px-4 sm:px-0'
    >
      {media.map((m) => (
        <Link
          key={m.id}
          to={`/problem/${problemId ?? 0}/${m.id ?? 0}`}
          className='relative block aspect-square sm:h-thumbnail-h sm:w-thumbnail-w shrink-0 group overflow-hidden rounded-md sm:rounded-lg border border-surface-border bg-surface-card transition-all active:scale-95'
        >
          {inView ? (
            <img
              src={getMediaFileUrl(Number(m.id ?? 0), Number(m.versionStamp ?? 0), false, {
                minDimension: 200,
              })}
              className={cn(
                'w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ease-out animate-in fade-in fill-mode-both',
                m.movie && 'brightness-90 group-hover:brightness-100',
              )}
              alt='Activity media'
              loading='lazy'
              decoding='async'
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/png/video_placeholder.png';
              }}
            />
          ) : (
            <div className='w-full h-full bg-surface-hover/40 animate-pulse' />
          )}

          {m.movie && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors duration-300'>
              <div className='p-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 shadow-lg'>
                <Film size={12} className='text-white' />
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
