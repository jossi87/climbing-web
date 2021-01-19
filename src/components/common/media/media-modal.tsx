import React from 'react';
import { Dimmer, Button, Icon, Image, Modal, Header, ButtonGroup, Embed, Container } from 'semantic-ui-react';
import { getBuldreinfoMediaUrl, getImageUrl } from '../../../api';
import ReactPlayer from 'react-player';
import Svg from './svg';
import { useHistory } from 'react-router-dom';
import { saveAs } from 'file-saver';

const style = {
  img: {
    maxHeight: '100vh',
    maxWidth: '100vw',
    objectFit: 'scale-down'
  },
  video: {
    maxHeight: '100vh',
    maxWidth: '100vw'
  },
  actions: {
    zIndex: 2,
    position: 'fixed',
    top: '0px',
    right: '0px'
  },
  prev: {
    zIndex: 2,
    position: 'fixed',
    top: '50%',
    left: '2px',
    height: '40px',
    marginTop: '-20px' /* 1/2 the hight of the button */
  },
  next: {
    zIndex: 2,
    position: 'fixed',
    top: '50%',
    right: '2px',
    height: '40px',
    marginTop: '-20px' /* 1/2 the hight of the button */
  },
  play: {
    zIndex: 2,
    position: 'fixed',
    top: '50%',
    left: '50%',
    height: '60px',
    width: '60px',
    marginTop: '-30px', /* 1/2 the hight of the button */
    marginLeft: '-30px' /* 1/2 the width of the button */
  },
}

const MediaModal = ({ isAdmin, onClose, onDelete, m, length, gotoPrev, gotoNext, playVideo, useBlueNotRed, autoPlayVideo }) => {
  let history = useHistory();
  let myPlayer;
  let content;
  if (m.idType===1) {
    if (m.svgs) {
      content = <Image style={style.img}><Svg useBlueNotRed={useBlueNotRed} thumb={false} style={{}} m={m} close={onClose}/></Image>;
    }
    else {
      content = <Image style={style.img} alt={m.mediaMetadata.alt} src={getImageUrl(m.id, 720)} />
    }
  }
  else {
    if (m.embedUrl) {
      content = <Embed as={Container} style={{minWidth: '320px', minHeight: '200px'}} url={m.embedUrl} defaultActive={true}/>;
    }
    else if (autoPlayVideo) {
      content = <ReactPlayer
        style={style.video}
        ref={player => myPlayer = player }
        url={getBuldreinfoMediaUrl(m.id, true)}
        controls={true}
        playing={true}
        onDuration={duration => myPlayer.seekTo(m.t/duration)}
      />;
    }
    else {
      content = <>
        <Image style={style.img} alt={m.description} src={getImageUrl(m.id, 360)} />
        <Button size="massive" color="youtube" circular style={style.play} icon="play" onClick={playVideo} />
      </>
    }
  }

  return (
    <Dimmer active={true} onClickOutside={onClose} page>
      <ButtonGroup secondary size="small" style={style.actions}>
        {isAdmin && m.idType===1 && !m.svgs && (
          <Button icon onClick={onDelete}>
            <Icon name="trash"/>
          </Button>
        )}
        {isAdmin && m.idType===1 && m.svgProblemId && (
          <Button icon onClick={() => history.push(`/problem/svg-edit/${m.svgProblemId}-${m.id}`)}>
            <Icon name="paint brush"/>
          </Button>
        )}
        {!m.embedUrl && <Button icon="download" onClick={() => {
          let isMovie = m.idType!==1;
          let ext = isMovie? "mp4" : "jpg";
          saveAs(getBuldreinfoMediaUrl(m.id, isMovie), "buldreinfo_brattelinjer_" + m.id + "." + ext)}
        }/>}
        <Modal trigger={<Button icon="info" />}>
          <Modal.Content image>
            <Image wrapped size='medium' src={getImageUrl(m.id, 150)} />
            <Modal.Description>
              <Header>Info</Header>
              {m.mediaMetadata.dateCreated && <><b>Date uploaded:</b> {m.mediaMetadata.dateCreated}<br/></>}
              {m.mediaMetadata.dateTaken && <><b>Date taken:</b> {m.mediaMetadata.dateTaken}<br/></>}
              {m.mediaMetadata.capturer && <><b>{m.idType===1? "Photographer" : "Video created by"}:</b> {m.mediaMetadata.capturer}<br/></>}
              {m.mediaMetadata.tagged && <><b>In {m.idType===1? "photo" : "video"}:</b> {m.mediaMetadata.tagged}<br/></>}
              {m.height!=0 && m.width!=0 && <><b>Image dimensions:</b> {m.width}x{m.height}<br/></>}
              {m.mediaMetadata.description && <i>{m.mediaMetadata.description}</i>}
            </Modal.Description>
          </Modal.Content>
        </Modal>
        <Button icon="close" onClick={onClose} />
      </ButtonGroup>
      {length > 1 &&
        <>
          <Icon
            size="big"
            style={style.prev}
            name="angle left"
            link
            onClick={gotoPrev}
          />
          <Icon
            as={Icon}
            size="big"
            style={style.next}
            name="angle right"
            link
            onClick={gotoNext}
          />
        </>
      }
      {content}
    </Dimmer>
  )
}

export default MediaModal