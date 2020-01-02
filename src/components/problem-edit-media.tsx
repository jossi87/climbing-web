import React, {Component} from 'react';
import ImageUpload from './common/image-upload/image-upload';
import { getProblem, postProblemMedia } from './../api';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Container, Button } from 'semantic-ui-react';
import history from '../utils/history';

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
    getProblem(this.props.accessToken, id).then((data) => this.setState({id: data.id, isAuthenticated: data.metadata.isAuthenticated}));
  }

  onNewMediaChanged = (newMedia) => {
    this.setState({newMedia});
  }

  save = (event) => {
    event.preventDefault();
    this.setState({isSaving: true});
    postProblemMedia(this.props.accessToken, this.state.id, this.state.newMedia)
    .then((response) => {
      history.push("/problem/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  onCancel = () => {
    window.history.back();
  }

  render() {
    if (!this.state || !this.state.id) {
      return <LoadingAndRestoreScroll />;
    } else if (!this.state.isAuthenticated) {
      history.push("/login");
    }

    return (
      <Container>
        <form onSubmit={this.save}>
          <ImageUpload accessToken={this.props.accessToken} onMediaChanged={this.onNewMediaChanged} />
          <Button.Group>
            <Button onClick={this.onCancel}>Cancel</Button>
            <Button.Or />
            <Button type="submit" positive loading={this.state.isSaving}>Save</Button>
          </Button.Group>
        </form>
      </Container>
    );
  }
}

export default ProblemEditMedia;
