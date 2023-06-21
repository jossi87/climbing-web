import React, { useState, useEffect } from "react";
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
import Svg from "./svg";
import { useAuth0 } from "@auth0/auth0-react";
import { Loading } from "../widgets/widgets";

const style = {
  objectFit: "cover",
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: "100%",
  height: "100%",
};

const Media = ({
  numPitches,
  media,
  removeMedia,
  isAdmin,
  optProblemId,
  isBouldering,
}) => {
  const location = useLocation();
  const [m, setM] = useState<any>(null);
  const [editM, setEditM] = useState<any>(null);
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
    setEditM(null);
    window.history.replaceState("", "", url);
  }

  function closeModal() {
    const url = location.pathname;
    setM(null);
    window.history.replaceState("", "", url);
  }

  function gotoPrev() {
    if (m && media.length > 1) {
      const ix =
        (media.findIndex((x) => x.id === m.id) - 1 + media.length) %
        media.length;
      openModal(media[ix]);
    }
  }

  function gotoNext() {
    if (m && media.length > 1) {
      const ix = (media.findIndex((x) => x.id === m.id) + 1) % media.length;
      openModal(media[ix]);
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
            removeMedia(id);
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
        "Are you sure you want to rotate this image " + degrees + " degrees?"
      )
    ) {
      getAccessTokenSilently().then((accessToken) => {
        putMediaJpegRotate(accessToken, m.id, degrees)
          .then(() => {
            closeModal();
            window.location.reload();
          })
          .catch((error) => {
            console.warn(error);
          });
      });
    }
  }

  function onMoveImageLeft() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, true, 0, 0)
        .then(() => {
          closeModal();
          window.location.reload();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageRight() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, 0, 0)
        .then(() => {
          closeModal();
          window.location.reload();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageToSector() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, m.enableMoveToIdSector, 0)
        .then(() => {
          closeModal();
          window.location.reload();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function onMoveImageToProblem() {
    getAccessTokenSilently().then((accessToken) => {
      moveMedia(accessToken, m.id, false, 0, m.enableMoveToIdProblem)
        .then(() => {
          closeModal();
          window.location.reload();
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  if (isLoading) {
    return <Loading />;
  }
  if (window.location.search && media) {
    let id = window.location.search.replace("?idMedia=", "");
    if (id.indexOf("&") > 0) {
      id = id.substr(0, id.indexOf("&"));
    }
    const x = media.filter((m) => m.id == id);
    if (x && x.length === 1 && (!m || m.id != x[0].id)) {
      setM(x[0]);
    }
  } else if (!window.location.search && media && m) {
    setM(null);
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
                  window.location.reload();
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
          isAdmin={isAdmin}
          onClose={closeModal}
          m={m}
          autoPlayVideo={autoPlayVideo}
          onEdit={() => setEditM(m)}
          onDelete={onDeleteImage}
          onRotate={onRotate}
          onMoveImageLeft={onMoveImageLeft}
          onMoveImageRight={onMoveImageRight}
          onMoveImageToProblem={onMoveImageToProblem}
          onMoveImageToSector={onMoveImageToSector}
          length={media.length}
          gotoPrev={gotoPrev}
          gotoNext={gotoNext}
          playVideo={playVideo}
          optProblemId={optProblemId}
          isBouldering={isBouldering}
        />
      )}
      <Card.Group itemsPerRow={5} doubling>
        {media.map((x, i) => {
          let content;
          if (x.svgs || x.mediaSvgs) {
            content = (
              <Svg
                close={null}
                thumb={true}
                m={x}
                key={i}
                style={style}
                optProblemId={optProblemId}
                showText={false}
                problemIdHovered={null}
                setPoblemIdHovered={null}
              />
            );
          } else {
            content = (
              <Image
                alt={x.description}
                key={i}
                style={style}
                src={getImageUrl(x.id, x.crc32, 205)}
                onError={(i) => (i.target.src = "/png/video_placeholder.png")}
                rounded
              />
            );
          }
          return (
            <Card
              as="a"
              onClick={() => openModal(x)}
              key={i}
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
