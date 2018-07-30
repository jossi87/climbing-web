 import React, {Component} from 'react';
import { Modal, Button, FormGroup, ControlLabel, FormControl, ButtonGroup } from 'react-bootstrap';
import { postComment } from './../../../api';

export default class CommentModal extends Component {
  constructor(props) {
    super(props);
  }

  refresh(props) {
    this.setState({
      idProblem: props.idProblem,
      comment: ''
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

  save(e) {
    if (this.state.comment) {
      postComment(this.state.idProblem, this.state.comment)
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
