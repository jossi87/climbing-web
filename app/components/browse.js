import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Request from 'superagent';
import { OverlayTrigger, Tooltip, Button, Table, Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Map from './common/map/map';
import auth from '../utils/auth.js';
import config from '../utils/config.js';

class TableRow extends Component {
  toRad(value) {
    return value * Math.PI / 180;
  }

  calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = this.toRad(lat2-lat1);
    var dLon = this.toRad(lon2-lon1);
    var lat1 = this.toRad(lat1);
    var lat2 = this.toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
  }

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
    var distance = "";
    if (this.props.area.currLat>0 && this.props.area.currLng>0 && this.props.area.lat>0 && this.props.area.lng>0) {
      distance = this.calcCrow(this.props.area.currLat, this.props.area.currLng, this.props.area.lat, this.props.area.lng).toFixed(1) + " km";
    }
    return (
      <tr>
        <td><Link to={`/area/${this.props.area.id}`}>{this.props.area.name}</Link> {this.props.area.visibility===1 && <i className="fa fa-lock"></i>}{this.props.area.visibility===2 && <i className="fa fa-expeditedssl"></i>}</td>
        <td>{comment}</td>
        <td>{this.props.area.numSectors}</td>
        <td>{distance}</td>
      </tr>
    )
  }
}

export default class Browse extends Component {
  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({currLat: position.coords.latitude, currLng: position.coords.longitude});
    });
    Request.get(config.getUrl("areas/list?regionId=" + config.getRegion())).withCredentials().end((err, res) => {
      this.setState({
        error: err? err : null,
        areas: err? null : res.body
      });
      document.title=config.getTitle() + " | browse";
    });
  }

  render() {
    if (!this.state || !this.state.areas) {
      return <center><i className="fa fa-cog fa-spin fa-2x"></i></center>;
    }
    if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    const rows = this.state.areas.map((area, i) => {
      return (
        <TableRow area={area} currLat={this.state.currLat} currLng={this.state.currLng} key={i} />
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
              <th>Distance</th>
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
