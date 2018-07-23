import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router'
import Request from 'superagent';
import { FormGroup, ControlLabel, FormControl, ButtonGroup, Button, DropdownButton, MenuItem, Well } from 'react-bootstrap';
import {withGoogleMap, GoogleMap, Marker} from "react-google-maps";
import UserSelector from './common/user-selector/user-selector';
import ProblemSection from './common/problem-section/problem-section';
import ImageUpload from './common/image-upload/image-upload';
import config from '../utils/config.js';
import auth from '../utils/auth.js';
import Calendar from 'react-input-calendar';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/fontawesome-free-solid';

const GettingStartedGoogleMap = withGoogleMap(props => (
  <GoogleMap
    defaultZoom={props.defaultZoom}
    defaultCenter={props.defaultCenter}
    defaultMapTypeId={google.maps.MapTypeId.TERRAIN}
    onClick={props.onClick.bind(this)}>
    {props.markers}
  </GoogleMap>
));

export default class ProblemEdit extends Component {
  componentDidMount() {
    Request.get(config.getUrl("grades?regionId=" + config.getRegion())).end((err, res) => {
      this.setState({
        error: err? err : null,
        grades: err? null : res.body
      });
    });
    Request.get(config.getUrl("types?regionId=" + config.getRegion())).end((err, res) => {
      this.setState({
        error: err? err : null,
        types: err? null : res.body
      });
    });
    if (this.props.match.params.problemId==-1) {
      this.setState({
        id: -1,
        visibility: 0,
        name: "",
        comment: "",
        originalGrade: "n/a",
        fa: [],
        faDate: config.convertFromDateToString(new Date()),
        nr: this.props.location.query.nr,
        lat: 0,
        lng: 0,
        newMedia: []
      });
    } else {
      Request.get(config.getUrl("problems?regionId=" + config.getRegion() + "&id=" + this.props.match.params.problemId)).withCredentials().end((err, res) => {
        if (err) {
          this.setState({error: err});
        } else {
          this.setState({
            id: res.body[0].id,
            visibility: res.body[0].visibility,
            name: res.body[0].name,
            comment: res.body[0].comment,
            originalGrade: res.body[0].originalGrade,
            fa: res.body[0].fa,
            faDate: res.body[0].faDate,
            nr: res.body[0].nr,
            typeId: res.body[0].t.id,
            lat: res.body[0].lat,
            lng: res.body[0].lng,
            sections: res.body[0].sections,
            newMedia: []
          });
        }
      });
    }
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
    const newMedia = this.state.newMedia.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
    var req = Request.post(config.getUrl("problems?regionId=" + config.getRegion()))
    .withCredentials()
    .field('json', JSON.stringify({sectorId: this.props.location.query.idSector, id: this.state.id, visibility: this.state.visibility, name: this.state.name, comment: this.state.comment, originalGrade: this.state.originalGrade, fa: this.state.fa, faDate: this.state.faDate, nr: this.state.nr, t: this.state.typeId? this.state.types.find(t => t.id === this.state.typeId) : this.state.types[0], lat: this.state.lat, lng: this.state.lng, sections: this.state.sections, newMedia: newMedia}))
    .set('Accept', 'application/json');
    this.state.newMedia.forEach(m => req.attach(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
    req.end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({pushUrl: "/problem/" + res.body.id});
      }
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
    if (!this.state || !this.state.id || !this.state.types || !this.state.grades) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    else if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    var visibilityText = 'Visible for everyone';
    if (this.state.visibility===1) {
      visibilityText = 'Only visible for administrators';
    } else if (this.state.visibility===2) {
      visibilityText = 'Only visible for super administrators';
    }

    const selectedType = this.state.typeId? this.state.types.find(t => t.id === this.state.typeId) : this.state.types[0];
    var defaultCenter;
    var defaultZoom;
    if (this.state.lat!=0 && this.state.lng!=0) {
      defaultCenter = {lat: this.state.lat, lng: this.state.lng};
      defaultZoom = 15;
    }
    else if (this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0) {
      defaultCenter = {lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng)};
      defaultZoom = 14;
    }
    else {
      defaultCenter = config.getDefaultCenter();
      defaultZoom = config.getDefaultZoom();
    }

    var sections = null;
    if (!config.isBouldering()) {
      sections = (
        <FormGroup controlId="formControlsSections">
          <ControlLabel>Section(s)</ControlLabel><br/>
          <ProblemSection sections={this.state.sections} grades={this.state.grades} onSectionsUpdated={this.onSectionsUpdated.bind(this)} />
        </FormGroup>
      );
    }
    return (
      <span>
        <MetaTags>
          <title>{config.getTitle("Problem edit")}</title>
        </MetaTags>
        <Well>
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsName">
              <ControlLabel>Problem name</ControlLabel>
              <FormControl type="text" value={this.state.name} placeholder="Enter name" onChange={this.onNameChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsFaDate">
              <ControlLabel>FA date (yyyy-mm-dd)</ControlLabel><br/>
              <Calendar format='YYYY-MM-DD' computableFormat='YYYY-MM-DD' date={this.state.faDate} onChange={this.onFaDateChanged.bind(this)} />
              <ButtonGroup>
                <Button onClick={this.onFaDateChanged.bind(this, config.convertFromDateToString(yesterday))}>Yesterday</Button>
                <Button onClick={this.onFaDateChanged.bind(this, config.convertFromDateToString(new Date()))}>Today</Button>
              </ButtonGroup>
            </FormGroup>
            <FormGroup controlId="formControlsTypeId">
              <ControlLabel>Type</ControlLabel><br/>
              <DropdownButton title={selectedType.type + (selectedType.subType? " - " + selectedType.subType : "")} id="bg-nested-dropdown">
                {this.state.types.map((t, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onTypeIdChanged.bind(this, t.id)}>{t.type} {t.subType? " - " + t.subType : ""}</MenuItem> })}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsGrade">
              <ControlLabel>Grade</ControlLabel><br/>
              <DropdownButton title={this.state.originalGrade} id="bg-nested-dropdown">
                {this.state.grades.map((g, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onOriginalGradeChanged.bind(this, g.grade)}>{g.grade}</MenuItem> })}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsFA">
              <ControlLabel>FA</ControlLabel><br/>
              <UserSelector users={this.state.fa? this.state.fa.map(u => {return {value: u.id, label: u.firstname + " " + u.surname}}) : []} onUsersUpdated={this.onUsersUpdated.bind(this)} />
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
              <FormControl type="text" value={this.state.nr} placeholder="Enter sector number" onChange={this.onNrChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsComment">
              <ControlLabel>Comment</ControlLabel>
              <FormControl style={{height: '100px'}} componentClass="textarea" placeholder="Enter comment" value={this.state.comment} onChange={this.onCommentChanged.bind(this)} />
            </FormGroup>
            {sections}
            <FormGroup controlId="formControlsMedia">
              <ImageUpload onMediaChanged={this.onNewMediaChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsMap">
              <ControlLabel>Click to mark problem on map</ControlLabel><br/>
              <section style={{height: '600px'}}>
                <GettingStartedGoogleMap
                  containerElement={<div style={{ height: `100%` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  defaultZoom={defaultZoom}
                  defaultCenter={defaultCenter}
                  onClick={this.onMapClick.bind(this)}
                  markers={this.state.lat!=0 && this.state.lng!=0? <Marker position={{lat: this.state.lat, lng: this.state.lng}}/> : ""}
                />
              </section>
              <ControlLabel>Latitude</ControlLabel>
              <FormControl type="text" value={this.state.lat} placeholder="Latitude" onChange={this.onLatChanged.bind(this)} />
              <ControlLabel>Longitude</ControlLabel>
              <FormControl type="text" value={this.state.lng} placeholder="Longitude" onChange={this.onLngChanged.bind(this)} />
            </FormGroup>
            <ButtonGroup><Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button><Button type="submit" bsStyle="success" disabled={this.state.isSaving}>{this.state.isSaving? 'Saving...' : 'Save problem'}</Button></ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }
}
