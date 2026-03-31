import { Link } from 'react-router-dom';
import { getMediaFileUrl, getMediaFileUrlSrcSet } from '../../api';
import { ClickableAvatar, AvatarGroup, Card } from '../../shared/ui';
import { profileRowMiddleDotClass } from '../../shared/components/Profile/ProfileRowTextSep';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';

type RandomMedia = components['schemas']['FrontpageRandomMedia'];

export const RandomMediaCard = ({ randomMedia }: { randomMedia?: RandomMedia }) => {
  const cardShellClass = 'group overflow-hidden border-0 text-left md:border';

  if (!randomMedia)
    return (
      <Card flush className={cardShellClass}>
        <div className='bg-surface-card w-full animate-pulse' style={{ aspectRatio: '275 / 250' }} />
        <div className='hidden p-4 md:block'>
          <div className='mb-4 space-y-2'>
            <div className='bg-surface-hover h-4 w-3/4 animate-pulse rounded' />
            <div className='bg-surface-hover/50 h-3 w-1/2 animate-pulse rounded' />
          </div>
          <div className='border-surface-border/50 flex flex-col gap-y-3 border-t pt-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-surface-hover h-6 w-6 animate-pulse rounded-full' />
              <div className='bg-surface-hover/50 h-3 w-24 animate-pulse rounded' />
            </div>
          </div>
        </div>
      </Card>
    );

  const taggedUsers = randomMedia.tagged || [];
  const photographer = randomMedia.photographer;
  const problemTitleClass = 'text-[15px] leading-snug font-semibold text-slate-100 md:text-[16px]';
  const gradeClass = 'text-[13px] leading-none font-medium text-slate-300 tabular-nums md:text-[14px]';
  const locationClass = 'text-[11px] leading-snug font-medium text-slate-300 md:text-[12px]';
  const metaTextClass = 'text-[11px] leading-snug text-slate-200 md:text-[12px]';
  const interactiveLinkClass =
    'rounded-sm transition-colors duration-150 hover:text-brand hover:underline hover:decoration-brand/60 underline-offset-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35';

  return (
    <Card flush className={cardShellClass}>
      <div className='bg-surface-card relative overflow-hidden' style={{ aspectRatio: '275 / 250' }}>
        <Link
          to={`/problem/${randomMedia.idProblem}`}
          className='focus-visible:ring-brand/45 block h-full w-full transition-[filter,transform] duration-300 outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-inset'
        >
          <img
            className='h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105'
            src={getMediaFileUrl(Number(randomMedia.idMedia ?? 0), randomMedia.versionStamp || 0, false, {
              minDimension: 400,
            })}
            srcSet={getMediaFileUrlSrcSet(
              Number(randomMedia.idMedia ?? 0),
              randomMedia.versionStamp || 0,
              randomMedia.width ?? 2560,
            )}
            sizes='(max-width: 767px) 100vw, 400px'
            alt={randomMedia.problem}
            width={400}
            height={364}
            fetchPriority='high'
            loading='eager'
          />
        </Link>
        <div className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-100 md:opacity-0' />

        <div className='absolute right-0 bottom-0 left-0 p-4 md:hidden'>
          <Link
            to={`/problem/${randomMedia.idProblem}`}
            className={`${interactiveLinkClass} flex items-baseline gap-2`}
          >
            <h3 className={problemTitleClass}>{randomMedia.problem}</h3>
            <span className={gradeClass}>{randomMedia.grade}</span>
          </Link>
          <div className='mt-3 mb-0 leading-snug'>
            <Link to={`/area/${randomMedia.idArea}`} className={interactiveLinkClass}>
              <span className={locationClass}>{randomMedia.area}</span>
            </Link>
            <span className={cn('mx-1', profileRowMiddleDotClass)}>·</span>
            <Link to={`/sector/${randomMedia.idSector}`} className={interactiveLinkClass}>
              <span className={locationClass}>{randomMedia.sector}</span>
            </Link>
          </div>

          {(taggedUsers.length > 0 || photographer) && (
            <div className='mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 pt-5'>
              {taggedUsers.length > 0 && (
                <div className='flex items-center gap-2'>
                  <AvatarGroup
                    items={taggedUsers.map((u) => ({ ...u, mediaId: u.mediaId ?? 0 }))}
                    size='mini'
                    max={3}
                  />
                  <span className={metaTextClass}>
                    {taggedUsers.length === 1 ? (
                      <Link to={`/user/${taggedUsers[0].id}`} className={interactiveLinkClass}>
                        {taggedUsers[0].name}
                      </Link>
                    ) : (
                      `${taggedUsers.length} in photo`
                    )}
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
                    className='h-5! w-5! ring-1 ring-white/20'
                  />
                  <div className={metaTextClass}>
                    <span className='mr-1 text-slate-400/95'>By</span>
                    <Link to={`/user/${photographer.id}`} className={interactiveLinkClass}>
                      {photographer.name}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='hidden p-4 md:block'>
        <div className='space-y-3'>
          <Link
            to={`/problem/${randomMedia.idProblem}`}
            className={`${interactiveLinkClass} inline-flex flex-wrap items-baseline gap-x-2 gap-y-1`}
          >
            <span className={problemTitleClass}>{randomMedia.problem}</span>
            <span className={gradeClass}>{randomMedia.grade}</span>
          </Link>
          <div className='leading-snug'>
            <Link to={`/area/${randomMedia.idArea}`} className={interactiveLinkClass}>
              <span className={locationClass}>{randomMedia.area}</span>
            </Link>
            <span className={cn('mx-1', profileRowMiddleDotClass)}>·</span>
            <Link to={`/sector/${randomMedia.idSector}`} className={interactiveLinkClass}>
              <span className={locationClass}>{randomMedia.sector}</span>
            </Link>
          </div>
        </div>

        {(taggedUsers.length > 0 || photographer) && (
          <div className='border-surface-border/50 mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t pt-5'>
            {taggedUsers.length > 0 && (
              <div className='flex items-center gap-3'>
                <AvatarGroup items={taggedUsers.map((u) => ({ ...u, mediaId: u.mediaId ?? 0 }))} size='mini' max={3} />
                <div className={metaTextClass}>
                  <Link to={`/user/${taggedUsers[0].id}`} className={interactiveLinkClass}>
                    {taggedUsers[0].name}
                  </Link>
                  {taggedUsers.length > 1 && (
                    <span className='ml-1 text-slate-500'>and {taggedUsers.length - 1} more</span>
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
                <div className={metaTextClass}>
                  <span className='mr-1 text-slate-400'>By</span>
                  <Link to={`/user/${photographer.id}`} className={interactiveLinkClass}>
                    {photographer.name}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
