import React, {Component} from 'react';
import { getImageUrl, deleteMedia } from '../../../api';
import { Card, Image } from 'semantic-ui-react';
import MediaModal from './media-modal';

interface Props {
  removeMedia: any,
  auth: any,
  isAdmin: boolean,
  media: Array<any>
}

class Media extends Component<Props, any> {
  openModal = (m) => {
    this.setState({ m });
  }

  closeModal = () => {
    this.setState({m: null});
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
        {this.state && this.state.m && <MediaModal isAdmin={this.props.isAdmin} onClose={this.closeModal} m={this.state.m} onDelete={this.onDeleteImage} />}
        <Card.Group itemsPerRow={5} doubling>
          {this.props.media.map((m, i) => (
            <Card as="a" onClick={() => this.openModal(m)} key={i} raised>
              <Image key={i} style={{height: '180px', width: '100%', objectFit: 'cover'}} src={getImageUrl(m.id, 400)} />
            </Card>
          ))}
        </Card.Group>
      </>
    )
  }
}

export default Media;
