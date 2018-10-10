import React, {Component} from 'react';
import { postComment } from './../../../api';
import { Button, Modal, Form, TextArea } from 'semantic-ui-react';

class CommentModal extends Component<any, any> {
  refresh(props) {
    this.setState({
      idProblem: props.idProblem,
      comment: '',
      danger: false,
      resolved: false
    });
  }

  componentDidMount() {
    this.refresh(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.refresh(nextProps);
  }

  onCommentChanged(e, data) {
    this.setState({comment: data.value});
  }

  onFlagged(e) {
    const danger = e==1;
    const resolved = e==2;
    this.setState({danger, resolved});
  }

  save(e) {
    if (this.state.comment) {
      postComment(this.props.auth.getAccessToken(), -1, this.state.idProblem, this.state.comment, this.state.danger, this.state.resolved)
      .then((response) => {
        this.props.onClose();
      })
      .catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    }
  }

  render() {
    return (
      <Modal open={this.props.open} onClose={this.props.onClose.bind(this)}>
        <Modal.Header>Add comment</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form>
              <Form.Field>
                <label>Comment</label>
                <TextArea placeholder='Comment' style={{ minHeight: 100 }} value={this.state && this.state.comment} onChange={this.onCommentChanged.bind(this)} />
              </Form.Field>
              {!this.props.isBouldering &&
                <Button.Group size="mini" compact>
                  <Button onClick={this.onFlagged.bind(this, 0)} active={this.state && !this.state.danger && !this.state.resolved}>Default comment</Button>
                  <Button.Or />
                  <Button onClick={this.onFlagged.bind(this, 1)} negative={this.state && this.state.danger && !this.state.resolved} active={this.state && this.state.danger && !this.state.resolved}>Flag as dangerous</Button>
                  <Button.Or />
                  <Button onClick={this.onFlagged.bind(this, 2)} positive={this.state && !this.state.danger && this.state.resolved} active={this.state && !this.state.danger && this.state.resolved}>Flag as safe</Button>
                </Button.Group>
              }
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button.Group compact size="tiny">
            <Button color='black' onClick={this.props.onClose.bind(this)}>
              Cancel
            </Button>
            <Button
              positive
              icon='checkmark'
              labelPosition='right'
              content="Save"
              onClick={this.save.bind(this)}
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default CommentModal;
