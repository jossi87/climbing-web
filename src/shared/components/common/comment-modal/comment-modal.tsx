import React, {Component} from 'react';
import { Modal, Button, FormGroup, ControlLabel, FormControl, ButtonGroup, ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { postComment } from './../../../api';

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

  onCommentChanged(e) {
    this.setState({comment: e.target.value});
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
        this.props.onHide();
      })
      .catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    }
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Add comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup controlId="formControlsTextArea">
            <ControlLabel>Comment</ControlLabel>
            <FormControl style={{height: '100px'}} componentClass="textarea" placeholder="Comment" value={this.state && this.state.comment} onChange={this.onCommentChanged.bind(this)} />
          </FormGroup>
          {!this.props.isBouldering &&
            <ButtonToolbar>
              <ToggleButtonGroup type="radio" name="flag" onChange={this.onFlagged.bind(this)} defaultValue={0}>
                <ToggleButton value={0}>Default comment</ToggleButton>
                <ToggleButton bsStyle={this.state && this.state.danger? "danger" : "default"} value={1}>Flag as dangerous</ToggleButton>
                <ToggleButton bsStyle={this.state && this.state.resolved? "success" : "default"} value={2}>Flag as safe</ToggleButton>
              </ToggleButtonGroup>
            </ButtonToolbar>
          }
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <Button onClick={this.save.bind(this)} bsStyle="success">Save</Button>
            <Button onClick={this.props.onHide.bind(this)}>Close</Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CommentModal;
