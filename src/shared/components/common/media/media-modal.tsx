import React from 'react';
import { Dimmer, Button, Icon, Image } from 'semantic-ui-react';
import { RouteComponentProps, withRouter } from 'react-router';
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
  buttonEdit: {
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

interface Props extends RouteComponentProps<any> {
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
  var topLeftButton;
  if (props.isAdmin && props.m.idType===1) {
    if (props.m.svgProblemId>0) {
      topLeftButton = <Icon style={style.buttonEdit} size="large" color="red" name="edit" link onClick={() => props.history.push(`/problem/svg-edit/${props.m.svgProblemId}-${props.m.id}`)} />
    } else if (!props.m.svgs) {
      topLeftButton = <Icon style={style.buttonEdit} size="large" color="red" name="trash" link onClick={props.onDelete} />
    }
  }
  return (
    <Dimmer active={true} onClickOutside={props.onClose} page>
      {topLeftButton}
      <Icon style={style.close} size="big" name="close" link onClick={props.onClose} />
      {props.length > 1 &&
        <>
          <Icon style={style.prev} size="big" name="angle left" link onClick={props.gotoPrev} />
          <Icon style={style.next} size="big" name="angle right" link onClick={props.gotoNext} />
        </>
      }
      {props.m.idType===1?
        (props.m.svgs? <Image style={style.img}><Svg thumb={false} style={{}} m={props.m} close={props.onClose}/></Image> : <Image style={style.img} alt={props.m.description} src={getImageUrl(props.m.id, 720)} />)
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
            <Image as="a" style={style.img} alt={props.m.description} src={getImageUrl(props.m.id)} />
          </>
        )
      }
    </Dimmer>
  )
}

export default withRouter(MediaModal);
