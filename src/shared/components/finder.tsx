import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Leaflet from './common/leaflet/leaflet';
import { LockSymbol } from './common/lock-symbol/lock-symbol';
import { ButtonToolbar, ButtonGroup, Button, OverlayTrigger, Tooltip, Popover, Breadcrumb } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
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

  toRad(value) {
    return value * Math.PI / 180;
  }

  calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = this.toRad(lat2-lat1);
    var dLon = this.toRad(lon2-lon1);
    var rLat1 = this.toRad(lat1);
    var rLat2 = this.toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(rLat1) * Math.cos(rLat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.grade);
    }
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({currLat: position.coords.latitude, currLng: position.coords.longitude});
    });
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

  trClassFormat(rowData, rIndex){
    return rowData.ticked? 'success':'';
  }

  formatAreaName(cell, row) {
    return <span><Link to={`/area/${row.areaId}`}>{row.areaName}</Link> <LockSymbol visibility={row.areaVisibility}/></span>;
  }

  formatSectorName(cell, row) {
    return <span><Link to={`/sector/${row.sectorId}`}>{row.sectorName}</Link> <LockSymbol visibility={row.sectorVisibility}/></span>;
  }

  formatName(cell, row) {
    return <span><Link to={`/problem/${row.id}`}>{row.name}</Link> <LockSymbol visibility={row.visibility}/></span>
  }

  formatType(cell, row) {
    var typeImg;
    const subtype = row.t.subtype;
    switch (row.t.id) {
      case 2: typeImg = <img height="20" src="/jpg/bolt.jpg" alt={subtype}/>; break;
      case 3: typeImg = <img height="20" src="/jpg/trad.jpg" alt={subtype}/>; break;
      case 4: typeImg = <img height="20" src="/jpg/mixed.jpg" alt={subtype}/>; break;
      case 5: typeImg = <img height="20" src="/jpg/toprope.jpg" alt={subtype}/>; break;
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
      stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /></div>;
    } else if (row.stars===1.5) {
      stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
    } else if (row.stars===2.0) {
      stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
    } else if (row.stars===2.5) {
      stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star-half" /></div>;
    } else if (row.stars===3.0) {
      stars = <div style={{whiteSpace: 'nowrap'}}><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /><FontAwesomeIcon icon="star" /></div>;
    } else {
      return "";
    }
    return <OverlayTrigger placement="top" overlay={
          <Popover id="Guidelines" title="Guidelines">
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
        label: p.name,
        url: '/problem/' + p.id
        }
    });
    const map = markers.length>0? <Leaflet useOpenStreetMap={true} markers={markers} defaultCenter={this.state.data.metadata.defaultCenter} defaultZoom={7}/> : null;
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
        {map}
        {table}
      </React.Fragment>
    );
  }
}

export default Finder;
