import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router'
import { FormGroup, ControlLabel, FormControl, ButtonGroup, Button, DropdownButton, MenuItem, Well } from 'react-bootstrap';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import UserSelector from './common/user-selector/user-selector';
import ProblemSection from './common/problem-section/problem-section';
import ImageUpload from './common/image-upload/image-upload';
import auth from '../utils/auth.js';
import Calendar from 'react-input-calendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { postProblem } from './../api';

const GettingStartedGoogleMap = withScriptjs(withGoogleMap(props => (
  <GoogleMap
    defaultZoom={props.defaultZoom}
    defaultCenter={props.defaultCenter}
    defaultMapTypeId={google.maps.MapTypeId.TERRAIN}
    onClick={props.onClick.bind(this)}>
    {props.markers}
  </GoogleMap>
)));

export default class ProblemEdit extends Component {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data};
  }

  componentWillMount() {
    if (!auth.isAdmin()) {
      this.setState({pushUrl: "/login", error: null});
    }
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

  refresh(id) {
    this.props.fetchInitialData(id).then((data) => this.setState(() => ({data})));
  }

  onNameChanged(e) {
    this.setState({name: e.target.value});
  }

  onNrChanged(e) {
    this.setState({nr: parseInt(e.target.value)});
  }

  onLatChanged(e) {
    this.setState({lat: parseFloat(e.target.value)});
  }

  onLngChanged(e) {
    this.setState({lng: parseFloat(e.target.value)});
  }

  onVisibilityChanged(visibility, e) {
    this.setState({visibility: visibility});
  }

  onCommentChanged(e) {
    this.setState({comment: e.target.value});
  }

  onFaDateChanged(newFaDate) {
    this.setState({faDate: newFaDate});
  }

  onOriginalGradeChanged(originalGrade, e) {
    this.setState({originalGrade: originalGrade});
  }

  onTypeIdChanged(typeId, e) {
    this.setState({typeId: typeId});
  }

  onNewMediaChanged(newMedia) {
    this.setState({newMedia: newMedia});
  }

  save(event) {
    event.preventDefault();
    this.setState({isSaving: true});
    const newMedia = this.state.data.newMedia.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
    const { data } = this.state;
    postSector(this.props.location.query.idSector, data.id, data.visibility, data.name, data.comment, data.originalGrade, data.fa, data.faDate, data.nr, (data.typeId? data.types.find(t => t.id === data.typeId) : data.types[0]), data.lat, data.lng, data.sections, newMedia)
    .then((response) => {
      this.setState({pushUrl: "/problem/" + response.id});
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  onMapClick(event) {
    this.setState({lat: event.latLng.lat(), lng: event.latLng.lng()});
  }

  onUsersUpdated(newUsers) {
    const fa = newUsers.map(u => {
      return {id: (typeof u.value === 'string' || u.value instanceof String)? -1 : u.value, firstname: u.label, surname: null};
    });
    this.setState({fa: fa});
  }

  onSectionsUpdated(sections) {
    this.setState({sections});
  }

  onCancel() {
    window.history.back();
  }

  render() {
    const { data } = this.state;
    if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.problemId || !this.props.location || !this.props.location.query || !this.props.location.query.idSector) {
      return <span><h3>Invalid action...</h3></span>;
    }
    else if (!data) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    var visibilityText = 'Visible for everyone';
    if (data.visibility===1) {
      visibilityText = 'Only visible for administrators';
    } else if (data.visibility===2) {
      visibilityText = 'Only visible for super administrators';
    }

    const selectedType = data.typeId? data.types.find(t => t.id === data.typeId) : data.types[0];
    var defaultCenter;
    var defaultZoom;
    if (data.lat!=0 && data.lng!=0) {
      defaultCenter = {lat: data.lat, lng: data.lng};
      defaultZoom = 15;
    }
    else if (this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0) {
      defaultCenter = {lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng)};
      defaultZoom = 14;
    }
    else {
      defaultCenter = data.metadata.defaultCenter;
      defaultZoom = data.metadata.defaultZoom;
    }

    var sections = null;
    if (!data.metadata.isBouldering) {
      sections = (
        <FormGroup controlId="formControlsSections">
          <ControlLabel>Section(s)</ControlLabel><br/>
          <ProblemSection sections={data.sections} grades={data.grades} onSectionsUpdated={this.onSectionsUpdated.bind(this)} />
        </FormGroup>
      );
    }
    return (
      <span>
        <MetaTags>
          <title>{data.metadata.title}</title>
        </MetaTags>
        <Well>
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsName">
              <ControlLabel>Problem name</ControlLabel>
              <FormControl type="text" value={data.name} placeholder="Enter name" onChange={this.onNameChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsFaDate">
              <ControlLabel>FA date (yyyy-mm-dd)</ControlLabel><br/>
              <Calendar format='YYYY-MM-DD' computableFormat='YYYY-MM-DD' date={data.faDate} onChange={this.onFaDateChanged.bind(this)} />
              <ButtonGroup>
                <Button onClick={this.onFaDateChanged.bind(this, this.convertFromDateToString(yesterday))}>Yesterday</Button>
                <Button onClick={this.onFaDateChanged.bind(this, this.convertFromDateToString(new Date()))}>Today</Button>
              </ButtonGroup>
            </FormGroup>
            <FormGroup controlId="formControlsTypeId">
              <ControlLabel>Type</ControlLabel><br/>
              <DropdownButton title={selectedType.type + (selectedType.subType? " - " + selectedType.subType : "")} id="bg-nested-dropdown">
                {data.types.map((t, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onTypeIdChanged.bind(this, t.id)}>{t.type} {t.subType? " - " + t.subType : ""}</MenuItem> })}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsGrade">
              <ControlLabel>Grade</ControlLabel><br/>
              <DropdownButton title={data.originalGrade} id="bg-nested-dropdown">
                {data.grades.map((g, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onOriginalGradeChanged.bind(this, g.grade)}>{g.grade}</MenuItem> })}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsFA">
              <ControlLabel>FA</ControlLabel><br/>
              <UserSelector users={data.fa? data.fa.map(u => {return {value: u.id, label: u.firstname + " " + u.surname}}) : []} onUsersUpdated={this.onUsersUpdated.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsVisibility">
              <ControlLabel>Visibility</ControlLabel><br/>
              <DropdownButton title={visibilityText} id="bg-nested-dropdown">
                <MenuItem eventKey="0" onSelect={this.onVisibilityChanged.bind(this, 0)}>Visible for everyone</MenuItem>
                <MenuItem eventKey="1" onSelect={this.onVisibilityChanged.bind(this, 1)}>Only visible for administrators</MenuItem>
                {auth.isSuperAdmin() && <MenuItem eventKey="2" onSelect={this.onVisibilityChanged.bind(this, 2)}>Only visible for super administrators</MenuItem>}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsSectorNr">
              <ControlLabel>Sector number</ControlLabel>
              <FormControl type="text" value={data.nr} placeholder="Enter sector number" onChange={this.onNrChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsComment">
              <ControlLabel>Comment</ControlLabel>
              <FormControl style={{height: '100px'}} componentClass="textarea" placeholder="Enter comment" value={data.comment} onChange={this.onCommentChanged.bind(this)} />
            </FormGroup>
            {sections}
            <FormGroup controlId="formControlsMedia">
              <ImageUpload onMediaChanged={this.onNewMediaChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsMap">
              <ControlLabel>Click to mark problem on map</ControlLabel><br/>
              <section style={{height: '600px'}}>
                <GettingStartedGoogleMap
                  googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyCpaVd5518yMB-oiIyP5JnTVWMfrOv4sAI&v=3.exp"
                  loadingElement={<div style={{ height: `100%` }} />}
                  containerElement={<div style={{ height: `100%` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  defaultZoom={defaultZoom}
                  defaultCenter={defaultCenter}
                  onClick={this.onMapClick.bind(this)}
                  markers={data.lat!=0 && data.lng!=0? <Marker position={{lat: data.lat, lng: data.lng}}/> : ""}
                />
              </section>
              <ControlLabel>Latitude</ControlLabel>
              <FormControl type="text" value={data.lat} placeholder="Latitude" onChange={this.onLatChanged.bind(this)} />
              <ControlLabel>Longitude</ControlLabel>
              <FormControl type="text" value={data.lng} placeholder="Longitude" onChange={this.onLngChanged.bind(this)} />
            </FormGroup>
            <ButtonGroup><Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button><Button type="submit" bsStyle="success" disabled={this.state.isSaving}>{this.state.isSaving? 'Saving...' : 'Save problem'}</Button></ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }

  convertFromDateToString(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  }
}
