import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router'
import UserSelector from './common/user-selector/user-selector';
import ProblemSection from './common/problem-section/problem-section';
import ImageUpload from './common/image-upload/image-upload';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { Form, Button, Input, Dropdown, TextArea } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { convertFromDateToString, convertFromStringToDate, postProblem } from './../api';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';

class ProblemEdit extends Component<any, any> {
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
      this.refresh(this.props.match.params.problemId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.problemId !== this.props.match.params.problemId) {
      this.refresh(this.props.match.params.problemId);
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

  onNrChanged = (e, { value }) => {
    const { data } = this.state;
    data.nr = parseInt(value);
    this.setState({data});
  }

  onLatChanged = (e, { value }) => {
    const { data } = this.state;
    data.lat = parseFloat(value);
    this.setState({data});
  }

  onLngChanged = (e, { value }) => {
    const { data } = this.state;
    data.lng = parseFloat(value);
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

  onFaDateChanged = (newFaDate) => {
    const { data } = this.state;
    data.faDate = newFaDate? convertFromDateToString(newFaDate) : null;
    this.setState({data});
  }

  onOriginalGradeChanged = (e, { value }) => {
    const { data } = this.state;
    data.originalGrade = value;
    this.setState({data});
  }

  onTypeIdChanged = (e, { value }) => {
    const { data } = this.state;
    data.typeId = parseInt(value);
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
    const { data } = this.state;
    postProblem(
      this.props.auth.getAccessToken(),
      this.props.location.query.idSector,
      data.id,
      data.visibility,
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
      data.newMedia)
    .then((response) => {
      this.props.history.push("/problem/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  onMapClick = (event) => {
    const { data } = this.state;
    data.lat = event.latlng.lat;
    data.lng = event.latlng.lng;
    this.setState({data});
  }

  onUsersUpdated = (newUsers) => {
    const { data } = this.state;
    data.fa = newUsers.map(u => {
      return {id: (typeof u.value === 'string' || u.value instanceof String)? -1 : u.value, name: u.label};
    });
    this.setState({data});
  }

  onSectionsUpdated = (sections) => {
    const { data } = this.state;
    data.sections = sections;
    this.setState({data});
  }

  onCancel = () => {
    window.history.back();
  }

  render() {
    const { data } = this.state;
    if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.problemId || !this.props.location || !this.props.location.query || !this.props.location.query.idSector) {
      return <span><h3>Invalid action...</h3></span>;
    } else if (!data) {
      return <LoadingAndRestoreScroll />;
    } else if (!data.metadata.isAdmin) {
      this.props.history.push("/login");
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);
    var defaultCenter;
    var defaultZoom: number;
    if (data.lat!=0 && data.lng!=0) {
      defaultCenter = {lat: data.lat, lng: data.lng};
      defaultZoom = 15;
    }
    else if (this.props.location.query.lat && parseFloat(this.props.location.query.lat)>0) {
      defaultCenter = {lat: parseFloat(this.props.location.query.lat), lng: parseFloat(this.props.location.query.lng)};
      defaultZoom = 14;
    }
    else {
      defaultCenter = data.metadata.defaultCenter;
      defaultZoom = data.metadata.defaultZoom;
    }
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
            <label>Name</label>
            <Input placeholder='Enter name' value={data.name} onChange={this.onNameChanged} />
          </Form.Field>
          <Form.Field>
            <label>FA date (yyyy-mm-dd)</label>
            <DayPickerInput
              format="LL"
              onDayChange={this.onFaDateChanged}
              value={convertFromStringToDate(data.faDate)}
            /><br/>
            <Button.Group>
              <Button onClick={() => this.onFaDateChanged(yesterday)}>Yesterday</Button>
              <Button onClick={() => this.onFaDateChanged(new Date())}>Today</Button>
            </Button.Group>
          </Form.Field>
          {data.metadata.types.length > 1 &&
            <Form.Field>
              <label>Type</label>
              <Dropdown selection value={data.typeId} onChange={this.onTypeIdChanged}
                options={data.metadata.types.map((t, i) => {
                  const text = t.type + (t.subType? " - " + t.subType : "")
                  return ({key: i, value: t.id, text: text});
                })}/>
            </Form.Field>
          }
          <Form.Field>
            <label>Grade</label>
            <Dropdown selection value={data.originalGrade} onChange={this.onOriginalGradeChanged}
              options={data.metadata.grades.map((g, i) => ({key: i, value: g.grade, text: g.grade}))}/>
          </Form.Field>
          <Form.Field>
            <label>FA</label>
            <UserSelector auth={this.props.auth} users={data.fa? data.fa.map(u => {return {value: u.id, label: u.name}}) : []} onUsersUpdated={this.onUsersUpdated} />
          </Form.Field>
          <Form.Field>
            <label>Visibility</label>
            <Dropdown selection value={this.state.data.visibility} onChange={this.onVisibilityChanged} options={visibilityOptions}/>
          </Form.Field>
          <Form.Field>
            <label>Sector number</label>
            <Input placeholder='Enter number' value={data.nr} onChange={this.onNrChanged} />
          </Form.Field>
          <Form.Field>
            <label>Comment</label>
            <TextArea placeholder='Enter comment' style={{ minHeight: 100 }} value={data.comment} onChange={this.onCommentChanged} />
          </Form.Field>
          {!data.metadata.isBouldering &&
            <Form.Field>
              <label>Pitches</label>
              <ProblemSection sections={data.sections} grades={data.metadata.grades} onSectionsUpdated={this.onSectionsUpdated} />
            </Form.Field>
          }
          <Form.Field>
            <ImageUpload auth={this.props.auth} onMediaChanged={this.onNewMediaChanged} />
          </Form.Field>
          <Form.Field>
            <label>Click to mark problem on map</label><br/>
            <Leaflet
              markers={data.lat!=0 && data.lng!=0 && [{lat: data.lat, lng: data.lng}]}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onClick={this.onMapClick}
            />
          </Form.Field>
          <Form.Field>
            <label>Latitude</label>
            <Input placeholder='Latitude' value={data.lat} onChange={this.onLatChanged} />
          </Form.Field>
          <Form.Field>
            <label>Longitude</label>
            <Input placeholder='Longitude' value={data.lng} onChange={this.onLngChanged} />
          </Form.Field>
          <Button.Group>
            <Button negative onClick={this.onCancel}>Cancel</Button>
            <Button.Or />
            <Button positive disabled={this.state.isSaving} onClick={this.save}>{this.state.isSaving? 'Saving...' : 'Save'}</Button>
          </Button.Group>
        </Form>
      </>
    );
  }
}

export default withRouter(ProblemEdit);
