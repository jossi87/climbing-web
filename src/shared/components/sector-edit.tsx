import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Redirect } from 'react-router';
import ImageUpload from './common/image-upload/image-upload';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Container } from 'semantic-ui-react';
import { postSector } from './../api';
import Leaflet from './common/leaflet/leaflet';

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
    this.state = {data, ctrl: false};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.sectorId);
    }
    if (document) {
      document.addEventListener("keydown", this.handleKeyDown.bind(this));
      document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
  }

  componentWillUnmount() {
    if (document) {
      document.removeEventListener("keydown", this.handleKeyDown.bind(this));
      document.removeEventListener("keyup", this.handleKeyUp.bind(this));
    }
  }

  handleKeyDown(e) {
    if (e.ctrlKey) this.setState({ctrl: true});
  };

  handleKeyUp(e) {
    if (!e.ctrlKey) this.setState({ctrl: false});
  };

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
    const { data, ctrl } = this.state;
    if (ctrl) {
      const coords = event.latlng.lat + "," + event.latlng.lng;
      if (data.polygonCoords) {
        data.polygonCoords = data.polygonCoords + ";" + coords;
      } else {
        data.polygonCoords = coords;
      }
    } else {
      data.lat = event.latlng.lat;
      data.lng = event.latlng.lng;
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
      return <LoadingAndRestoreScroll />;
    } else if (!this.state.data.metadata.isAdmin) {
      this.setState({pushUrl: "/login", error: null});
    }

    const polygon = this.state.data.polygonCoords && this.state.data.polygonCoords.split(";").map((c, i) => {
      const latLng = c.split(",");
      return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
    });

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
        <Container>
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
              <ControlLabel>Left mouse button to position parking coordinate, press and hold ctrl-key to add polygon points (sector outline)</ControlLabel><br/>
              <Leaflet
                markers={this.state.data.lat!=0 && this.state.data.lng!=0 && [{lat: this.state.data.lat, lng: this.state.data.lng, isParking: true}]}
                outlines={polygon && [{polygon: polygon}]}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                onClick={this.onMapClick.bind(this)}
              />
            </FormGroup>
            <ButtonGroup>
              <Button bsStyle="warning" onClick={this.resetMapPolygon.bind(this)}>Clear polygon</Button>
              <Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button>
              <Button type="submit" bsStyle="success" disabled={this.state.isSaving}>{this.state.isSaving? 'Saving...' : 'Save sector'}</Button>
            </ButtonGroup>
          </form>
        </Container>
      </React.Fragment>
    );
  }
}

export default SectorEdit;
