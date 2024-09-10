import React, {
  useState,
  useEffect,
  ComponentProps,
  CSSProperties,
} from "react";
import LazyLoad from "react-lazyload";
import { useLocation } from "react-router-dom";
import {
  getImageUrl,
  deleteMedia,
  moveMedia,
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
import { getUrlValue } from "../../../api/utils";

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

type Props = Pick<ComponentProps<typeof MediaEditModal>, "numPitches"> &
  Pick<ComponentProps<typeof MediaModal>, "optProblemId"> & {
    media: components["schemas"]["Media"][];
    orderableMedia: components["schemas"]["Media"][];
    carouselMedia: components["schemas"]["Media"][];
    showLocation: boolean;
  };

const Media = ({
  numPitches,
  media,
  orderableMedia,
  carouselMedia,
  optProblemId,
  showLocation,
}: Props) => {
  const location = useLocation();
  const [m, setM] = useState<components["schemas"]["Media"]>(null);
  const [pitch, setPitch] = useState<number>(null);
  const [editM, setEditM] = useState<components["schemas"]["Media"]>(null);
  const [autoPlayVideo, setAutoPlayVideo] = useState(false);
  const { isLoading, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    function handleKeyPress({ keyCode }) {
      if (editM == null) {
        if (keyCode === 27) {
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

  function openModal(m) {
    const url = location.pathname + "?idMedia=" + m.id;
    setM(m);
    setPitch(null);
    setEditM(null);
    window.history.replaceState("", "", url);
  }

  function closeModal() {
    let url = location.pathname;
    if (pitch) {
      setPitch(null);
      url += "?idMedia=" + m.id;
    } else {
      setM(null);
    }
    window.history.replaceState("", "", url);
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

  function onDeleteImage() {
    if (confirm("Are you sure you want to delete this image?")) {
      const id = m.id;
      getAccessTokenSilently().then((accessToken) => {
        deleteMedia(accessToken, id)
          .then(() => {
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
      getAccessTokenSilently().then((accessToken) => {
        putMediaJpegRotate(accessToken, m.id, degrees)
          .then(() => {
            closeModal();
          })
          .catch((error) => {
            console.warn(error);
          });
      });
    }
  }

  function onMoveImageLeft() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, true, 0, 0, 0)
        .then(() => {
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageRight() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, 0, 0, 0)
        .then(() => {
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageToArea() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, m.enableMoveToIdArea, 0, 0)
        .then(() => {
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageToSector() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, 0, m.enableMoveToIdSector, 0)
        .then(() => {
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageToProblem() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, 0, 0, m.enableMoveToIdProblem)
        .then(() => {
          closeModal();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  if (isLoading) {
    return <Loading />;
  }
  const idMedia = getUrlValue("idMedia");
  if (idMedia && media) {
    const newMediaArr = media.filter((m) => m.id === parseInt(idMedia));
    if (newMediaArr && newMediaArr.length === 1) {
      const newM = newMediaArr[0];
      if (!m || m.id != newM.id || m.mediaSvgs != newM.mediaSvgs) {
        setM(newM);
      }
      const pitchArg = parseInt(getUrlValue("pitch")) || null;
      if (pitch != pitchArg) {
        setPitch(pitchArg);
      }
    }
  } else if (!window.location.search && media && m) {
    setM(null);
    setPitch(null);
  }

  return (
    <>
      {editM && (
        <MediaEditModal
          numPitches={numPitches}
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
          onClose={closeModal}
          m={m}
          pitch={pitch}
          autoPlayVideo={autoPlayVideo}
          onEdit={() => setEditM(m)}
          onDelete={onDeleteImage}
          onRotate={onRotate}
          onMoveImageLeft={onMoveImageLeft}
          onMoveImageRight={onMoveImageRight}
          onMoveImageToArea={onMoveImageToArea}
          onMoveImageToSector={onMoveImageToSector}
          onMoveImageToProblem={onMoveImageToProblem}
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
