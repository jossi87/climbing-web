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
    <div ref={ref} className='grid min-h-12 grid-cols-4 gap-1 sm:flex sm:flex-wrap sm:gap-2'>
      {media.map((m) => (
        <Link
          key={m.id}
          to={`/problem/${problemId ?? 0}/${m.id ?? 0}`}
          className='sm:h-thumbnail-h sm:w-thumbnail-w group border-surface-border bg-surface-card relative block aspect-square min-w-0 shrink-0 overflow-hidden rounded-md border transition-all active:scale-95 sm:rounded-lg'
        >
          {inView ? (
            <div
              role='img'
              aria-label='Activity media'
              className={cn(
                'animate-in fade-in fill-mode-both absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 ease-out group-hover:scale-110',
                m.movie && 'brightness-90 group-hover:brightness-100',
              )}
              style={{
                backgroundImage: `url(${JSON.stringify(
                  getMediaFileUrl(Number(m.id ?? 0), Number(m.versionStamp ?? 0), false, { minDimension: 200 }),
                )})`,
              }}
            />
          ) : (
            <div className='bg-surface-raised h-full w-full animate-pulse' />
          )}

          {m.movie && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-300 group-hover:bg-transparent'>
              <div className='rounded-full border border-white/10 bg-black/40 p-1 shadow-lg backdrop-blur-sm'>
                <Film size={12} />
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
