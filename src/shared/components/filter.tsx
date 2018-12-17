import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Header, Segment, Form, Dropdown, Button, Checkbox, Icon, List, Image } from 'semantic-ui-react';
import { getImageUrl, postFilter } from '../api';
import { Stars, LockSymbol } from './common/widgets/widgets';

class Filter extends Component<any, any> {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    const hideTicked = data && data.metadata && data.metadata.isAuthenticated? true : false;
    this.state = {data, hideTicked, onlyWithMedia: false, onlyAdmin: false, onlySuperAdmin: false, isLoading: false, filterDisabled: true};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.props.fetchInitialData(this.props.auth.getAccessToken()).then((data) => this.setState(() => ({data})));
    }
  }

  onChangeGrades = (e, { value }) => this.setState({grades: value, filterDisabled: value.length==0})
  toggleHideTicked = () => this.setState({hideTicked: !this.state.hideTicked})
  toggleOnlyWithMedia = () => this.setState({onlyWithMedia: !this.state.onlyWithMedia})
  toggleOnlyAdmin = () => this.setState({onlyAdmin: !this.state.onlyAdmin, onlySuperAdmin: false})
  toggleOnlySuperAdmin = () => this.setState({onlySuperAdmin: !this.state.onlySuperAdmin, onlyAdmin: false})

  filter = () => {
    this.setState( {isLoading: true, filterDisabled: true} );
    postFilter(this.props.auth.getAccessToken(), this.state.grades).then((res) => {
      this.setState({ filterResponse: res, isLoading: false });
    });
  }

  render() {
    const { data, filterResponse, filterDisabled, hideTicked, onlyWithMedia, onlyAdmin, onlySuperAdmin, isLoading } = this.state;
    if (!data) {
      return <LoadingAndRestoreScroll />;
    }
    const gradeOptions = data.metadata.grades.map(g => ({key: g.id, value: g.id, text: g.grade}));
    var res = filterResponse && filterResponse.rows.filter(p => ( (!hideTicked || !p.ticked) && (!onlyWithMedia || p.randomMediaId>0) && (!onlyAdmin || p.problemVisibility===1) && (!onlySuperAdmin || p.problemVisibility===2) ))
    return (
      <>
        <Segment>
          <Header>Filter</Header>
          <Form>
            <Form.Field>
              <Dropdown placeholder="Select grade(s)" fluid multiple selection options={gradeOptions} onChange={this.onChangeGrades} />
            </Form.Field>
            <Form.Field>
              <Checkbox label="Hide ticked" onChange={this.toggleHideTicked} checked={this.state.hideTicked} disabled={!data.metadata.isAuthenticated} />
            </Form.Field>
            <Form.Field>
              <Checkbox label="Only with images/videos" onChange={this.toggleOnlyWithMedia} checked={this.state.onlyWithMedia} />
            </Form.Field>
            {data.metadata.isAdmin &&
              <Form.Field>
                <Checkbox label="Only admin" onChange={this.toggleOnlyAdmin} checked={this.state.onlyAdmin} />
              </Form.Field>
            }
            {data.metadata.isSuperAdmin &&
              <Form.Field>
                <Checkbox label="Only superadmin" onChange={this.toggleOnlySuperAdmin} checked={this.state.onlySuperAdmin} />
              </Form.Field>
            }
            <Button icon labelPosition='left' onClick={this.filter} disabled={filterDisabled} loading={isLoading}>
              <Icon name='filter' />
              Filter
            </Button>
          </Form>
        </Segment>
        {res && (
          <Segment>
            <Header as="h3">{res.length} {data.metadata.isBouldering? "Problems" : "Routes"}</Header>
            <Leaflet
              height='40vh'
              markers={res.filter(p => p.latitude!=0 && p.longitude!=0).map(p => ({lat: p.latitude, lng: p.longitude, label: p.problemName, url: '/problem/' + p.problemId}))}
              defaultCenter={data.metadata.defaultCenter}
              defaultZoom={data.metadata.defaultZoom}/>
            <List selection verticalAlign='middle'>
              {res.map((p, i) => (
                <List.Item key={i} as={Link} to={`/problem/${p.problemId}`}>
                  <Image avatar src={p.randomMediaId>0? getImageUrl(p.randomMediaId, 28) : '/png/image.png'} />
                  <List.Content>
                    <List.Header>
                      {p.problemName} {p.grade} <LockSymbol visibility={p.problemVisibility}/> <Stars numStars={p.stars} />
                    </List.Header>
                    <List.Description>
                      {p.areaName} <LockSymbol visibility={p.areaVisibility}/> / {p.sectorName} <LockSymbol visibility={p.sectorVisibility}/>
                    </List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Segment>
        )}
      </>
    )
  }
}

export default Filter;
