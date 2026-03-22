import { useState, useEffect, type ComponentProps, type SyntheticEvent, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getMediaFileUrl,
  deleteMedia,
  moveMedia,
  setMediaAsAvatar,
  putMediaJpegRotate,
  putMediaInfo,
} from '../../../api';
import { Play } from 'lucide-react';
import MediaModal from './media-modal';
import MediaEditModal from './media-edit-modal';
import SvgViewer from '../../SvgViewer';
import { useAuth0 } from '@auth0/auth0-react';
import { Loading } from '../widgets/widgets';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';

type MediaItem = components['schemas']['Media'];
type ProblemSection = components['schemas']['ProblemSection'];

type Props = Pick<ComponentProps<typeof MediaModal>, 'optProblemId'> & {
  pitches?: ProblemSection[] | null;
  media?: MediaItem[] | null;
  orderableMedia?: MediaItem[] | null;
  carouselMedia?: MediaItem[] | null;
  showLocation: boolean;
};

const useIds = () => {
  const { mediaId, pitch } = useParams();
  return {
    mediaId: mediaId ? +mediaId : 0,
    pitch: pitch ? +pitch : 0,
  };
};

type MediaAction = (token: string) => Promise<unknown>;

const Media = ({
  pitches,
  media,
  orderableMedia,
  carouselMedia,
  optProblemId,
  showLocation,
}: Props) => {
  const { mediaId, pitch } = useIds();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [m, setM] = useState<MediaItem | null>(null);
  const [editM, setEditM] = useState<MediaItem | null>(null);
  const [autoPlayVideo, setAutoPlayVideo] = useState(false);
  const { isLoading, getAccessTokenSilently } = useAuth0();
  const [confirmation, setConfirmation] = useState<{ message: string; action: () => void } | null>(
    null,
  );

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
      const ix =
        (carouselMedia.findIndex((x) => x.id === m.id) - 1 + carouselMedia.length) %
        carouselMedia.length;
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

  // Sync state with URL params
  if (mediaId && media) {
    const found = media.find((x) => x.id === mediaId);
    if (found && (!m || m.id !== found.id || m.mediaSvgs !== found.mediaSvgs)) {
      setM(found);
    }
  } else if (!mediaId && !pitch && m) {
    setM(null);
  }

  const LazyMediaCard = ({ x }: { x: MediaItem }) => {
    const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px 0px' });
    const hasSvgs = (x.svgs?.length ?? 0) > 0 || (x.mediaSvgs?.length ?? 0) > 0;

    return (
      <div
        ref={ref}
        onClick={() => openModal(x)}
        className={cn(
          'relative group cursor-pointer overflow-hidden rounded-xl border transition-all duration-300',
          'bg-surface-nav border-surface-border hover:border-brand/50 hover:shadow-lg',
          x.inherited && 'border-slate-700',
        )}
      >
        <div className='aspect-4/3 relative'>
          {inView ? (
            hasSvgs ? (
              <SvgViewer
                thumb
                m={x}
                optProblemId={optProblemId}
                showText={false}
                className='absolute inset-0 w-full h-full object-cover'
              />
            ) : (
              <>
                <img
                  alt={x.mediaMetadata?.description ?? ''}
                  src={getMediaFileUrl(Number(x.id ?? 0), Number(x.versionStamp ?? 0), false, {
                    minDimension: 205,
                  })}
                  className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                  onError={(e: SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/png/video_placeholder.png';
                  }}
                />
                {x.idType === 2 && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors'>
                    <div className='w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white shadow-lg'>
                      <Play size={20} fill='currentColor' />
                    </div>
                  </div>
                )}
              </>
            )
          ) : (
            <div className='absolute inset-0 bg-surface-hover animate-pulse' />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {confirmation && (
        <div className='fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='bg-surface-card border border-surface-border p-6 rounded-2xl shadow-2xl max-w-sm w-full'>
            <h3 className='text-lg font-bold text-white mb-2'>Confirm Action</h3>
            <p className='text-slate-400 mb-6'>{confirmation.message}</p>
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setConfirmation(null)}
                className='px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => {
                  confirmation.action();
                  setConfirmation(null);
                }}
                className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-red-500/20'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {editM && (
        <MediaEditModal
          numPitches={pitches?.length || 0}
          m={editM}
          save={(id, description, pitchNr, trivia) => {
            getAccessTokenSilently().then((token) => {
              putMediaInfo(token, id, description, pitchNr, trivia).then(() => setEditM(null));
            });
          }}
          onCloseWithoutReload={() => setEditM(null)}
        />
      )}

      {m && (
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
          onRotate={(deg) =>
            executeMediaAction((token) => putMediaJpegRotate(token, m.id ?? 0, deg))
          }
          onMoveImageLeft={() =>
            executeMediaAction((token) => moveMedia(token, m.id ?? 0, true, 0, 0, 0))
          }
          onMoveImageRight={() =>
            executeMediaAction((token) => moveMedia(token, m.id ?? 0, false, 0, 0, 0))
          }
          onMoveImageToArea={() =>
            executeMediaAction((token) =>
              moveMedia(token, m.id ?? 0, false, m.enableMoveToIdArea ?? 0, 0, 0),
            )
          }
          onMoveImageToSector={() =>
            executeMediaAction((token) =>
              moveMedia(token, m.id ?? 0, false, 0, m.enableMoveToIdSector ?? 0, 0),
            )
          }
          onMoveImageToProblem={() =>
            executeMediaAction((token) =>
              moveMedia(token, m.id ?? 0, false, 0, 0, m.enableMoveToIdProblem ?? 0),
            )
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
        />
      )}

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
        {media?.map((x) => (
          <LazyMediaCard x={x} key={x.id ?? 0} />
        ))}
      </div>
    </div>
  );
};

export default Media;
