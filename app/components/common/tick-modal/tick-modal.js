import React, {Component} from 'react';
import { Modal, Button, FormGroup, ControlLabel, FormControl, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import Request from 'superagent';
import config from '../../../utils/config.js';
import Calendar from 'react-input-calendar';

export default class TickModal extends Component {
  constructor(props) {
    super(props);
  }

  refresh(props) {
    var date = null;
    if (props.date) {
      date = props.date;
    } else if (props.idTick==-1) {
      date = config.convertFromDateToString(new Date());
    }

    this.setState({
      idTick: props.idTick,
      idProblem: props.idProblem,
      date: date,
      comment: props.comment? props.comment : "",
      grade: props.grade,
      stars: props.stars? props.stars : 0
    });
  }

  componentDidMount() {
    this.refresh(this.props);
    Request.get(config.getUrl("grades?regionId=" + config.getRegion())).end((err, res) => {
      this.setState({
        error: err? err : null,
        grades: err? null : res.body
      });
    });
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
    Request.post(config.getUrl("ticks?regionId=" + config.getRegion()))
    .withCredentials()
    .send({delete: true, id: this.state.idTick, idProblem: this.state.idProblem, comment: this.state.comment, date: this.state.date, stars: this.state.stars, grade: this.state.grade})
    .end((err, res) => {
      if (err) {
        console.log(err);
        alert(err);
      } else {
        this.props.onHide();
      }
    });
  }

  save(e) {
    Request.post(config.getUrl("ticks?regionId=" + config.getRegion()))
    .withCredentials()
    .send({delete: false, id: this.state.idTick, idProblem: this.state.idProblem, comment: this.state.comment, date: this.state.date, stars: this.state.stars, grade: this.state.grade})
    .end((err, res) => {
      if (err) {
        console.log(err);
        alert(err);
      } else {
        this.props.onHide();
      }
    });
  }

  render() {
    if (!this.state || !this.state.idProblem) {
      return <center><i className="fa fa-cog fa-spin fa-2x"></i></center>;
    }

    var stars = null;
    if (this.state.stars===0) { stars = <span><i className="fa fa-star-o"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/></span>; }
    else if (this.state.stars===1) { stars = <span><i className="fa fa-star"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/></span>; }
    else if (this.state.stars===2) { stars = <span><i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star-o"/></span>; }
    else if (this.state.stars===3) { stars = <span><i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star"/></span>; }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    return (
      <Modal show={this.props.show} onHide={this.props.onHide.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Tick</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <ControlLabel>Date (yyyy-mm-dd)</ControlLabel><br/>
            <Calendar format='YYYY-MM-DD' computableFormat='YYYY-MM-DD' date={this.state.date} onChange={this.onDateChanged.bind(this)} />
            <ButtonGroup>
              <Button onClick={this.onDateChanged.bind(this, config.convertFromDateToString(yesterday))}>Yesterday</Button>
              <Button onClick={this.onDateChanged.bind(this, config.convertFromDateToString(new Date()))}>Today</Button>
            </ButtonGroup>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Grade</ControlLabel><br/>
            <DropdownButton title={this.state.grade} id="bg-nested-dropdown">
              {this.state && this.state.grades && this.state.grades.map((g, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onGradeChanged.bind(this, g.grade)}>{g.grade}</MenuItem> })}
            </DropdownButton>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Stars</ControlLabel><br/>
            <DropdownButton title={stars} id="bg-nested-dropdown">
              <MenuItem eventKey="0" onSelect={this.onStarsChanged.bind(this, 0)}><i className="fa fa-star-o"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/></MenuItem>
              <MenuItem eventKey="1" onSelect={this.onStarsChanged.bind(this, 1)}><i className="fa fa-star"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/> Nice</MenuItem>
              <MenuItem eventKey="2" onSelect={this.onStarsChanged.bind(this, 2)}><i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star-o"/> Very nice</MenuItem>
              <MenuItem eventKey="3" onSelect={this.onStarsChanged.bind(this, 3)}><i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star"/> Fantastic!</MenuItem>
            </DropdownButton>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Comment</ControlLabel>
            <FormControl componentClass="textarea" placeholder="textarea" style={{height: '100px'}} value={this.state.comment} onChange={this.onCommentChanged.bind(this)} placeholder='Comment' />
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <Button onClick={this.save.bind(this)} bsStyle="success">Save</Button>
            {this.state.idTick>1? <Button onClick={this.delete.bind(this)} bsStyle="warning">Delete tick</Button> : ""}
            <Button onClick={this.props.onHide.bind(this)}>Close</Button>
          </ButtonGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}
