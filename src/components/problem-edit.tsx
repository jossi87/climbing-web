import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import UserSelector from './common/user-selector/user-selector';
import ProblemSection from './common/problem-section/problem-section';
import ImageUpload from './common/image-upload/image-upload';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { Icon, Form, Button, Input, Dropdown, TextArea, Segment, Message, Container, Checkbox } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getProblemEdit, convertFromDateToString, convertFromStringToDate, postProblem, getSector } from '../api';
import { LoadingAndRestoreScroll, InsufficientPrivileges } from './common/widgets/widgets';
import { useHistory, useParams, useLocation } from 'react-router-dom';

interface SectorIdProblemIdParams {
  sectorIdProblemId: string;
}
const ProblemEdit = () => {
  const { accessToken, loading, isAuthenticated, loginWithRedirect } = useAuth0();
  const [data, setData] = useState(null);
  const [sectorMarkers, setSectorMarkers] = useState(null);
  const [saving, setSaving] = useState(false);
  let { sectorIdProblemId } = useParams<SectorIdProblemIdParams>();
  let history = useHistory();
  let location = useLocation();
  useEffect(() => {
    if (sectorIdProblemId && accessToken) {
      getProblemEdit(accessToken, sectorIdProblemId).then((data) => setData(data));
    }
  }, [accessToken, sectorIdProblemId]);

  function onNameChanged(e, { value }) {
    setData(prevState => ({ ...prevState, name: value }));
  }

  function onNrChanged(e, { value }) {
    setData(prevState => ({ ...prevState, nr: value }));
  }

  function onLatChanged(e, { value }) {
    console.log(value.replace(',','.'));
    let lat = parseFloat(value);
    if (isNaN(lat)) {
      lat = 0;
    }
    setData(prevState => ({ ...prevState, lat }));
  }

  function onLngChanged(e, { value }) {
    let lng = parseFloat(value);
    if (isNaN(lng)) {
      lng = 0;
    }
    setData(prevState => ({ ...prevState, lng }));
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

  function onFaDateChanged(newFaDate) {
    let faDate = newFaDate? convertFromDateToString(newFaDate) : null;
    setData(prevState => ({ ...prevState, faDate }));
  }

  function onOriginalGradeChanged(e, { value }) {
    setData(prevState => ({ ...prevState, originalGrade: value }));
  }

  function onTypeIdChanged(e, { value }) {
    let typeId = parseInt(value);
    setData(prevState => ({ ...prevState, typeId }));
  }

  function onNewMediaChanged(newMedia) {
    setData(prevState => ({ ...prevState, newMedia }));
  }

  function onFaAidDateChanged(newFaDate) {
    let faDate = newFaDate? convertFromDateToString(newFaDate) : null;
    let faAid = data.faAid;
    data.faAid.date = faDate;
    setData(prevState => ({ ...prevState, faAid }));
  }

  function onFaAidDescriptionChanged(e, { value }) {
    let faAid = data.faAid;
    faAid.description = value;
    setData(prevState => ({ ...prevState, faAid }));
  }

  function onFaAidUsersUpdated(newUsers) {
    let fa = newUsers.map(u => {
      return {id: (typeof u.value === 'string' || u.value instanceof String)? -1 : u.value, name: u.label};
    });
    let faAid = data.faAid;
    faAid.users = fa;
    setData(prevState => ({ ...prevState, faAid }));
  }

  function save(event) {
    event.preventDefault();
    setSaving(true);
    postProblem(
      accessToken,
      data.sectorId,
      data.id,
      data.lockedAdmin,
      data.lockedSuperadmin,
      data.name,
      data.comment,
      data.originalGrade,
      data.fa,
      data.faDate,
      data.nr,
      (data.typeId? data.metadata.types.find(t => t.id === data.typeId) : data.metadata.types[0]),
      data.lat,
      data.lng,
      data.sections,
      data.newMedia,
      data.faAid)
    .then((response) => {
      history.push("/problem/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  function onMapClick(event) {
    setData(prevState => ({ ...prevState, lat: event.latlng.lat, lng: event.latlng.lng }));
  }

  function onUsersUpdated(newUsers) {
    let fa = newUsers.map(u => {
      return {id: (typeof u.value === 'string' || u.value instanceof String)? -1 : u.value, name: u.label};
    });
    setData(prevState => ({ ...prevState, fa }));
  }

  function onSectionsUpdated(sections) {
    setData(prevState => ({ ...prevState, sections }));
  }

  if (loading || (isAuthenticated && !data)) {
    return <LoadingAndRestoreScroll />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  } else if (!data.metadata.isAdmin) {
    return <InsufficientPrivileges />
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate()-1);
  var defaultCenter;
  var defaultZoom: number;
  if (data.lat!=0 && data.lng!=0) {
    defaultCenter = {lat: data.lat, lng: data.lng};
    defaultZoom = 15;
  }
  else {
    defaultCenter = data.metadata.defaultCenter;
    defaultZoom = data.metadata.defaultZoom;
  }
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

  //@ts-ignore
  let dayPicker = <DayPickerInput
      format="LL"
      onDayChange={onFaDateChanged}
      value={convertFromStringToDate(data.faDate)}
    />;
  //@ts-ignore
  let dayPickerAid = <DayPickerInput
    format="LL"
    onDayChange={onFaAidDateChanged}
    value={convertFromStringToDate(data.faAid? data.faAid.date : '')}
  />;

  let markers = [];
  if (data.lat!=0 && data.lng!=0) {
    markers.push({lat: data.lat, lng: data.lng});
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
        content={<><Icon name="info"/>Contact <a href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</a> if you want to delete or move {data.metadata.gradeSystem==='BOULDER'? "problem" : "route"} to an other sector.</>}
      />
      <Form>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Field
                label="Name"
                control={Input}
                placeholder="Enter name"
                value={data.name}
                onChange={onNameChanged}
                error={data.name? false : "Name required"}
              />
            <Form.Field
              label="Visibility"
              control={Dropdown}
              selection
              value={lockedValue}
              onChange={onLockedChanged}
              options={lockedOptions} />
            <Form.Field
              label="Number"
              control={Input}
              placeholder='Enter number'
              value={data.nr}
              onChange={onNrChanged} />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Field
              label="Grade"
              control={Dropdown}
              selection
              value={data.originalGrade}
              onChange={onOriginalGradeChanged}
              options={data.metadata.grades.map((g, i) => ({key: i, value: g.grade, text: g.grade}))}/>
            <Form.Field
              label="FA User(s)"
              control={UserSelector}
              isMulti={true}
              placeholder="Select user(s)"
              users={data.fa? data.fa.map(u => {return {value: u.id, label: u.name}}) : []} onUsersUpdated={onUsersUpdated} identity={null} />
            <Form.Field>
              <label>FA Date</label>
              {dayPicker}<br/>
              <Button.Group size="tiny">
                <Button onClick={() => onFaDateChanged(yesterday)}>Yesterday</Button>
                <Button onClick={() => onFaDateChanged(new Date())}>Today</Button>
              </Button.Group>
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
          <Form.Field>
            <label>Upload image(s) or embed video(s)</label><br/>
            <ImageUpload onMediaChanged={onNewMediaChanged} isMultiPitch={data.sections && data.sections.length>1} />
          </Form.Field>
        </Segment>
        
        {data.metadata.gradeSystem==='CLIMBING' &&
          <Segment>
            <Form.Field
              label="Type"
              control={Dropdown}
              selection
              value={data.typeId}
              onChange={onTypeIdChanged}
              options={data.metadata.types.map((t, i) => {
                const text = t.type + (t.subType? " - " + t.subType : "")
                return ({key: i, value: t.id, text: text});
              })}
              error={data.typeId? false : "Type required"}>
            </Form.Field>
            <Form.Field>
              <label>First AID ascent?</label>
              <Button.Group size="tiny">
                <Button onClick={() => setData(prevState => ({ ...prevState, faAid: {problemId: data.id, date: '', description: ''} }))} positive={data.faAid? true : false}>Yes</Button>
                <Button.Or />
                <Button onClick={() => setData(prevState => ({ ...prevState, faAid: null }))} positive={data.faAid? false : true}>No</Button>
              </Button.Group>
              {data.faAid &&
                <Container>
                  {dayPickerAid}
                  <TextArea placeholder='Enter description' style={{ minHeight: 75 }} value={data.faAid.description} onChange={onFaAidDescriptionChanged} />
                  <UserSelector isMulti={true} placeholder="Select user(s)" users={data.faAid.users? data.faAid.users.map(u => {return {value: u.id, label: u.name}}) : []} onUsersUpdated={onFaAidUsersUpdated} identity={null} />
                </Container>
              }
            </Form.Field>
            <Form.Field>
              <label>Pitches</label>
              <ProblemSection sections={data.sections} grades={data.metadata.grades} onSectionsUpdated={onSectionsUpdated} />
            </Form.Field>
          </Segment>
        }

        <Segment>
          <Form.Field>
            <label>Click to mark problem on map</label>
            <Leaflet
              autoZoom={true}
              markers={markers}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onClick={onMapClick}
              history={history}
              polylines={null}
              outlines={null}
              height={'300px'}
              showSateliteImage={true} 
              clusterMarkers={false}
            />
          </Form.Field>
          <Form.Group widths='equal'>
            <Form.Field>
              <label>Latitude</label>
              <Input placeholder='Latitude' value={data.lat} onChange={onLatChanged} />
            </Form.Field>
            <Form.Field>
              <label>Longitude</label>
              <Input placeholder='Longitude' value={data.lng} onChange={onLngChanged} />
            </Form.Field>
            <Form.Field>
              <label>Include all markers in sector</label>
              <Checkbox toggle onChange={(e,d) => {
                if (d.checked) {
                  let sectorIdProblemIdArray = sectorIdProblemId.split("-");
                  let sectorId = sectorIdProblemIdArray[0];
                  let problemId = sectorIdProblemIdArray[1];
                  getSector(accessToken, parseInt(sectorId)).then((data) => setSectorMarkers(data.problems.filter(p => p.lat>0 && p.lng>0 && p.id!=problemId).map(p => ({lat: p.lat, lng: p.lng, label: p.name}))));
                } else {
                  setSectorMarkers(null);
                }
              }} />
            </Form.Field>
          </Form.Group>
        </Segment>

        <Button.Group>
          <Button negative onClick={() => {
            let problemId = sectorIdProblemId.split("-")[1];
            if (problemId && problemId != '0') {
              history.push(`/problem/${problemId}`)
            } else {
              let sectorId = sectorIdProblemId.split("-")[0];
              history.push(`/sector/${sectorId}`)
            }
          }}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save} disabled={!data.name || (data.metadata.types.length > 1 && !data.typeId)}>Save</Button>
        </Button.Group>
      </Form>
    </>
  );
}

export default ProblemEdit;
