import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { FaButtons, LockSymbol, Stars, TypeImage, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Table, Icon } from 'semantic-ui-react';

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
      return <LoadingAndRestoreScroll />;
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
        {map}
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Area</Table.HeaderCell>
              <Table.HeaderCell>Sector</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              {!this.state.data.metadata.isBouldering && <Table.HeaderCell>Type</Table.HeaderCell>}
              <Table.HeaderCell>FA</Table.HeaderCell>
              <Table.HeaderCell>Ticks</Table.HeaderCell>
              <Table.HeaderCell>Stars</Table.HeaderCell>
              <Table.HeaderCell><Icon name="camera" /></Table.HeaderCell>
              <Table.HeaderCell><Icon name="video" /></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.state.data.problems.map((p, i) => (
              <Table.Row>
                <Table.Cell>{p.ticked} TODO <Link to={`/area/${p.areaId}`}>{p.areaName}</Link> <LockSymbol visibility={p.areaVisibility}/></Table.Cell>
                <Table.Cell><Link to={`/sector/${p.sectorId}`}>{p.sectorName}</Link> <LockSymbol visibility={p.sectorVisibility}/></Table.Cell>
                <Table.Cell><Link to={`/problem/${p.id}`}>{p.name}</Link> <LockSymbol visibility={p.visibility}/></Table.Cell>
                {!this.state.data.metadata.isBouldering && <Table.Cell><TypeImage t={p.t}/></Table.Cell>}
                <Table.Cell><FaButtons fa={p.fa}/></Table.Cell>
                <Table.Cell>{p.numTicks}</Table.Cell>
                <Table.Cell><Stars numStars={p.stars}/></Table.Cell>
                <Table.Cell>{p.media? p.media.filter(m => {return m.idType===1}).length : 0}</Table.Cell>
                <Table.Cell>{p.media? p.media.filter(m => {return m.idType===2}).length : 0}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}

export default Finder;
