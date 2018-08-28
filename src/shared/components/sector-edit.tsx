import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Redirect } from 'react-router';
import { FormGroup, ControlLabel, FormControl, ButtonGroup, DropdownButton, MenuItem, Button, Well } from 'react-bootstrap';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polygon } from "react-google-maps";
import ImageUpload from './common/image-upload/image-upload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { postSector } from './../api';

interface googleMapProps {
  googleMapURL: string,
  loadingElement: any,
  containerElement: any,
  mapElement: any,
  defaultZoom: number,
  defaultCenter: any,
  onClick: any,
  onRightClick: any,
  parkingMarkerLat: number,
  parkingMarkerLng: number,
  outline: any
}
const GettingStartedGoogleMap = withScriptjs(withGoogleMap((props: googleMapProps) => {
  var marker = null;
  if (props.parkingMarkerLat!=0 && props.parkingMarkerLng!=0) {
    marker = <Marker position={{lat: props.parkingMarkerLat, lng: props.parkingMarkerLng}} icon={{url: 'https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png', scaledSize: new google.maps.Size(32, 32)}} />;
  }
  return (
    <GoogleMap
      defaultZoom={props.defaultZoom}
      defaultCenter={props.defaultCenter}
      defaultMapTypeId={google.maps.MapTypeId.TERRAIN}
      onClick={props.onClick.bind(this)}
      onRightClick={props.onRightClick.bind(this)}>
      {marker}
      {props.outline}
    </GoogleMap>);
}));

class SectorEdit extends Component<any, any> {
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

  onNameChanged(e) {
    const { data } = this.state;
    data.name = e.target.value;
    this.setState({data});
  }

  onVisibilityChanged(visibility, e) {
    const { data } = this.state;
    data.visibility = visibility;
    this.setState({data});
  }

  onCommentChanged(e) {
    const { data } = this.state;
    data.comment = e.target.value;
    this.setState({data});
  }

  onNewMediaChanged(newMedia) {
    const { data } = this.state;
    data.newMedia = newMedia;
    this.setState({data});
  }

  save(event) {
    event.preventDefault();
    this.setState({isSaving: true});
    postSector(this.props.auth.getAccessToken(), this.props.location.query.idArea, this.state.data.id, this.state.data.visibility, this.state.data.name, this.state.data.comment, this.state.data.lat, this.state.data.lng, this.state.data.polygonCoords, this.state.data.newMedia)
    .then((response) => {
      this.setState({pushUrl: "/sector/" + response.id});
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  onMapClick(event) {
    const { data } = this.state;
    data.lat = event.latLng.lat();
    data.lng = event.latLng.lng();
    this.setState({data});
  }

  onMapRightClick(event) {
    const { data } = this.state;
    const coords = event.latLng.lat() + "," + event.latLng.lng();
    if (data.polygonCoords) {
      data.polygonCoords = data.polygonCoords + ";" + coords;
    } else {
      data.polygonCoords = coords;
    }
    this.setState({data});
  }

  resetMapPolygon(event) {
    const { data } = this.state;
    data.polygonCoords = null;
    this.setState({data});
  }

  onCancel() {
    window.history.back();
  }

  render() {
    if (this.state.error) {
      return <h3>{this.state.error.toString()}</h3>;
    } else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    } else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.sectorId || !this.props.location || !this.props.location.query || !this.props.location.query.idArea) {
      return <span><h3>Invalid action...</h3></span>;
    } else if (!this.state.data) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    } else if (!this.state.data.metadata.isAdmin) {
      this.setState({pushUrl: "/login", error: null});
    }

    var triangleCoords = this.state.data.polygonCoords? this.state.data.polygonCoords.split(";").map((p, i) => {
      const latLng = p.split(",");
      return {lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1])};
    }) : [];
    var outline = null;
    if (triangleCoords.length==1) {
      outline = <Marker position={{lat: triangleCoords[0].lat, lng: triangleCoords[0].lng}}/>;
    } else if (triangleCoords.length>1) {
      outline = <Polygon paths={triangleCoords} options={{strokeColor: '#FF3300', strokeOpacity: 0.5, strokeWeight: 2, fillColor: '#FF3300', fillOpacity: 0.15}} onClick={this.onMapClick.bind(this)} onRightClick={this.onMapRightClick.bind(this)}/>;
    }

    var visibilityText = 'Visible for everyone';
    if (this.state.data.visibility===1) {
      visibilityText = 'Only visible for administrators';
    } else if (this.state.data.visibility===2) {
      visibilityText = 'Only visible for super administrators';
    }
    const defaultCenter = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? {lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng)} : this.state.data.metadata.defaultCenter;
    const defaultZoom: number = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? 14 : this.state.data.metadata.defaultZoom;
    return (
      <React.Fragment>
        <MetaTags>
          <title>{this.state.data.metadata.title}</title>
        </MetaTags>
        <Well>
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsName">
              <ControlLabel>Sector name</ControlLabel>
              <FormControl type="text" value={this.state.data.name} placeholder="Enter name" onChange={this.onNameChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsComment">
              <ControlLabel>Comment</ControlLabel>
              <FormControl style={{height: '100px'}} componentClass="textarea" placeholder="Enter comment" value={this.state.data.comment} onChange={this.onCommentChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsVisibility">
              <ControlLabel>Visibility</ControlLabel><br/>
              <DropdownButton title={visibilityText} id="bg-nested-dropdown">
                <MenuItem eventKey="0" onSelect={this.onVisibilityChanged.bind(this, 0)}>Visible for everyone</MenuItem>
                <MenuItem eventKey="1" onSelect={this.onVisibilityChanged.bind(this, 1)}>Only visible for administrators</MenuItem>
                {this.state.data.metadata.isSuperAdmin && <MenuItem eventKey="2" onSelect={this.onVisibilityChanged.bind(this, 2)}>Only visible for super administrators</MenuItem>}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsMedia">
              <ImageUpload auth={this.props.auth} onMediaChanged={this.onNewMediaChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsMap">
              <ControlLabel>Left mouse button to position parking coordinate, right mouse button to add polygon points (sector outline)</ControlLabel><br/>
              <section style={{height: '600px'}}>
                <GettingStartedGoogleMap
                  googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyCpaVd5518yMB-oiIyP5JnTVWMfrOv4sAI&v=3.exp"
                  loadingElement={<div style={{ height: `100%` }} />}
                  containerElement={<div style={{ height: `100%` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  defaultZoom={defaultZoom}
                  defaultCenter={defaultCenter}
                  onClick={this.onMapClick.bind(this)}
                  onRightClick={this.onMapRightClick.bind(this)}
                  parkingMarkerLat={this.state.data.lat}
                  parkingMarkerLng={this.state.data.lng}
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
      </React.Fragment>
    );
  }
}

export default SectorEdit;
