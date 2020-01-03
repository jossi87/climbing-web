import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import ImageUpload from './common/image-upload/image-upload';
import Leaflet from './common/leaflet/leaflet';
import { Form, Button, Input, Dropdown, TextArea } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getAreaEdit, postArea } from '../api';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import history from '../utils/history';

const AreaEdit = ({ location, match }) => {
  const { accessToken } = useAuth0();
  const [data, setData] = useState();
  const [forceUpdate, setForceUpdate] = useState(1);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const id = match.params.areaId;
    if (id && accessToken) {
      getAreaEdit(accessToken, id).then((data) => setData(data));
    }
  }, [accessToken, match]);

  function onNameChanged(e, { value }) {
    data.name = value;
    setData(data);
    setForceUpdate(forceUpdate+1);
  }

  function onVisibilityChanged(e, { value }) {
    data.visibility = value;
    setData(data);
    setForceUpdate(forceUpdate+1);
  }

  function onCommentChanged(e, { value }) {
    data.comment = value;
    setData(data);
    setForceUpdate(forceUpdate+1);
  }

  function onNewMediaChanged(newMedia) {
    data.newMedia = newMedia;
    setData(data);
    setForceUpdate(forceUpdate+1);
  }

  function save(event) {
    event.preventDefault();
    setSaving(true);
    postArea(accessToken, data.id, data.visibility, data.name, data.comment, data.lat, data.lng, data.newMedia)
    .then((response) => {
      history.push("/area/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  function onMarkerClick(event) {
    data.lat = event.latlng.lat;
    data.lng = event.latlng.lng;
    setData(data);
    setForceUpdate(forceUpdate+1);
  }

  function onCancel() {
    window.history.back();
  }

  if (!data) {
    return <LoadingAndRestoreScroll />;
  } else if (!data) {
    return <LoadingAndRestoreScroll />;
  } else if (!data.metadata.isAdmin) {
    history.push("/login");
  }
  const defaultCenter = location && location.query && location.query.lat && parseFloat(location.query.lat)>0? {lat: parseFloat(location.query.lat), lng: parseFloat(location.query.lng)} : data.metadata.defaultCenter;
  const defaultZoom: number = location && location.query && location.query.lat && parseFloat(location.query.lat)>0? 8 : data.metadata.defaultZoom;
  const visibilityOptions = [
    {key: 0, value: 0, text: "Visible for everyone"},
    {key: 1, value: 1, text: "Only visible for administrators"}
  ];
  if (data.metadata.isSuperAdmin) {
    visibilityOptions.push({key: 2, value: 2, text: "Only visible for super administrators"})
  }
  return (
    <>
      <MetaTags>
        <title>{data.metadata.title}</title>
      </MetaTags>
      <Form>
        <Form.Field>
          <label>Area name</label>
          <Input placeholder='Enter name' value={data.name} onChange={onNameChanged} />
        </Form.Field>
        <Form.Field>
          <label>Comment</label>
          <TextArea placeholder='Enter comment' style={{ minHeight: 100 }} value={data.comment} onChange={onCommentChanged} />
        </Form.Field>
        <Form.Field>
          <label>Visibility</label>
          <Dropdown selection value={data.visibility} onChange={onVisibilityChanged} options={visibilityOptions}/>
        </Form.Field>
        <Form.Field>
          <label>Upload image(s)</label>
          <ImageUpload onMediaChanged={onNewMediaChanged} />
        </Form.Field>
        <Form.Field>
          <label>Click to mark area center on map</label>
          <Leaflet
            markers={data.lat!=0 && data.lng!=0 && [{lat: data.lat, lng: data.lng}]}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            onClick={onMarkerClick}
          />
        </Form.Field>
        <Button.Group>
          <Button negative onClick={onCancel}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save}>Save area</Button>
        </Button.Group>
      </Form>
    </>
  );
}

export default AreaEdit;
