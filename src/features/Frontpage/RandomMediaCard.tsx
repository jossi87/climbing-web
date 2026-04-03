import { Link } from 'react-router-dom';
import { getMediaFileUrl, getMediaFileUrlSrcSet } from '../../api';
import { cn } from '../../lib/utils';
import { ClickableAvatar, AvatarGroup, Card } from '../../shared/ui';
import type { components } from '../../@types/buldreinfo/swagger';

type RandomMedia = components['schemas']['FrontpageRandomMedia'];

type Props = {
  randomMedia?: RandomMedia;
  /** While true, show placeholder card (frontpage waits for stats + media + meta together to avoid staggered CLS). */
  isLoading?: boolean;
};

/** Matches API crop; img is `absolute` so decode/intrinsic size cannot collapse the frame (CLS). */
const mediaFrameClass = 'relative aspect-[275/250] w-full overflow-hidden bg-surface-card';

const desktopCopyMin = 'hidden min-h-[5.25rem] p-4 md:block md:min-h-[5.5rem]';

export const RandomMediaCard = ({ randomMedia, isLoading = false }: Props) => {
  const cardShellClass = 'group overflow-hidden border-0 text-left md:border';

  if (isLoading)
    return (
      <Card flush className={cardShellClass}>
        <div className={mediaFrameClass}>
          <div className='bg-surface-hover/50 absolute inset-0 animate-pulse' />
        </div>
        <div className={desktopCopyMin}>
          <div className='space-y-3'>
            <div className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
              <div className='bg-surface-hover h-[1.125rem] max-w-[min(100%,14rem)] flex-1 animate-pulse rounded sm:h-5' />
              <div className='bg-surface-hover/60 h-3.5 w-10 shrink-0 animate-pulse rounded md:h-4 md:w-11' />
            </div>
            <div className='bg-surface-hover/45 h-3 w-full max-w-[18rem] animate-pulse rounded md:h-[0.875rem]' />
          </div>
        </div>
      </Card>
    );

  if (!randomMedia)
    return (
      <Card flush className={cardShellClass}>
        <div className={cn(mediaFrameClass, 'flex items-center justify-center text-center text-sm text-slate-500')}>
          No featured media
        </div>
        <div className={desktopCopyMin}>
          <p className='text-sm text-slate-500'>Check back later for a random photo from the index.</p>
        </div>
      </Card>
    );

  const taggedUsers = randomMedia.tagged || [];
  const photographer = randomMedia.photographer;
  const problemTitleClass = 'text-[15px] leading-snug font-semibold text-slate-100 md:text-[16px]';
  const gradeClass = 'text-[13px] leading-none font-medium text-slate-300 tabular-nums md:text-[14px]';
  const locationClass = 'text-[11px] leading-snug font-medium text-slate-200 md:text-[12px]';
  const metaTextClass = 'text-[11px] leading-snug text-slate-200 md:text-[12px]';
  const interactiveLinkClass =
    'rounded-sm transition-colors duration-150 hover:text-brand hover:underline hover:decoration-brand/60 underline-offset-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35';

  return (
    <Card flush className={cardShellClass}>
      <div className={mediaFrameClass}>
        <Link
          to={`/problem/${randomMedia.idProblem}`}
          className='focus-visible:ring-brand/45 absolute inset-0 block transition-[filter,transform] duration-300 outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-inset'
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
            decoding='async'
            fetchPriority='high'
            loading='eager'
          />
        </Link>
        <div className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-100 md:opacity-0' />

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
            <span className='mx-1 text-slate-200/90' aria-hidden>
              ·
            </span>
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

      <div className={desktopCopyMin}>
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
            <span className='mx-1 text-slate-200/90' aria-hidden>
              ·
            </span>
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
