import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import Request from 'superagent';
import { FormGroup, ControlLabel, FormControl, ButtonGroup, DropdownButton, MenuItem, Button, Well } from 'react-bootstrap';
import {withGoogleMap, GoogleMap, Marker, Polygon} from "react-google-maps";
import ImageUpload from './common/image-upload/image-upload';
import config from '../utils/config.js';
import auth from '../utils/auth.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GettingStartedGoogleMap = withGoogleMap(props => (
  <GoogleMap
    defaultZoom={props.defaultZoom}
    defaultCenter={props.defaultCenter}
    defaultMapTypeId={google.maps.MapTypeId.TERRAIN}
    onClick={props.onClick.bind(this)}
    onRightClick={props.onRightClick.bind(this)}>
    {props.markers}
    {props.outline}
  </GoogleMap>
));

export default class SectorEdit extends Component {
  componentWillMount() {
    if (!auth.isAdmin()) {
      this.setState({pushUrl: "/login", error: null});
    }
  }

  componentDidMount() {
    if (this.props.match.params.sectorId==-1) {
      this.setState({
        id: -1,
        visibility: 0,
        name: "",
        comment: "",
        lat: 0,
        lng: 0,
        polygonCoords: null,
        newMedia: []
      });
    } else {
      Request.get(config.getUrl("sectors?regionId=" + config.getRegion() + "&id=" + this.props.match.params.sectorId)).withCredentials().end((err, res) => {
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
            polygonCoords: res.body.polygonCoords,
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
    var req = Request.post(config.getUrl("sectors?regionId=" + config.getRegion()))
    .withCredentials()
    .field('json', JSON.stringify({areaId: this.props.location.query.idArea, id: this.state.id, visibility: this.state.visibility, name: this.state.name, comment: this.state.comment, lat: this.state.lat, lng: this.state.lng, polygonCoords: this.state.polygonCoords, newMedia: newMedia}))
    .set('Accept', 'application/json');
    this.state.newMedia.forEach(m => req.attach(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
    req.end((err, res) => {
      if (err) {
        this.setState({error: err});
      } else {
        this.setState({pushUrl: "/sector/" + res.body.id});
      }
    });
  }

  onMapClick(event) {
    this.setState({lat: event.latLng.lat(), lng: event.latLng.lng()});
  }

  onMapRightClick(event) {
    if (this.state.polygonCoords) {
      this.setState({
        polygonCoords: this.state.polygonCoords + ";" + event.latLng.lat() + "," + event.latLng.lng()
      });
    } else {
      this.setState({polygonCoords: event.latLng.lat() + "," + event.latLng.lng()});
    }
  }

  resetMapPolygon(event) {
    this.setState({polygonCoords: null});
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
    var triangleCoords = this.state.polygonCoords? this.state.polygonCoords.split(";").map((p, i) => {
      const latLng = p.split(",");
      return {lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1])};
    }) : [];
    var outline = "";
    if (triangleCoords.length==1) {
      outline = <Marker position={{lat: triangleCoords[0].lat, lng: triangleCoords[0].lng}}/>;
    } else if (triangleCoords.length>1) {
      outline = <Polygon paths={triangleCoords} options={{strokeColor: '#FF3300', strokeOpacity: '0.5', strokeWeight: '2', fillColor: '#FF3300', fillOpacity: '0.15'}} onClick={this.onMapClick.bind(this)} onRightclick={this.onMapRightClick.bind(this)}/>;
    }

    var visibilityText = 'Visible for everyone';
    if (this.state.visibility===1) {
      visibilityText = 'Only visible for administrators';
    } else if (this.state.visibility===2) {
      visibilityText = 'Only visible for super administrators';
    }
    const defaultCenter = this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? {lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng)} : config.getDefaultCenter();
    const defaultZoom = this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? 14 : config.getDefaultZoom();
    return (
      <span>
        <MetaTags>
          <title>{config.getTitle("Sector edit")}</title>
          <meta name="description" content={"Edit sector " + this.state.name} />
        </MetaTags>
        <Well>
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsName">
              <ControlLabel>Sector name</ControlLabel>
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
              <ControlLabel>Left mouse button to position parking coordinate, right mouse button to add polygon points (sector outline)</ControlLabel><br/>
              <section style={{height: '600px'}}>
                <GettingStartedGoogleMap
                  containerElement={<div style={{ height: `100%` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  defaultZoom={defaultZoom}
                  defaultCenter={defaultCenter}
                  onClick={this.onMapClick.bind(this)}
                  onRightClick={this.onMapRightClick.bind(this)}
                  markers={this.state.lat!=0 && this.state.lng!=0? <Marker position={{lat: this.state.lat, lng: this.state.lng}} icon={{url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png', scaledSize: new google.maps.Size(32, 32)}}/> : ""}
                  outline={outline}
                />
              </section>
            </FormGroup>
            <ButtonGroup>
              <Button bsStyle="warning" onClick={this.resetMapPolygon.bind(this)}>Clear polygon</Button>
              <Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button>
              <Button type="submit" bsStyle="success" disabled={this.state.isSaving}>{this.state.isSaving? 'Saving...' : 'Save sector'}</Button>
            </ButtonGroup>
          </form>
        </Well>
      </span>
    );
  }
}
