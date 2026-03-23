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
      <div className='app-card aspect-square sm:aspect-275/250 animate-pulse border-0 sm:border' />
    );

  const taggedUsers = randomMedia.tagged || [];
  const photographer = randomMedia.photographer;

  return (
    <div className='app-card group transition-all text-left mb-6 sm:mb-0 overflow-hidden border-0 sm:border'>
      <Link to={`/problem/${randomMedia.idProblem}`} className='block relative overflow-hidden'>
        <img
          className='w-full aspect-square sm:aspect-275/250 object-cover transition-transform duration-1000 group-hover:scale-105'
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
          fetchPriority='high'
          loading='eager'
        />
        <div className='absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

        <div className='absolute bottom-0 left-0 right-0 p-5 sm:hidden'>
          <div className='flex items-baseline gap-2'>
            <h3 className='text-white font-bold text-2xl leading-none'>{randomMedia.problem}</h3>
            <span className='text-slate-300 font-bold text-lg'>{randomMedia.grade}</span>
          </div>
          <div className='text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]'>
            {randomMedia.area} <span className='mx-1 opacity-30'>/</span> {randomMedia.sector}
          </div>
        </div>
      </Link>

      <div className='hidden sm:block p-4'>
        <div className='mb-4'>
          <Link
            to={`/problem/${randomMedia.idProblem}`}
            className='text-slate-200 font-bold hover:text-brand transition-colors block text-base leading-tight'
          >
            {randomMedia.problem}{' '}
            <span className='font-bold text-slate-500 ml-1 tabular-nums'>{randomMedia.grade}</span>
          </Link>
          <div className='text-[10px] text-slate-500 mt-2 uppercase tracking-[0.15em] font-bold flex items-center gap-1.5'>
            <Link
              to={`/area/${randomMedia.idArea}`}
              className='hover:text-slate-300 transition-colors'
            >
              {randomMedia.area}
            </Link>
            <span className='text-slate-700 font-black'>/</span>
            <Link
              to={`/sector/${randomMedia.idSector}`}
              className='hover:text-slate-300 transition-colors truncate'
            >
              {randomMedia.sector}
            </Link>
          </div>
        </div>

        {(taggedUsers.length > 0 || photographer) && (
          <div className='space-y-3 pt-4 border-t border-surface-border/50'>
            {taggedUsers.map((x: User) => (
              <Link
                key={x.id}
                to={`/user/${x.id}`}
                className='flex items-center gap-2.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors group/user'
              >
                <ClickableAvatar
                  name={x.name}
                  mediaId={x.mediaId}
                  mediaVersionStamp={x.mediaVersionStamp}
                  size='mini'
                  className='ring-1 ring-surface-border group-hover/user:ring-brand/50'
                />
                <span className='font-bold tracking-tight'>{x.name}</span>
              </Link>
            ))}

            {photographer && (
              <Link
                to={`/user/${photographer.id}`}
                className='flex items-center gap-2.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors group/photo'
              >
                <ClickableAvatar
                  name={photographer.name}
                  mediaId={photographer.mediaId}
                  mediaVersionStamp={photographer.mediaVersionStamp}
                  size='mini'
                  className='ring-1 ring-surface-border group-hover/photo:ring-brand/50'
                />
                <div className='flex flex-col leading-none'>
                  <span className='text-slate-600 text-[8px] font-black uppercase tracking-widest mb-0.5'>
                    Captured By
                  </span>
                  <span className='font-bold tracking-tight text-slate-300'>
                    {photographer.name}
                  </span>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
