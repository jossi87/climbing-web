import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import ImageUpload from './common/image-upload/image-upload';
import Leaflet from './common/leaflet/leaflet';
import { Form, Button, Checkbox, Input, Dropdown, TextArea } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getAreaEdit, postArea } from '../api';
import { LoadingAndRestoreScroll, InsufficientPrivileges } from './common/widgets/widgets';
import { useHistory, useParams, useLocation } from 'react-router-dom';

const AreaEdit = () => {
  const { accessToken, loading, isAuthenticated, loginWithRedirect } = useAuth0();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  let { areaId } = useParams();
  let history = useHistory();
  let location = useLocation();
  useEffect(() => {
    if (!loading && areaId && accessToken) {
      getAreaEdit(accessToken, parseInt(areaId)).then((data) => setData(data));
    }
  }, [accessToken, areaId, loading]);

  function onNameChanged(e, { value }) {
    setData(prevState => ({ ...prevState, name: value }));
  }

  function onVisibilityChanged(e, { value }) {
    setData(prevState => ({ ...prevState, visibility: value }));
  }

  function onCommentChanged(e, { value }) {
    setData(prevState => ({ ...prevState, comment: value }));
  }

  function onNewMediaChanged(newMedia) {
    setData(prevState => ({ ...prevState, newMedia }));
  }

  function save(event) {
    event.preventDefault();
    setSaving(true);
    postArea(accessToken, data.id, data.visibility, data.forDevelopers, data.name, data.comment, data.lat, data.lng, data.newMedia)
    .then((response) => {
      history.push("/area/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  function onMarkerClick(event) {
    setData(prevState => ({ ...prevState, lat: event.latlng.lat, lng: event.latlng.lng }));
  }

  if (loading || (isAuthenticated && !data)) {
    return <LoadingAndRestoreScroll />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  } else if (!data.metadata.isAdmin) {
    return <InsufficientPrivileges />
  }
  const defaultCenter = data.lat && data.lng && parseFloat(data.lat)>0? {lat: parseFloat(data.lat), lng: parseFloat(data.lng)} : data.metadata.defaultCenter;
  const defaultZoom: number = data.lat && parseFloat(data.lat)>0? 8 : data.metadata.defaultZoom;
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
          <label>For developers</label>
          <Checkbox label="For developers" checked={data.forDevelopers} onChange={() => setData(prevState => ({ ...prevState, forDevelopers: !data.forDevelopers }))} />
        </Form.Field>
        <Form.Field>
          <label>Upload image(s)</label>
          <ImageUpload onMediaChanged={onNewMediaChanged} isMultiPitch={false} />
        </Form.Field>
        <Form.Field>
          <label>Click to mark area center on map</label>
          <Leaflet
            markers={data.lat!=0 && data.lng!=0 && [{lat: data.lat, lng: data.lng}]}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            onClick={onMarkerClick}
            history={history}
            polylines={null}
            outlines={null}
            height={null}
          />
        </Form.Field>
        <Button.Group>
          <Button negative onClick={() => {
            if (areaId && areaId != '-1') {
              history.push(`/area/${areaId}`);
            } else {
              history.push(`/browse`);
            }
          }}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save}>Save area</Button>
        </Button.Group>
      </Form>
    </>
  );
}

export default AreaEdit;
