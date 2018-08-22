import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Map from './common/map/map';
import Gallery from './common/gallery/gallery';
import { Tabs, Tab, Well, OverlayTrigger, Tooltip, Popover, ButtonGroup, Button, Table, Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class TableRow extends Component {
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
    var comment = "";
    if (this.props.problem.comment) {
      if (this.props.problem.comment.length>40) {
        const tooltip = (<Tooltip id={this.props.problem.id}>{this.props.problem.comment}</Tooltip>);
        comment = <OverlayTrigger key={this.props.problem.id} placement="top" overlay={tooltip}><span>{this.props.problem.comment.substring(0,40) + "..."}</span></OverlayTrigger>;
      } else {
        comment = this.props.problem.comment;
      }
    }
    var fa = this.props.problem.fa? this.props.problem.fa.map((u, i) => {return (<Link key={i} to={`/user/${u.id}`}>{u.firstname} {u.surname}</Link>)}) : [];
    fa = this.intersperse(fa, ", ");
    const isTickedClassName = this.props.problem.ticked? 'success' : '';

    var stars = null;
    if (this.props.problem.stars===0.5) {
      stars = <FontAwesomeIcon icon="star-half" />;
    } else if (this.props.problem.stars===1.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={2}><FontAwesomeIcon icon="star" /></div>;
    } else if (this.props.problem.stars===1.5) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={3}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
    } else if (this.props.problem.stars===2.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={4}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
    } else if (this.props.problem.stars===2.5) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={5}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
    } else if (this.props.problem.stars===3.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={6}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
    }
    if (stars) {
      stars = <OverlayTrigger placement="top" overlay={
        <Popover id={0} title="Guidelines">
          <FontAwesomeIcon icon="star" /> Nice<br/>
          <FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Very nice<br/>
          <FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Fantastic!
        </Popover>
      }>{stars}</OverlayTrigger>;
    }

    var type;
    if (!this.props.isBouldering) {
      var typeImg;
      const subtype = this.props.problem.t.subtype;
      switch (this.props.problem.t.id) {
        case 2: typeImg = <img height="20" src="/jpg/bolt.jpg" alt={subtype}/>; break;
        case 3: typeImg = <img height="20" src="/jpg/trad.jpg" alt={subtype}/>; break;
        case 4: typeImg = <img height="20" src="/jpg/mixed.jpg" alt={subtype}/>; break;
        case 5: typeImg = <img height="20" src="/jpg/toprope.jpg" alt={subtype}/>; break;
      }
      type = <td><OverlayTrigger placement="top" overlay={<Popover id={this.props.problem.t.id} title="Type">
          {this.props.problem.t.type + " - " + this.props.problem.t.subType}
        </Popover>}>{typeImg}</OverlayTrigger></td>;
    }

    return (
      <tr className={isTickedClassName}>
        <td>{this.props.problem.nr}</td>
        <td><Link to={`/problem/${this.props.problem.id}`}>{this.props.problem.name}</Link> {this.props.problem.visibility===1 && <FontAwesomeIcon icon="lock" />}{this.props.problem.visibility===2 && <FontAwesomeIcon icon="user-secret" />}</td>
        <td>{comment}</td>
        {type}
        <td>{this.props.problem.grade}</td>
        <td>{fa}</td>
        <td>{this.props.problem.numTicks}</td>
        <td>{stars}</td>
        <td>{this.props.problem.numImages}</td>
        <td>{this.props.problem.numMovies}</td>
        <td>{( (this.props.problem.lat>0 && this.props.problem.lng>0) || (this.props.problemsInTopo.indexOf(this.props.problem.id)>=0) ) && <FontAwesomeIcon icon="check" />}</td>
      </tr>
    )
  }
}

class Sector extends Component {
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
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
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
          title: p.nr + " - " + p.name + " [" + p.grade + "]",
          label: p.name.charAt(0),
          url: '/problem/' + p.id,
          icon: {
            url: p.ticked? 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-a.png' : 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png',
            labelOriginX: 11,
            labelOriginY: 13
          }
        }
    });
    if (data.lat>0 && data.lng>0) {
      markers.push({
        lat: data.lat,
        lng: data.lng,
        title: 'Parking',
        icon: {
          url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png',
          scaledSizeW: 32,
          scaledSizeH: 32
        },
        url: '/sector/' + data.id
      });
    }
    const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
    const defaultZoom = data.lat && data.lat>0? 15 : data.metadata.defaultZoom;
    const map = markers.length>0? <Map markers={markers} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/> : null;
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
        <Breadcrumb>
          {this.state && this.state.data && this.state.data.metadata.isAdmin?
            <div style={{float: 'right'}}>
              <ButtonGroup>
                <OverlayTrigger placement="top" overlay={<Tooltip id={-1}>Add problem</Tooltip>}>
                  <LinkContainer to={{ pathname: `/problem/edit/-1`, query: { idSector: data.id, nr: nextNr, lat: data.lat, lng: data.lng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="plus-square" inverse={true} /></Button></LinkContainer>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id={data.id}>Edit sector</Tooltip>}>
                  <LinkContainer to={{ pathname: `/sector/edit/${data.id}`, query: { idArea: data.areaId, lat: data.lat, lng: data.lng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="edit" inverse={true} /></Button></LinkContainer>
                </OverlayTrigger>
              </ButtonGroup>
            </div>:
            null
          }
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <Link to={`/area/${data.areaId}`}>{data.areaName}</Link> {data.areaVisibility===1 && <FontAwesomeIcon icon="lock" />}{data.areaVisibility===2 && <FontAwesomeIcon icon="user-secret" />} / <font color='#777'>{data.name}</font> {data.visibility===1 && <FontAwesomeIcon icon="lock" />}{data.visibility===2 && <FontAwesomeIcon icon="user-secret" />}
        </Breadcrumb>
        {topoContent}
        {data.comment? <Well>{data.comment}</Well> : null}
        <Table striped condensed hover>
          <thead>
            <tr>
              <th><FontAwesomeIcon icon="hashtag" /></th>
              <th>Name</th>
              <th>Description</th>
              {!data.metadata.isBouldering && <th>Type</th>}
              <th>Grade</th>
              <th>FA</th>
              <th>Ticks</th>
              <th>Stars</th>
              <th><FontAwesomeIcon icon="camera" /></th>
              <th><FontAwesomeIcon icon="video" /></th>
              <th><FontAwesomeIcon icon="map-marker" /></th>
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

export default Sector;
