import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Redirect } from 'react-router';
import ImageUpload from './common/image-upload/image-upload';
import Leaflet from './common/leaflet/leaflet';
import { Form, Button, Input, Dropdown, TextArea } from 'semantic-ui-react';
import { postArea } from './../api';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';

class AreaEdit extends Component<any, any> {
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
      this.refresh(this.props.match.params.areaId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.areaId !== this.props.match.params.areaId) {
      this.refresh(this.props.match.params.areaId);
    }
  }

  refresh(id) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), id).then((data) => this.setState(() => ({data})));
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
    postArea(this.props.auth.getAccessToken(), this.state.data.id, this.state.data.visibility, this.state.data.name, this.state.data.comment, this.state.data.lat, this.state.data.lng, this.state.data.newMedia)
    .then((response) => {
      this.setState({pushUrl: "/area/" + response.id});
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  onMarkerClick = (event) => {
    const { data } = this.state;
    data.lat = event.latlng.lat;
    data.lng = event.latlng.lng;
    this.setState({data});
  }

  onCancel = () => {
    window.history.back();
  }

  render() {
    if (this.state.error) {
      return <h3>{this.state.error.toString()}</h3>;
    } else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    } else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.areaId) {
      return <span><h3>Invalid action...</h3></span>;
    } else if (!this.state.data) {
      return <LoadingAndRestoreScroll />;
    } else if (!this.state.data.metadata.isAdmin) {
      this.setState({pushUrl: "/login", error: null});
    }
    const defaultCenter = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? {lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng)} : this.state.data.metadata.defaultCenter;
    const defaultZoom: number = this.props && this.props.location && this.props.location.query && this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0? 8 : this.state.data.metadata.defaultZoom;
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
            <label>Area name</label>
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
            <label>Click to mark area center on map</label>
            <Leaflet
              useOpenStreetMap={true}
              markers={this.state.data.lat!=0 && this.state.data.lng!=0 && [{lat: this.state.data.lat, lng: this.state.data.lng}]}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onClick={this.onMarkerClick}
            />
          </Form.Field>
          <Button.Group>
            <Button negative onClick={this.onCancel}>Cancel</Button>
            <Button.Or />
            <Button positive disabled={this.state.isSaving} onClick={this.save}>{this.state.isSaving? 'Saving...' : 'Save area'}</Button>
          </Button.Group>
        </Form>
      </>
    );
  }
}

export default AreaEdit;
