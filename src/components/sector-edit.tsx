import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router';
import ImageUpload from './common/image-upload/image-upload';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Form, Button, Input, Dropdown, TextArea } from 'semantic-ui-react';
import { getSectorEdit, postSector } from './../api';
import Leaflet from './common/leaflet/leaflet';

class SectorEdit extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {leafletMode: 'PARKING'};
  }

  componentDidMount() {
    if (!this.state || !this.state.data) {
      this.refresh(this.props.match.params.sectorId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.sectorId !== this.props.match.params.sectorId) {
      this.refresh(this.props.match.params.sectorId);
    }
  }

  refresh(id) {
    getSectorEdit(this.props.accessToken, id).then((data) => this.setState(() => ({data})));
  }

  onNameChanged = (e, { value }) => {
    const { data } = this.state;
    data.name = value;
    this.setState({data});
  }

  onVisibilityChanged = (e, { value }) => {
    const { data } = this.state;
    data.visibility = value;
    this.setState({data});
  }

  onCommentChanged = (e, { value }) => {
    const { data } = this.state;
    data.comment = value;
    this.setState({data});
  }

  onNewMediaChanged = (newMedia) => {
    const { data } = this.state;
    data.newMedia = newMedia;
    this.setState({data});
  }

  save = (event) => {
    event.preventDefault();
    this.setState({isSaving: true});
    postSector(this.props.accessToken, this.props.location.query.idArea, this.state.data.id, this.state.data.visibility, this.state.data.name, this.state.data.comment, this.state.data.lat, this.state.data.lng, this.state.data.polygonCoords, this.state.data.polyline, this.state.data.newMedia)
    .then((response) => {
      this.props.history.push("/sector/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  onMapClick = (event) => {
    const { data, leafletMode } = this.state;
    if (leafletMode == 'PARKING') {
      data.lat = event.latlng.lat;
      data.lng = event.latlng.lng;
    } else if (leafletMode == 'POLYGON') {
      const coords = event.latlng.lat + "," + event.latlng.lng;
      if (data.polygonCoords) {
        data.polygonCoords = data.polygonCoords + ";" + coords;
      } else {
        data.polygonCoords = coords;
      }
    } else if (leafletMode == 'POLYLINE') {
      const coords = event.latlng.lat + "," + event.latlng.lng;
      if (data.polyline) {
        data.polyline = data.polyline + ";" + coords;
      } else {
        data.polyline = coords;
      }
    }
    this.setState({data});
  }

  clearDrawing = () => {
    const { data, leafletMode } = this.state;
    if (leafletMode == 'PARKING') {
      data.lat = 0;
      data.lng = 0;
    } else if (leafletMode == 'POLYGON') {
      data.polygonCoords = null;
    } else if (leafletMode == 'POLYLINE') {
      data.polyline = null;
    }
    this.setState({data});
  }

  onCancel = () => {
    window.history.back();
  }

  setMode = (mode) => {
    this.setState({leafletMode: mode});
  }

  render() {
    if (!this.state || !this.state.data) {
      return <LoadingAndRestoreScroll />;
    } else if (this.state.error) {
      return <h3>{this.state.error.toString()}</h3>;
    } else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.sectorId || !this.props.location || !this.props.location.query || !this.props.location.query.idArea) {
      return <span><h3>Invalid action...</h3></span>;
    } else if (!this.state.data.metadata.isAdmin) {
      this.props.history.push("/login");
    }
    const polygon = this.state.data.polygonCoords && this.state.data.polygonCoords.split(";").map((c, i) => {
      const latLng = c.split(",");
      return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
    });
    const polyline = this.state.data.polyline && {
      label: "",
      polyline: this.state.data.polyline.split(";").map(e => {
        return e.split(",").map(Number);
      })
    };
    const defaultCenter = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? {lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng)} : this.state.data.metadata.defaultCenter;
    const defaultZoom: number = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? 14 : this.state.data.metadata.defaultZoom;
    const visibilityOptions = [
      {key: 0, value: 0, text: "Visible for everyone"},
      {key: 1, value: 1, text: "Only visible for administrators"}
    ];
    if (this.state.data.metadata.isSuperAdmin) {
      visibilityOptions.push({key: 2, value: 2, text: "Only visible for super administrators"})
    }
    return (
      <>
        <MetaTags>
          <title>{this.state.data.metadata.title}</title>
        </MetaTags>
        <Form>
          <Form.Field>
            <label>Sector name</label>
            <Input placeholder='Enter name' value={this.state.data.name} onChange={this.onNameChanged} />
          </Form.Field>
          <Form.Field>
            <label>Comment</label>
            <TextArea placeholder='Enter comment' style={{ minHeight: 100 }} value={this.state.data.comment} onChange={this.onCommentChanged} />
          </Form.Field>
          <Form.Field>
            <label>Visibility</label>
            <Dropdown selection value={this.state.data.visibility} onChange={this.onVisibilityChanged} options={visibilityOptions}/>
          </Form.Field>
          <Form.Field>
            <label>Upload image(s)</label>
            <ImageUpload auth={this.props.auth} onMediaChanged={this.onNewMediaChanged} />
          </Form.Field>
          <Form.Field>
            <label>Draw mode (click on map to draw)</label>
            <Button.Group>
              <Button positive={this.state.leafletMode=='PARKING'} onClick={() => this.setMode("PARKING")}>Parking</Button>
              <Button positive={this.state.leafletMode=='POLYGON'} onClick={() => this.setMode("POLYGON")}>Sector outline (polygon)</Button>
              <Button positive={this.state.leafletMode=='POLYLINE'} onClick={() => this.setMode("POLYLINE")}>Path to sector (polyline)</Button>
              <Button negative onClick={this.clearDrawing}>Remove parking/polygon/polyline</Button>
            </Button.Group>
            <br/><br/>
            <Leaflet
              markers={this.state.data.lat!=0 && this.state.data.lng!=0 && [{lat: this.state.data.lat, lng: this.state.data.lng, isParking: true}]}
              outlines={polygon && [{polygon: polygon}]}
              polylines={polyline && [polyline]}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onClick={this.onMapClick}
            />
          </Form.Field>
          <Button.Group>
            <Button negative onClick={this.onCancel}>Cancel</Button>
            <Button.Or />
            <Button positive disabled={this.state.isSaving} onClick={this.save}>{this.state.isSaving? 'Saving...' : 'Save sector'}</Button>
          </Button.Group>
        </Form>
      </>
    );
  }
}

export default withRouter(SectorEdit);
