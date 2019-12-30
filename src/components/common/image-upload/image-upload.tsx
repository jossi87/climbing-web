import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import { Button, Card, Image } from 'semantic-ui-react';
import classNames from 'classnames';
import UserSelector from '../user-selector/user-selector';

class ImageUpload extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {media: []};
  }

  onDrop = (files) => {
    const allMedia = this.state.media;
    files.forEach(f => {
      f.preview = URL.createObjectURL(f);
      allMedia.push({file: f})
    });
    this.setState({media: allMedia});
    this.props.onMediaChanged(allMedia);
  }

  onPhotographerChanged = (u, m) => {
    m.photographer = u.label;
    this.props.onMediaChanged(this.state.media);
  }

  onInPhotoChanged = (u, m) => {
    m.inPhoto = u.label;
    this.props.onMediaChanged(this.state.media);
  }

  onRemove = (toRemove) => {
    const allMedia = this.state.media.filter(m => m!=toRemove);
    this.setState({media: allMedia});
    this.props.onMediaChanged(allMedia);
  }

  render() {
    return (
      <>
        <Dropzone onDrop={this.onDrop} accept={'image/*'}>
          {({getRootProps, getInputProps, isDragActive}) => {
            return (
              <div
                {...getRootProps()}
                className={classNames('dropzone', {'dropzone--isActive': isDragActive})}
                style={{padding: '15px', borderWidth: '1px', borderColor: '#666', borderStyle: 'dashed', borderRadius: '5px', backgroundColor: 'white'}}
              >
                <input {...getInputProps()}/>
                {
                  isDragActive ?
                    <p>Drop files here...</p> :
                    <p>Drop images here, or click to select files to upload.</p>
                }
              </div>
            )
          }}
        </Dropzone><br/>
        {this.state.media.length > 0 &&
          <Card.Group itemsPerRow={4} stackable>
            {this.state.media.map((m, i) =>
              <Card key={i}>
                <Image src={m.file.preview} />
                <Card.Content>
                  <UserSelector isMulti={false} placeholder="In photo" accessToken={this.props.accessToken} onUsersUpdated={this.onInPhotoChanged} identity={m} />
                  <UserSelector isMulti={false} placeholder="Photographer" accessToken={this.props.accessToken} onUsersUpdated={this.onPhotographerChanged}  identity={m} />
                </Card.Content>
                <Card.Content extra>
                  <Button fluid basic negative onClick={() => this.onRemove(m)}>Remove</Button>
                </Card.Content>
              </Card>
            )}
          </Card.Group>
        }
      </>
    );
  }
}

export default ImageUpload;
