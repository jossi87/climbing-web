import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import Gallery from './common/gallery/gallery';
import { CroppedText, LockSymbol, Stars, TypeImage } from './common/widgets/widgets';
import { Loader, Icon, Button, Table, Container } from 'semantic-ui-react';

class TableRow extends Component<any, any> {
  /* intersperse: Return an array with the separator interspersed between
   * each element of the input array.
   *
   * > _([1,2,3]).intersperse(0)
   * [1,0,2,0,3]
  */
  intersperse(arr, sep) {
    if (arr.length === 0) {
      return [];
    }
    return arr.slice(1).reduce((xs, x, i) => {
      return (xs.concat([sep, x]));
    }, [arr[0]]);
  }

  render() {
    var fa = this.props.problem.fa? this.props.problem.fa.map((u, i) => {return (<Link key={i} to={`/user/${u.id}`}>{u.firstname} {u.surname}</Link>)}) : [];
    fa = this.intersperse(fa, ", ");
    var bsStyle = '';
    if (this.props.problem.ticked) {
      bsStyle = 'success';
    } else if (this.props.problem.danger) {
      bsStyle = 'danger';
    }

    return (
      <Table.Row>
        <Table.Cell>{this.props.problem.nr}</Table.Cell>
        <Table.Cell><Link to={`/problem/${this.props.problem.id}`}>{this.props.problem.name}</Link> <LockSymbol visibility={this.props.problem.visibility}/></Table.Cell>
        <Table.Cell><CroppedText text={this.props.problem.comment} i={this.props.problem.id} maxLength={40} /></Table.Cell>
        {this.state && this.state.data && !this.state.data.metadata.isBouldering && <Table.Cell><TypeImage t={this.props.problem.t}/></Table.Cell>}
        <Table.Cell>{this.props.problem.grade}</Table.Cell>
        <Table.Cell>{fa}</Table.Cell>
        <Table.Cell>{this.props.problem.numTicks}</Table.Cell>
        <Table.Cell><Stars numStars={this.props.problem.stars}/></Table.Cell>
        <Table.Cell>{this.props.problem.numImages}</Table.Cell>
        <Table.Cell>{this.props.problem.numMovies}</Table.Cell>
        <Table.Cell>{( (this.props.problem.lat>0 && this.props.problem.lng>0) || (this.props.problemsInTopo.indexOf(this.props.problem.id)>=0) ) && <Icon name="check" />}</Table.Cell>
      </Table.Row>
    )
  }
}

class Sector extends Component<any, any> {
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
      this.refresh(this.props.match.params.sectorId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.sectorId !== this.props.match.params.sectorId) {
      this.refresh(this.props.match.params.sectorId);
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
    const { data } = this.state;
    if (!data) {
      return <Loader active inline='centered' />;
    }
    const problemsInTopo = [];
    if (data.media) {
      data.media.forEach(m => {
        if (m.svgs) {
          m.svgs.forEach(svg => problemsInTopo.push(svg.problemId));
        }
      });
    }

    const rows = data.problems.map((problem, i) => {
      return (
        <TableRow isBouldering={data.metadata.isBouldering} problem={problem} problemsInTopo={problemsInTopo} key={i} />
      )
    });

    const markers = data.problems.filter(p => p.lat!=0 && p.lng!=0).map(p => {
      return {
          lat: p.lat,
          lng: p.lng,
          label: p.nr + " - " + p.name + " [" + p.grade + "]",
          url: '/problem/' + p.id
        }
    });
    if (data.lat>0 && data.lng>0) {
      markers.push({
        lat: data.lat,
        lng: data.lng,
        isParking: true
      });
    }
    const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
    const defaultZoom = data.lat && data.lat>0? 15 : data.metadata.defaultZoom;
    const map = markers.length>0? <Leaflet markers={markers} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/> : null;
    const gallery = data.media && data.media.length>0? <Gallery auth={this.props.auth} isAdmin={this.state.data.metadata.isAdmin} alt={data.name + " (" + data.areaName + ")"} media={data.media} showThumbnails={data.media.length>1} removeMedia={this.onRemoveMedia.bind(this)}/> : null;
    var topoContent = null;
    if (map && gallery) {
      topoContent = (
        <Tabs activeKey={this.state.tabIndex} animation={false} onSelect={this.handleTabsSelection.bind(this)} id="sector_tab" unmountOnExit={true}>
          <Tab eventKey={1} title="Topo">{this.state.tabIndex==1? gallery : false}</Tab>
          <Tab eventKey={2} title="Map">{this.state.tabIndex==2? map : false}</Tab>
        </Tabs>
      );
    } else if (map) {
      topoContent = map;
    } else if (gallery) {
      topoContent = gallery;
    }
    const nextNr = data.problems.length>0? data.problems[data.problems.length-1].nr+1 : 1;

    return (
      <React.Fragment>
        <MetaTags>
          {data.metadata.canonical && <link rel="canonical" href={data.metadata.canonical} />}
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data.metadata.jsonLd)}} />
          <title>{data.metadata.title}</title>
          <meta name="description" content={data.metadata.description} />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={data.metadata.description} />
          <meta property="og:url" content={data.metadata.og.url} />
          <meta property="og:title" content={data.metadata.title} />
          <meta property="og:image" content={data.metadata.og.image} />
          <meta property="og:image:width" content={data.metadata.og.imageWidth} />
          <meta property="og:image:height" content={data.metadata.og.imageHeight} />
        </MetaTags>
        {this.state && this.state.data && this.state.data.metadata.isAdmin &&
          <span><Button.Group fluid size="mini">
            <Button as={Link} to={{ pathname: `/problem/edit/-1`, query: { idSector: data.id, nr: nextNr, lat: data.lat, lng: data.lng } }}>Add problem</Button>
            <Button as={Link} to={{ pathname: `/sector/edit/${data.id}`, query: { idArea: data.areaId, lat: data.lat, lng: data.lng } }}>Edit sector</Button>
          </Button.Group><br/></span>
        }
        {topoContent}
        {data.comment? <Container>{data.comment}</Container> : null}
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell><Icon name="hashtag" /></Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              {!data.metadata.isBouldering && <Table.HeaderCell>Type</Table.HeaderCell>}
              <Table.HeaderCell>Grade</Table.HeaderCell>
              <Table.HeaderCell>FA</Table.HeaderCell>
              <Table.HeaderCell>Ticks</Table.HeaderCell>
              <Table.HeaderCell>Stars</Table.HeaderCell>
              <Table.HeaderCell><Icon name="camera" /></Table.HeaderCell>
              <Table.HeaderCell><Icon name="video" /></Table.HeaderCell>
              <Table.HeaderCell><Icon name="map marker" /></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}

export default Sector;
