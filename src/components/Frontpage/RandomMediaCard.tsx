import { Link } from 'react-router-dom';
import { getMediaFileUrl, getMediaFileUrlSrcSet } from '../../api';
import { ClickableAvatar, AvatarGroup } from '../ui/Avatar/Avatar';
import type { components } from '../../@types/buldreinfo/swagger';

type RandomMedia = components['schemas']['FrontpageRandomMedia'];

export const RandomMediaCard = ({ randomMedia }: { randomMedia?: RandomMedia }) => {
  if (!randomMedia)
    return (
      <div className='app-card w-full border-0 sm:border overflow-hidden'>
        <div className='w-full bg-surface-nav animate-pulse' style={{ aspectRatio: '275 / 250' }} />
        <div className='hidden sm:block p-4'>
          <div className='mb-4 space-y-2'>
            <div className='h-4 w-3/4 bg-surface-hover rounded animate-pulse' />
            <div className='h-3 w-1/2 bg-surface-hover/50 rounded animate-pulse' />
          </div>
          <div className='flex flex-col gap-y-3 pt-4 border-t border-surface-border/50'>
            <div className='flex items-center gap-3'>
              <div className='w-6 h-6 rounded-full bg-surface-hover animate-pulse' />
              <div className='h-3 w-24 bg-surface-hover/50 rounded animate-pulse' />
            </div>
          </div>
        </div>
      </div>
    );

  const taggedUsers = randomMedia.tagged || [];
  const photographer = randomMedia.photographer;

  return (
    <div className='app-card group transition-all text-left mb-6 sm:mb-0 overflow-hidden border-0 sm:border'>
      <Link
        to={`/problem/${randomMedia.idProblem}`}
        className='block relative overflow-hidden bg-surface-nav'
        style={{ aspectRatio: '275 / 250' }}
      >
        <img
          className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'
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
          width={400}
          height={364}
          fetchPriority='high'
          loading='eager'
        />
        <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

        <div className='absolute bottom-0 left-0 right-0 p-5 sm:hidden'>
          <div className='flex items-baseline gap-2'>
            <h3 className='text-white font-bold text-2xl leading-none'>{randomMedia.problem}</h3>
            <span className='text-slate-300 font-bold text-lg'>{randomMedia.grade}</span>
          </div>
          <div className='text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.2em] mb-4'>
            {randomMedia.area} <span className='mx-1 opacity-30'>/</span> {randomMedia.sector}
          </div>

          {(taggedUsers.length > 0 || photographer) && (
            <div className='flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 pt-4'>
              {taggedUsers.length > 0 && (
                <div className='flex items-center gap-2'>
                  <AvatarGroup
                    items={taggedUsers.map((u) => ({ ...u, mediaId: u.mediaId ?? 0 }))}
                    size='mini'
                    max={3}
                  />
                  <span className='text-[11px] text-white font-bold tracking-tight'>
                    {taggedUsers.length === 1
                      ? taggedUsers[0].name
                      : `${taggedUsers.length} in photo`}
                  </span>
                </div>
              )}
              {photographer && (
                <div className='flex items-center gap-2'>
                  <ClickableAvatar
                    name={photographer.name}
                    mediaId={photographer.mediaId}
                    mediaVersionStamp={photographer.mediaVersionStamp}
                    size='mini'
                    className='w-5! h-5! ring-1 ring-white/20'
                  />
                  <div className='flex items-center gap-1.5 text-[11px] text-white font-bold'>
                    <span className='text-[8px] font-black uppercase tracking-widest opacity-50'>
                      BY
                    </span>
                    <Link to={`/user/${photographer.id}`} className='tracking-tight'>
                      {photographer.name}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
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
          <div className='flex flex-col gap-y-3 pt-4 border-t border-surface-border/50'>
            {taggedUsers.length > 0 && (
              <div className='flex items-center gap-3'>
                <AvatarGroup
                  items={taggedUsers.map((u) => ({ ...u, mediaId: u.mediaId ?? 0 }))}
                  size='mini'
                  max={3}
                />
                <div className='text-[11px] text-slate-300 font-bold tracking-tight'>
                  {taggedUsers[0].name}
                  {taggedUsers.length > 1 && (
                    <span className='text-slate-500 font-medium ml-1'>
                      and {taggedUsers.length - 1} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {photographer && (
              <div className='flex items-center gap-2.5'>
                <ClickableAvatar
                  name={photographer.name}
                  mediaId={photographer.mediaId}
                  mediaVersionStamp={photographer.mediaVersionStamp}
                  size='mini'
                />
                <div className='flex items-center gap-1 text-[11px] text-slate-300 font-bold tracking-tight'>
                  <span className='text-[8px] font-black uppercase tracking-widest text-slate-500'>
                    BY
                  </span>
                  <Link
                    to={`/user/${photographer.id}`}
                    className='hover:text-brand transition-colors tracking-tight'
                  >
                    {photographer.name}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
