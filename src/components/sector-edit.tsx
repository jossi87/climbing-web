import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import ImageUpload from './common/image-upload/image-upload';
import { LoadingAndRestoreScroll, InsufficientPrivileges } from './common/widgets/widgets';
import { Form, Button, Input, Dropdown, TextArea } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSectorEdit, postSector } from './../api';
import Leaflet from './common/leaflet/leaflet';
import { useHistory, useParams, useLocation } from 'react-router-dom';

const SectorEdit = () => {
  const { accessToken, loading, isAuthenticated, loginWithRedirect } = useAuth0();
  const [leafletMode, setLeafletMode] = useState('PARKING');
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  let { areaIdSectorId } = useParams();
  let history = useHistory();
  let location = useLocation();
  useEffect(() => {
    if (areaIdSectorId && accessToken) {
      getSectorEdit(accessToken, areaIdSectorId).then((data) => setData(data));
    }
  }, [accessToken, areaIdSectorId]);

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
    postSector(accessToken, data.areaId, data.id, data.visibility, data.name, data.comment, data.lat, data.lng, data.polygonCoords, data.polyline, data.newMedia)
    .then((response) => {
      history.push("/sector/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  function onMapClick(event) {
    if (leafletMode == 'PARKING') {
      setData(prevState => ({ ...prevState, lat: event.latlng.lat, lng: event.latlng.lng }));
    } else if (leafletMode == 'POLYGON') {
      const coords = event.latlng.lat + "," + event.latlng.lng;
      let { polygonCoords } = data;
      if (polygonCoords) {
        polygonCoords = polygonCoords + ";" + coords;
      } else {
        polygonCoords = coords;
      }
      setData(prevState => ({ ...prevState, polygonCoords }));
    } else if (leafletMode == 'POLYLINE') {
      const coords = event.latlng.lat + "," + event.latlng.lng;
      let { polyline } = data;
      if (polyline) {
        polyline = polyline + ";" + coords;
      } else {
        polyline = coords;
      }
      setData(prevState => ({ ...prevState, polyline }));
    }
  }

  function clearDrawing() {
    if (leafletMode == 'PARKING') {
      setData(prevState => ({ ...prevState, lat: 0, lng: 0 }));
    } else if (leafletMode == 'POLYGON') {
      setData(prevState => ({ ...prevState, polygonCoords: null }));
    } else if (leafletMode == 'POLYLINE') {
      setData(prevState => ({ ...prevState, polyline: null }));
    }
  }

  if (loading || (isAuthenticated && !data)) {
    return <LoadingAndRestoreScroll />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  } else if (!data.metadata.isAdmin) {
    return <InsufficientPrivileges />
  }
  const polygon = data.polygonCoords && data.polygonCoords.split(";").map((c, i) => {
    const latLng = c.split(",");
    return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
  });
  const polyline = data.polyline && {
    label: "",
    polyline: data.polyline.split(";").map(e => {
      return e.split(",").map(Number);
    })
  };
  const defaultCenter = data.lat && parseFloat(data.lat)>0? {lat: parseFloat(data.lat), lng: parseFloat(data.lng)} : data.metadata.defaultCenter;
  const defaultZoom = data.lat && parseFloat(data.lat)>0? 14 : data.metadata.defaultZoom;
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
          <label>Sector name</label>
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
          <ImageUpload onMediaChanged={onNewMediaChanged} isMultiPitch={false} />
        </Form.Field>
        <Form.Field>
          <label>Draw mode (click on map to draw)</label>
          <Button.Group>
            <Button positive={leafletMode=='PARKING'} onClick={() => setLeafletMode("PARKING")}>Parking</Button>
            <Button positive={leafletMode=='POLYGON'} onClick={() => setLeafletMode("POLYGON")}>Sector outline (polygon)</Button>
            <Button positive={leafletMode=='POLYLINE'} onClick={() => setLeafletMode("POLYLINE")}>Path to sector (polyline)</Button>
            <Button negative onClick={clearDrawing}>Remove parking/polygon/polyline</Button>
          </Button.Group>
          <br/><br/>
          <Leaflet
            markers={data.lat!=0 && data.lng!=0 && [{lat: data.lat, lng: data.lng, isParking: true}]}
            outlines={polygon && [{polygon: polygon}]}
            polylines={polyline && [polyline]}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            onClick={onMapClick}
            history={history}
            height={null}
          />
        </Form.Field>
        <Button.Group>
          <Button negative onClick={() => history.push(`/sector/${areaIdSectorId.split("-")[1]}`)}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save}>Save sector</Button>
        </Button.Group>
      </Form>
    </>
  );
}

export default SectorEdit;
