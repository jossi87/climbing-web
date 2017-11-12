import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Request from 'superagent';
import Map from './common/map/map';
import Gallery from './common/gallery/gallery';
import { Tabs, Tab, Well, OverlayTrigger, Tooltip, Popover, ButtonGroup, Button, Table, Breadcrumb } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import auth from '../utils/auth.js';
import config from '../utils/config.js';

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
    var stars = "";
    const isTickedClassName = this.props.problem.ticked? 'success' : '';
    if (this.props.problem.stars===0.0) { stars = <div style={{whiteSpace: 'nowrap'}}><i className="fa fa-star-o"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/></div>; }
    else if (this.props.problem.stars===0.5) { stars = <div style={{whiteSpace: 'nowrap'}}><i className="fa fa-star-half-o"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/></div>; }
    else if (this.props.problem.stars===1.0) { stars = <div style={{whiteSpace: 'nowrap'}}><i className="fa fa-star"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/></div>; }
    else if (this.props.problem.stars===1.5) { stars = <div style={{whiteSpace: 'nowrap'}}><i className="fa fa-star"/><i className="fa fa-star-half-o"/><i className="fa fa-star-o"/></div>; }
    else if (this.props.problem.stars===2.0) { stars = <div style={{whiteSpace: 'nowrap'}}><i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star-o"/></div>; }
    else if (this.props.problem.stars===2.5) { stars = <div style={{whiteSpace: 'nowrap'}}><i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star-half-o"/></div>; }
    else if (this.props.problem.stars===3.0) { stars = <div style={{whiteSpace: 'nowrap'}}><i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star"/></div>; }
    var type;
    if (config.getRegion()==4) {
      switch (this.props.problem.t.id) {
        case 2: type = <td><img src="/jpg/bolt.jpg"/></td>; break;
        case 3: type = <td><img src="/jpg/trad.jpg"/></td>; break;
        case 4: type = <td><img src="/jpg/mixed.jpg"/></td>; break;
      }
    }
    return (
      <tr className={isTickedClassName}>
        <td>{this.props.problem.nr}</td>
        <td><Link to={`/problem/${this.props.problem.id}`}>{this.props.problem.name}</Link> {this.props.problem.visibility===1 && <i className="fa fa-lock"></i>}{this.props.problem.visibility===2 && <i className="fa fa-expeditedssl"></i>}</td>
        <td>{comment}</td>
        {type}
        <td>{this.props.problem.grade}</td>
        <td>{fa}</td>
        <td>{this.props.problem.numTicks}</td>
        <td>
          <OverlayTrigger placement="top" overlay={
            <Popover id={this.props.problem.id} title="Guidelines">
              <i className="fa fa-star-o"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/><br/>
              <i className="fa fa-star"/><i className="fa fa-star-o"/><i className="fa fa-star-o"/> Nice<br/>
              <i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star-o"/> Very nice<br/>
              <i className="fa fa-star"/><i className="fa fa-star"/><i className="fa fa-star"/> Fantastic!
            </Popover>
          }>{stars}</OverlayTrigger>
        </td>
        <td>{this.props.problem.numImages}</td>
        <td>{this.props.problem.numMovies}</td>
        <td>{this.props.problem.lat>0 && this.props.problem.lng>0 && <i className="fa fa-check"></i>}</td>
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
      return <center><i className="fa fa-cog fa-spin fa-2x"></i></center>;
    }
    if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    const rows = this.state.problems.map((problem, i) => {
      return (
        <TableRow problem={problem} key={i} />
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
    const map = markers.length>0? <Map markers={markers} defaultCenter={{lat: this.state.lat, lng: this.state.lng}} defaultZoom={15}/> : null;
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
                  <LinkContainer to={{ pathname: `/problem/edit/-1`, query: { idSector: this.state.id, nr: nextNr, lat: this.state.lat, lng: this.state.lng } }}><Button bsStyle="primary" bsSize="xsmall"><i className="fa fa-inverse fa-plus-square"/></Button></LinkContainer>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id={this.state.id}>Edit sector</Tooltip>}>
                  <LinkContainer to={{ pathname: `/sector/edit/${this.state.id}`, query: { idArea: this.state.areaId, lat: this.state.lat, lng: this.state.lng } }}><Button bsStyle="primary" bsSize="xsmall"><i className="fa fa-inverse fa-pencil-square-o"/></Button></LinkContainer>
                </OverlayTrigger>
              </ButtonGroup>
            </div>:
            null
          }
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <Link to={`/area/${this.state.areaId}`}>{this.state.areaName}</Link> {this.state.areaVisibility===1 && <i className="fa fa-lock"></i>}{this.state.areaVisibility===2 && <i className="fa fa-expeditedssl"></i>} / <font color='#777'>{this.state.name}</font> {this.state.visibility===1 && <i className="fa fa-lock"></i>}{this.state.visibility===2 && <i className="fa fa-expeditedssl"></i>}
        </Breadcrumb>
        {topoContent}
        {this.state.comment? <Well>{this.state.comment}</Well> : null}
        <Table striped condensed hover>
          <thead>
            <tr>
              <th><i className="fa fa-hashtag"></i></th>
              <th>Name</th>
              <th>Description</th>
              {config.getRegion()==4 && <th>Type</th>}
              <th>Grade</th>
              <th>FA</th>
              <th>Ticks</th>
              <th>Stars</th>
              <th><i className="fa fa-camera"></i></th>
              <th><i className="fa fa-video-camera"></i></th>
              <th><i className="fa fa-map-marker"></i></th>
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
