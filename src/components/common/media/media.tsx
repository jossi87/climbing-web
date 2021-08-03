import React, { useState, useEffect } from 'react';
import LazyLoad from 'react-lazyload';
import { useHistory } from 'react-router-dom';
import { getImageUrl, deleteMedia, moveMedia, putMediaJpegRotate } from '../../../api';
import { Card, Image } from 'semantic-ui-react';
import MediaModal from './media-modal';
import Svg from './svg';
import { useAuth0 } from '../../../utils/react-auth0-spa';
import { LoadingAndRestoreScroll } from '../widgets/widgets';

const style = {objectFit: 'cover', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%'};

const Media = ({ media, removeMedia, isAdmin, optProblemId, isBouldering }) => {
  let history = useHistory();
  const [m, setM] = useState(null)
  const [autoPlayVideo, setAutoPlayVideo] = useState(false)
  const { loading, accessToken } = useAuth0();
  useEffect(() => {
    function handleKeyPress({ keyCode }) {
      if (keyCode === 27) {
        closeModal();
      } else if (keyCode === 37) {
        gotoPrev();
      } else if (keyCode === 39) {
        gotoNext();
      }
    }
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    }
  });

  function openModal(m, autoPlayVideo) {
    onMediaIdOpen(m.id);
    setM(m);
    setAutoPlayVideo(autoPlayVideo);
  }

  function closeModal() {
    onMediaIdOpen(null);
    setM(null);
  }

  function onMediaIdOpen(idMedia) {
    history.replace(history.location.pathname + (idMedia ? "?idMedia=" + idMedia : ""));
  }

  function gotoPrev() {
    if (m && media.length > 1) {
      let ix = (media.findIndex(x => x.id===m.id) - 1 + media.length) % media.length;
      openModal(media[ix], false);
    }
  }

  function gotoNext() {
    if (m && media.length > 1) {
      let ix = (media.findIndex(x => x.id===m.id) + 1) % media.length;
      openModal(media[ix], false);
    }
  }

  function playVideo() {
    if (m) {
      openModal(m, true);
    }
  }

  function onDeleteImage() {
    if (confirm('Are you sure you want to delete this image?')) {
      const id = m.id;
      deleteMedia(accessToken, id)
      .then((response) => {
        removeMedia(id);
        closeModal();
      })
      .catch ((error) => {
        console.warn(error);
      });
    }
  }

  function onRotate(degrees) {
    if (confirm('Are you sure you want to rotate this image ' + degrees + ' degrees?')) {
      putMediaJpegRotate(accessToken, m.id, degrees)
      .then((response) => {
        closeModal();
        window.location.reload();
      })
      .catch ((error) => {
        console.warn(error);
      });
    }
  }

  function onMoveImageLeft() {
    moveMedia(accessToken, m.id, true, 0, 0)
    .then((response) => {
      closeModal();
      window.location.reload();
    })
    .catch ((error) => {
      console.warn(error);
    });
  }

  function onMoveImageRight() {
    moveMedia(accessToken, m.id, false, 0, 0)
    .then((response) => {
      closeModal();
      window.location.reload();
    })
    .catch ((error) => {
      console.warn(error);
    });
  }

  function onMoveImageToSector() {
    moveMedia(accessToken, m.id, false, m.enableMoveToIdSector, 0)
    .then((response) => {
      closeModal();
      window.location.reload();
    })
    .catch ((error) => {
      console.warn(error);
    });
  }

  function onMoveImageToProblem() {
    moveMedia(accessToken, m.id, false, 0, m.enableMoveToIdProblem)
    .then((response) => {
      closeModal();
      window.location.reload();
    })
    .catch ((error) => {
      console.warn(error);
    });
  }

  if (loading) {
    return <LoadingAndRestoreScroll />;
  }
  if (history.location.search && media) {
    let id = history.location.search.replace("?idMedia=","");
    if (id.indexOf("&") > 0) {
      id = id.substr(0, id.indexOf("&"));
    }
    let x = media.filter(m => m.id==id);
    if (x && x.length===1 && (!m || m.id!=x[0].id)) {
      setM(x[0]);
    }
  }
  else if (!history.location.search && media && m) {
    setM(null);
  }
  return (
    <>
      {m &&
        <MediaModal
          isAdmin={isAdmin}
          onClose={closeModal}
          m={m}
          autoPlayVideo={autoPlayVideo}
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
      }
      <Card.Group itemsPerRow={5} doubling>
        {media.map((x, i) => {
          let content;
          if (x.svgs || x.mediaSvgs) {
            content = <Svg close={null} thumb={true} m={x} key={i} style={style} optProblemId={optProblemId}/>;
          }
          else {
            content = <Image alt={x.description} key={i} style={style} src={getImageUrl(x.id, x.crc32, 205)} onError={i => i.target.src='/png/video_placeholder.png'} rounded />;
          }
          return (
            <Card as="a" onClick={() => openModal(x, true)} key={i} raised style={{backgroundColor: "rgb(245, 245, 245)", border: (x.inherited? "1px solid black" : "1px solid rgb(245, 245, 245)")}}>
              <div style={{paddingTop: '75%'}}>
                <LazyLoad offset={100}>{content}</LazyLoad>
              </div>
            </Card>
          );
        })}
      </Card.Group>
    </>
  )
}

export default Media;
