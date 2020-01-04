import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import ImageUpload from './common/image-upload/image-upload';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Form, Button, Input, Dropdown, TextArea } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSectorEdit, postSector } from './../api';
import Leaflet from './common/leaflet/leaflet';
import { useHistory } from 'react-router-dom';
import { useParams, useLocation } from 'react-router-dom';

const SectorEdit = () => {
  const { accessToken } = useAuth0();
  const [leafletMode, setLeafletMode] = useState('PARKING');
  const [data, setData] = useState();
  const [forceUpdate, setForceUpdate] = useState(1);
  const [saving, setSaving] = useState(false);
  let { sectorId } = useParams();
  let location = useLocation();
  let history = useHistory();
  useEffect(() => {
    if (sectorId && accessToken) {
      getSectorEdit(accessToken, parseInt(sectorId)).then((data) => setData(data));
    }
  }, [accessToken, sectorId]);

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
    postSector(accessToken, location.query.idArea, data.id, data.visibility, data.name, data.comment, data.lat, data.lng, data.polygonCoords, data.polyline, data.newMedia)
    .then((response) => {
      history.push("/sector/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  function onMapClick(event) {
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
    setData(data);
    setForceUpdate(forceUpdate+1);
  }

  function clearDrawing() {
    if (leafletMode == 'PARKING') {
      data.lat = 0;
      data.lng = 0;
    } else if (leafletMode == 'POLYGON') {
      data.polygonCoords = null;
    } else if (leafletMode == 'POLYLINE') {
      data.polyline = null;
    }
    setData(data);
    setForceUpdate(forceUpdate+1);
  }

  function onCancel() {
    window.history.back();
  }

  if (!data) {
    return <LoadingAndRestoreScroll />;
  } else if (!data.metadata.isAdmin) {
    return <span><h3>Not logged in</h3></span>;
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
  const defaultCenter = location && location.query && location.query.lat && parseFloat(location.query.lat)>0? {lat: parseFloat(location.query.lat), lng: parseFloat(location.query.lng)} : data.metadata.defaultCenter;
  const defaultZoom: number = location && location.query && location.query.lat && parseFloat(location.query.lat)>0? 14 : data.metadata.defaultZoom;
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
          <ImageUpload onMediaChanged={onNewMediaChanged} />
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
          />
        </Form.Field>
        <Button.Group>
          <Button negative onClick={onCancel}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save}>Save sector</Button>
        </Button.Group>
      </Form>
    </>
  );
}

export default SectorEdit;
