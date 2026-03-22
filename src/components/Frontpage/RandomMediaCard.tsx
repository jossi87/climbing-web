import { Link } from 'react-router-dom';
import { getMediaFileUrl, getMediaFileUrlSrcSet } from '../../api';
import { ClickableAvatar } from '../ui/Avatar';
import type { components } from '../../@types/buldreinfo/swagger';

type RandomMedia = components['schemas']['FrontpageRandomMedia'];
type User = components['schemas']['User'];

type Props = {
  randomMedia?: RandomMedia;
};

export const RandomMediaCard = ({ randomMedia }: Props) => {
  if (!randomMedia) {
    return (
      <div className='aspect-275/250 bg-surface-card border border-surface-border rounded-md animate-pulse' />
    );
  }

  const taggedUsers = randomMedia.tagged || [];
  const photographer = randomMedia.photographer;

  return (
    <div className='bg-surface-card border border-surface-border rounded-md overflow-hidden shadow-sm group transition-all hover:border-surface-border/80 text-left'>
      <Link to={`/problem/${randomMedia.idProblem}`} className='block relative overflow-hidden'>
        <img
          className='w-full aspect-275/250 object-cover transition-transform duration-500 group-hover:scale-105'
          src={getMediaFileUrl(
            Number(randomMedia.idMedia ?? 0),
            randomMedia.versionStamp || 0,
            false,
            { minDimension: 275 },
          )}
          srcSet={getMediaFileUrlSrcSet(
            Number(randomMedia.idMedia ?? 0),
            randomMedia.versionStamp || 0,
            randomMedia.width ?? 2560,
          )}
          sizes='(max-width: 767px) 100vw, 300px'
          alt={randomMedia.problem}
          loading='eager'
        />
        <div className='absolute inset-0 bg-linear-to-t from-surface-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
      </Link>

      <div className='p-4'>
        <div className='mb-3'>
          <Link
            to={`/problem/${randomMedia.idProblem}`}
            className='text-white font-bold hover:text-brand transition-colors block text-base leading-tight'
          >
            {randomMedia.problem}{' '}
            <span className='font-medium text-slate-400 ml-1 tabular-nums'>
              {randomMedia.grade}
            </span>
          </Link>

          <div className='text-[10px] text-slate-400 mt-1.5 uppercase tracking-widest font-bold flex items-center gap-1.5 overflow-hidden whitespace-nowrap'>
            <Link
              to={`/area/${randomMedia.idArea}`}
              className='hover:text-white transition-colors shrink-0'
            >
              {randomMedia.area}
            </Link>
            <span className='text-slate-600'>/</span>
            <Link
              to={`/sector/${randomMedia.idSector}`}
              className='hover:text-white transition-colors truncate'
            >
              {randomMedia.sector}
            </Link>
          </div>
        </div>

        {(taggedUsers.length > 0 || photographer) && (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2 pt-3 border-t border-surface-border'>
            {taggedUsers.map((x: User) => (
              <Link
                key={x.id}
                to={`/user/${x.id}`}
                className='inline-flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white transition-colors'
              >
                <ClickableAvatar
                  name={x.name}
                  mediaId={x.mediaId}
                  mediaVersionStamp={x.mediaVersionStamp}
                  size='mini'
                />
                <span className='font-semibold'>{x.name}</span>
              </Link>
            ))}

            {photographer && (
              <Link
                to={`/user/${photographer.id}`}
                className='inline-flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white transition-colors'
              >
                <ClickableAvatar
                  name={photographer.name}
                  mediaId={photographer.mediaId}
                  mediaVersionStamp={photographer.mediaVersionStamp}
                  size='mini'
                />
                <span className='flex items-center gap-1'>
                  <span className='text-slate-500 text-[9px] uppercase font-black tracking-tight'>
                    BY
                  </span>
                  <span className='font-semibold'>{photographer.name}</span>
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
