import React, {Component} from 'react';
import { getImageUrl, deleteMedia } from '../../../api';
import { Card, Image } from 'semantic-ui-react';
import MediaModal from './media-modal';
import Svg from './svg';

interface Props {
  removeMedia: any,
  auth: any,
  isAdmin: boolean,
  media: Array<any>
}
const style = {objectFit: 'cover', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%'};

class Media extends Component<Props, any> {
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  handleKeyPress = (e) => {
    if (this.state && this.state.m) {
      if (e.keyCode === 27) {
        this.closeModal();
      } else if (e.keyCode === 37) {
        this.gotoPrev();
      } else if (e.keyCode === 39) {
        this.gotoNext();
      }
    }
  }

  openModal = (m, autoPlayVideo) => {
    m.autoPlayVideo = autoPlayVideo;
    this.setState({ m });
  }

  closeModal = () => {
    this.setState({m: null});
  }

  gotoPrev = () => {
    if (this.state && this.state.m && this.props.media.length > 1) {
      var ix = this.props.media.indexOf(this.state.m)-1;
      if (ix < 0) ix = this.props.media.length-1;
      this.openModal(this.props.media[ix], false);
    }
  }

  gotoNext = () => {
    if (this.state && this.state.m && this.props.media.length > 1) {
      var ix = this.props.media.indexOf(this.state.m)+1;
      if (ix > this.props.media.length-1) ix = 0;
      this.openModal(this.props.media[ix], false);
    }
  }

  playVideo = () => {
    if (this.state && this.state.m) {
      this.openModal(this.state.m, true);
    }
  }

  onDeleteImage = () => {
    if (confirm('Are you sure you want to delete this image?')) {
      const id = this.state.m.id;
      deleteMedia(this.props.auth.getAccessToken(), id)
      .then((response) => {
        this.props.removeMedia(id);
        this.closeModal();
      })
      .catch ((error) => {
        console.warn(error);
      });
    }
  }

  render() {
    return (
      <>
        {this.state && this.state.m &&
          <MediaModal
            isAdmin={this.props.isAdmin}
            onClose={this.closeModal}
            m={this.state.m}
            onDelete={this.onDeleteImage}
            length={this.props.media.length}
            gotoPrev={this.gotoPrev}
            gotoNext={this.gotoNext}
            playVideo={this.playVideo}
          />
        }
        <Card.Group itemsPerRow={5} doubling>
          {this.props.media.map((m, i) => (
            <Card as="a" onClick={() => this.openModal(m, true)} key={i} raised>
              <div style={{paddingTop: '75%'}}>
                {m.svgs? <Svg m={m} key={i} style={style}/> : <Image key={i} style={style} src={getImageUrl(m.id, 205)} />}
              </div>
            </Card>
          ))}
        </Card.Group>
      </>
    )
  }
}

export default Media;
