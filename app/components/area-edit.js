import React, {Component} from 'react';
import Request from 'superagent';
import { Redirect } from 'react-router';
import { FormGroup, ControlLabel, FormControl, Checkbox, ButtonGroup, DropdownButton, MenuItem, Button, Well } from 'react-bootstrap';
import ImageUpload from './common/image-upload/image-upload';
import {withGoogleMap, GoogleMap, Marker} from "react-google-maps";
import config from '../utils/config.js';
import auth from '../utils/auth.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GettingStartedGoogleMap = withGoogleMap(props => (
  <GoogleMap
    defaultZoom={props.defaultZoom}
    defaultCenter={props.defaultCenter}
    defaultMapTypeId={google.maps.MapTypeId.TERRAIN}
    onClick={props.onClick.bind(this)}>
    {props.markers}
  </GoogleMap>
));

export default class AreaEdit extends Component {
  componentWillMount() {
    if (!auth.isAdmin()) {
      this.setState({pushUrl: "/login", error: null});
    }
  }

  componentDidMount() {
    if (this.props.match.params.areaId==-1) {
      this.setState({
        id: -1,
        visibility: 0,
        name: "",
        comment: "",
        lat: 0,
        lng: 0,
        newMedia: []
      });
    } else {
      Request.get(config.getUrl("areas?regionId=" + config.getRegion() + "&id=" + this.props.match.params.areaId)).withCredentials().end((err, res) => {
        if (err) {
          this.setState({error: err});
        } else {
          this.setState({
            id: res.body.id,
            visibility: res.body.visibility,
            name: res.body.name,
            comment: res.body.comment,
            lat: res.body.lat,
            lng: res.body.lng,
            newMedia: []
          });
        }
      });
    }
  }

  onNameChanged(e) {
    this.setState({name: e.target.value});
  }

  onVisibilityChanged(visibility, e) {
    this.setState({visibility: visibility});
  }

  onCommentChanged(e) {
    this.setState({comment: e.target.value});
  }

  onNewMediaChanged(newMedia) {
    this.setState({newMedia: newMedia});
  }

  save(event) {
    event.preventDefault();
    this.setState({isSaving: true});
    const newMedia = this.state.newMedia.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
    var req = Request.post(config.getUrl("areas"))
    .withCredentials()
    .field('json', JSON.stringify({regionId: config.getRegion(), id: this.state.id, visibility: this.state.visibility, name: this.state.name, comment: this.state.comment, lat: this.state.lat, lng: this.state.lng, newMedia: newMedia}))
    .set('Accept', 'application/json')
    this.state.newMedia.forEach(m => req.attach(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
    req.end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({pushUrl: "/area/" + res.body.id});
      }
    });
  }

  onMarkerClick(event) {
    this.setState({lat: event.latLng.lat(), lng: event.latLng.lng()});
  }

  onCancel() {
    window.history.back();
  }

  render() {
    if (!this.state) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    }
    else if (this.state.error) {
      return <span><h3>{this.state.error.status}</h3>{this.state.error.toString()}</span>;
    }
    else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.areaId) {
      return <span><h3>Invalid action...</h3></span>;
    }

    var visibilityText = 'Visible for everyone';
    if (this.state.visibility===1) {
      visibilityText = 'Only visible for administrators';
    } else if (this.state.visibility===2) {
      visibilityText = 'Only visible for super administrators';
    }
    const defaultCenter = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? {lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng)} : config.getDefaultCenter();
    const defaultZoom = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? 8 : config.getDefaultZoom();
    return (
      <span>
        <Well>
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsName">
              <ControlLabel>Area name</ControlLabel>
              <FormControl type="text" value={this.state.name} placeholder="Enter name" onChange={this.onNameChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsComment">
              <ControlLabel>Comment</ControlLabel>
              <FormControl style={{height: '100px'}} componentClass="textarea" placeholder="Enter comment" value={this.state.comment} onChange={this.onCommentChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsVisibility">
              <ControlLabel>Visibility</ControlLabel><br/>
              <DropdownButton title={visibilityText} id="bg-nested-dropdown">
                <MenuItem eventKey="0" onSelect={this.onVisibilityChanged.bind(this, 0)}>Visible for everyone</MenuItem>
                <MenuItem eventKey="1" onSelect={this.onVisibilityChanged.bind(this, 1)}>Only visible for administrators</MenuItem>
                {auth.isSuperAdmin() && <MenuItem eventKey="2" onSelect={this.onVisibilityChanged.bind(this, 2)}>Only visible for super administrators</MenuItem>}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsMedia">
              <ImageUpload onMediaChanged={this.onNewMediaChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsMap">
              <ControlLabel>Click to mark area center on map</ControlLabel><br/>
              <section style={{height: '600px'}}>
                <GettingStartedGoogleMap
                  googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyCpaVd5518yMB-oiIyP5JnTVWMfrOv4sAI&v=3.exp"
                  containerElement={<div style={{ height: `100%` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  defaultZoom={defaultZoom}
                  defaultCenter={defaultCenter}
                  onClick={this.onMarkerClick.bind(this)}
                  markers={this.state.lat!=0 && this.state.lng!=0? <Marker position={{lat: this.state.lat, lng: this.state.lng}}/> : ""}
                />
              </section>
            </FormGroup>

            <ButtonGroup><Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button><Button type="submit" bsStyle="success" disabled={this.state.isSaving}>{this.state.isSaving? 'Saving...' : 'Save area'}</Button></ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }
}
