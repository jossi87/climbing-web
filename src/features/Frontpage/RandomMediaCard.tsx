import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMediaFileUrl, getMediaFileUrlSrcSet } from '../../api';
import { cn } from '../../lib/utils';
import { ClickableAvatar, AvatarGroup, Card } from '../../shared/ui';
import type { components } from '../../@types/buldreinfo/swagger';

type RandomMedia = components['schemas']['FrontpageRandomMedia'];

/** Full description for `alt` / SR: core climb info plus tagged / photographer (not repeated in the mobile overlay). */
function randomMediaImageAlt(m: RandomMedia): string {
  const parts: string[] = [`${m.problem} (${m.grade})`, `${m.area} · ${m.sector}`];
  const tagged = m.tagged || [];
  const photographer = m.photographer;
  const photographerId = photographer?.id ?? null;
  const photographerAlsoTagged = photographerId != null && tagged.some((u) => u.id === photographerId);
  const showPhotographerByRow = Boolean(photographer && !photographerAlsoTagged);

  if (tagged.length === 1) {
    let t = `In photo: ${tagged[0].name}`;
    if (photographerAlsoTagged) t += ' · photographer & in photo';
    parts.push(t);
  } else if (tagged.length > 1) {
    parts.push(`${tagged.length} in photo`);
  }
  if (showPhotographerByRow && photographer) {
    parts.push(`Photo by ${photographer.name}`);
  }
  return parts.join('. ');
}

type Props = {
  randomMedia?: RandomMedia[];
  /** While true, show placeholder card (frontpage waits for stats + media + meta together to avoid staggered CLS). */
  isLoading?: boolean;
};

/** Matches API crop; img is `absolute` so decode/intrinsic size cannot collapse the frame (CLS). */
const mediaFrameClass = 'relative aspect-[275/250] w-full overflow-hidden bg-surface-card';

const desktopCopyMin = 'hidden min-h-[5.25rem] bg-surface-card p-4 md:block md:min-h-[4.75rem] md:px-4 md:py-3';

const SWIPE_PX = 48;
/** Subtle carousel controls: readable on photos, stronger on card hover / focus. */
const arrowNavClass =
  'absolute top-1/2 z-[3] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-black/35 p-0 text-white/90 shadow-sm outline-none backdrop-blur-[1px] transition-[opacity,background-color,color] hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white/45 max-md:opacity-90 md:opacity-55 md:group-hover:opacity-90';

export const RandomMediaCard = ({ randomMedia, isLoading = false }: Props) => {
  /** Explicit `bg-surface-card` so the shell never reads as white next to `app-card` shadow merge / aside. */
  const cardShellClass = 'group bg-surface-card overflow-hidden border-0 text-left';

  const items = randomMedia?.length ? randomMedia : undefined;
  const listKey = useMemo(() => items?.map((m) => `${m.idProblem}-${m.idMedia}`).join('|') ?? '', [items]);

  const [carousel, setCarousel] = useState<{ key: string; index: number }>(() => ({
    key: listKey,
    index: 0,
  }));

  if (carousel.key !== listKey) {
    setCarousel({ key: listKey, index: 0 });
  }

  const n = items?.length ?? 0;
  const rawIndex = carousel.key === listKey ? carousel.index : 0;
  const safeIndex = n > 0 ? Math.min(rawIndex, n - 1) : 0;

  const blockLinkNavigation = useRef(false);
  const touchStartX = useRef<number | null>(null);

  const go = (dir: -1 | 1) => {
    if (!items || items.length < 2) return;
    const len = items.length;
    setCarousel((c) => {
      if (c.key !== listKey) return { key: listKey, index: 0 };
      const base = Math.min(c.index, len - 1);
      return { key: listKey, index: (base + dir + len) % len };
    });
  };

  const armBlockLinkNavigation = () => {
    blockLinkNavigation.current = true;
    window.setTimeout(() => {
      blockLinkNavigation.current = false;
    }, 320);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || !items || items.length < 2) return;
    const x = e.changedTouches[0]?.clientX;
    if (x == null) return;
    const dx = x - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    armBlockLinkNavigation();
    if (dx > 0) go(-1);
    else go(1);
  };

  const onLinkClick = (e: React.MouseEvent) => {
    if (blockLinkNavigation.current) e.preventDefault();
  };

  if (isLoading)
    return (
      <Card flush className={cardShellClass}>
        <div className={mediaFrameClass}>
          <div className='skeleton-bar absolute inset-0 animate-pulse' />
        </div>
        <div className={desktopCopyMin}>
          <div className='space-y-3 md:space-y-1.5'>
            <div className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
              <div className='skeleton-bar h-[1.125rem] max-w-[min(100%,14rem)] flex-1 animate-pulse rounded sm:h-5' />
              <div className='skeleton-bar-muted h-3.5 w-10 shrink-0 animate-pulse rounded md:h-4 md:w-11' />
            </div>
            <div className='skeleton-bar-muted h-3 w-full max-w-[18rem] animate-pulse rounded md:h-[0.875rem]' />
          </div>
          {/*
            Mirror loaded footer (tagged + photographer): without this block the card grows when data arrives.
            Matches `border-t` row in the loaded state; avatar placeholders use mini size (24px).
          */}
          <div className='border-surface-border/50 mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t pt-5 md:mt-4 md:gap-y-2 md:pt-3'>
            <div className='flex min-w-0 items-center gap-3 md:gap-2.5'>
              <div className='skeleton-bar h-6 w-6 shrink-0 animate-pulse rounded-full' />
              <div className='skeleton-bar h-3.5 w-[min(100%,9rem)] max-w-full animate-pulse rounded' />
            </div>
            <div className='flex min-w-0 items-center gap-2.5 md:gap-2'>
              <div className='skeleton-bar h-6 w-6 shrink-0 animate-pulse rounded-full' />
              <div className='skeleton-bar-muted h-3.5 w-[min(100%,10rem)] max-w-full animate-pulse rounded' />
            </div>
          </div>
        </div>
      </Card>
    );

  if (!items)
    return (
      <Card flush className={cardShellClass}>
        <div className={cn(mediaFrameClass, 'flex items-center justify-center text-center text-sm text-slate-400')}>
          No featured media
        </div>
        <div className={desktopCopyMin}>
          <p className='text-sm text-slate-400'>Check back later for a random photo from the index.</p>
        </div>
      </Card>
    );

  const randomMediaItem = items[safeIndex];
  const taggedUsers = randomMediaItem.tagged || [];
  const photographer = randomMediaItem.photographer;
  const photographerId = photographer?.id ?? null;
  const photographerAlsoTagged = photographerId != null && taggedUsers.some((u) => u.id === photographerId);
  /** Separate “By …” block only when the photographer isn’t already listed as tagged (avoids duplicate names). */
  const showPhotographerByRow = Boolean(photographer && !photographerAlsoTagged);
  /** Desktop + below-image copy: normal slate tokens (light mode remaps to dark ink on white). */
  const problemTitleClass = 'text-[15px] font-semibold leading-tight text-slate-300 md:text-[16px] md:leading-snug';
  const gradeClass = 'text-[13px] leading-none font-light tabular-nums tracking-tight text-slate-300 md:text-[14px]';
  const locationClass =
    'text-[12px] font-normal leading-tight text-slate-300 md:text-[13px] md:leading-snug md:text-slate-400';
  const metaTextClass = 'text-[12px] leading-snug text-slate-400 md:text-[13px]';
  const interactiveLinkClass =
    'rounded-sm transition-colors duration-150 hover:text-brand hover:underline hover:decoration-brand/50 underline-offset-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-border/70';
  /** Mobile-only text on the photo — `photo-overlay-*` avoids light-theme `text-slate-*` remaps. No people row. */
  const overlayLinkClass = `${interactiveLinkClass} photo-overlay-link`;
  const mobileProblemTitleClass = 'photo-overlay-fg text-[15px] font-semibold leading-tight';
  const mobileGradeClass = 'photo-overlay-fg-muted text-[13px] font-light tabular-nums tracking-tight leading-none';
  const mobileLocationClass = 'photo-overlay-fg-muted text-[12px] font-normal leading-tight';
  const multi = items.length > 1;

  return (
    <Card flush className={cardShellClass}>
      <div
        className={mediaFrameClass}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          touchStartX.current = null;
        }}
      >
        <Link
          to={`/problem/${randomMediaItem.idProblem}`}
          onClick={onLinkClick}
          className='focus-visible:ring-brand-border/80 absolute inset-0 z-0 block transition-[filter,transform] duration-300 outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-inset'
        >
          <img
            key={`${randomMediaItem.idProblem}-${randomMediaItem.idMedia}-${safeIndex}`}
            className='h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105'
            src={getMediaFileUrl(Number(randomMediaItem.idMedia ?? 0), randomMediaItem.versionStamp || 0, false, {
              minDimension: 400,
            })}
            srcSet={getMediaFileUrlSrcSet(
              Number(randomMediaItem.idMedia ?? 0),
              randomMediaItem.versionStamp || 0,
              randomMediaItem.width ?? 2560,
            )}
            sizes='(max-width: 767px) 100vw, 400px'
            alt={randomMediaImageAlt(randomMediaItem)}
            width={400}
            height={364}
            decoding='async'
            fetchPriority={safeIndex === 0 ? 'high' : 'low'}
            loading={safeIndex === 0 ? 'eager' : 'lazy'}
          />
        </Link>
        {multi && (
          <>
            <button
              type='button'
              aria-label='Previous featured photo'
              className={cn(arrowNavClass, 'left-2 max-md:left-1.5')}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                go(-1);
              }}
            >
              <ChevronLeft className='h-5 w-5 shrink-0' strokeWidth={2} aria-hidden />
            </button>
            <button
              type='button'
              aria-label='Next featured photo'
              className={cn(arrowNavClass, 'right-2 max-md:right-1.5')}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                go(1);
              }}
            >
              <ChevronRight className='h-5 w-5 shrink-0' strokeWidth={2} aria-hidden />
            </button>
          </>
        )}
        <div className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/44 via-black/14 to-transparent md:hidden' />
        <div className='pointer-events-none absolute inset-x-0 bottom-0 z-[1] px-3 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden'>
          <Link
            to={`/problem/${randomMediaItem.idProblem}`}
            className={`${overlayLinkClass} pointer-events-auto flex items-baseline gap-1.5`}
          >
            <h3 className={mobileProblemTitleClass}>{randomMediaItem.problem}</h3>
            <span className={mobileGradeClass}>{randomMediaItem.grade}</span>
          </Link>
          <div className='mt-1 leading-none'>
            <Link to={`/area/${randomMediaItem.idArea}`} className={`${overlayLinkClass} pointer-events-auto`}>
              <span className={mobileLocationClass}>{randomMediaItem.area}</span>
            </Link>
            <span className='photo-overlay-sep mx-1' aria-hidden>
              ·
            </span>
            <Link to={`/sector/${randomMediaItem.idSector}`} className={`${overlayLinkClass} pointer-events-auto`}>
              <span className={mobileLocationClass}>{randomMediaItem.sector}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={desktopCopyMin}>
        <div className='space-y-3 md:space-y-1.5'>
          <Link
            to={`/problem/${randomMediaItem.idProblem}`}
            className={`${interactiveLinkClass} inline-flex flex-wrap items-baseline gap-x-2 gap-y-1`}
          >
            <span className={problemTitleClass}>{randomMediaItem.problem}</span>
            <span className={gradeClass}>{randomMediaItem.grade}</span>
          </Link>
          <div className='leading-snug'>
            <Link to={`/area/${randomMediaItem.idArea}`} className={interactiveLinkClass}>
              <span className={locationClass}>{randomMediaItem.area}</span>
            </Link>
            <span className='mx-1 text-slate-500' aria-hidden>
              ·
            </span>
            <Link to={`/sector/${randomMediaItem.idSector}`} className={interactiveLinkClass}>
              <span className={locationClass}>{randomMediaItem.sector}</span>
            </Link>
          </div>
        </div>

        {(taggedUsers.length > 0 || showPhotographerByRow) && (
          <div className='border-surface-border/50 mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t pt-5 md:mt-4 md:gap-y-2 md:pt-3'>
            {taggedUsers.length > 0 && (
              <div className='flex items-center gap-3 md:gap-2.5'>
                <AvatarGroup items={taggedUsers.map((u) => ({ ...u, mediaId: u.mediaId ?? 0 }))} size='mini' max={3} />
                <div className={metaTextClass}>
                  <Link to={`/user/${taggedUsers[0].id}`} className={interactiveLinkClass}>
                    {taggedUsers[0].name}
                  </Link>
                  {taggedUsers.length > 1 && (
                    <span className='ml-1 text-slate-500'>and {taggedUsers.length - 1} more</span>
                  )}
                  {taggedUsers.length === 1 && photographerAlsoTagged ? (
                    <span className='ml-1 text-slate-500'>{'· photographer & in photo'}</span>
                  ) : null}
                </div>
              </div>
            )}
            {showPhotographerByRow && photographer ? (
              <div className='flex items-center gap-2.5 md:gap-2'>
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
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
};
