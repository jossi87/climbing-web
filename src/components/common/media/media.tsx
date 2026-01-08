import {
  useState,
  useEffect,
  type ComponentProps,
  type SyntheticEvent,
  type CSSProperties,
  useCallback,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getImageUrl,
  deleteMedia,
  moveMedia,
  setMediaAsAvatar,
  putMediaJpegRotate,
  putMediaInfo,
} from '../../../api';
import { Card, Icon, Image } from 'semantic-ui-react';
import MediaModal from './media-modal';
import MediaEditModal from './media-edit-modal';
import SvgViewer from '../../SvgViewer';
import { useAuth0 } from '@auth0/auth0-react';
import { Loading } from '../widgets/widgets';
import type { components } from '../../../@types/buldreinfo/swagger';

const style: CSSProperties = {
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
};

type Props = Pick<ComponentProps<typeof MediaModal>, 'optProblemId'> & {
  pitches?: components['schemas']['ProblemSection'][] | null;
  media?: components['schemas']['Media'][] | null;
  orderableMedia?: components['schemas']['Media'][] | null;
  carouselMedia?: components['schemas']['Media'][] | null;
  showLocation: boolean;
};

const useIds = (): {
  mediaId: number;
  pitch: number;
} => {
  const { mediaId, pitch } = useParams();
  return {
    mediaId: mediaId ? +mediaId : 0,
    pitch: pitch ? +pitch : 0,
  };
};

type ConfirmationState = {
  isOpen: boolean;
  message: string;
  action: () => void;
};

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
  const [m, setM] = useState<components['schemas']['Media'] | null>(null);
  const [editM, setEditM] = useState<components['schemas']['Media'] | null>(null);
  const [autoPlayVideo, setAutoPlayVideo] = useState(false);
  const { isLoading, getAccessTokenSilently } = useAuth0();
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const showConfirmation = useCallback((message: string, action: () => void) => {
    setConfirmation({ isOpen: true, message, action });
  }, []);
  const handleCancel = useCallback(() => {
    setConfirmation(null);
  }, []);
  const handleProceed = useCallback(() => {
    if (confirmation) {
      confirmation.action();
      setConfirmation(null);
    }
  }, [confirmation]);

  const openModal = useCallback(
    (newM: components['schemas']['Media']) => {
      const prevMediaId = m?.id;
      const url = prevMediaId
        ? location.pathname.replace(prevMediaId.toString(), (newM.id ?? 0).toString())
        : location.pathname + '/' + (newM.id ?? 0);
      setM(newM);
      setEditM(null);
      navigate(url);
    },
    [m?.id, location.pathname, navigate],
  );

  const closeModal = useCallback(() => {
    const url = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    if (!pitch) {
      setM(null);
    }
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
    function handleKeyPress({ keyCode }: KeyboardEvent) {
      if (editM == null && m != null) {
        if (keyCode === 27) {
          closeModal();
        } else if (keyCode === 37) {
          gotoPrev();
        } else if (keyCode === 39) {
          gotoNext();
        }
      }
    }
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress as EventListener);
    };
  }, [editM, m, closeModal, gotoNext, gotoPrev]);

  function playVideo() {
    if (m) {
      setAutoPlayVideo(true);
    }
  }

  function onDeleteMedia() {
    if (!m) return;
    const { id, idType } = m;
    const mediaType = idType === 1 ? 'image' : 'video';

    showConfirmation(`Are you sure you want to delete this ${mediaType}?`, () => {
      setIsSaving(true);
      getAccessTokenSilently().then((accessToken) => {
        deleteMedia(accessToken, id ?? 0)
          .then(() => {
            setIsSaving(false);
            closeModal();
          })
          .catch((error) => {
            console.warn('Delete Media Error:', error);
          });
      });
    });
  }

  function onRotate(degrees: number) {
    if (!m) return;

    showConfirmation(`Are you sure you want to rotate this image ${degrees} degrees?`, () => {
      setIsSaving(true);
      getAccessTokenSilently().then((accessToken) => {
        putMediaJpegRotate(accessToken, m.id ?? 0, degrees)
          .then(() => {
            setIsSaving(false);
            closeModal();
          })
          .catch((error) => {
            console.warn('Rotate Error:', error);
          });
      });
    });
  }

  function onMoveImageLeft() {
    if (!m) return;
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id ?? 0, true, 0, 0, 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn('Move Left Error:', error);
        });
    });
  }

  function onMoveImageRight() {
    if (!m) return;
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id ?? 0, false, 0, 0, 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn('Move Right Error:', error);
        });
    });
  }

  function onMoveImageToArea() {
    if (!m || !m.enableMoveToIdArea) return;
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id ?? 0, false, m.enableMoveToIdArea ?? 0, 0, 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn('Move to Area Error:', error);
        });
    });
  }

  function onMoveImageToSector() {
    if (!m || !m.enableMoveToIdSector) return;
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id ?? 0, false, 0, m.enableMoveToIdSector ?? 0, 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn('Move to Sector Error:', error);
        });
    });
  }

  function onMoveImageToProblem() {
    if (!m || !m.enableMoveToIdProblem) return;
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id ?? 0, false, 0, 0, m.enableMoveToIdProblem ?? 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn('Move to Problem Error:', error);
        });
    });
  }

  function onSetMediaAsAvatar() {
    if (!m) return;

    showConfirmation('Are you sure you want to change your avatar to this image?', () => {
      setIsSaving(true);
      getAccessTokenSilently().then((accessToken) => {
        setMediaAsAvatar(accessToken, m.id ?? 0)
          .then(() => {
            setIsSaving(false);
            closeModal();
          })
          .catch((error) => {
            console.warn('Set Avatar Error:', error);
          });
      });
    });
  }

  if (isLoading) {
    return <Loading />;
  }

  if (mediaId && media) {
    const newMediaArr = media.filter((m) => m.id === mediaId);
    if (newMediaArr && newMediaArr.length === 1) {
      const newM = newMediaArr[0];
      if (!m || m.id !== newM.id || m.mediaSvgs !== newM.mediaSvgs) {
        setM(newM);
      }
    }
  } else if (!mediaId && !pitch && media && m) {
    setM(null);
  }

  const LazyMediaCard = ({ x }: { x: components['schemas']['Media'] }) => {
    const { ref, inView } = useInView({
      triggerOnce: true,
      rootMargin: '200px 0px',
    });

    return (
      <Card
        as='a'
        onClick={() => openModal(x)}
        key={x.id}
        raised
        style={{
          backgroundColor: 'rgb(245, 245, 245)',
          border: x.inherited ? '1px solid black' : '1px solid rgb(245, 245, 245)',
        }}
        ref={ref}
      >
        <div style={{ paddingTop: '75%' }}>
          {inView ? (
            x.svgs || x.mediaSvgs ? (
              <SvgViewer
                thumb={true}
                m={x}
                style={style}
                optProblemId={optProblemId}
                showText={false}
              />
            ) : (
              <>
                <Image
                  alt={x.mediaMetadata?.description ?? ''}
                  style={style}
                  src={getImageUrl(Number(x.id ?? 0), Number(x.crc32 ?? 0), { minDimension: 205 })}
                  onError={(e: SyntheticEvent<HTMLImageElement>) =>
                    ((e.currentTarget as HTMLImageElement).src = '/png/video_placeholder.png')
                  }
                  rounded
                />
                {x.idType === 2 && (
                  <Icon
                    name='play'
                    circular
                    style={{
                      background: 'red',
                      color: 'white',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 2,
                    }}
                  />
                )}
              </>
            )
          ) : (
            <div style={{ ...style, backgroundColor: '#e0e0e0' }}></div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      {confirmation?.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '300px',
            }}
          >
            <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{confirmation.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#db2828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
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
          save={(mediaId, description, pitch, trivia) => {
            getAccessTokenSilently().then((accessToken) => {
              putMediaInfo(accessToken, mediaId, description, pitch, trivia)
                .then(() => {
                  setEditM(null);
                })
                .catch((error) => {
                  console.warn(error);
                });
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
          onRotate={onRotate}
          onMoveImageLeft={onMoveImageLeft}
          onMoveImageRight={onMoveImageRight}
          onMoveImageToArea={onMoveImageToArea}
          onMoveImageToSector={onMoveImageToSector}
          onMoveImageToProblem={onMoveImageToProblem}
          onSetMediaAsAvatar={onSetMediaAsAvatar}
          orderableMedia={orderableMedia ?? []}
          carouselIndex={(carouselMedia?.findIndex((x) => x.id === (m.id ?? 0)) ?? -1) + 1}
          carouselSize={carouselMedia?.length ?? 0}
          showLocation={showLocation}
          gotoPrev={gotoPrev}
          gotoNext={gotoNext}
          playVideo={playVideo}
          optProblemId={optProblemId}
        />
      )}
      <Card.Group itemsPerRow={5} doubling>
        {media?.map((x) => (
          <LazyMediaCard x={x} key={x.id ?? 0} />
        ))}
      </Card.Group>
    </>
  );
};

export default Media;
