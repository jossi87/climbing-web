import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Tabs, Tab, Well, Table } from 'react-bootstrap';
import Leaflet from './common/leaflet/leaflet';
import Gallery from './common/gallery/gallery';
import { CroppedText, LockSymbol } from './common/widgets/widgets';
import { Loader, Button } from 'semantic-ui-react';

class Area extends Component<any, any> {
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

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.areaId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.areaId !== this.props.match.params.areaId) {
      this.refresh(this.props.match.params.areaId);
    }
  }

  refresh(id) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), id).then((data) => this.setState(() => ({data})));
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
      return <Loader active inline='centered' />;
    }
    const rows = this.state.data.sectors.map((sector, i) => (
      <tr>
        <td><Link to={`/sector/${sector.id}`}>{sector.name}</Link> <LockSymbol visibility={sector.visibility}/></td>
        <td><CroppedText text={sector.comment} i={i} maxLength={100}/></td>
        <td>{sector.numProblems}</td>
      </tr>
    ));
    const markers = this.state.data.sectors.filter(s => s.lat!=0 && s.lng!=0).map(s => {
      return {
          lat: s.lat,
          lng: s.lng,
          url: '/sector/' + s.id,
          isParking: true
        }
    });
    const outlines = this.state.data.sectors.filter(s => s.polygonCoords).map(s => {
      const polygon = s.polygonCoords.split(";").map((c, i) => {
        const latLng = c.split(",");
        return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
      });
      return {url: '/sector/' + s.id, label: s.name, polygon: polygon}
    });
    const defaultCenter = this.state.data.lat && this.state.data.lat>0? {lat: this.state.data.lat, lng: this.state.data.lng} : this.state.data.metadata.defaultCenter;
    const defaultZoom = this.state.data.lat && this.state.data.lat>0? 14 : this.state.data.metadata.defaultZoom;
    const map = markers.length>0 || outlines.length>0? <Leaflet useOpenStreetMap={true} markers={markers} outlines={outlines} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/> : null;
    const gallery = this.state.data.media && this.state.data.media.length>0? <Gallery auth={this.props.auth} isAdmin={this.state.data.metadata.isAdmin} alt={this.state.data.name} media={this.state.data.media} showThumbnails={this.state.data.media.length>1} removeMedia={this.onRemoveMedia.bind(this)}/> : null;
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
      <React.Fragment>
        <MetaTags>
          {this.state.data.metadata.canonical && <link rel="canonical" href={this.state.data.metadata.canonical} />}
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
        {this.state.data.metadata.isAdmin &&
          <span><Button.Group fluid size="mini">
            <Button as={Link} to={{ pathname: `/sector/edit/-1`, query: { idArea: this.state.data.id, lat: this.state.data.lat, lng: this.state.data.lng } }}>Add sector</Button>
            <Button as={Link} to={{ pathname: `/area/edit/${this.state.data.id}`, query: { lat: this.state.data.lat, lng: this.state.data.lng } }}>Edit area</Button>
          </Button.Group><br/></span>
        }
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
      </React.Fragment>
    );
  }
}

export default Area;
