import React, {
  useState,
  useEffect,
  ComponentProps,
  CSSProperties,
} from "react";
import LazyLoad from "react-lazyload";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getImageUrl,
  deleteMedia,
  moveMedia,
  setMediaAsAvatar,
  putMediaJpegRotate,
  putMediaInfo,
} from "../../../api";
import { Card, Image } from "semantic-ui-react";
import MediaModal from "./media-modal";
import MediaEditModal from "./media-edit-modal";
import SvgViewer from "../../SvgViewer";
import { useAuth0 } from "@auth0/auth0-react";
import { Loading } from "../widgets/widgets";
import { components } from "../../../@types/buldreinfo/swagger";

const style: CSSProperties = {
  objectFit: "cover",
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: "100%",
  height: "100%",
};

type Props = Pick<ComponentProps<typeof MediaModal>, "optProblemId"> & {
  pitches: components["schemas"]["ProblemSection"][];
  media: components["schemas"]["Media"][];
  orderableMedia: components["schemas"]["Media"][];
  carouselMedia: components["schemas"]["Media"][];
  showLocation: boolean;
};

const useIds = (): {
  mediaId: number;
  pitch: number;
} => {
  const { mediaId, pitch } = useParams();
  return {
    mediaId: +mediaId,
    pitch: +pitch,
  };
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
  const [m, setM] = useState<components["schemas"]["Media"]>(null);
  const [editM, setEditM] = useState<components["schemas"]["Media"]>(null);
  const [autoPlayVideo, setAutoPlayVideo] = useState(false);
  const { isLoading, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    function handleKeyPress({ keyCode }) {
      if (editM == null && m != null) {
        if (keyCode === 27) {
          // Escape
          closeModal();
        } else if (keyCode === 37) {
          gotoPrev();
        } else if (keyCode === 39) {
          gotoNext();
        }
      }
    }
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  function openModal(newM) {
    const prevMediaId = m?.id;
    const url = prevMediaId
      ? location.pathname.replace(prevMediaId.toString(), newM.id)
      : location.pathname + "/" + newM.id;
    setM(newM);
    setEditM(null);
    navigate(url);
  }

  function closeModal() {
    const url = location.pathname.substring(
      0,
      location.pathname.lastIndexOf("/"),
    );
    if (!pitch) {
      setM(null);
    }
    navigate(url);
  }

  function gotoPrev() {
    if (m && carouselMedia.length > 1) {
      const ix =
        (carouselMedia.findIndex((x) => x.id === m.id) -
          1 +
          carouselMedia.length) %
        carouselMedia.length;
      openModal(carouselMedia[ix]);
    }
  }

  function gotoNext() {
    if (m && carouselMedia.length > 1) {
      const ix =
        (carouselMedia.findIndex((x) => x.id === m.id) + 1) %
        carouselMedia.length;
      openModal(carouselMedia[ix]);
    }
  }

  function playVideo() {
    if (m) {
      setAutoPlayVideo(true);
    }
  }

  function onDeleteMedia() {
    const { id, idType } = m;
    if (
      confirm(
        "Are you sure you want to delete this " +
          (idType === 1 ? "image" : "video") +
          "?",
      )
    ) {
      setIsSaving(true);
      getAccessTokenSilently().then((accessToken) => {
        deleteMedia(accessToken, id)
          .then(() => {
            setIsSaving(false);
            closeModal();
          })
          .catch((error) => {
            console.warn(error);
          });
      });
    }
  }

  function onRotate(degrees) {
    if (
      confirm(
        "Are you sure you want to rotate this image " + degrees + " degrees?",
      )
    ) {
      setIsSaving(true);
      getAccessTokenSilently().then((accessToken) => {
        putMediaJpegRotate(accessToken, m.id, degrees)
          .then(() => {
            setIsSaving(false);
            closeModal();
          })
          .catch((error) => {
            console.warn(error);
          });
      });
    }
  }

  function onMoveImageLeft() {
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, true, 0, 0, 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageRight() {
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, 0, 0, 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageToArea() {
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, m.enableMoveToIdArea, 0, 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageToSector() {
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, 0, m.enableMoveToIdSector, 0)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageToProblem() {
    setIsSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, 0, 0, m.enableMoveToIdProblem)
        .then(() => {
          setIsSaving(false);
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onSetMediaAsAvatar() {
    if (confirm("Are you sure you want to change your avatar to this image?")) {
      setIsSaving(true);
      getAccessTokenSilently().then((accessToken) => {
        setMediaAsAvatar(accessToken, m.id)
          .then(() => {
            setIsSaving(false);
            closeModal();
          })
          .catch((error) => {
            console.warn(error);
          });
      });
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  if (mediaId && media) {
    const newMediaArr = media.filter((m) => m.id === mediaId);
    if (newMediaArr && newMediaArr.length === 1) {
      const newM = newMediaArr[0];
      if (!m || m.id != newM.id || m.mediaSvgs != newM.mediaSvgs) {
        setM(newM);
      }
    }
  } else if (!mediaId && !pitch && media && m) {
    setM(null);
  }

  return (
    <>
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
          isSaving={isSaving}
          onClose={closeModal}
          m={m}
          pitch={pitch}
          pitches={pitches}
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
          orderableMedia={orderableMedia}
          carouselIndex={carouselMedia.findIndex((x) => x.id === m.id) + 1}
          carouselSize={carouselMedia.length}
          showLocation={showLocation}
          gotoPrev={gotoPrev}
          gotoNext={gotoNext}
          playVideo={playVideo}
          optProblemId={optProblemId}
        />
      )}
      <Card.Group itemsPerRow={5} doubling>
        {media.map((x) => {
          let content;
          if (x.svgs || x.mediaSvgs) {
            content = (
              <SvgViewer
                close={null}
                thumb={true}
                m={x}
                pitch={null}
                style={style}
                optProblemId={optProblemId}
                showText={false}
                problemIdHovered={null}
              />
            );
          } else {
            content = (
              <Image
                alt={x.mediaMetadata.description}
                style={style}
                src={getImageUrl(x.id, x.crc32, 205)}
                onError={(img) =>
                  (img.target.src = "/png/video_placeholder.png")
                }
                rounded
              />
            );
          }
          return (
            <Card
              as="a"
              onClick={() => openModal(x)}
              key={x.id}
              raised
              style={{
                backgroundColor: "rgb(245, 245, 245)",
                border: x.inherited
                  ? "1px solid black"
                  : "1px solid rgb(245, 245, 245)",
              }}
            >
              <div style={{ paddingTop: "75%" }}>
                <LazyLoad offset={100}>{content}</LazyLoad>
              </div>
            </Card>
          );
        })}
      </Card.Group>
    </>
  );
};

export default Media;
