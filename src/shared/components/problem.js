import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Map from './common/map/map';
import Gallery from './common/gallery/gallery';
import { LinkContainer } from 'react-router-bootstrap';
import { Tabs, Tab, Well, Panel, ButtonGroup, Button, Breadcrumb, OverlayTrigger, Popover, Tooltip, Table } from 'react-bootstrap';
import TickModal from './common/tick-modal/tick-modal';
import CommentModal from './common/comment-modal/comment-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Problem extends Component {
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
    this.state = {
      data,
      tabIndex: 1,
      showTickModal: false,
      showCommentModal: false
    };
  }

  refresh(id) {
    const { cookies } = this.props;
    const accessToken = cookies.get('access_token');
    this.props.fetchInitialData(accessToken, id).then((data) => this.setState(() => ({data})));
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.problemId);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.match.params.problemId !== this.props.match.params.problemId) {
      this.refresh(this.props.match.params.problemId);
    }
  }

  handleTabsSelection(key) {
    this.setState({tabIndex: key});
  }

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

  closeTickModal(event) {
    this.setState({ showTickModal: false });
    this.refresh(this.props.match.params.problemId);
  }

  openTickModal(event) {
    this.setState({ showTickModal: true });
  }

  closeCommentModal(event) {
    this.setState({ showCommentModal: false });
    this.refresh(this.props.match.params.problemId);
  }

  openCommentModal(event) {
    this.setState({ showCommentModal: true });
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

    const markers = [];
    if (data.lat>0 && data.lng>0) {
      markers.push({
        lat: data.lat,
        lng: data.lng,
        title: data.name + ' [' + data.grade + ']',
        label: data.name.charAt(0),
        url: '/problem/' + data.id,
        icon: {
          url: (data.ticks && data.ticks.filter(t => t.writable).length>0)? 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-a.png' : 'https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png',
          labelOriginX: 11,
          labelOriginY: 13
        }
      });
    }
    if (data.sectorLat>0 && data.sectorLng>0) {
      markers.push({
        lat: data.sectorLat,
        lng: data.sectorLng,
        title: 'Parking',
        labelContent: data.sectorName,
        icon: {
          url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png',
          scaledSizeW: 32,
          scaledSizeH: 32
        },
        url: '/sector/' + data.sectorId
      });
    }
    const map = markers.length>0? <Map markers={markers} defaultCenter={{lat: markers[0].lat, lng: markers[0].lng}} defaultZoom={16}/> : null;
    const gallery = data.media && data.media.length>0? <Gallery isAdmin={this.state.data.metadata.isAdmin} alt={data.name + ' ' + data.grade + ' (' + data.areaName + " - " + data.sectorName + ')'} media={data.media} showThumbnails={false} removeMedia={this.onRemoveMedia.bind(this)} /> : null;
    var topoContent = null;
    if (map && gallery) {
      topoContent = (
        <Tabs activeKey={this.state.tabIndex} animation={false} onSelect={this.handleTabsSelection.bind(this)} id="problem_tab" unmountOnExit={true}>
          <Tab eventKey={1} title="Media">{this.state.tabIndex==1? gallery : false}</Tab>
          <Tab eventKey={2} title="Map">{this.state.tabIndex==2? map : false}</Tab>
        </Tabs>
      );
    } else if (map) {
      topoContent = map;
    } else if (gallery) {
      topoContent = gallery;
    }
    var fa = data.fa? data.fa.map((u, i) => {return (<Link key={i} to={`/user/${u.id}`}>{u.firstname} {u.surname}</Link>)}) : [];
    fa = this.intersperse(fa, ", ");

    var table = null;
    if (data.ticks) {
      const rows = data.ticks.map((t, i) => {
        const isTickedClassName = t.writable? 'success' : '';
        var stars = null;
        if (t.stars===0.5) {
          stars = <FontAwesomeIcon icon="star-half" />;
        } else if (t.stars===1.0) {
          stars = <div style={{whiteSpace: 'nowrap'}} id={2}><FontAwesomeIcon icon="star" /></div>;
        } else if (t.stars===1.5) {
          stars = <div style={{whiteSpace: 'nowrap'}} id={3}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
        } else if (t.stars===2.0) {
          stars = <div style={{whiteSpace: 'nowrap'}} id={4}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
        } else if (t.stars===2.5) {
          stars = <div style={{whiteSpace: 'nowrap'}} id={5}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
        } else if (t.stars===3.0) {
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
        return (
          <tr className={isTickedClassName} key={i}>
            <td>{t.date}</td>
            <td><Link to={`/user/${t.idUser}`}>{t.name}</Link></td>
            <td>{t.suggestedGrade}</td>
            <td>{t.comment}</td>
            <td>{stars}</td>
          </tr>
        );
      });
      table = (
        <Table striped condensed hover>
          <thead>
            <tr>
              <th>When</th>
              <th>Name</th>
              <th>Grade</th>
              <th>Comment</th>
              <th>Stars</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      );
    }

    var comment = null;
    if (data.comments) {
      const comments = data.comments.map((c, i) => {
        const header = <span><Link to={`/user/${c.idUser}`}>{c.name}</Link> <small><i>{c.date}</i></small></span>;
        return (
          <Panel key={i}>
      			<Panel.Heading>{header}</Panel.Heading>
      			<Panel.Body>{c.message}</Panel.Body>
      		</Panel>
        );
      });
      comment = <span>{comments}</span>;
    };

    var section = null;
    if (data.sections) {
      const sections = data.sections.map((s, i) => {
        return (
          <tr key={i}>
            <td>{s.nr}</td>
            <td>{s.grade}</td>
            <td>{s.description}</td>
          </tr>
        );
      });
      section = (
        <span>
          <strong>Sections:</strong><br/>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <td>#</td>
                <td>Grade</td>
                <td>Description</td>
              </tr>
            </thead>
            <tbody>
              {sections}
            </tbody>
          </Table>
        </span>
      );
    };

    var headerButtons = null;
    if (data.metadata && data.metadata.isAuthenticated) {
      headerButtons = (
        <div style={{float: 'right'}}>
          <ButtonGroup>
            <OverlayTrigger placement="top" overlay={<Tooltip id={-1}>Tick problem</Tooltip>}>
              <Button bsStyle="primary" bsSize="xsmall" onClick={this.openTickModal.bind(this)}>Tick</Button>
            </OverlayTrigger>
            <OverlayTrigger placement="top" overlay={<Tooltip id={-2}>Add comment</Tooltip>}>
              <Button bsStyle="primary" bsSize="xsmall" onClick={this.openCommentModal.bind(this)}><FontAwesomeIcon icon="comment" inverse={true} /></Button>
            </OverlayTrigger>
            {data.metadata.isAdmin ?
              <OverlayTrigger placement="top" overlay={<Tooltip id={data.id}>Edit problem</Tooltip>}>
                <LinkContainer to={{ pathname: `/problem/edit/${data.id}`, query: { idSector: data.sectorId, lat: data.sectorLat, lng: data.sectorLng } }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="edit" inverse={true} /></Button></LinkContainer>
              </OverlayTrigger>
            :
              <OverlayTrigger placement="top" overlay={<Tooltip id={data.id}>Add image(s)</Tooltip>}>
                <LinkContainer to={{ pathname: `/problem/edit/media/${data.id}` }}><Button bsStyle="primary" bsSize="xsmall"><FontAwesomeIcon icon="image" inverse={true} /></Button></LinkContainer>
              </OverlayTrigger>
            }
          </ButtonGroup>
        </div>
      );
    }

    var tickModal = null;
    if (data.ticks) {
      const userTicks = data.ticks.filter(t => t.writable);
      if (userTicks && userTicks.length>0) {
        tickModal = <TickModal idTick={userTicks[0].id} idProblem={data.id} date={userTicks[0].date} comment={userTicks[0].comment} grade={userTicks[0].suggestedGrade} grades={data.metadata.grades} stars={userTicks[0].stars} show={this.state.showTickModal} onHide={this.closeTickModal.bind(this)}/>
      }
    }
    if (!tickModal) {
      tickModal = <TickModal idTick={-1} idProblem={data.id} grade={data.originalGrade} show={this.state.showTickModal} onHide={this.closeTickModal.bind(this)}/>;
    }

    return (
      <span>
        <MetaTags>
          <script type="application/ld+json">{JSON.stringify(data.metadata.jsonLd)}</script>
          <title>{data.metadata.title}</title>
          <meta name="description" content={data.metadata.description} />
        </MetaTags>

        {tickModal}
        <CommentModal idProblem={data.id} show={this.state.showCommentModal} onHide={this.closeCommentModal.bind(this)}/>

        <Breadcrumb>
          {headerButtons}
          <Link to={`/`}>Home</Link> / <Link to={`/browse`}>Browse</Link> / <Link to={`/area/${data.areaId}`}>{data.areaName}</Link> {data.areaVisibility===1 && <FontAwesomeIcon icon="lock" />}{data.areaVisibility===2 && <FontAwesomeIcon icon="user-secret" />} / <Link to={`/sector/${data.sectorId}`}>{data.sectorName}</Link> {data.sectorVisibility===1 && <FontAwesomeIcon icon="lock" />}{data.sectorVisibility===2 && <FontAwesomeIcon icon="user-secret" />} / {data.nr} <font color='#777'>{data.name}</font> {data.grade} {data.visibility===1 && <FontAwesomeIcon icon="lock" />}{data.visibility===2 && <FontAwesomeIcon icon="user-secret" />}
        </Breadcrumb>
        {topoContent}
        <Well bsSize="small">
          {!data.metadata.isBouldering && <span><strong>Type:</strong> {data.t.type + " - " + data.t.subType}<br/></span>}
          <strong>Comment:</strong> {data.comment}<br/>
          <strong>FA:</strong> {fa}<br/>
          <strong>FA date:</strong> {data.faDateHr}<br/>
          <strong>Original grade:</strong> {data.originalGrade}<br/>
          {data.sectorLat>0 && data.sectorLng>0 &&
            <span><a href={`http://maps.google.com/maps?q=loc:${data.sectorLat},${data.sectorLng}&navigate=yes`} rel="noopener" target="_blank">Start navigation</a><br/></span>}
          {section}
        </Well>
        {table}
        {comment}
      </span>
    );
  }
}

export default withCookies(Problem);
