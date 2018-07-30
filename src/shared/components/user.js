import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Tabs, Tab, ButtonToolbar, ButtonGroup, Button, OverlayTrigger, Tooltip, Popover, Well, Breadcrumb } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Chart from './common/chart/chart';
import TickModal from './common/tick-modal/tick-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class User extends Component {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data, showTickModal: false};
  }

  refresh(id) {
    this.props.fetchInitialData(id).then((data) => this.setState(() => ({data})));
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.userId);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.refresh(this.props.match.params.userId);
    }
  }

  closeTickModal(event) {
    this.setState({ showTickModal: false });
    this.refresh(this.props.match.params.userId);
  }

  openTickModal(t, event) {
    this.setState({ currTick: t, showTickModal: true });
  }

  formatName(cell, row) {
    return <span><Link to={`/problem/${row.idProblem}`}>{row.name}</Link> {row.visibility===1 && <FontAwesomeIcon icon="lock" />}{row.visibility===2 && <FontAwesomeIcon icon="user-secret" />}</span>;
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
    var stars = null;
    if (row.stars===0.5) {
      stars = <FontAwesomeIcon icon="star-half" />;
    } else if (row.stars===1.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={2}><FontAwesomeIcon icon="star" /></div>;
    } else if (row.stars===1.5) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={3}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
    } else if (row.stars===2.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={4}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
    } else if (row.stars===2.5) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={5}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
    } else if (row.stars===3.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={6}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
    } else {
      return "";
    }
    return <OverlayTrigger placement="top" overlay={
          <Popover id={0} title="Guidelines">
            <FontAwesomeIcon icon="star" /> Nice<br/>
            <FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Very nice<br/>
            <FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Fantastic!
          </Popover>
        }>{stars}</OverlayTrigger>;
  }

  formatFa(cell, row) {
    if (cell) {
      return <FontAwesomeIcon icon="check" />;
    }
    return "";
  }

  formatEdit(cell, row) {
    if (this.state.data.readOnly==false && row.id!=0) {
      return <OverlayTrigger placement="top" overlay={<Tooltip id={row.id}>Edit tick</Tooltip>}><Button bsSize="xsmall" bsStyle="primary" onClick={this.openTickModal.bind(this, row)}><FontAwesomeIcon icon="edit" inverse={true} /></Button></OverlayTrigger>
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
    const { data } = this.state;
    if (!data) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }

    var numTicks = data.ticks.filter(t => !t.fa).length;
    var numFas = data.ticks.filter(t => t.fa).length;

    const chart = data.ticks.length>0? <Chart data={data.ticks}/> : null;

    return (
      <span>
        <MetaTags>
          <title>{data.metadata.title}</title>
          <meta name="description" content={data.metadata.description} />
        </MetaTags>

        {this.state.currTick? <TickModal idTick={this.state.currTick.id} idProblem={this.state.currTick.idProblem} date={this.state.currTick.date} comment={this.state.currTick.comment} grade={this.state.currTick.grade} grades={data.metadata.grades} stars={this.state.currTick.stars} show={this.state.showTickModal} onHide={this.closeTickModal.bind(this)}/> : ""}
        <Breadcrumb>
          {data.metadata.isAuthenticated && currTick.user.readOnly==false?
            <div style={{float: 'right'}}>
              <OverlayTrigger placement="top" overlay={<Tooltip id={data.id}>Edit user</Tooltip>}>
                <LinkContainer to={`/user/${data.id}/edit`}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="edit" inverse={true} /></Button></LinkContainer>
              </OverlayTrigger>
            </div>:
            null
          }
          <Link to={`/`}>Home</Link> / <font color='#777'>{data.name}</font>
        </Breadcrumb>
        <Well bsSize="small">First ascents: {numFas}<br/>Public ascents: {numTicks}<br/>Pictures taken: {data.numImagesCreated}<br/>Appearance in pictures: {data.numImageTags}<br/>Videos created: {data.numVideosCreated}<br/>Appearance in videos: {data.numVideoTags}</Well>
        {chart}
        <BootstrapTable
        	data={data.ticks}
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
