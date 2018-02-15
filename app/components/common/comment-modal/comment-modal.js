import React, {Component} from 'react';
import { Modal, Button, FormGroup, ControlLabel, FormControl, ButtonGroup } from 'react-bootstrap';
import Request from 'superagent';
import config from '../../../utils/config.js';

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
      Request.post(config.getUrl("comments"))
      .withCredentials()
      .send({idProblem: this.state.idProblem, comment: this.state.comment})
      .end((err, res) => {
        if (err) {
          console.log(err);
          alert(err);
        } else {
          this.props.onHide();
        }
      });
    }
  }

  render() {
    if (!this.state) {
      return <center><div className="fa-3x"><i className="fas fa-spinner fa-spin"></i></div></center>;
    }

    return (
      <Modal show={this.props.show} onHide={this.props.onHide.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Add comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup controlId="formControlsTextArea">
            <ControlLabel>Comment</ControlLabel>
            <FormControl style={{height: '100px'}} componentClass="textarea" placeholder="Comment" value={this.state.comment} onChange={this.onCommentChanged.bind(this)} />
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
