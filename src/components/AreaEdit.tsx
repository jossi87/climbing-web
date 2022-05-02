import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import ImageUpload from './common/image-upload/image-upload';
import Leaflet from './common/leaflet/leaflet';
import { Form, Button, Checkbox, Input, Dropdown, TextArea, Segment, Icon, Message, Accordion } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getAreaEdit, postArea } from '../api';
import { Loading, InsufficientPrivileges } from './common/widgets/widgets';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const AreaEdit = () => {
  const { accessToken, loading, isAuthenticated, loginWithRedirect } = useAuth0();
  const [data, setData] = useState(null);
  const [showSectorOrder, setShowSectorOrder] = useState(false);
  const [saving, setSaving] = useState(false);
  let { areaId } = useParams();
  let navigate = useNavigate();
  let location = useLocation();
  useEffect(() => {
    if (!loading && areaId && accessToken) {
      getAreaEdit(accessToken, parseInt(areaId)).then((data) => setData(data));
    }
  }, [accessToken, areaId, loading]);

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
    if (!trash || confirm("Are you sure you want to move area to trash?")) {
      setSaving(true);
      postArea(accessToken, data.id, data.trash, data.lockedAdmin, data.lockedSuperadmin, data.forDevelopers, data.name, data.comment, data.lat, data.lng, data.newMedia, data.sectorOrder)
      .then((data) => {
        navigate(data.destination);
      })
      .catch((error) => {
        console.warn(error);
      });
    }
  }

  function onMarkerClick(event) {
    setData(prevState => ({ ...prevState, lat: event.latlng.lat, lng: event.latlng.lng }));
  }

  if (loading || (isAuthenticated && !data)) {
    return <Loading />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  } else if (!data.metadata.isAdmin) {
    return <InsufficientPrivileges />
  }
  const defaultCenter = data.lat && data.lng && parseFloat(data.lat)>0? {lat: parseFloat(data.lat), lng: parseFloat(data.lng)} : data.metadata.defaultCenter;
  const defaultZoom: number = data.lat && parseFloat(data.lat)>0? 8 : data.metadata.defaultZoom;
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

  const orderForm = data.sectorOrder?.length>1 && (
    <Form>
      {data.sectorOrder.map((s, i) => (
        <Form.Group widths={2} inline key={i} active>
          <Form.Field>
            <Input size="mini" icon="hashtag" iconPosition="left" fluid placeholder='Number' value={s.sorting} onChange={(e, { value }) => {
              let sectorOrder = data.sectorOrder;
              if (sectorOrder[i].origSorting === undefined) {
                sectorOrder[i].origSorting = sectorOrder[i].sorting;
              }
              sectorOrder[i].sorting = parseInt(value) || 0;
              setData(prevState => ({ ...prevState, sectorOrder }));
            }} />
          </Form.Field>
          <Form.Field>
            {s.name}
          </Form.Field>
          <Form.Field>
            {s.origSorting && s.sorting!=s.origSorting && "Changed"}
          </Form.Field>
        </Form.Group>
      ))}
    </Form>
  );

  return (
    <>
      <MetaTags>
        <title>{data.metadata.title}</title>
      </MetaTags>
      <Message
        size="tiny"
        content={<><Icon name="info"/>Contact <a href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</a> if you want to split area.</>}
      />
      <Form>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Field
              label="Area name"
              control={Input}
              placeholder="Enter name"
              value={data.name}
              onChange={onNameChanged}
              error={data.name? false : "Area name required"}
            />
            <Form.Field
              label="Visibility"
              control={Dropdown}
              selection
              value={lockedValue}
              onChange={onLockedChanged}
              options={lockedOptions} />
            <Form.Field>
              <label>For developers</label>
              <Checkbox toggle checked={data.forDevelopers} onChange={() => setData(prevState => ({ ...prevState, forDevelopers: !data.forDevelopers }))} />
            </Form.Field>
            <Form.Field>
              <label>Move to trash</label>
              <Checkbox disabled={!data.id || data.id<=0} toggle checked={data.trash} onChange={() => setData(prevState => ({ ...prevState, trash: !data.trash }))} />
            </Form.Field>
          </Form.Group>
          <Form.Field>
            <label>Description (supports remarkable formatting, more info <a href="https://jonschlinkert.github.io/remarkable/demo/" rel="noreferrer noopener" target="_blank">here</a>)</label>
            <TextArea placeholder='Enter description' style={{ minHeight: 100 }} value={data.comment} onChange={onCommentChanged} />
          </Form.Field>
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
          <Form.Field>
            <label>Click to mark area center on map</label>
            <Leaflet
              autoZoom={true}
              markers={data.lat!=0 && data.lng!=0 && [{lat: data.lat, lng: data.lng}]}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onClick={onMarkerClick}
              navigate={navigate}
              polylines={null}
              outlines={null}
              height={'300px'}
              showSateliteImage={true} 
              clusterMarkers={false}
              rocks={null}
            />
          </Form.Field>
        </Segment>

        {orderForm &&
          <Segment>
            <Accordion>
              <Accordion.Title active={showSectorOrder} onClick={() => setShowSectorOrder(!showSectorOrder)}>
                <Icon name='dropdown' />
                Change order of sectors in area
              </Accordion.Title>
              <Accordion.Content active={showSectorOrder} content={orderForm}/>
            </Accordion>
          </Segment>
        }

        <Button.Group>
          <Button negative onClick={() => {
            if (areaId && areaId != '-1') {
              navigate(`/area/${areaId}`);
            } else {
              navigate(`/browse`);
            }
          }}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save} disabled={!data.name}>Save area</Button>
        </Button.Group>
      </Form>
    </>
  );
}

export default AreaEdit;
