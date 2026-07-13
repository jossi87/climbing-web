import { useState, useEffect, useRef, type ComponentProps, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useInView } from 'react-intersection-observer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  deleteMedia,
  getMediaFileUrl,
  getMediaFileUrlSrcSet,
  getTieredMinDimension,
  mediaIdentityId,
  mediaIdentityVersionStamp,
  mediaObjectPositionStyle,
  mediaPlaceholderStyle,
  moveMedia,
  putMediaJpegRotate,
} from '../../../api';
import { useAuth0 } from '@auth0/auth0-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import SvgViewer from '../SvgViewer';
import { VideoThumbnailPlayOverlay } from './VideoThumbnailPlayOverlay';
import { VideoProcessingPlaceholder } from './VideoProcessingPlaceholder';
import { Loading } from '../../ui/StatusWidgets';
import MediaModal from './MediaModal';
type MediaItem = components['schemas']['Media'];
type ProblemSection = components['schemas']['ProblemSection'];
type Props = Pick<ComponentProps<typeof MediaModal>, 'optProblemId'> & {
  pitches?: ProblemSection[] | null;
  media?: MediaItem[] | null;
  orderableMedia?: MediaItem[] | null;
  carouselMedia?: MediaItem[] | null;
  showLocation: boolean;
  compactTiles?: boolean;
  /** Denser grid than `compactTiles` (trivia on area/sector/problem). */
  triviaTiles?: boolean;
};
/** Tab path segments on `/area`, `/problem`, and `/sector` share the same URL slot as numeric media ids. */
const AREA_PROBLEM_SECTOR_TAB_SEGMENTS = new Set(['overview', 'map', 'distribution', 'top', 'todo', 'activity']);

const useIds = () => {
  const { mediaId, pitch, segment } = useParams();
  // segment can be either a media ID (numeric, from /problem/:id/:mediaId) or a tab name (from /sector/:id/:tab/:mediaId).
  // When segment is numeric, use it as the media ID. Otherwise fall back to the mediaId param.
  const raw = segment && /^\d+$/.test(segment) ? segment : mediaId;
  const mediaIdNum = raw && /^\d+$/.test(String(raw)) ? +raw : 0;
  return { mediaId: mediaIdNum, pitch: pitch ? +pitch : 0 };
};
type MediaAction = (token: string) => Promise<unknown>;

/**
 * Tile thumbs are rendered at roughly 110-205 CSS px depending on grid variant.
 * Use coarse 1x/2x tiers to avoid generating many near-identical on-demand sizes.
 */
function mediaTileMinDimension(triviaTiles: boolean): number {
  const baseCssPx = triviaTiles ? 96 : 120;
  return Math.max(baseCssPx, getTieredMinDimension(baseCssPx));
}

function mediaTileSizes(compactTiles: boolean, triviaTiles: boolean): string {
  if (triviaTiles) {
    // trivia: 4 / 5 / 6 / 7 columns across breakpoints
    return '(min-width: 1024px) 14vw, (min-width: 768px) 16vw, (min-width: 640px) 19vw, 24vw';
  }
  if (compactTiles) {
    // compact: 3 / 4 / 5 / 6 columns across breakpoints
    return '(min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 24vw, 32vw';
  }
  // default: 3 / 3 / 4 / 5 columns across breakpoints
  return '(min-width: 1024px) 20vw, (min-width: 768px) 24vw, 32vw';
}

/** File videos: always request poster JPEG; only show placeholder when the image actually fails (e.g. not generated yet). */
const MediaVideoTile = ({ x, triviaTiles }: { x: MediaItem; triviaTiles: boolean }) => {
  const [imgError, setImgError] = useState(false);
  const sizes = mediaTileSizes(false, triviaTiles);
  const originalWidth = Math.max(Number(x.width ?? 0) || 0, 300);
  const thumbUrl = getMediaFileUrl(mediaIdentityId(x.identity), mediaIdentityVersionStamp(x.identity), false, {
    minDimension: mediaTileMinDimension(triviaTiles),
  });
  const thumbSrcSet = getMediaFileUrlSrcSet(
    mediaIdentityId(x.identity),
    mediaIdentityVersionStamp(x.identity),
    originalWidth,
  );

  if (imgError) {
    return (
      <div className='absolute inset-0'>
        <VideoProcessingPlaceholder />
      </div>
    );
  }

  return (
    <>
      <img
        src={thumbUrl}
        srcSet={thumbSrcSet}
        sizes={sizes}
        alt=''
        className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
        style={mediaObjectPositionStyle(x.identity)}
        onError={() => setImgError(true)}
      />
      <VideoThumbnailPlayOverlay />
    </>
  );
};

const Media = ({
  pitches,
  media,
  orderableMedia,
  carouselMedia,
  optProblemId,
  showLocation,
  compactTiles,
  triviaTiles,
}: Props) => {
  const { mediaId, pitch } = useIds();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [m, setM] = useState<MediaItem | null>(null);
  const [autoPlayVideo, setAutoPlayVideo] = useState(false);
  const { isLoading, getAccessTokenSilently } = useAuth0();
  const [confirmation, setConfirmation] = useState<{ message: string; action: () => void } | null>(null);
  /** True after we opened the viewer with a history push from this page; close with pop so we do not duplicate the base URL. */
  const mediaModalPushedRef = useRef(false);

  useEffect(() => {
    if (!mediaId) {
      mediaModalPushedRef.current = false;
    }
  }, [mediaId]);

  const openModal = useCallback(
    (newM: MediaItem) => {
      const prevMediaId = m ? mediaIdentityId(m.identity) : 0;
      const pathname = location.pathname;
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
      const lastIsNumeric = /^\d+$/.test(lastSegment);
      const lastIsTab = AREA_PROBLEM_SECTOR_TAB_SEGMENTS.has(lastSegment);
      // Determine the URL for the media modal.
      // On /problem/, /sector/, /area/ paths:
      //   - If the last segment is a known tab name (e.g. "map", "overview"), strip it and replace with the media ID.
      //     This way /sector/3541/map → /sector/3541/42371, and closing goes back to /sector/3541/map via navigate(-1).
      //   - If the last segment is numeric (a media ID), replace it (swipe between images).
      //   - Otherwise append the media ID.
      // On /user/ paths: always append the media ID after the page name.
      //   /user/1/media → /user/1/media/38926
      const isAreaProblemSector =
        pathname.startsWith('/problem/') || pathname.startsWith('/sector/') || pathname.startsWith('/area/');
      let url: string;
      if (isAreaProblemSector && lastIsTab) {
        // Strip the tab name (e.g. "map", "overview") and replace with the media ID.
        // /sector/3541/map → /sector/3541/42371
        url = `/${segments.slice(0, -1).join('/')}/${mediaIdentityId(newM.identity)}`;
      } else if (lastIsNumeric && segments.length >= 3) {
        // The last segment is a numeric media ID (3+ segments), replace it.
        // /problem/5162/21682 → /problem/5162/21683
        url = `/${segments.slice(0, -1).join('/')}/${mediaIdentityId(newM.identity)}`;
      } else if (prevMediaId) {
        // Carousel swipe: replace the last segment (which is the previous media ID)
        url = `/${segments.slice(0, -1).join('/')}/${mediaIdentityId(newM.identity)}`;
      } else {
        // Append the media ID
        url = `${pathname}/${mediaIdentityId(newM.identity)}`;
      }
      setM(newM);
      /** Push on first open so browser Back closes the modal; replace when swapping media so swipes do not stack history. */
      const isCarousel = !!prevMediaId;
      if (!isCarousel) {
        mediaModalPushedRef.current = true;
      }
      /** Replace when pitch changes so browser Back goes to the base problem URL, not the previous pitch. */
      const prevPitch = pitch;
      const newPitch = newM.problems?.find((p) => p.problemId === optProblemId)?.problemPitch ?? 0;
      const pitchChanged = !!prevPitch && !!newPitch && prevPitch !== newPitch;
      navigate(url, { replace: isCarousel || pitchChanged });
    },
    [m, location.pathname, navigate, pitch, optProblemId],
  );
  const closeModal = useCallback(() => {
    const lastSlashIndex = location.pathname.lastIndexOf('/');
    const url = location.pathname.substring(0, lastSlashIndex);
    if (!pitch) setM(null);
    setAutoPlayVideo(false);
    if (mediaModalPushedRef.current) {
      mediaModalPushedRef.current = false;
      navigate(-1);
    } else {
      navigate(url, { replace: true });
    }
  }, [location.pathname, pitch, navigate]);
  const carouselMediaRef = useRef(carouselMedia);
  carouselMediaRef.current = carouselMedia;
  const mRef = useRef(m);
  mRef.current = m;

  const gotoPrev = useCallback(() => {
    const cur = mRef.current;
    const arr = carouselMediaRef.current;
    if (cur && arr && arr.length > 1) {
      const ix =
        (arr.findIndex((x) => mediaIdentityId(x.identity) === mediaIdentityId(cur.identity)) - 1 + arr.length) %
        arr.length;
      openModal(arr[ix]);
    }
  }, [openModal]);
  const gotoNext = useCallback(() => {
    const cur = mRef.current;
    const arr = carouselMediaRef.current;
    if (cur && arr && arr.length > 1) {
      const ix = (arr.findIndex((x) => mediaIdentityId(x.identity) === mediaIdentityId(cur.identity)) + 1) % arr.length;
      openModal(arr[ix]);
    }
  }, [openModal]);
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const cur = mRef.current;
      if (!cur) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') gotoPrev();
      if (e.key === 'ArrowRight') gotoNext();
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [closeModal, gotoNext, gotoPrev]);
  const executeMediaAction = (action: MediaAction) => {
    setIsSaving(true);
    getAccessTokenSilently()
      .then((token) =>
        action(token).then(() => {
          setIsSaving(false);
          closeModal();
        }),
      )
      .catch((err) => {
        console.error(err);
        setIsSaving(false);
      });
  };
  const onDeleteMedia = () => {
    if (!m) return;
    setConfirmation({
      message: `Delete this ${m.isMovie ? 'video' : 'image'}?`,
      action: () => executeMediaAction((token) => deleteMedia(token, mediaIdentityId(m.identity))),
    });
  };

  if (isLoading) return <Loading />;
  if (mediaId && media) {
    const found = media.find((x) => mediaIdentityId(x.identity) === mediaId);
    if (
      found &&
      (!m ||
        mediaIdentityId(m.identity) !== mediaIdentityId(found.identity) ||
        mediaIdentityVersionStamp(m.identity) !== mediaIdentityVersionStamp(found.identity) ||
        m.mediaSvgs !== found.mediaSvgs ||
        m.description !== found.description ||
        m.photographer !== found.photographer)
    ) {
      setM(found);
    }
  } else if (!mediaId && !pitch && m) {
    setM(null);
  }
  const tileCompact = compactTiles || triviaTiles;
  const tileSizes = mediaTileSizes(!!compactTiles, !!triviaTiles);

  const LazyMediaCard = ({ x }: { x: MediaItem }) => {
    const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px 0px' });
    const hasSvgs = (x.svgs?.length ?? 0) > 0 || (x.mediaSvgs?.length ?? 0) > 0;
    return (
      <div
        ref={ref}
        onClick={() => openModal(x)}
        className={cn(
          'group relative w-full min-w-0 cursor-pointer overflow-hidden transition-all duration-300',
          tileCompact ? 'rounded-lg' : 'rounded-xl',
          'bg-surface-card hover:shadow-lg',
          hasSvgs
            ? 'border-0'
            : cn('border-surface-border hover:border-brand-border border', x.inherited && 'border-slate-700'),
        )}
      >
        {' '}
        <div className='relative aspect-4/3 w-full overflow-hidden'>
          {' '}
          {inView ? (
            hasSvgs ? (
              <SvgViewer
                thumb
                m={x}
                optProblemId={optProblemId}
                showText={false}
                className='absolute inset-0 h-full w-full'
              />
            ) : x.isMovie ? (
              <MediaVideoTile
                key={`${mediaIdentityId(x.identity)}-${mediaIdentityVersionStamp(x.identity)}`}
                x={x}
                triviaTiles={!!triviaTiles}
              />
            ) : (
              <img
                src={getMediaFileUrl(mediaIdentityId(x.identity), mediaIdentityVersionStamp(x.identity), false, {
                  minDimension: mediaTileMinDimension(!!triviaTiles),
                })}
                srcSet={getMediaFileUrlSrcSet(
                  mediaIdentityId(x.identity),
                  mediaIdentityVersionStamp(x.identity),
                  Math.max(Number(x.width ?? 0) || 0, 300),
                )}
                sizes={tileSizes}
                alt={x.description ?? ''}
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                style={mediaObjectPositionStyle(x.identity)}
                loading='lazy'
                decoding='async'
              />
            )
          ) : (
            <div className='absolute inset-0 animate-pulse' style={mediaPlaceholderStyle(x.identity)} />
          )}{' '}
          {x.is360 && (
            <div className='pointer-events-none absolute top-1.5 left-1.5 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] leading-tight font-bold text-[#fff] shadow-sm sm:top-2 sm:left-2 sm:px-2 sm:py-0.5 sm:text-[11px]'>
              360°
            </div>
          )}
        </div>{' '}
      </div>
    );
  };
  return (
    <div className={cn(triviaTiles ? 'space-y-2' : compactTiles ? 'space-y-3' : 'space-y-6')}>
      {' '}
      {confirmation &&
        createPortal(
          <div className='animate-in fade-in fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200'>
            {' '}
            <div className='bg-surface-card border-surface-border w-full max-w-sm rounded-2xl border p-6 shadow-2xl'>
              {' '}
              <h3 className='type-h2 mb-2'>Confirm Action</h3>{' '}
              <p className='type-body mb-6 opacity-70'>{confirmation.message}</p>{' '}
              <div className='flex justify-end gap-3'>
                {' '}
                <button type='button' onClick={() => setConfirmation(null)} className='modal-action-cancel px-4 py-2'>
                  Cancel
                </button>{' '}
                <button
                  type='button'
                  onClick={() => {
                    confirmation.action();
                    setConfirmation(null);
                  }}
                  className='type-label rounded-lg bg-red-500 px-4 py-2 shadow-lg shadow-red-500/20 transition-colors hover:bg-red-600'
                >
                  {' '}
                  Confirm{' '}
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </div>,
          document.body,
        )}{' '}
      {m &&
        createPortal(
          <MediaModal
            key={mediaIdentityId(m.identity)}
            isSaving={isSaving}
            onClose={closeModal}
            m={m}
            pitch={pitch ?? 0}
            pitches={pitches ?? []}
            autoPlayVideo={autoPlayVideo}
            onDelete={onDeleteMedia}
            onRotate={(deg) =>
              executeMediaAction((token) => putMediaJpegRotate(token, mediaIdentityId(m.identity), deg))
            }
            onMoveImageLeft={() =>
              executeMediaAction((token) => moveMedia(token, mediaIdentityId(m.identity), true, false))
            }
            onMoveImageRight={() =>
              executeMediaAction((token) => moveMedia(token, mediaIdentityId(m.identity), false, true))
            }
            orderableMedia={orderableMedia ?? []}
            carouselIndex={
              (carouselMedia?.findIndex((x) => mediaIdentityId(x.identity) === mediaIdentityId(m.identity)) ?? -1) + 1
            }
            carouselSize={carouselMedia?.length ?? 0}
            showLocation={showLocation}
            gotoPrev={gotoPrev}
            gotoNext={gotoNext}
            playVideo={() => setAutoPlayVideo(true)}
            stopVideo={() => setAutoPlayVideo(false)}
            optProblemId={optProblemId}
          />,
          document.body,
        )}{' '}
      <div
        className={cn(
          triviaTiles
            ? designContract.layout.mediaTileGridTrivia
            : compactTiles
              ? designContract.layout.mediaTileGridCompact
              : 'grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5',
        )}
      >
        {' '}
        {media?.map((x) => (
          <LazyMediaCard x={x} key={mediaIdentityId(x.identity)} />
        ))}{' '}
      </div>{' '}
    </div>
  );
};
export default Media;
