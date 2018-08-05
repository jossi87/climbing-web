import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { Modal, Button, FormGroup, ControlLabel, FormControl, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import Calendar from 'react-input-calendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { convertFromDateToString, postTicks } from './../../../api';

class TickModal extends Component {
  constructor(props) {
    super(props);
  }

  refresh(props) {
    var date = null;
    if (props.date) {
      date = props.date;
    } else if (props.idTick==-1) {
      date = convertFromDateToString(new Date());
    }

    this.setState({
      idTick: props.idTick,
      idProblem: props.idProblem,
      date: date,
      comment: props.comment? props.comment : "",
      grade: props.grade,
      stars: props.stars? props.stars : 0,
      grades: props.grades
    });
  }

  componentDidMount() {
    this.refresh(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.refresh(nextProps);
  }

  onDateChanged(newDate) {
    this.setState({date: newDate});
  }

  onCommentChanged(e) {
    this.setState({comment: e.target.value});
  }

  onStarsChanged(stars, e) {
    this.setState({stars: stars});
  }

  onGradeChanged(grade, e) {
    this.setState({grade: grade});
  }

  delete(e) {
    const { cookies } = this.props;
    postTicks(cookies, true, this.state.idTick, this.state.idProblem, this.state.comment, this.state.date, this.state.stars, this.state.grade)
    .then((response) => {
      this.props.onHide();
    })
    .catch((error) => {
      console.warn(error);
      alert(error.toString());
    });
  }

  save(e) {
    const { cookies } = this.props;
    postTicks(cookies, false, this.state.idTick, this.state.idProblem, this.state.comment, this.state.date, this.state.stars, this.state.grade)
    .then((response) => {
      this.props.onHide();
    })
    .catch((error) => {
      console.warn(error);
      alert(error.toString());
    });
  }

  render() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    var stars = "No stars";
    if (this.state) {
      if (this.state.stars===1) {
        stars = <span><FontAwesomeIcon icon="star" /> Nice</span>
      } else if (this.state.stars===2) {
        stars = <span><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Very nice</span>
      } else if (this.state.stars===3) {
        stars = <span><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Fantastic!</span>
      }
    }

    return (
      <Modal show={this.props.show} onHide={this.props.onHide.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Tick</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <ControlLabel>Date (yyyy-mm-dd)</ControlLabel><br/>
            <Calendar format='YYYY-MM-DD' computableFormat='YYYY-MM-DD' date={this.state && this.state.date} onChange={this.onDateChanged.bind(this)} />
            <ButtonGroup>
              <Button onClick={this.onDateChanged.bind(this, convertFromDateToString(yesterday))}>Yesterday</Button>
              <Button onClick={this.onDateChanged.bind(this, convertFromDateToString(new Date()))}>Today</Button>
            </ButtonGroup>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Grade</ControlLabel><br/>
            <DropdownButton title={this.state? this.state.grade : "Loading"} id="bg-nested-dropdown">
              {this.state && this.state.grades && this.state.grades.map((g, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onGradeChanged.bind(this, g.grade)}>{g.grade}</MenuItem> })}
            </DropdownButton>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Stars</ControlLabel><br/>
            <DropdownButton title={stars} id="bg-nested-dropdown">
              <MenuItem eventKey="0" onSelect={this.onStarsChanged.bind(this, 0)}>No stars</MenuItem>
              <MenuItem eventKey="1" onSelect={this.onStarsChanged.bind(this, 1)}><FontAwesomeIcon icon="star" /> Nice</MenuItem>
              <MenuItem eventKey="2" onSelect={this.onStarsChanged.bind(this, 2)}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Very nice</MenuItem>
              <MenuItem eventKey="3" onSelect={this.onStarsChanged.bind(this, 3)}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Fantastic!</MenuItem>
            </DropdownButton>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Comment</ControlLabel>
            <FormControl componentClass="textarea" placeholder="textarea" style={{height: '100px'}} value={this.state && this.state.comment} onChange={this.onCommentChanged.bind(this)} placeholder='Comment' />
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <Button onClick={this.save.bind(this)} bsStyle="success">Save</Button>
            {this.state && this.state.idTick>1? <Button onClick={this.delete.bind(this)} bsStyle="warning">Delete tick</Button> : ""}
            <Button onClick={this.props.onHide.bind(this)}>Close</Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default withCookies(TickModal);
