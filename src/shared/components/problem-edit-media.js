import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router'
import { FormGroup, ControlLabel, ButtonGroup, Button, Well } from 'react-bootstrap';
import ImageUpload from './common/image-upload/image-upload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { postProblemMedia } from './../api';

class ProblemEditMedia extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.problemId);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.match.params.problemId !== this.props.match.params.problemId) {
      this.refresh(this.props.match.params.problemId);
    }
  }

  refresh(id) {
    const { cookies } = this.props;
    const accessToken = cookies.get('access_token');
    this.props.fetchInitialData(accessToken, id).then((data) => this.setState(() => ({data})));
  }

  onNewMediaChanged(newMedia) {
    this.setState({newMedia: newMedia});
  }

  save(event) {
    event.preventDefault();
    this.setState({isSaving: true});
    const newMedia = this.state.newMedia.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
    postProblemMedia(id, newMedia)
    .then((response) => {
      this.setState({pushUrl: "/problem/" + response.id});
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  onCancel() {
    window.history.back();
  }

  render() {
    if (!this.state || !this.state.id) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    } else if (this.state.error) {
      return <h3>{this.state.error.toString()}</h3>;
    } else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    } else if (!this.state.metadata.isAuthenticated) {
      this.setState({pushUrl: "/login", error: null});
    }

    return (
      <span>
        <Well>
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsMedia">
              <ImageUpload onMediaChanged={this.onNewMediaChanged.bind(this)} />
            </FormGroup>
            <ButtonGroup><Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button><Button type="submit" bsStyle="success" disabled={this.state.isSaving}>{this.state.isSaving? 'Saving...' : 'Save'}</Button></ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }
}

export default withCookies(ProblemEditMedia);
