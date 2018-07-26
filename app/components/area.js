import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Request from 'superagent';
import { Tabs, Tab, Well, OverlayTrigger, Tooltip, ButtonGroup, Button, Table, Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Map from './common/map/map';
import Gallery from './common/gallery/gallery';
import auth from '../utils/auth.js';
import config from '../utils/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
        <td><Link to={`/sector/${this.props.sector.id}`}>{this.props.sector.name}</Link> {this.props.sector.visibility===1 && <FontAwesomeIcon icon="lock" />}{this.props.sector.visibility===2 && <FontAwesomeIcon icon="user-secret" />}</td>
        <td>{comment}</td>
        <td>{this.props.sector.numProblems}</td>
      </tr>
    )
  }
}

export default class Area extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 1
    };
  }

  refresh(id) {
    Request.get(config.getUrl("areas?regionId=" + config.getRegion() + "&id=" + id)).withCredentials().end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({
          id: res.body.id,
          visibility: res.body.visibility,
          name: res.body.name,
          media: res.body.media,
          comment: res.body.comment,
          lat: res.body.lat,
          lng: res.body.lng,
          sectors: res.body.sectors
        });
      }
    });
  }

  componentDidMount() {
    this.refresh(this.props.match.params.areaId);
  }

  componentWillReceiveProps(nextProps) {
    this.refresh(nextProps.match.params.areaId);
  }

  handleTabsSelection(key) {
    this.setState({tabIndex: key});
  }

  onRemoveMedia(idMediaToRemove) {
    const allMedia = this.state.media.filter(m => m.id!=idMediaToRemove);
    this.setState({media: allMedia});
  }

  render() {
    if (!this.state.id) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
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
    const defaultCenter = this.state.lat && this.state.lat>0? {lat: this.state.lat, lng: this.state.lng} : config.getDefaultCenter();
    const defaultZoom = this.state.lat && this.state.lat>0? 14 : config.getDefaultZoom();
    const map = markers.length>0 || polygons.length>0? <Map markers={markers} polygons={polygons} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/> : null;
    const gallery = this.state.media && this.state.media.length>0? <Gallery alt={this.state.name} media={this.state.media} showThumbnails={this.state.media.length>1} removeMedia={this.onRemoveMedia.bind(this)}/> : null;
    var topoContent = null;
    if (map && gallery) {
      topoContent = (
        <Tabs activeKey={this.state.tabIndex} animation={false} onSelect={this.handleTabsSelection.bind(this)} id="area_tab" unmountOnExit={true}>
          <Tab eventKey={1} title="Topo">{this.state.tabIndex==1? gallery : false}</Tab>
          <Tab eventKey={2} title="Map">{this.state.tabIndex==2? map : false}</Tab>
        </Tabs>
      );
    } else if (map) {
      topoContent = map;
    } else if (gallery) {
      topoContent = gallery;
    }

    return (
      <span>
        <MetaTags>
          <title>{config.getTitle(this.state.name)}</title>
          <meta name="description" content={"List of sectors connected to " + this.state.name} />
        </MetaTags>
        <Breadcrumb>
          {auth.isAdmin()?
            <div style={{float: 'right'}}>
              <ButtonGroup>
                <OverlayTrigger placement="top" overlay={<Tooltip id={-1}>Add sector</Tooltip>}>
                  <LinkContainer to={{ pathname: `/sector/edit/-1`, query: { idArea: this.state.id, lat: this.state.lat, lng: this.state.lng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="plus-square" inverse={true} /></Button></LinkContainer>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id={this.state.id}>Edit area</Tooltip>}>
                  <LinkContainer to={{ pathname: `/area/edit/${this.state.id}`, query: { lat: this.state.lat, lng: this.state.lng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="edit" inverse={true} /></Button></LinkContainer>
                </OverlayTrigger>
              </ButtonGroup>
            </div>:
            null
          }
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <font color='#777'>{this.state.name}</font> {this.state.visibility===1 && <FontAwesomeIcon icon="lock" />}{this.state.visibility===2 && <FontAwesomeIcon icon="user-secret" />}
        </Breadcrumb>
        {topoContent}
        {this.state.comment? <Well><div dangerouslySetInnerHTML={{ __html: this.state.comment }} /></Well> : null}
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
