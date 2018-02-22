import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Request from 'superagent';
import Map from './common/map/map';
import Gallery from './common/gallery/gallery';
import { Tabs, Tab, Well, OverlayTrigger, Tooltip, Popover, ButtonGroup, Button, Table, Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import auth from '../utils/auth.js';
import config from '../utils/config.js';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner, faLock, faUserSecret, faStar, faStarHalf, faCamera, faVideo, faCheck, faPlusSquare, faEdit, faHashtag, faMapMarker } from '@fortawesome/fontawesome-free-solid';

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
    if (config.getRegion()==4) {
      var typeImg;
      switch (this.props.problem.t.id) {
        case 2: typeImg = <img height="20" src="/jpg/bolt.jpg"/>; break;
        case 3: typeImg = <img height="20" src="/jpg/trad.jpg"/>; break;
        case 4: typeImg = <img height="20" src="/jpg/mixed.jpg"/>; break;
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

export default class Sector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 1
    };
  }

  componentDidMount() {
    Request.get(config.getUrl("sectors?regionId=" + config.getRegion() + "&id=" + this.props.match.params.sectorId)).withCredentials().end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState(res.body);
        document.title=config.getTitle() + " | " + this.state.name;
      }
    });
  }

  handleTabsSelection(key) {
    this.setState({tabIndex: key});
  }

  onRemoveMedia(idMediaToRemove) {
    const allMedia = this.state.media.filter(m => m.id!=idMediaToRemove);
    this.setState({media: allMedia});
  }

  render() {
    if (!this.state.areaId) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    const problemsInTopo = [];
    if (this.state.media) {
      this.state.media.forEach(m => {
        console.log("media=" + m);
        if (m.svgs) {
          this.state.media.forEach(svg => problemsInTopo.push(svg.problemId));
          console.log("svgs=" + m.svgs);
        }
      });
    }
    console.log(problemsInTopo);

    const rows = this.state.problems.map((problem, i) => {
      return (
        <TableRow problem={problem} problemsInTopo={problemsInTopo} key={i} />
      )
    });

    const markers = this.state.problems.filter(p => p.lat!=0 && p.lng!=0).map(p => {
      return {
          lat: p.lat,
          lng: p.lng,
          title: p.nr + " - " + p.name + " [" + p.grade + "]",
          label: p.name.charAt(0),
          url: '/problem/' + p.id,
          icon: {
            url: p.ticked? 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-a.png' : 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png',
            labelOrigin: new google.maps.Point(11, 13)
          }
        }
    });
    if (this.state.lat>0 && this.state.lng>0) {
      markers.push({
        lat: this.state.lat,
        lng: this.state.lng,
        title: 'Parking',
        icon: {
          url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png',
          scaledSize: new google.maps.Size(32, 32)
        },
        url: '/sector/' + this.state.id
      });
    }
    const defaultCenter = this.state.lat && this.state.lat>0? {lat: this.state.lat, lng: this.state.lng} : config.getDefaultCenter();
    const defaultZoom = this.state.lat && this.state.lat>0? 15 : config.getDefaultZoom();
    const map = markers.length>0? <Map markers={markers} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/> : null;
    const gallery = this.state.media && this.state.media.length>0? <Gallery media={this.state.media} showThumbnails={this.state.media.length>1} removeMedia={this.onRemoveMedia.bind(this)}/> : null;
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
    const nextNr = this.state.problems.length>0? this.state.problems[this.state.problems.length-1].nr+1 : 1;

    return (
      <span>
        <Breadcrumb>
          {auth.isAdmin()?
            <div style={{float: 'right'}}>
              <ButtonGroup>
                <OverlayTrigger placement="top" overlay={<Tooltip id={-1}>Add problem</Tooltip>}>
                  <LinkContainer to={{ pathname: `/problem/edit/-1`, query: { idSector: this.state.id, nr: nextNr, lat: this.state.lat, lng: this.state.lng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="plus-square" inverse /></Button></LinkContainer>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id={this.state.id}>Edit sector</Tooltip>}>
                  <LinkContainer to={{ pathname: `/sector/edit/${this.state.id}`, query: { idArea: this.state.areaId, lat: this.state.lat, lng: this.state.lng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="edit" inverse /></Button></LinkContainer>
                </OverlayTrigger>
              </ButtonGroup>
            </div>:
            null
          }
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <Link to={`/area/${this.state.areaId}`}>{this.state.areaName}</Link> {this.state.areaVisibility===1 && <FontAwesomeIcon icon="lock" />}{this.state.areaVisibility===2 && <FontAwesomeIcon icon="user-secret" />} / <font color='#777'>{this.state.name}</font> {this.state.visibility===1 && <FontAwesomeIcon icon="lock" />}{this.state.visibility===2 && <FontAwesomeIcon icon="user-secret" />}
        </Breadcrumb>
        {topoContent}
        {this.state.comment? <Well>{this.state.comment}</Well> : null}
        <Table striped condensed hover>
          <thead>
            <tr>
              <th><FontAwesomeIcon icon="hashtag" /></th>
              <th>Name</th>
              <th>Description</th>
              {config.getRegion()==4 && <th>Type</th>}
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
      </span>
    );
  }
}
