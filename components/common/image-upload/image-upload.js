import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import Request from 'superagent';
import { Grid, Row, Col, Thumbnail, MenuItem, Button, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';
import config from '../../../utils/config.js';

class Text extends Component {
  constructor(props) {
    super(props);
    this.state = {searchResults: [], value: ''};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({value: nextProps.value});
  }

  inputChange(e) {
    const value = e.target.value;
    this.props.onValueChanged(this.props.m, value);
    if (value.length>0) {
      Request.get(config.getUrl("users/search?value=" + value)).withCredentials().end((err, res) => {
        if (err) {
          console.log(err);
        }
        const sr = res.body.filter(u => u.name.toUpperCase() !== value.toUpperCase());
        this.setState({searchResults: sr});
      });
    }
    else {
      this.setState({searchResults: []});
    }
  }

  menuItemSelect(user, event) {
    this.setState({searchResults: []});
    this.props.onValueChanged(this.props.m, user.name);
  }

  render() {
    var searchResults = null;
    if (this.state.searchResults.length>0) {
      const rows = this.state.searchResults.map((u, i) => <MenuItem key={i} href="#" onSelect={this.menuItemSelect.bind(this, u)}>{u.name}</MenuItem>);
      searchResults=(
        <div>
          <ul className="dropdown-menu open" style={{position: 'absolute', display: 'inline'}}>
            {rows}
          </ul>
        </div>
      );
    }

    return (
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{width: '100%'}}>
          <FormControl style={{display: 'inline-block'}} type="text" placeholder={this.props.placeholder} value={this.state.value} onChange={this.inputChange.bind(this)} />
        </div>
        {searchResults}
      </div>
    )
  }
}

export default class ImageUpload extends Component {
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
    return (
      <FormGroup>
        <ControlLabel>Upload image(s)</ControlLabel><br/>
        <Dropzone
          onDrop={this.onDrop.bind(this)}
          style={{width: '220px', height: '75px', padding: '15px', borderWidth: '1px', borderColor: '#666', borderStyle: 'dashed', borderRadius: '5px'}}
          accept={'image/*'}>
          <i>Drop JPG-image(s) here or click to select files to upload.</i>
        </Dropzone>
        {this.state.media.length > 0 ?
          <Grid>
            <Row>
              {this.state.media.map((m, i) =>
                <Col key={i} xs={8} sm={6} md={4} lg={2}>
                  <Thumbnail src={m.file.preview}>
                    <Text m={m} placeholder='In photo' value={m? m.inPhoto : ''}  onValueChanged={this.onInPhotoChanged.bind(this)} />
                    <Text m={m} placeholder='Photographer' value={m? m.photographer : ''} onValueChanged={this.onPhotographerChanged.bind(this)} />
                    <Button style={{width: '100%'}} bsStyle='danger' onClick={this.onRemove.bind(this, m)}>Remove</Button>
                  </Thumbnail>
                </Col>
              )}
            </Row>
          </Grid>
          : null}
      </FormGroup>
    );
  }
}
