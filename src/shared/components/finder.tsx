import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { FaButtons, LockSymbol, Stars, TypeImage } from './common/widgets/widgets';
import { Breadcrumb, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Finder extends Component<any, any> {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {
      data,
      tabIndex: 1,
      currLat: 0,
      currLng: 0
    };
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.grade);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.grade !== this.props.match.params.grade) {
      this.refresh(this.props.match.params.grade);
    }
  }

  refresh(grade) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), grade).then((data) => this.setState(() => ({data})));
  }

  handleTabsSelection(key) {
    this.setState({tabIndex: key});
  }

  render() {
    if (!this.state.data || !this.state.data.problems) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    const markers = this.state.data.problems.filter(p => p.lat!=0 && p.lng!=0).map(p => {
      return {
        lat: p.lat,
        lng: p.lng,
        label: p.name,
        url: '/problem/' + p.id
        }
    });
    const map = markers.length>0? <Leaflet useOpenStreetMap={true} markers={markers} defaultCenter={this.state.data.metadata.defaultCenter} defaultZoom={7}/> : null;
    return (
      <React.Fragment>
        <MetaTags>
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
          <Link to={`/`}>Home</Link> / Finder [{this.state.data.grade}] (problems: {this.state.data.problems.length})
        </Breadcrumb>
        {map}<br/>
        <Table striped condensed hover>
          <thead>
            <tr>
              <th>Area</th>
              <th>Sector</th>
              <th>Name</th>
              {!this.state.data.metadata.isBouldering && <th>Type</th>}
              <th>FA</th>
              <th>Ticks</th>
              <th>Stars</th>
              <th><FontAwesomeIcon icon="camera" /></th>
              <th><FontAwesomeIcon icon="video" /></th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.problems.map((p, i) => (
              <tr key={i} className={p.ticked? 'success' : ''}>
                <td><Link to={`/area/${p.areaId}`}>{p.areaName}</Link> <LockSymbol visibility={p.areaVisibility}/></td>
                <td><Link to={`/sector/${p.sectorId}`}>{p.sectorName}</Link> <LockSymbol visibility={p.sectorVisibility}/></td>
                <td><Link to={`/problem/${p.id}`}>{p.name}</Link> <LockSymbol visibility={p.visibility}/></td>
                {!this.state.data.metadata.isBouldering && <td><TypeImage t={p.t}/></td>}
                <td><FaButtons fa={p.fa}/></td>
                <td>{p.numTicks}</td>
                <td><Stars numStars={p.stars}/></td>
                <td>{p.media? p.media.filter(m => {return m.idType===1}).length : 0}</td>
                <td>{p.media? p.media.filter(m => {return m.idType===2}).length : 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </React.Fragment>
    );
  }
}

export default Finder;
