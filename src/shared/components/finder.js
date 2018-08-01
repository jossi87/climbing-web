import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Map from './common/map/map';
import { Tabs, Tab, Panel, ButtonToolbar, ButtonGroup, Button, OverlayTrigger, Tooltip, Popover, Breadcrumb } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Finder extends Component {
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
      currLat: 0,
      currLng: 0
    };
  }

  toRad(value) {
    return value * Math.PI / 180;
  }

  calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = this.toRad(lat2-lat1);
    var dLon = this.toRad(lon2-lon1);
    var lat1 = this.toRad(lat1);
    var lat2 = this.toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
  }

  refresh(grade) {
    const { cookies } = this.props;
    const accessToken = cookies.get('access_token');
    this.props.fetchInitialData(accessToken, grade).then((data) => this.setState(() => ({data})));
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.grade);
    }
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({currLat: position.coords.latitude, currLng: position.coords.longitude});
    });
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.match.params.grade !== this.props.match.params.grade) {
      this.refresh(this.props.match.params.grade);
    }
  }

  handleTabsSelection(key) {
    this.setState({tabIndex: key});
  }

  trClassFormat(rowData, rIndex){
    return rowData.ticked? 'success':'';
  }

  formatAreaName(cell, row) {
    return <span><Link to={`/area/${row.areaId}`}>{row.areaName}</Link> {row.areaVisibility===1 && <FontAwesomeIcon icon="lock" />}{row.areaVisibility===2 && <FontAwesomeIcon icon="user-secret" />}</span>;
  }

  formatSectorName(cell, row) {
    return <span><Link to={`/sector/${row.sectorId}`}>{row.sectorName}</Link> {row.sectorVisibility===1 && <FontAwesomeIcon icon="lock" />}{row.sectorVisibility===2 && <FontAwesomeIcon icon="user-secret" />}</span>;
  }

  formatName(cell, row) {
    return <span><Link to={`/problem/${row.id}`}>{row.name}</Link> {row.visibility===1 && <FontAwesomeIcon icon="lock" />}{row.visibility===2 && <FontAwesomeIcon icon="user-secret" />}</span>
  }

  formatType(cell, row) {
    var typeImg;
    switch (row.t.id) {
      case 2: typeImg = <img height="20" src="/jpg/bolt.jpg" alt="Bolt"/>; break;
      case 3: typeImg = <img height="20" src="/jpg/trad.jpg" alt="Trad"/>; break;
      case 4: typeImg = <img height="20" src="/jpg/mixed.jpg" alt="Mixed"/>; break;
    }
    return <OverlayTrigger placement="top" overlay={<Popover id={row.t.id} title="Type"> {row.t.type + " - " + row.t.subType}</Popover>}>
        {typeImg}
      </OverlayTrigger>;
  }

  formatFa(cell, row) {
    const fa = row.fa? row.fa.map((u, i) => {
      const tooltip = (<Tooltip id={i}>{u.firstname} {u.surname}</Tooltip>);
      return (<OverlayTrigger key={i} placement="top" overlay={tooltip}><LinkContainer key={i} to={`/user/${u.id}`}><Button key={i} bsStyle="default">{u.initials}</Button></LinkContainer></OverlayTrigger>)
    }) : [];
    return <ButtonToolbar><ButtonGroup bsSize="xsmall">{fa}</ButtonGroup></ButtonToolbar>;
  }

  formatStars(cell, row) {
    var stars = null;
    if (row.stars===0.5) {
      stars = <FontAwesomeIcon icon="star-half" />;
    } else if (row.stars===1.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={2}><FontAwesomeIcon icon="star" /></div>;
    } else if (row.stars===1.5) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={3}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
    } else if (row.stars===2.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={4}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
    } else if (row.stars===2.5) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={5}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
    } else if (row.stars===3.0) {
      stars = <div style={{whiteSpace: 'nowrap'}} id={6}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
    } else {
      return "";
    }
    return <OverlayTrigger placement="top" overlay={
          <Popover id={0} title="Guidelines">
            <FontAwesomeIcon icon="star" /> Nice<br/>
            <FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Very nice<br/>
            <FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /> Fantastic!
          </Popover>
        }>{stars}</OverlayTrigger>;
  }

  formatNumImages(cell, row) {
    return row.media? row.media.filter(m => {return m.idType===1}).length : 0;
  }

  formatNumMovies(cell, row) {
    return row.media? row.media.filter(m => {return m.idType===2}).length : 0;
  }

  formatDistance(cell, row) {
    if (this.state.currLat>0 && this.state.currLng>0 && row.lat>0 && row.lng>0) {
      return this.calcCrow(this.state.currLat, this.state.currLng, row.lat, row.lng).toFixed(1) + " km";
    }
    return "";
  }

  sortFa(a, b, order) {
    const x = a.fa? a.fa[0].initials : "";
    const y = b.fa? b.fa[0].initials : "";
    if (order==='asc') return x.localeCompare(y);
    return y.localeCompare(x);
  }

  sortNumImages(a, b, order) {
    const x = a.media? a.media.filter(m => {return m.idType===1}).length : 0;
    const y = b.media? b.media.filter(m => {return m.idType===1}).length : 0;
    if (order==='asc') {
      if (x<y) return -1;
      else if (x>y) return 1;
      return 0;
    } else {
      if (x<y) return 1;
      else if (x>y) return -1;
      return 0;
    }
  }

  sortNumMovies(a, b, order) {
    const x = a.media? a.media.filter(m => {return m.idType===2}).length : 0;
    const y = b.media? b.media.filter(m => {return m.idType===2}).length : 0;
    if (order==='asc') {
      if (x<y) return -1;
      else if (x>y) return 1;
      return 0;
    } else {
      if (x<y) return 1;
      else if (x>y) return -1;
      return 0;
    }
  }

  sortDistance(a, b, order) {
    const x = this.state.currLat>0 && this.state.currLng>0 && a.lat>0 && a.lng>0? this.calcCrow(this.state.currLat, this.state.currLng, a.lat, a.lng) : 0;
    const y = this.state.currLat>0 && this.state.currLng>0 && b.lat>0 && b.lng>0? this.calcCrow(this.state.currLat, this.state.currLng, b.lat, b.lng) : 0;
    if (order==='asc') {
      if (x<y) return -1;
      else if (x>y) return 1;
      return 0;
    } else {
      if (x<y) return 1;
      else if (x>y) return -1;
      return 0;
    }
  }

  render() {
    if (!this.state.data || !this.state.data.problems) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    const markers = this.state.data.problems.filter(p => p.lat!=0 && p.lng!=0).map(p => {
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
    const map = markers.length>0? <Map markers={markers} defaultCenter={this.state.data.metadata.defaultCenter} defaultZoom={7}/> : null;
    var table = null;
    if (!this.state.data.metadata.isBouldering) {
      table = <BootstrapTable
                data={this.state.data.problems}
                trClassName={this.trClassFormat.bind(this)}
                condensed={true}
                hover={true}
                columnFilter={false}>
                <TableHeaderColumn dataField="id" isKey={true} hidden={true}>id</TableHeaderColumn>
                <TableHeaderColumn dataField="areaName" dataSort={true} dataFormat={this.formatAreaName.bind(this)} width="150" filter={{type: "TextFilter", placeholder: "Filter"}}>Area</TableHeaderColumn>
                <TableHeaderColumn dataField="sectorName" dataSort={true} dataFormat={this.formatSectorName.bind(this)} width="150" filter={{type: "TextFilter", placeholder: "Filter"}}>Sector</TableHeaderColumn>
                <TableHeaderColumn dataField="name" dataSort={true} dataFormat={this.formatName.bind(this)} width="150" filter={{type: "TextFilter", placeholder: "Filter"}}>Name</TableHeaderColumn>
                <TableHeaderColumn dataField="type" dataFormat={this.formatType.bind(this)} dataAlign="center" width="70">Type</TableHeaderColumn>
                <TableHeaderColumn dataField="grade" dataSort={true} dataAlign="center" width="70">Grade</TableHeaderColumn>
                <TableHeaderColumn dataField="fa" dataSort={true} dataFormat={this.formatFa.bind(this)} sortFunc={this.sortFa.bind(this)} dataAlign="center" width="70">FA</TableHeaderColumn>
                <TableHeaderColumn dataField="numTicks" dataSort={true} dataAlign="center" width="50">Ticks</TableHeaderColumn>
                <TableHeaderColumn dataField="stars" dataSort={true} dataFormat={this.formatStars.bind(this)} dataAlign="center" width="70">Stars</TableHeaderColumn>
                <TableHeaderColumn dataField="numImages" dataSort={true} dataFormat={this.formatNumImages.bind(this)} sortFunc={this.sortNumImages.bind(this)} dataAlign="center" width="50"><FontAwesomeIcon icon="camera" /></TableHeaderColumn>
                <TableHeaderColumn dataField="numMovies" dataSort={true} dataFormat={this.formatNumMovies.bind(this)} sortFunc={this.sortNumMovies.bind(this)} dataAlign="center" width="50"><FontAwesomeIcon icon="video" /></TableHeaderColumn>
              </BootstrapTable>;
    } else {
      table = <BootstrapTable
                data={this.state.data.problems}
                trClassName={this.trClassFormat.bind(this)}
                condensed={true}
                hover={true}
                columnFilter={false}>
                <TableHeaderColumn dataField="id" isKey={true} hidden={true}>id</TableHeaderColumn>
                <TableHeaderColumn dataField="areaName" dataSort={true} dataFormat={this.formatAreaName.bind(this)} width="150" filter={{type: "TextFilter", placeholder: "Filter"}}>Area</TableHeaderColumn>
                <TableHeaderColumn dataField="sectorName" dataSort={true} dataFormat={this.formatSectorName.bind(this)} width="150" filter={{type: "TextFilter", placeholder: "Filter"}}>Sector</TableHeaderColumn>
                <TableHeaderColumn dataField="name" dataSort={true} dataFormat={this.formatName.bind(this)} width="150" filter={{type: "TextFilter", placeholder: "Filter"}}>Name</TableHeaderColumn>
                <TableHeaderColumn dataField="grade" dataSort={true} dataAlign="center" width="70">Grade</TableHeaderColumn>
                <TableHeaderColumn dataField="fa" dataSort={true} dataFormat={this.formatFa.bind(this)} sortFunc={this.sortFa.bind(this)} dataAlign="center" width="70">FA</TableHeaderColumn>
                <TableHeaderColumn dataField="numTicks" dataSort={true} dataAlign="center" width="50">Ticks</TableHeaderColumn>
                <TableHeaderColumn dataField="stars" dataSort={true} dataFormat={this.formatStars.bind(this)} dataAlign="center" width="70">Stars</TableHeaderColumn>
                <TableHeaderColumn dataField="numImages" dataSort={true} dataFormat={this.formatNumImages.bind(this)} sortFunc={this.sortNumImages.bind(this)} dataAlign="center" width="50"><FontAwesomeIcon icon="camera" /></TableHeaderColumn>
                <TableHeaderColumn dataField="numMovies" dataSort={true} dataFormat={this.formatNumMovies.bind(this)} sortFunc={this.sortNumMovies.bind(this)} dataAlign="center" width="50"><FontAwesomeIcon icon="video" /></TableHeaderColumn>
                <TableHeaderColumn dataField="distance" dataSort={true} dataFormat={this.formatDistance.bind(this)} sortFunc={this.sortDistance.bind(this)} dataAlign="center" width="60"><FontAwesomeIcon icon="plane" /></TableHeaderColumn>
              </BootstrapTable>;
    }

    return (
      <div>
        <MetaTags>
          <title>{this.state.data.metadata.title}</title>
          <meta name="description" content={this.state.data.metadata.description} />
        </MetaTags>
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / <font color='#777'>Finder [{this.state.data.grade}] (problems: {this.state.data.problems.length})</font>
        </Breadcrumb>
        {map}
        {table}
      </div>
    );
  }
}

export default withCookies(Finder);
