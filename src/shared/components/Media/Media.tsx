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
  moveMedia,
  putMediaInfo,
  putMediaJpegRotate,
  setMediaAsAvatar,
} from '../../../api';
import { useAuth0 } from '@auth0/auth0-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import SvgViewer from '../SvgViewer';
import { VideoThumbnailPlayOverlay } from './VideoThumbnailPlayOverlay';
import { VideoProcessingPlaceholder } from './VideoProcessingPlaceholder';
import { Loading } from '../../ui/StatusWidgets';
import MediaEditModal from './MediaEditModal';
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

function stripTabSegmentFromPath(pathname: string): string {
  if (!pathname.startsWith('/problem/') && !pathname.startsWith('/sector/') && !pathname.startsWith('/area/')) {
    return pathname;
  }
  const lastSlash = pathname.lastIndexOf('/');
  if (lastSlash <= 0) return pathname;
  const last = pathname.slice(lastSlash + 1);
  if (last && AREA_PROBLEM_SECTOR_TAB_SEGMENTS.has(last)) {
    return pathname.slice(0, lastSlash);
  }
  return pathname;
}

const useIds = () => {
  const { mediaId, pitch, segment } = useParams();
  const raw = segment ?? mediaId;
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
  const [editM, setEditM] = useState<MediaItem | null>(null);
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
      const basePath = stripTabSegmentFromPath(location.pathname);
      const url = prevMediaId
        ? location.pathname.replace(prevMediaId.toString(), String(mediaIdentityId(newM.identity)))
        : `${basePath}/${mediaIdentityId(newM.identity)}`;
      setM(newM);
      setEditM(null);
      /** Push on first open so browser Back closes the modal; replace when swapping media so swipes do not stack history. */
      const isCarousel = !!prevMediaId;
      if (!isCarousel) {
        mediaModalPushedRef.current = true;
      }
      navigate(url, { replace: isCarousel });
    },
    [m, location.pathname, navigate],
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
  const gotoPrev = useCallback(() => {
    if (m && carouselMedia && carouselMedia.length > 1) {
      const ix =
        (carouselMedia.findIndex((x) => mediaIdentityId(x.identity) === mediaIdentityId(m.identity)) -
          1 +
          carouselMedia.length) %
        carouselMedia.length;
      openModal(carouselMedia[ix]);
    }
  }, [m, carouselMedia, openModal]);
  const gotoNext = useCallback(() => {
    if (m && carouselMedia && carouselMedia.length > 1) {
      const ix =
        (carouselMedia.findIndex((x) => mediaIdentityId(x.identity) === mediaIdentityId(m.identity)) + 1) %
        carouselMedia.length;
      openModal(carouselMedia[ix]);
    }
  }, [m, carouselMedia, openModal]);
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (editM || !m) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') gotoPrev();
      if (e.key === 'ArrowRight') gotoNext();
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [editM, m, closeModal, gotoNext, gotoPrev]);
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
      message: `Delete this ${m.idType === 1 ? 'image' : 'video'}?`,
      action: () => executeMediaAction((token) => deleteMedia(token, mediaIdentityId(m.identity))),
    });
  };
  if (isLoading) return <Loading />;
  if (mediaId && media) {
    const found = media.find((x) => mediaIdentityId(x.identity) === mediaId);
    if (
      found &&
      (!m || mediaIdentityId(m.identity) !== mediaIdentityId(found.identity) || m.mediaSvgs !== found.mediaSvgs)
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
            ) : x.idType === 2 ? (
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
                alt={x.mediaMetadata?.description ?? ''}
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                style={mediaObjectPositionStyle(x.identity)}
                loading='lazy'
                decoding='async'
              />
            )
          ) : (
            <div className='skeleton-bar absolute inset-0 animate-pulse' />
          )}{' '}
        </div>{' '}
      </div>
    );
  };
  return (
    <div className={cn(triviaTiles ? 'space-y-2' : compactTiles ? 'space-y-3' : 'space-y-6')}>
      {' '}
      {confirmation && (
        <div className='animate-in fade-in fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200'>
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
        </div>
      )}{' '}
      {editM && (
        <MediaEditModal
          numPitches={pitches?.length || 0}
          m={editM}
          save={async (id, description, pitchNr, trivia) => {
            const token = await getAccessTokenSilently();
            await putMediaInfo(token, id, description, pitchNr, trivia);
            setEditM(null);
          }}
          onCloseWithoutReload={() => setEditM(null)}
        />
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
            onEdit={() => setEditM(m)}
            onDelete={onDeleteMedia}
            onRotate={(deg) =>
              executeMediaAction((token) => putMediaJpegRotate(token, mediaIdentityId(m.identity), deg))
            }
            onMoveImageLeft={() =>
              executeMediaAction((token) => moveMedia(token, mediaIdentityId(m.identity), true, 0, 0, 0))
            }
            onMoveImageRight={() =>
              executeMediaAction((token) => moveMedia(token, mediaIdentityId(m.identity), false, 0, 0, 0))
            }
            onMoveImageToArea={() =>
              executeMediaAction((token) =>
                moveMedia(token, mediaIdentityId(m.identity), false, m.enableMoveToIdArea ?? 0, 0, 0),
              )
            }
            onMoveImageToSector={() =>
              executeMediaAction((token) =>
                moveMedia(token, mediaIdentityId(m.identity), false, 0, m.enableMoveToIdSector ?? 0, 0),
              )
            }
            onMoveImageToProblem={() =>
              executeMediaAction((token) =>
                moveMedia(token, mediaIdentityId(m.identity), false, 0, 0, m.enableMoveToIdProblem ?? 0),
              )
            }
            onSetMediaAsAvatar={() =>
              setConfirmation({
                message: 'Change your avatar to this image?',
                action: () => executeMediaAction((token) => setMediaAsAvatar(token, mediaIdentityId(m.identity))),
              })
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
