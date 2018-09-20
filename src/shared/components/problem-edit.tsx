import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Redirect } from 'react-router'
import { FormGroup, ControlLabel, FormControl, ButtonGroup, Button, DropdownButton, MenuItem, Well } from 'react-bootstrap';
import UserSelector from './common/user-selector/user-selector';
import ProblemSection from './common/problem-section/problem-section';
import ImageUpload from './common/image-upload/image-upload';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Leaflet from './common/leaflet/leaflet';
import { convertFromDateToString, convertFromStringToDate, postProblem } from './../api';

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

  onNameChanged(e) {
    const { data } = this.state;
    data.name = e.target.value;
    this.setState({data});
  }

  onNrChanged(e) {
    const { data } = this.state;
    data.nr = parseInt(e.target.value);
    this.setState({data});
  }

  onLatChanged(e) {
    const { data } = this.state;
    data.lat = parseFloat(e.target.value);
    this.setState({data});
  }

  onLngChanged(e) {
    const { data } = this.state;
    data.lng = parseFloat(e.target.value);
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

  onFaDateChanged(newFaDate) {
    const { data } = this.state;
    data.faDate = newFaDate? convertFromDateToString(newFaDate) : null;
    this.setState({data});
  }

  onOriginalGradeChanged(originalGrade, e) {
    const { data } = this.state;
    data.originalGrade = originalGrade;
    this.setState({data});
  }

  onTypeIdChanged(typeId, e) {
    const { data } = this.state;
    data.typeId = typeId;
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
      this.setState({pushUrl: "/problem/" + response.id});
    })
    .catch((error) => {
      console.warn(error);
      this.setState({error});
    });
  }

  onMapClick(event) {
    const { data } = this.state;
    data.lat = event.latlng.lat;
    data.lng = event.latlng.lng;
    this.setState({data});
  }

  onUsersUpdated(newUsers) {
    const { data } = this.state;
    data.fa = newUsers.map(u => {
      return {id: (typeof u.value === 'string' || u.value instanceof String)? -1 : u.value, firstname: u.label, surname: null};
    });
    this.setState({data});
  }

  onSectionsUpdated(sections) {
    const { data } = this.state;
    data.sections = sections;
    this.setState({data});
  }

  onCancel() {
    window.history.back();
  }

  render() {
    const { data } = this.state;
    if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    } else if (this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    } else if (!this.props || !this.props.match || !this.props.match.params || !this.props.match.params.problemId || !this.props.location || !this.props.location.query || !this.props.location.query.idSector) {
      return <span><h3>Invalid action...</h3></span>;
    } else if (!data) {
      return <center><FontAwesomeIcon icon="spinner" spin size="3x" /></center>;
    } else if (!data.metadata.isAdmin) {
      this.setState({pushUrl: "/login", error: null});
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    var visibilityText = 'Visible for everyone';
    if (data.visibility===1) {
      visibilityText = 'Only visible for administrators';
    } else if (data.visibility===2) {
      visibilityText = 'Only visible for super administrators';
    }

    const selectedType = data.typeId? data.metadata.types.find(t => t.id === data.typeId) : data.metadata.types[0];
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

    var sections = null;
    if (!data.metadata.isBouldering) {
      sections = (
        <FormGroup controlId="formControlsSections">
          <ControlLabel>Section(s)</ControlLabel><br/>
          <ProblemSection sections={data.sections} grades={data.metadata.grades} onSectionsUpdated={this.onSectionsUpdated.bind(this)} />
        </FormGroup>
      );
    }
    return (
      <React.Fragment>
        <MetaTags>
          <title>{data.metadata.title}</title>
        </MetaTags>
        <Well>
          <form onSubmit={this.save.bind(this)}>
            <FormGroup controlId="formControlsName">
              <ControlLabel>Problem name</ControlLabel>
              <FormControl type="text" value={data.name} placeholder="Enter name" onChange={this.onNameChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsFaDate">
              <ControlLabel>FA date (yyyy-mm-dd)</ControlLabel><br/>
              <DayPickerInput
                format="LL"
                onDayChange={this.onFaDateChanged.bind(this)}
                value={convertFromStringToDate(data.faDate)}
              /><br/>
              <ButtonGroup>
                <Button onClick={this.onFaDateChanged.bind(this, yesterday)}>Yesterday</Button>
                <Button onClick={this.onFaDateChanged.bind(this, new Date())}>Today</Button>
              </ButtonGroup>
            </FormGroup>
            <FormGroup controlId="formControlsTypeId">
              <ControlLabel>Type</ControlLabel><br/>
              <DropdownButton title={selectedType.type + (selectedType.subType? " - " + selectedType.subType : "")} id="bg-nested-dropdown">
                {data.metadata.types.map((t, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onTypeIdChanged.bind(this, t.id)}>{t.type} {t.subType? " - " + t.subType : ""}</MenuItem> })}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsGrade">
              <ControlLabel>Grade</ControlLabel><br/>
              <DropdownButton title={data.originalGrade} id="bg-nested-dropdown">
                {data.metadata.grades.map((g, i) => { return <MenuItem key={i} eventKey={i} onSelect={this.onOriginalGradeChanged.bind(this, g.grade)}>{g.grade}</MenuItem> })}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsFA">
              <ControlLabel>FA</ControlLabel><br/>
              <UserSelector auth={this.props.auth} users={data.fa? data.fa.map(u => {return {value: u.id, label: u.firstname + " " + u.surname}}) : []} onUsersUpdated={this.onUsersUpdated.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsVisibility">
              <ControlLabel>Visibility</ControlLabel><br/>
              <DropdownButton title={visibilityText} id="bg-nested-dropdown">
                <MenuItem eventKey="0" onSelect={this.onVisibilityChanged.bind(this, 0)}>Visible for everyone</MenuItem>
                <MenuItem eventKey="1" onSelect={this.onVisibilityChanged.bind(this, 1)}>Only visible for administrators</MenuItem>
                {data.metadata.isSuperAdmin && <MenuItem eventKey="2" onSelect={this.onVisibilityChanged.bind(this, 2)}>Only visible for super administrators</MenuItem>}
              </DropdownButton>
            </FormGroup>
            <FormGroup controlId="formControlsSectorNr">
              <ControlLabel>Sector number</ControlLabel>
              <FormControl type="text" value={data.nr} placeholder="Enter sector number" onChange={this.onNrChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsComment">
              <ControlLabel>Comment</ControlLabel>
              <FormControl style={{height: '100px'}} componentClass="textarea" placeholder="Enter comment" value={data.comment} onChange={this.onCommentChanged.bind(this)} />
            </FormGroup>
            {sections}
            <FormGroup controlId="formControlsMedia">
              <ImageUpload auth={this.props.auth} onMediaChanged={this.onNewMediaChanged.bind(this)} />
            </FormGroup>
            <FormGroup controlId="formControlsMap">
              <ControlLabel>Click to mark problem on map</ControlLabel><br/>
              <Leaflet
                markers={data.lat!=0 && data.lng!=0 && [{lat: data.lat, lng: data.lng}]}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                onClick={this.onMapClick.bind(this)}
              />
              <ControlLabel>Latitude</ControlLabel>
              <FormControl type="text" value={data.lat} placeholder="Latitude" onChange={this.onLatChanged.bind(this)} />
              <ControlLabel>Longitude</ControlLabel>
              <FormControl type="text" value={data.lng} placeholder="Longitude" onChange={this.onLngChanged.bind(this)} />
            </FormGroup>
            <ButtonGroup><Button bsStyle="danger" onClick={this.onCancel.bind(this)}>Cancel</Button><Button type="submit" bsStyle="success" disabled={this.state.isSaving}>{this.state.isSaving? 'Saving...' : 'Save problem'}</Button></ButtonGroup>
          </form>
        </Well>
      </React.Fragment>
    );
  }
}

export default ProblemEdit;
