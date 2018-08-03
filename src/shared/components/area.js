import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Tabs, Tab, Well, OverlayTrigger, Tooltip, ButtonGroup, Button, Table, Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Map from './common/map/map';
import Gallery from './common/gallery/gallery';
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

class Area extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data, tabIndex: 1};
  }

  refresh(id) {
    const { cookies } = this.props;
    const accessToken = cookies.get('access_token');
    this.props.fetchInitialData(accessToken, id).then((data) => this.setState(() => ({data})));
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.areaId);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.match.params.areaId !== this.props.match.params.areaId) {
      this.refresh(this.props.match.params.areaId);
    }
  }

  handleTabsSelection(key) {
    this.setState({tabIndex: key});
  }

  onRemoveMedia(idMediaToRemove) {
    const allMedia = this.state.data.media.filter(m => m.id!=idMediaToRemove);
    this.setState({media: allMedia});
  }

  render() {
    if (!this.state.data) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    const rows = this.state.data.sectors.map((sector, i) => {
      return (
        <TableRow sector={sector} key={i} />
      )
    });
    const markers = this.state.data.sectors.filter(s => s.lat!=0 && s.lng!=0).map(s => {
      return {
          lat: s.lat,
          lng: s.lng,
          title: s.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png',
            scaledSizeW: 32,
            scaledSizeH: 32
          },
          url: '/sector/' + s.id
        }
    });
    const polygons = this.state.data.sectors.filter(s => s.polygonCoords).map(s => {
      const triangleCoords = s.polygonCoords.split(";").map((p, i) => {
        const latLng = p.split(",");
        return {lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1])};
      });
      return {
        triangleCoords: triangleCoords,
        url: '/sector/' + s.id
      }
    });
    const defaultCenter = this.state.data.lat && this.state.data.lat>0? {lat: this.state.data.lat, lng: this.state.data.lng} : this.state.data.metadata.defaultCenter;
    const defaultZoom = this.state.data.lat && this.state.data.lat>0? 14 : this.state.data.metadata.defaultZoom;
    const map = markers.length>0 || polygons.length>0? <Map markers={markers} polygons={polygons} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/> : null;
    const gallery = this.state.data.media && this.state.data.media.length>0? <Gallery isAdmin={this.state.data.metadata.isAdmin} alt={this.state.data.name} media={this.state.data.media} showThumbnails={this.state.data.media.length>1} removeMedia={this.onRemoveMedia.bind(this)}/> : null;
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
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(this.state.data.metadata.jsonLd)}} />
          <title>{this.state.data.metadata.title}</title>
          <meta name="description" content={this.state.data.metadata.description} />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={this.state.data.metadata.description} />
          <meta property="og:url" content={this.state.data.metadata.og.url} />
          <meta property="og:title" content={this.state.data.metadata.title} />
          <meta property="og:image" content={this.state.data.metadata.og.image} />
          <meta property="og:image:width" content={this.state.data.metadata.og.imageWidth} />
          <meta property="og:image:height" content={this.state.data.metadata.og.imageHeight} />
        </MetaTags>
        <Breadcrumb>
          {this.state.data.metadata.isAdmin?
            <div style={{float: 'right'}}>
              <ButtonGroup>
                <OverlayTrigger placement="top" overlay={<Tooltip id={-1}>Add sector</Tooltip>}>
                  <LinkContainer to={{ pathname: `/sector/edit/-1`, query: { idArea: this.state.data.id, lat: this.state.data.lat, lng: this.state.data.lng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="plus-square" inverse={true} /></Button></LinkContainer>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id={this.state.data.id}>Edit area</Tooltip>}>
                  <LinkContainer to={{ pathname: `/area/edit/${this.state.data.id}`, query: { lat: this.state.data.lat, lng: this.state.data.lng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="edit" inverse={true} /></Button></LinkContainer>
                </OverlayTrigger>
              </ButtonGroup>
            </div>:
            null
          }
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <font color='#777'>{this.state.data.name}</font> {this.state.data.visibility===1 && <FontAwesomeIcon icon="lock" />}{this.state.data.visibility===2 && <FontAwesomeIcon icon="user-secret" />}
        </Breadcrumb>
        {topoContent}
        {this.state.data.comment? <Well><div dangerouslySetInnerHTML={{ __html: this.state.data.comment }} /></Well> : null}
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

export default withCookies(Area);
