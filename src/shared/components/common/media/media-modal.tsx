import React from 'react';
import { Dimmer, Button, Image } from 'semantic-ui-react';
import { getImageUrl } from '../../../api';

const style = {
  img: {
    maxHeight: '100vh',
    maxWidth: '100vw',
    objectFit: 'scale-down'
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
  }
}

interface Media {
  id: number,
  idType: number,
  svgProblemId: number
}
interface Props {
  isAdmin: boolean,
  onClose: any,
  onDelete: any,
  m: Media
}
const MediaModal: React.SFC<Props> = props => {
  return (
      <Dimmer active={true} onClickOutside={props.onClose} page>
        {props.isAdmin && props.m.idType==1 && !props.m.svgProblemId &&
          <Button inverted circular style={style.delete} icon="trash" onClick={props.onDelete} />
        }
        <Button inverted circular style={style.close} icon="close" onClick={props.onClose} />
        <Button inverted circular style={style.prev} icon="angle left" />
        <Button inverted circular style={style.next} icon="angle right" />
        <Image style={style.img} src={getImageUrl(props.m.id, 0)} />
      </Dimmer>
  )
}

export default MediaModal;
