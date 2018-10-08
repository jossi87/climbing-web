import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import { getUserSearch } from './../../../api';
import { Button, Card, Image, Search } from 'semantic-ui-react';

class Text extends Component<any, any> {
  componentWillMount() {
    this.resetComponent()
  }

  componentWillReceiveProps(nextProps) {
    this.resetComponent()
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result.title });
    this.props.onValueChanged(this.props.m, result.title);
  }

  handleSearchChange = (e, { value }) => {
    if (value.length < 1) return this.resetComponent()
    this.setState({ isLoading: true, value })
    this.props.onValueChanged(this.props.m, value);
    getUserSearch(this.props.accessToken, value)
    .then((res) => {
      this.setState({
        isLoading: false,
        results: res.map(u => ({title: u.name}))
      });
    });
  }

  render() {
    const { isLoading, value, results } = this.state;
    return (
      <Search
        loading={isLoading}
        onResultSelect={this.handleResultSelect}
        onSearchChange={this.handleSearchChange}
        results={results}
        value={value}
        {...this.props}
      />
    )
  }
}

class ImageUpload extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {media: []};
  }

  onDrop(files) {
    const allMedia = this.state.media;
    files.forEach(f => allMedia.push({file: f}));
    this.setState({media: allMedia});
    this.props.onMediaChanged(allMedia);
  }

  onPhotographerChanged(m, name) {
    m.photographer=name;
    this.props.onMediaChanged(this.state.media);
  }

  onInPhotoChanged(m, name) {
    m.inPhoto=name;
    this.props.onMediaChanged(this.state.media);
  }

  onRemove(toRemove) {
    const allMedia = this.state.media.filter(m => m!=toRemove);
    this.setState({media: allMedia});
    this.props.onMediaChanged(allMedia);
  }

  render() {
    const accessToken = this.props.auth.getAccessToken();
    return (
      <>
        <Dropzone
          onDrop={this.onDrop.bind(this)}
          style={{width: '220px', height: '75px', padding: '15px', borderWidth: '1px', borderColor: '#666', borderStyle: 'dashed', borderRadius: '5px'}}
          accept={'image/*'}>
          <i>Drop JPG-image(s) here or click to select files to upload.</i>
        </Dropzone><br/>
        {this.state.media.length > 0 &&
          <Card.Group itemsPerRow={4} stackable>
            {this.state.media.map((m, i) =>
              <Card>
                <Image src={m.file.preview} />
                <Card.Content>
                  <Text accessToken={accessToken} m={m} placeholder='In photo' value={m? m.inPhoto : ''}  onValueChanged={this.onInPhotoChanged.bind(this)} />
                  <Text accessToken={accessToken} m={m} placeholder='Photographer' value={m? m.photographer : ''} onValueChanged={this.onPhotographerChanged.bind(this)} />
                </Card.Content>
                <Card.Content extra>
                  <Button fluid basic negative onClick={this.onRemove.bind(this, m)}>Remove</Button>
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
