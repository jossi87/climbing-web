import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getImageUrl, deleteMedia } from '../../../api';
import { Card, Image } from 'semantic-ui-react';
import MediaModal from './media-modal';
import Svg from './svg';
import { useAuth0 } from '../../../utils/react-auth0-spa';
import { LoadingAndRestoreScroll } from '../widgets/widgets';

const style = {objectFit: 'cover', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%'};

const Media = ({ media, removeMedia, useBlueNotRed, isAdmin }) => {
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
    history.push(history.location.pathname + (idMedia ? "?idMedia=" + idMedia : ""));
  }

  function gotoPrev() {
    if (m && media.length > 1) {
      let ix = (media.indexOf(m) - 1 + media.length) % media.length;
      openModal(media[ix], false);
    }
  }

  function gotoNext() {
    if (m && media.length > 1) {
      let ix = (media.indexOf(m) + 1) % media.length;
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

  if (loading) {
    return <LoadingAndRestoreScroll />;
  }
  if (history.location.search && media && m == null) {
    let id = history.location.search.replace("?idMedia=","");
    if (id.indexOf("&") > 0) {
      id = id.substr(id, id.indexOf("&"));
    }
    let x = media.filter(m => m.id==id);
    if (x && x.length > 0) {
      setM(x[0]);
    }
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
          length={media.length}
          gotoPrev={gotoPrev}
          gotoNext={gotoNext}
          playVideo={playVideo}
          useBlueNotRed={useBlueNotRed}
        />
      }
      <Card.Group itemsPerRow={5} doubling>
        {media.map((x, i) => (
          <Card as="a" onClick={() => openModal(x, true)} key={i} raised>
            <div style={{paddingTop: '75%'}}>
              {x.svgs? <Svg close={null} useBlueNotRed={useBlueNotRed} thumb={true} m={x} key={i} style={style}/> : <Image alt={x.description} key={i} style={style} src={getImageUrl(x.id, 205)} />}
            </div>
          </Card>
        ))}
      </Card.Group>
    </>
  )
}

export default Media;
