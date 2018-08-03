import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { Modal, Button, FormGroup, ControlLabel, FormControl, ButtonGroup } from 'react-bootstrap';
import { postComment } from './../../../api';

class CommentModal extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

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
      const { cookies } = this.props;
      const accessToken = cookies.get('access_token');
      postComment(accessToken, this.state.idProblem, this.state.comment)
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

export default withCookies(CommentModal);
