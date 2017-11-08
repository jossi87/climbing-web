import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Request from 'superagent';
import { Well, OverlayTrigger, Tooltip, ButtonGroup, Button, Table, Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Map from './common/map/map';
import auth from '../utils/auth.js';
import config from '../utils/config.js';

class TableRow extends Component {
  render() {
    var comment = "";
    if (this.props.sector.comment) {
      if (this.props.sector.comment.length>100) {
        const tooltip = (<Tooltip id={this.props.sector.id}>{this.props.sector.comment}</Tooltip>);
        comment = <OverlayTrigger key={this.props.sector.id} placement="top" overlay={tooltip}><span>{this.props.sector.comment.substring(0,100) + "..."}</span></OverlayTrigger>;
      } else {
        comment = this.props.sector.comment;
      }
    }
    return (
      <tr>
        <td><Link to={`/sector/${this.props.sector.id}`}>{this.props.sector.name}</Link> {this.props.sector.visibility===1 && <i className="fa fa-lock"></i>}{this.props.sector.visibility===2 && <i className="fa fa-expeditedssl"></i>}</td>
        <td>{comment}</td>
        <td>{this.props.sector.numProblems}</td>
      </tr>
    )
  }
}

export default class Area extends Component {
  componentDidMount() {
    Request.get(config.getUrl("areas?id=" + this.props.match.params.areaId)).withCredentials().end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({
          id: res.body.id,
          visibility: res.body.visibility,
          name: res.body.name,
          comment: res.body.comment,
          lat: res.body.lat,
          lng: res.body.lng,
          sectors: res.body.sectors
        });
        document.title=config.getTitle() + " | " + this.state.name;
      }
    });
  }

  render() {
    if (!this.state) {
      return <center><i className="fa fa-cog fa-spin fa-2x"></i></center>;
    }
    if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    const rows = this.state.sectors.map((sector, i) => {
      return (
        <TableRow sector={sector} key={i} />
      )
    });
    const markers = this.state.sectors.filter(s => s.lat!=0 && s.lng!=0).map(s => {
      return {
          lat: s.lat,
          lng: s.lng,
          title: s.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png',
            scaledSize: new google.maps.Size(32, 32)
          },
          url: '/sector/' + s.id
        }
    });
    const polygons = this.state.sectors.filter(s => s.polygonCoords).map(s => {
      const triangleCoords = s.polygonCoords.split(";").map((p, i) => {
        const latLng = p.split(",");
        return {lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1])};
      });
      return {
        triangleCoords: triangleCoords,
        url: '/sector/' + s.id
      }
    });
    const map = markers.length>0 || polygons.length>0? <Map markers={markers} polygons={polygons} defaultCenter={{lat: this.state.lat, lng: this.state.lng}} defaultZoom={14}/> : null;
    return (
      <span>
        <Breadcrumb>
          {auth.isAdmin()?
            <div style={{float: 'right'}}>
              <ButtonGroup>
                <OverlayTrigger placement="top" overlay={<Tooltip id={-1}>Add sector</Tooltip>}>
                  <LinkContainer to={{ pathname: `/sector/edit/-1`, query: { idArea: this.state.id, lat: this.state.lat, lng: this.state.lng } }}><Button bsStyle="primary" bsSize="xsmall"><i className="fa fa-inverse fa-plus-square"/></Button></LinkContainer>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id={this.state.id}>Edit area</Tooltip>}>
                  <LinkContainer to={`/area/edit/${this.state.id}`}><Button bsStyle="primary" bsSize="xsmall"><i className="fa fa-inverse fa-pencil-square-o"/></Button></LinkContainer>
                </OverlayTrigger>
              </ButtonGroup>
            </div>:
            null
          }
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <font color='#777'>{this.state.name}</font> {this.state.visibility===1 && <i className="fa fa-lock"></i>}{this.state.visibility===2 && <i className="fa fa-expeditedssl"></i>}
        </Breadcrumb>
        {map}
        {this.state.comment? <Well>{this.state.comment}</Well> : null}
        <Table striped condensed hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>#problems</th>
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
