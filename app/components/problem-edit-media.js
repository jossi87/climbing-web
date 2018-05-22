import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router'
import Request from 'superagent';
import { FormGroup, ControlLabel, FormControl, ButtonGroup, Button, DropdownButton, MenuItem, Well } from 'react-bootstrap';
import ImageUpload from './common/image-upload/image-upload';
import config from '../utils/config.js';
import auth from '../utils/auth.js';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/fontawesome-free-solid';

export default class ProblemEditMedia extends Component {
  componentDidMount() {
    document.title=config.getTitle() + " | Problem edit (media)";
    Request.get(config.getUrl("problems?regionId=" + config.getRegion() + "&id=" + this.props.match.params.problemId)).withCredentials().end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({
          id: res.body[0].id,
          newMedia: []
        });
      }
    });
  }

  onNewMediaChanged(newMedia) {
    this.setState({newMedia: newMedia});
  }

  save(event) {
    event.preventDefault();
    this.setState({isSaving: true});
    const newMedia = this.state.newMedia.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
    var req = Request.post(config.getUrl("problems/media"))
    .withCredentials()
    .field('json', JSON.stringify({id: this.state.id, newMedia: newMedia}))
    .set('Accept', 'application/json');
    this.state.newMedia.forEach(m => req.attach(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
    req.end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({pushUrl: "/problem/" + res.body.id});
      }
    });
  }

  onCancel() {
    window.history.back();
  }

  render() {
    if (!this.state || !this.state.id) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    else if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }

    return (
      <Well>
        <form onSubmit={this.save.bind(this)}>
          <FormGroup controlId="formControlsMedia">
            <ImageUpload onMediaChanged={this.onNewMediaChanged.bind(this)} />
          </FormGroup>
          <ButtonGroup><Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button><Button type="submit" bsStyle="success" disabled={this.state.isSaving}>{this.state.isSaving? 'Saving...' : 'Save'}</Button></ButtonGroup>
        </form>
      </Well>
    );
  }
}
