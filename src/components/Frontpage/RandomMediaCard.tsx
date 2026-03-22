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
  if (!randomMedia)
    return (
      <div className='aspect-square sm:aspect-275/250 bg-surface-card sm:rounded-xl animate-pulse' />
    );
  const taggedUsers = randomMedia.tagged || [];
  const photographer = randomMedia.photographer;

  return (
    <div className='bg-surface-card sm:border sm:border-surface-border sm:rounded-xl overflow-hidden group transition-all text-left mb-6 sm:mb-0'>
      <Link to={`/problem/${randomMedia.idProblem}`} className='block relative overflow-hidden'>
        <img
          className='w-full aspect-square sm:aspect-275/250 object-cover transition-transform duration-700 group-hover:scale-105'
          src={getMediaFileUrl(
            Number(randomMedia.idMedia ?? 0),
            randomMedia.versionStamp || 0,
            false,
            { minDimension: 400 },
          )}
          srcSet={getMediaFileUrlSrcSet(
            Number(randomMedia.idMedia ?? 0),
            randomMedia.versionStamp || 0,
            randomMedia.width ?? 2560,
          )}
          sizes='(max-width: 640px) 100vw, 400px'
          alt={randomMedia.problem}
        />
        <div className='absolute inset-0 bg-linear-to-t from-surface-dark via-surface-dark/20 to-transparent sm:opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

        <div className='absolute bottom-0 left-0 right-0 p-5 sm:hidden'>
          <div className='flex items-baseline gap-2'>
            <h3 className='text-slate-200 font-bold text-2xl leading-none'>
              {randomMedia.problem}
            </h3>
            <span className='text-slate-400 font-bold text-lg'>{randomMedia.grade}</span>
          </div>
          <div className='text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]'>
            {randomMedia.area} <span className='mx-1 opacity-30'>/</span> {randomMedia.sector}
          </div>
        </div>
      </Link>

      <div className='hidden sm:block p-4'>
        <div className='mb-3'>
          <Link
            to={`/problem/${randomMedia.idProblem}`}
            className='text-slate-200 font-semibold hover:text-brand transition-colors block text-base leading-tight'
          >
            {randomMedia.problem}{' '}
            <span className='font-medium text-slate-400 ml-1 tabular-nums'>
              {randomMedia.grade}
            </span>
          </Link>
          <div className='text-[10px] text-slate-500 mt-1.5 uppercase tracking-widest font-medium flex items-center gap-1.5'>
            <Link
              to={`/area/${randomMedia.idArea}`}
              className='hover:text-slate-400 transition-colors'
            >
              {randomMedia.area}
            </Link>
            <span className='text-slate-700'>/</span>
            <Link
              to={`/sector/${randomMedia.idSector}`}
              className='hover:text-slate-400 transition-colors truncate'
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
                className='inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors'
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
                className='inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors'
              >
                <ClickableAvatar
                  name={photographer.name}
                  mediaId={photographer.mediaId}
                  mediaVersionStamp={photographer.mediaVersionStamp}
                  size='mini'
                />
                <span className='flex items-center gap-1'>
                  <span className='text-slate-600 text-[9px] uppercase font-black tracking-tight'>
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
