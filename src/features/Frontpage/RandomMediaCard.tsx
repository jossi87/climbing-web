import { Link } from 'react-router-dom';
import { getMediaFileUrl, getMediaFileUrlSrcSet } from '../../api';
import { ClickableAvatar, AvatarGroup, Card, SectionLabel } from '../../shared/ui';
import type { components } from '../../@types/buldreinfo/swagger';
import { designContract } from '../../design/contract';

type RandomMedia = components['schemas']['FrontpageRandomMedia'];

export const RandomMediaCard = ({ randomMedia }: { randomMedia?: RandomMedia }) => {
  if (!randomMedia)
    return (
      <Card flush className='w-full overflow-hidden border-0 sm:border'>
        <div className='bg-surface-nav w-full animate-pulse' style={{ aspectRatio: '275 / 250' }} />
        <div className='hidden p-4 sm:block'>
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

  return (
    <Card flush className='group overflow-hidden border-0 text-left sm:border'>
      <div className='bg-surface-nav relative overflow-hidden' style={{ aspectRatio: '275 / 250' }}>
        <Link to={`/problem/${randomMedia.idProblem}`} className='block h-full w-full'>
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
            sizes='(max-width: 640px) 100vw, 400px'
            alt={randomMedia.problem}
            width={400}
            height={364}
            fetchPriority='high'
            loading='eager'
          />
        </Link>
        <div className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0' />

        <div className='absolute right-0 bottom-0 left-0 p-4 sm:hidden'>
          <Link to={`/problem/${randomMedia.idProblem}`} className='flex items-baseline gap-2'>
            <h3 className={designContract.typography.subtitle + ' leading-none'}>{randomMedia.problem}</h3>
            <span className={designContract.typography.subtitle}>{randomMedia.grade}</span>
          </Link>
          <SectionLabel className='mt-2 mb-4 text-slate-300'>
            {randomMedia.area} <span className='mx-1 opacity-30'>/</span> {randomMedia.sector}
          </SectionLabel>

          {(taggedUsers.length > 0 || photographer) && (
            <div className='flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 pt-4'>
              {taggedUsers.length > 0 && (
                <div className='flex items-center gap-2'>
                  <AvatarGroup
                    items={taggedUsers.map((u) => ({ ...u, mediaId: u.mediaId ?? 0 }))}
                    size='mini'
                    max={3}
                  />
                  <span className='type-small'>
                    {taggedUsers.length === 1 ? (
                      <Link to={`/user/${taggedUsers[0].id}`} className='hover:text-brand transition-colors'>
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
                  <div className='flex items-center gap-1.5'>
                    <SectionLabel className='opacity-80'>BY</SectionLabel>
                    <Link to={`/user/${photographer.id}`} className='hover:text-brand tracking-tight transition-colors'>
                      {photographer.name}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='bg-surface-nav/10 hidden p-4 sm:block'>
        <div className='mb-4'>
          <Link
            to={`/problem/${randomMedia.idProblem}`}
            className='hover:text-brand block leading-tight transition-colors'
          >
            {randomMedia.problem} <span className='ml-1 tabular-nums'>{randomMedia.grade}</span>
          </Link>
          <div className='mt-2 leading-tight'>
            <Link to={`/area/${randomMedia.idArea}`} className='transition-colors hover:text-slate-300'>
              <SectionLabel className='inline text-slate-300'>{randomMedia.area}</SectionLabel>
            </Link>
            <span className='type-small mx-1 opacity-50'>/</span>
            <Link to={`/sector/${randomMedia.idSector}`} className='transition-colors hover:text-slate-300'>
              <SectionLabel className='inline text-slate-300'>{randomMedia.sector}</SectionLabel>
            </Link>
          </div>
        </div>

        {(taggedUsers.length > 0 || photographer) && (
          <div className='border-surface-border/50 flex flex-col gap-y-3 border-t pt-4'>
            {taggedUsers.length > 0 && (
              <div className='flex items-center gap-3'>
                <AvatarGroup items={taggedUsers.map((u) => ({ ...u, mediaId: u.mediaId ?? 0 }))} size='mini' max={3} />
                <div className='type-small'>
                  <Link to={`/user/${taggedUsers[0].id}`} className='hover:text-brand transition-colors'>
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
                <div className='flex items-center gap-1 text-xs font-semibold tracking-tight text-slate-300'>
                  <SectionLabel className='text-slate-400'>BY</SectionLabel>
                  <Link to={`/user/${photographer.id}`} className='hover:text-brand tracking-tight transition-colors'>
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
