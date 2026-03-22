import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Film } from 'lucide-react';
import type { components } from '../../../../@types/buldreinfo/swagger';
import { getMediaFileUrl } from '../../../../api';

export const LazyMedia = ({
  media,
  problemId,
}: {
  media: components['schemas']['ActivityMedia'][];
  problemId?: number;
}) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px 0px' });

  return (
    <div ref={ref} className='flex flex-wrap gap-2 mt-3'>
      {media.map((m) => (
        <Link
          key={m.id}
          to={`/problem/${problemId ?? 0}/${m.id ?? 0}`}
          className='relative block h-21.25 w-21.25 shrink-0 group overflow-hidden rounded-md border border-surface-border bg-surface-card'
        >
          {inView ? (
            <img
              src={getMediaFileUrl(Number(m.id ?? 0), Number(m.versionStamp ?? 0), false, {
                minDimension: 85,
              })}
              className='w-full h-full object-cover group-hover:scale-110 transition-transform'
              alt='Activity media'
              onError={(e) => (e.currentTarget.src = '/png/video_placeholder.png')}
            />
          ) : (
            <div className='w-full h-full bg-surface-hover' />
          )}
          {m.movie && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors'>
              <Film size={16} className='text-white drop-shadow-md' />
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
