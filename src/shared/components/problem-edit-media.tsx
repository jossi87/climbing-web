import React, {Component} from 'react';
import { Redirect } from 'react-router'
import ImageUpload from './common/image-upload/image-upload';
import { Loader } from 'semantic-ui-react';
import { getProblem, postProblemMedia } from './../api';
import { Container, Button } from 'semantic-ui-react';

class ProblemEditMedia extends Component<any, any> {
  componentDidMount() {
    this.refresh(this.props.match.params.problemId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.problemId !== this.props.match.params.problemId) {
      this.refresh(this.props.match.params.problemId);
    }
  }

  refresh(id) {
    getProblem(this.props.auth.getAccessToken(), id).then((data) => this.setState({id: data.id, isAuthenticated: data.metadata.isAuthenticated}));
  }

  onNewMediaChanged(newMedia) {
    this.setState({newMedia});
  }

  save(event) {
    event.preventDefault();
    this.setState({isSaving: true});
    postProblemMedia(this.props.auth.getAccessToken(), this.state.id, this.state.newMedia)
    .then((response) => {
      this.setState({pushUrl: "/problem/" + response.id});
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  onCancel() {
    window.history.back();
  }

  render() {
    if (!this.state || !this.state.id) {
      return <Loader active inline='centered' />;
    } else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    } else if (!this.state.isAuthenticated) {
      this.setState({pushUrl: "/login"});
    }

    return (
      <Container>
        <form onSubmit={this.save.bind(this)}>
          <ImageUpload auth={this.props.auth} onMediaChanged={this.onNewMediaChanged.bind(this)} />
          <Button.Group>
            <Button onClick={this.onCancel.bind(this)}>Cancel</Button>
            <Button.Or />
            <Button type="submit" positive loading={this.state.isSaving}>Save</Button>
          </Button.Group>
        </form>
      </Container>
    );
  }
}

export default ProblemEditMedia;
