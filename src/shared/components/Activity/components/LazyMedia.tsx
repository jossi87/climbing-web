import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { getMediaFileUrl } from '../../../../api';
import { VideoThumbnailPlayOverlay } from '../../Media/VideoThumbnailPlayOverlay';

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
              className='animate-in fade-in fill-mode-both absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 ease-out group-hover:scale-110'
              style={{
                backgroundImage: `url(${JSON.stringify(
                  getMediaFileUrl(Number(m.id ?? 0), Number(m.versionStamp ?? 0), false, { minDimension: 200 }),
                )})`,
              }}
            />
          ) : (
            <div className='skeleton-bar h-full w-full animate-pulse' />
          )}

          {m.movie && <VideoThumbnailPlayOverlay />}
        </Link>
      ))}
    </div>
  );
};
