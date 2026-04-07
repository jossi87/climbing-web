import { useState, useEffect, type ComponentProps, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useInView } from 'react-intersection-observer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  deleteMedia,
  getMediaFileUrl,
  moveMedia,
  putMediaInfo,
  putMediaJpegRotate,
  setMediaAsAvatar,
} from '../../../api';
import { useAuth0 } from '@auth0/auth0-react';
import { Film } from 'lucide-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import SvgViewer from '../SvgViewer';
import { VideoThumbnailPlayOverlay } from './VideoThumbnailPlayOverlay';
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
const useIds = () => {
  const { mediaId, pitch } = useParams();
  return { mediaId: mediaId ? +mediaId : 0, pitch: pitch ? +pitch : 0 };
};
type MediaAction = (token: string) => Promise<unknown>;

/** File videos: always request poster JPEG; only show placeholder when the image actually fails (e.g. not generated yet). */
const MediaVideoTile = ({ x, triviaTiles }: { x: MediaItem; triviaTiles: boolean }) => {
  const [imgError, setImgError] = useState(false);
  const thumbUrl = getMediaFileUrl(Number(x.id ?? 0), Number(x.versionStamp ?? 0), false, {
    minDimension: triviaTiles ? 160 : 205,
  });

  if (imgError) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-slate-800 to-slate-950 px-2 text-center'>
        <Film className='text-slate-500' size={28} aria-hidden />
        <p className='text-[10px] font-medium text-slate-400'>No thumbnail</p>
      </div>
    );
  }

  return (
    <>
      <img
        src={thumbUrl}
        alt=''
        className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
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
  const openModal = useCallback(
    (newM: MediaItem) => {
      const prevMediaId = m?.id;
      const url = prevMediaId
        ? location.pathname.replace(prevMediaId.toString(), (newM.id ?? 0).toString())
        : `${location.pathname}/${newM.id ?? 0}`;
      setM(newM);
      setEditM(null);
      navigate(url);
    },
    [m?.id, location.pathname, navigate],
  );
  const closeModal = useCallback(() => {
    const lastSlashIndex = location.pathname.lastIndexOf('/');
    const url = location.pathname.substring(0, lastSlashIndex);
    if (!pitch) setM(null);
    setAutoPlayVideo(false);
    navigate(url);
  }, [location.pathname, pitch, navigate]);
  const gotoPrev = useCallback(() => {
    if (m && carouselMedia && carouselMedia.length > 1) {
      const ix = (carouselMedia.findIndex((x) => x.id === m.id) - 1 + carouselMedia.length) % carouselMedia.length;
      openModal(carouselMedia[ix]);
    }
  }, [m, carouselMedia, openModal]);
  const gotoNext = useCallback(() => {
    if (m && carouselMedia && carouselMedia.length > 1) {
      const ix = (carouselMedia.findIndex((x) => x.id === m.id) + 1) % carouselMedia.length;
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
      action: () => executeMediaAction((token) => deleteMedia(token, m.id ?? 0)),
    });
  };
  if (isLoading) return <Loading />;
  if (mediaId && media) {
    const found = media.find((x) => x.id === mediaId);
    if (found && (!m || m.id !== found.id || m.mediaSvgs !== found.mediaSvgs)) {
      setM(found);
    }
  } else if (!mediaId && !pitch && m) {
    setM(null);
  }
  const tileCompact = compactTiles || triviaTiles;

  const LazyMediaCard = ({ x }: { x: MediaItem }) => {
    const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px 0px' });
    const hasSvgs = (x.svgs?.length ?? 0) > 0 || (x.mediaSvgs?.length ?? 0) > 0;
    return (
      <div
        ref={ref}
        onClick={() => openModal(x)}
        className={cn(
          'group relative w-full min-w-0 cursor-pointer overflow-hidden border transition-all duration-300',
          tileCompact ? 'rounded-lg' : 'rounded-xl',
          'border-surface-border bg-surface-nav hover:border-brand-border hover:shadow-lg',
          x.inherited && 'border-slate-700',
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
              <MediaVideoTile key={`${x.id}-${x.versionStamp ?? 0}`} x={x} triviaTiles={!!triviaTiles} />
            ) : (
              <div
                role='img'
                aria-label={x.mediaMetadata?.description ?? 'Media thumbnail'}
                className='absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105'
                style={{
                  backgroundImage: `url(${JSON.stringify(
                    getMediaFileUrl(Number(x.id ?? 0), Number(x.versionStamp ?? 0), false, {
                      minDimension: triviaTiles ? 160 : 205,
                    }),
                  )})`,
                }}
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
      {editM &&
        createPortal(
          <MediaEditModal
            numPitches={pitches?.length || 0}
            m={editM}
            save={(id, description, pitchNr, trivia) => {
              getAccessTokenSilently().then((token) => {
                putMediaInfo(token, id, description, pitchNr, trivia).then(() => setEditM(null));
              });
            }}
            onCloseWithoutReload={() => setEditM(null)}
          />,
          document.body,
        )}{' '}
      {m &&
        createPortal(
          <MediaModal
            key={m.id ?? 0}
            isSaving={isSaving}
            onClose={closeModal}
            m={m}
            pitch={pitch ?? 0}
            pitches={pitches ?? []}
            autoPlayVideo={autoPlayVideo}
            onEdit={() => setEditM(m)}
            onDelete={onDeleteMedia}
            onRotate={(deg) => executeMediaAction((token) => putMediaJpegRotate(token, m.id ?? 0, deg))}
            onMoveImageLeft={() => executeMediaAction((token) => moveMedia(token, m.id ?? 0, true, 0, 0, 0))}
            onMoveImageRight={() => executeMediaAction((token) => moveMedia(token, m.id ?? 0, false, 0, 0, 0))}
            onMoveImageToArea={() =>
              executeMediaAction((token) => moveMedia(token, m.id ?? 0, false, m.enableMoveToIdArea ?? 0, 0, 0))
            }
            onMoveImageToSector={() =>
              executeMediaAction((token) => moveMedia(token, m.id ?? 0, false, 0, m.enableMoveToIdSector ?? 0, 0))
            }
            onMoveImageToProblem={() =>
              executeMediaAction((token) => moveMedia(token, m.id ?? 0, false, 0, 0, m.enableMoveToIdProblem ?? 0))
            }
            onSetMediaAsAvatar={() =>
              setConfirmation({
                message: 'Change your avatar to this image?',
                action: () => executeMediaAction((token) => setMediaAsAvatar(token, m.id ?? 0)),
              })
            }
            orderableMedia={orderableMedia ?? []}
            carouselIndex={(carouselMedia?.findIndex((x) => x.id === (m.id ?? 0)) ?? -1) + 1}
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
          <LazyMediaCard x={x} key={x.id ?? 0} />
        ))}{' '}
      </div>{' '}
    </div>
  );
};
export default Media;
