import React from 'react';
import { Dimmer, Button, Image } from 'semantic-ui-react';
import { getImageUrl } from '../../../api';
import ReactPlayer from 'react-player';
import Svg from './svg';

const style = {
  img: {
    maxHeight: '100vh',
    maxWidth: '100vw',
    objectFit: 'scale-down'
  },
  video: {
    maxHeight: '720px',
    maxWidth: '1280px'
  },
  delete: {
    zIndex: 2,
    position: 'fixed',
    top: '2px',
    left: '2px'
  },
  close: {
    zIndex: 2,
    position: 'fixed',
    top: '2px',
    right: '2px'
  },
  prev: {
    zIndex: 2,
    position: 'fixed',
    top: '50%',
    left: '2px',
    height: '36px',
    marginTop: '-18px' /* 1/2 the hight of the button */
  },
  next: {
    zIndex: 2,
    position: 'fixed',
    top: '50%',
    right: '2px',
    height: '36px',
    marginTop: '-18px' /* 1/2 the hight of the button */
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

interface Props {
  isAdmin: boolean,
  onClose: any,
  onDelete: any,
  m: Media,
  length: number,
  gotoPrev: any,
  gotoNext: any,
  playVideo: any
}
const MediaModal: React.SFC<Props> = props => {
  let myPlayer;
  return (
    <Dimmer active={true} onClickOutside={props.onClose} page>
      {props.isAdmin && props.m.idType===1 && !props.m.svgProblemId &&
        <Button inverted circular style={style.delete} icon="trash" onClick={props.onDelete} />
      }
      <Button inverted circular style={style.close} icon="close" onClick={props.onClose} />
      {props.length > 1 &&
        <>
          <Button inverted circular style={style.prev} icon="angle left" onClick={props.gotoPrev} />
          <Button inverted circular style={style.next} icon="angle right" onClick={props.gotoNext} />
        </>
      }
      {props.m.idType===1?
        (props.m.svgs? <Image style={style.img}><Svg style={{}} m={props.m} close={props.onClose}/></Image> : <Image style={style.img} src={getImageUrl(props.m.id, 720)} />)
      :
        (props.m.autoPlayVideo?
          <ReactPlayer
            style={style.video}
            ref={player => myPlayer = player }
            className='react-player'
            width='100%'
            height='100%'
            url={'https://buldreinfo.com/buldreinfo_media/mp4/' + (Math.floor(props.m.id/100)*100) + "/" + props.m.id + '.mp4'}
            controls={true}
            playing={true}
            onDuration={duration => myPlayer.seekTo(props.m.t/duration)}
          />
        :
          <>
            <Button size="massive" color="youtube" circular style={style.play} icon="play" onClick={props.playVideo} />
            <Image as="a" style={style.img} src={getImageUrl(props.m.id, 480)} />
          </>
        )
      }
    </Dimmer>
  )
}

export default MediaModal;
