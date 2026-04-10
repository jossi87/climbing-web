import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { getMediaFileUrl } from '../../../../api';
import { VideoProcessingPlaceholder } from '../../Media/VideoProcessingPlaceholder';
import { VideoThumbnailPlayOverlay } from '../../Media/VideoThumbnailPlayOverlay';

type ActivityMedia = components['schemas']['ActivityMedia'];

function ActivityMediaThumb({ m, problemId }: { m: ActivityMedia; problemId?: number }) {
  const [imgError, setImgError] = useState(false);
  const isMovie = !!m.movie;
  const thumbUrl = getMediaFileUrl(Number(m.id ?? 0), Number(m.versionStamp ?? 0), false, { minDimension: 200 });

  return (
    <Link
      to={`/problem/${problemId ?? 0}/${m.id ?? 0}`}
      className='sm:h-thumbnail-h sm:w-thumbnail-w group border-surface-border bg-surface-card relative block aspect-square min-w-0 shrink-0 overflow-hidden rounded-md border transition-all active:scale-95 sm:rounded-lg'
      aria-label={`View activity photo, open problem ${problemId ?? 0}`}
    >
      {isMovie ? (
        imgError ? (
          <VideoProcessingPlaceholder compact className='absolute inset-0' />
        ) : (
          <>
            <img
              src={thumbUrl}
              alt=''
              className='absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110'
              onError={() => setImgError(true)}
            />
            <VideoThumbnailPlayOverlay />
          </>
        )
      ) : (
        <div
          role='img'
          aria-label='Activity media'
          className='animate-in fade-in fill-mode-both absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 ease-out group-hover:scale-110'
          style={{
            backgroundImage: `url(${JSON.stringify(thumbUrl)})`,
          }}
        />
      )}
    </Link>
  );
}

const thumbCellClass =
  'border-surface-border bg-surface-card sm:h-thumbnail-h sm:w-thumbnail-w relative block aspect-square min-w-0 shrink-0 overflow-hidden rounded-md border sm:rounded-lg';

export const LazyMedia = ({ media, problemId }: { media: ActivityMedia[]; problemId?: number }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '300px 0px',
    threshold: 0,
  });

  return (
    <div ref={ref} className='grid min-h-12 grid-cols-4 gap-1 sm:flex sm:flex-wrap sm:gap-2'>
      {media.map((m) =>
        inView ? (
          <ActivityMediaThumb key={m.id} m={m} problemId={problemId} />
        ) : (
          <div key={m.id} className={thumbCellClass}>
            <div className='skeleton-bar h-full w-full animate-pulse' />
          </div>
        ),
      )}
    </div>
  );
};
