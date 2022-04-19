import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import ImageUpload from './common/image-upload/image-upload';
import { Loading, InsufficientPrivileges } from './common/widgets/widgets';
import { Checkbox, Form, Button, Input, Dropdown, TextArea, Segment, Icon, Message } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSectorEdit, postSector, getSector } from '../api';
import Leaflet from './common/leaflet/leaflet';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const SectorEdit = () => {
  const { accessToken, loading, isAuthenticated, loginWithRedirect } = useAuth0();
  const [leafletMode, setLeafletMode] = useState('PARKING');
  const [data, setData] = useState(null);
  const [sectorMarkers, setSectorMarkers] = useState(null);
  const [saving, setSaving] = useState(false);
  let { areaIdSectorId } = useParams();
  let navigate = useNavigate();
  let location = useLocation();
  useEffect(() => {
    if (areaIdSectorId && accessToken) {
      getSectorEdit(accessToken, areaIdSectorId).then((data) => setData(data));
    }
  }, [accessToken, areaIdSectorId]);

  function onNameChanged(e, { value }) {
    setData(prevState => ({ ...prevState, name: value }));
  }

  function onLockedChanged(e, { value }) {
    setData(prevState => ({
      ...prevState,
      lockedAdmin: value == 1,
      lockedSuperadmin: value == 2
    }));
  }

  function onCommentChanged(e, { value }) {
    setData(prevState => ({ ...prevState, comment: value }));
  }

  function onNewMediaChanged(newMedia) {
    setData(prevState => ({ ...prevState, newMedia }));
  }

  function save(event) {
    event.preventDefault();
    const trash = data.trash? true : false;
    if (!trash || confirm("Are you sure you want to move sector to trash?")) {
      setSaving(true);
      postSector(accessToken, data.areaId, data.id, data.trash, data.lockedAdmin, data.lockedSuperadmin, data.name, data.comment, data.lat, data.lng, data.polygonCoords, data.polyline, data.newMedia)
      .then((data) => {
        navigate(data.destination);
      })
      .catch((error) => {
        console.warn(error);
      });
    }
  }

  function onMapClick(event) {
    if (leafletMode == 'PARKING') {
      setData(prevState => ({ ...prevState, lat: event.latlng.lat, lng: event.latlng.lng, latStr: event.latlng.lat, lngStr: event.latlng.lng }));
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

  function onLatChanged(e, { value }) {
    let latStr = value.replace(",",".");
    let lat = parseFloat(latStr);
    if (isNaN(lat)) {
      lat = 0;
      latStr = '';
    }
    setData(prevState => ({ ...prevState, lat, latStr }));
  }

  function onLngChanged(e, { value }) {
    let lngStr = value.replace(",",".");
    let lng = parseFloat(lngStr);
    if (isNaN(lng)) {
      lng = 0;
      lngStr = '';
    }
    setData(prevState => ({ ...prevState, lng, lngStr }));
  }

  if (loading || (isAuthenticated && !data)) {
    return <Loading />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  } else if (!data.metadata.isAdmin) {
    return <InsufficientPrivileges />
  }
  const polygon = data.polygonCoords && data.polygonCoords.split(";").map((c, i) => {
    const latLng = c.split(",");
    return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
  });
  const polyline = data.polyline && data.polyline.split(";").map(e => e.split(",").map(Number));
  const defaultCenter = data.lat && parseFloat(data.lat)>0? {lat: parseFloat(data.lat), lng: parseFloat(data.lng)} : data.metadata.defaultCenter;
  const defaultZoom = data.lat && parseFloat(data.lat)>0? 14 : data.metadata.defaultZoom;
  const lockedOptions = [
    {key: 0, value: 0, text: "Visible for everyone"},
    {key: 1, value: 1, text: "Only visible for administrators"}
  ];
  if (data.metadata.isSuperAdmin) {
    lockedOptions.push({key: 2, value: 2, text: "Only visible for super administrators"})
  }
  let lockedValue = 0;
  if (data.lockedSuperadmin) {
    lockedValue = 2;
  } else if (data.lockedAdmin) {
    lockedValue = 1;
  }
  let markers = [];
  if (data.lat!=0 && data.lng!=0) {
    markers.push({lat: data.lat, lng: data.lng, isParking: true});
  }
  if (sectorMarkers) {
    markers.push(...sectorMarkers);
  }
  return (
    <>
      <MetaTags>
        <title>{data.metadata.title}</title>
      </MetaTags>
      <Message
        size="tiny"
        content={<><Icon name="info"/>Contact <a href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</a> if you want to move or split sector.</>}
      />
      <Form>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Field
              label="Sector name"
              control={Input}
              placeholder="Enter name"
              value={data.name}
              onChange={onNameChanged}
              error={data.name? false : "Sector name required"}
            />
            <Form.Field
              label="Visibility"
              control={Dropdown}
              selection
              value={lockedValue}
              onChange={onLockedChanged}
              options={lockedOptions} />
            <Form.Field>
              <label>Move to trash</label>
              <Checkbox disabled={!data.id || data.id<=0} toggle checked={data.trash} onChange={() => setData(prevState => ({ ...prevState, trash: !data.trash }))} />
            </Form.Field>
          </Form.Group>
          <Form.Field
            label="Description"
            control={TextArea}
            placeholder='Enter description'
            style={{ minHeight: 100 }}
            value={data.comment}
            onChange={onCommentChanged} />
        </Segment>

        <Segment>
          <Form.Field
            label="Upload image(s)"
            control={ImageUpload}
            onMediaChanged={onNewMediaChanged}
            isMultiPitch={false}
            includeVideoEmbedder={false} />
        </Segment>

        <Segment>
          <Form.Group widths='equal'>
            <Form.Field>
              <Button.Group size="tiny" compact>
                <Button positive={leafletMode=='PARKING'} onClick={() => setLeafletMode("PARKING")}>Parking</Button>
                <Button positive={leafletMode=='POLYGON'} onClick={() => setLeafletMode("POLYGON")}>Outline</Button>
                <Button positive={leafletMode=='POLYLINE'} onClick={() => setLeafletMode("POLYLINE")}>Approach</Button>
                <Button color="orange" onClick={clearDrawing}>Reset selected</Button>
              </Button.Group>
            </Form.Field>
            <Form.Field>
              <Button size="tiny" compact positive={sectorMarkers != null} onClick={() => {
                if (sectorMarkers == null) {
                  let sectorId = areaIdSectorId.split("-")[1];
                  if (parseInt(sectorId)>0) {
                    getSector(accessToken, parseInt(sectorId)).then((data) => setSectorMarkers(data.problems.filter(p => p.lat>0 && p.lng>0).map(p => ({lat: p.lat, lng: p.lng, label: p.name}))));
                  }
                } else {
                  setSectorMarkers(null);
                }}}>Include all markers in sector
              </Button>
            </Form.Field>
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Field>
              <Leaflet
                autoZoom={true}
                markers={markers}
                outlines={polygon && [{polygon}]}
                polylines={polyline && [{polyline}]}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                onClick={onMapClick}
                navigate={navigate}
                height={'300px'}
                showSateliteImage={true} 
                clusterMarkers={false}
                rocks={null}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths='equal'>
            {leafletMode === 'PARKING' &&
              <>
                <Form.Field>
                  <label>Latitude</label>
                  <Input placeholder='Latitude' value={data.latStr} onChange={onLatChanged} />
                </Form.Field>
                <Form.Field>
                  <label>Longitude</label>
                  <Input placeholder='Longitude' value={data.lngStr} onChange={onLngChanged} />
                </Form.Field>
              </>
            }
            {leafletMode === 'POLYGON' &&
              <Form.Field>
                <label>Outline</label>
                <Input placeholder='Outline' value={data.polygonCoords} onChange={(e, { value }) => setData(prevState => ({ ...prevState, polygonCoords: value }))}/>
              </Form.Field>
            }
            {leafletMode === 'POLYLINE' &&
              <Form.Field>
                <label>Approach</label>
                <Input placeholder='Approach' value={data.polyline} onChange={(e, { value }) => setData(prevState => ({ ...prevState, polyline: value }))}/>
              </Form.Field>
            }
          </Form.Group>
        </Segment>
        
        <Button.Group>
          <Button negative onClick={() => {
            let sectorId = areaIdSectorId.split("-")[1];
            if (sectorId != '0') {
              navigate(`/sector/${sectorId}`);
            } else {
              let areaId = areaIdSectorId.split("-")[0];
              navigate(`/area/${areaId}`);
            }
          }}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save} disabled={!data.name}>Save sector</Button>
        </Button.Group>
      </Form>
    </>
  );
}

export default SectorEdit;
