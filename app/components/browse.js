import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Request from 'superagent';
import { OverlayTrigger, Tooltip, Button, Table, Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Map from './common/map/map';
import auth from '../utils/auth.js';
import config from '../utils/config.js';

class TableRow extends Component {
  render() {
    var comment = "";
    if (this.props.area.comment) {
      if (this.props.area.comment.length>100) {
        const tooltip = (<Tooltip id={this.props.area.id}>{this.props.area.comment}</Tooltip>);
        comment = <OverlayTrigger key={this.props.area.id} placement="top" overlay={tooltip}><span>{this.props.area.comment.substring(0,100) + "..."}</span></OverlayTrigger>;
      } else {
        comment = this.props.area.comment;
      }
    }
    return (
      <tr>
        <td><Link to={`/area/${this.props.area.id}`}>{this.props.area.name}</Link> {this.props.area.visibility===1 && <i className="fa fa-lock"></i>}{this.props.area.visibility===2 && <i className="fa fa-expeditedssl"></i>}</td>
        <td>{comment}</td>
        <td>{this.props.area.numSectors}</td>
      </tr>
    )
  }
}

export default class Browse extends Component {
  componentDidMount() {
    Request.get(config.getUrl("areas/list?regionId=" + config.getRegion())).withCredentials().end((err, res) => {
      this.setState({
        error: err? err : null,
        areas: err? null : res.body
      });
      document.title=config.getTitle() + " | browse";
    });
  }

  render() {
    if (!this.state) {
      return <center><i className="fa fa-cog fa-spin fa-2x"></i></center>;
    }
    if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    const rows = this.state.areas.map((area, i) => {
      return (
        <TableRow area={area} key={i} />
      )
    });
    const markers = this.state.areas.filter(a => a.lat!=0 && a.lng!=0).map(a => {
      return {
          lat: a.lat,
          lng: a.lng,
          title: a.name,
          label: a.name.charAt(0),
          url: '/area/' + a.id
        }
    });
    const map = markers.length>0? <Map markers={markers} defaultCenter={config.getDefaultCenter()} defaultZoom={config.getDefaultZoom()}/> : null;
    return (
      <span>
        <Breadcrumb>
          {auth.isAdmin()?
            <OverlayTrigger placement="top" overlay={<Tooltip id={-1}>Add area</Tooltip>}>
              <div style={{float: 'right'}}><LinkContainer to={`/area/edit/-1`}><Button bsStyle="primary" bsSize="xsmall"><i className="fa fa-inverse fa-plus-square"/></Button></LinkContainer></div>
            </OverlayTrigger>:
            null
          }
          <Link to={`/`}>Home</Link> / <font color='#777'>Browse</font>
        </Breadcrumb>
        {map}
        <Table striped condensed hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>#sectors</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </span>
    );
  }
}
