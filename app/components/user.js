import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Request from 'superagent';
import { LinkContainer } from 'react-router-bootstrap';
import { Tabs, Tab, ButtonToolbar, ButtonGroup, Button, OverlayTrigger, Tooltip, Popover, DropdownButton, MenuItem, Well, Breadcrumb } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Chart from './common/chart/chart';
import TickModal from './common/tick-modal/tick-modal';
import auth from '../utils/auth.js';
import config from '../utils/config.js';

export default class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTickModal: false
    };
  }

  refresh(userId) {
    Request.get(config.getUrl("users?regionId=" + config.getRegion() + (userId? "&id=" + userId : ""))).withCredentials().end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({user: res.body});
        document.title=config.getTitle() + " | " + res.body.name;
      }
    });
  }

  componentDidMount() {
    this.refresh(this.props.match.params.userId);
  }

  componentWillReceiveProps(nextProps) {
    this.refresh(nextProps.match.params.userId);
  }

  closeTickModal(event) {
    this.setState({ showTickModal: false });
    this.refresh(this.props.match.params.userId);
  }

  openTickModal(t, event) {
    this.setState({ currTick: t, showTickModal: true });
  }

  formatName(cell, row) {
    return <span><Link to={`/problem/${row.idProblem}`}>{row.name}</Link> {row.visibility===1 && <i className="fas fa-lock"></i>}{row.visibility===2 && <i className="fab fa-expeditedssl"></i>}</span>;
  }

  formatComment(cell, row) {
    if (row.comment) {
      if (row.comment.length>40) {
        const tooltip = (<Tooltip id={row.idProblem}>{row.comment}</Tooltip>);
        return <OverlayTrigger key={row.idProblem} placement="top" overlay={tooltip}><span>{row.comment.substring(0,40) + "..."}</span></OverlayTrigger>;
      } else {
        return row.comment;
      }
    }
    return "";
  }

  formatStars(cell, row) {
    var stars = "";
    if (row.stars===0.0) { stars = <div style={{whiteSpace: 'nowrap'}} id={0}><i className="far fa-star"/><i className="far fa-star"/><i className="far fa-star"/></div>; }
    else if (row.stars===0.5) { stars = <div style={{whiteSpace: 'nowrap'}} id={1}><i className="fas fa-star-half-o"/><i className="far fa-star"/><i className="far fa-star"/></div>; }
    else if (row.stars===1.0) { stars = <div style={{whiteSpace: 'nowrap'}} id={2}><i className="fas fa-star"/><i className="far fa-star"/><i className="far fa-star"/></div>; }
    else if (row.stars===1.5) { stars = <div style={{whiteSpace: 'nowrap'}} id={3}><i className="fas fa-star"/><i className="fas fa-star-half-o"/><i className="far fa-star"/></div>; }
    else if (row.stars===2.0) { stars = <div style={{whiteSpace: 'nowrap'}} id={4}><i className="fas fa-star"/><i className="fas fa-star"/><i className="far fa-star"/></div>; }
    else if (row.stars===2.5) { stars = <div style={{whiteSpace: 'nowrap'}} id={5}><i className="fas fa-star"/><i className="fas fa-star"/><i className="fas fa-star-half-o"/></div>; }
    else if (row.stars===3.0) { stars = <div style={{whiteSpace: 'nowrap'}} id={6}><i className="fas fa-star"/><i className="fas fa-star"/><i className="fas fa-star"/></div>; }
    else return cell;
    return <OverlayTrigger placement="top" overlay={
          <Popover id={0} title="Guidelines">
            <i className="far fa-star"/><i className="far fa-star"/><i className="far fa-star"/><br/>
            <i className="fas fa-star"/><i className="far fa-star"/><i className="far fa-star"/> Nice<br/>
            <i className="fas fa-star"/><i className="fas fa-star"/><i className="far fa-star"/> Very nice<br/>
            <i className="fas fa-star"/><i className="fas fa-star"/><i className="fas fa-star"/> Fantastic!
          </Popover>
        }>{stars}</OverlayTrigger>;
  }

  formatFa(cell, row) {
    if (cell) {
      return <i className="fas fa-check"/>;
    }
    return "";
  }

  formatEdit(cell, row) {
    if (this.state.user.readOnly==false && row.id!=0) {
      return <OverlayTrigger placement="top" overlay={<Tooltip id={row.id}>Edit tick</Tooltip>}><Button bsSize="xsmall" bsStyle="primary" onClick={this.openTickModal.bind(this, row)}><i className="fa-inverse fas fa-edit"/></Button></OverlayTrigger>
    }
    return "";
  }

  sortDate(a, b, order) {
    const x = a.date? (parseInt(a.date.substring(0,2))<50? "20" : "19") + a.date : "";
    const y = b.date? (parseInt(b.date.substring(0,2))<50? "20" : "19") + b.date : "";
    if (order==='asc') return x.localeCompare(y);
    return y.localeCompare(x);
  }

  sortGrade(a, b, order) {
    const x = a.gradeNumber? a.gradeNumber : 0;
    const y = b.gradeNumber? b.gradeNumber : 0;
    if (order==='asc') {
      if (x<y) {
        return -1
      } else if (x>y) {
        return 1;
      }
      return 0;
    }
    if (y<x) {
      return -1
    } else if (y>x) {
      return 1;
    }
    return 0;
  }

  sortComment(a, b, order) {
    const x = a.comment? a.comment : "";
    const y = b.comment? b.comment : "";
    if (order==='asc') return x.localeCompare(y);
    return y.localeCompare(x);
  }

  render() {
    if (!this.state.user) {
      return <center><div className="fa-3x"><i className="fas fa-spinner fa-spin"></i></div></center>;
    }
    if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }

    var numTicks = this.state.user.ticks.filter(t => !t.fa).length;
    var numFas = this.state.user.ticks.filter(t => t.fa).length;

    const chart = this.state.user.ticks.length>0? <Chart data={this.state.user.ticks}/> : null;

    return (
      <span>
        {this.state.currTick? <TickModal idTick={this.state.currTick.id} idProblem={this.state.currTick.idProblem} date={this.state.currTick.date} comment={this.state.currTick.comment} grade={this.state.currTick.grade} stars={this.state.currTick.stars} show={this.state.showTickModal} onHide={this.closeTickModal.bind(this)}/> : ""}
        <Breadcrumb>
          {auth.loggedIn() && this.state.user.readOnly==false?
            <div style={{float: 'right'}}>
              <OverlayTrigger placement="top" overlay={<Tooltip id={this.state.user.id}>Edit user</Tooltip>}>
                <LinkContainer to={`/user/${this.state.user.id}/edit`}><Button bsStyle="primary" bsSize="xsmall"><i className="fa-inverse fas fa-edit"/></Button></LinkContainer>
              </OverlayTrigger>
            </div>:
            null
          }
          <Link to={`/`}>Home</Link> / <font color='#777'>{this.state.user.name}</font>
        </Breadcrumb>
        <Well bsSize="small">First ascents: {numFas}<br/>Public ascents: {numTicks}<br/>Pictures taken: {this.state.user.numImagesCreated}<br/>Appearance in pictures: {this.state.user.numImageTags}<br/>Videos created: {this.state.user.numVideosCreated}<br/>Appearance in videos: {this.state.user.numVideoTags}</Well>
        {chart}
        <BootstrapTable
          containerStyle={{margin: '-5px -10px'}}
        	data={this.state.user.ticks}
          condensed={true}
        	hover={true}
        	columnFilter={false}>
          <TableHeaderColumn dataField="idProblem" isKey={true} hidden={true}>idProblem</TableHeaderColumn>
          <TableHeaderColumn dataField="dateHr" dataSort={true} sortFunc={this.sortDate.bind(this)} dataAlign="center" width="70">Date</TableHeaderColumn>
          <TableHeaderColumn dataField="name" dataSort={true} dataFormat={this.formatName.bind(this)} width="300">Name</TableHeaderColumn>
          <TableHeaderColumn dataField="grade" dataSort={true} sortFunc={this.sortGrade.bind(this)} dataAlign="center" width="70">Grade</TableHeaderColumn>
          <TableHeaderColumn dataField="comment" dataSort={true} sortFunc={this.sortComment.bind(this)} dataFormat={this.formatComment.bind(this)} width="300">Comment</TableHeaderColumn>
          <TableHeaderColumn dataField="stars" dataSort={true} dataFormat={this.formatStars.bind(this)} dataAlign="center" width="70">Stars</TableHeaderColumn>
          <TableHeaderColumn dataField="fa" dataSort={true} dataFormat={this.formatFa.bind(this)} dataAlign="center" width="50">FA</TableHeaderColumn>
          <TableHeaderColumn dataField="edit" dataFormat={this.formatEdit.bind(this)} dataAlign="center" width="30"> </TableHeaderColumn>
        </BootstrapTable>
      </span>
    );
  }
}
