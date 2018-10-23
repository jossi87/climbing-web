import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Header, Segment, Form, Dropdown, Button, Checkbox, Icon, List, Image, Rating } from 'semantic-ui-react';
import { getImageUrl, postFilter } from '../api';
import { LockSymbol } from './common/widgets/widgets';

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
    this.state = {data, hideTicked, onlyWithMedia: false};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.props.fetchInitialData(this.props.auth.getAccessToken()).then((data) => this.setState(() => ({data})));
    }
  }

  onChangeGrades = (e, { value }) => this.setState({grades: value})
  toggleHideTicked = () => this.setState({hideTicked: !this.state.hideTicked})
  toggleOnlyWithMedia = () => this.setState({onlyWithMedia: !this.state.onlyWithMedia})

  filter = () => {
    this.setState( {isLoading: true} );
    postFilter(this.props.auth.getAccessToken(), this.state.grades).then((res) => {
      this.setState({ results: res, isLoading: false });
    });
  }

  render() {
    const { data, results, grades, hideTicked, onlyWithMedia, isLoading } = this.state;
    if (!data) {
      return <LoadingAndRestoreScroll />;
    }
    const gradeOptions = data.metadata.grades.map(g => ({key: g.id, value: g.id, text: g.grade}));
    var res = results && results.filter(p => ( (!hideTicked || !p.ticked) && (!onlyWithMedia || p.randomMediaId>0) ))
    return (
      <>
        <Header>Filter</Header>
        <Segment>
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
            <Button icon labelPosition='left' onClick={this.filter} disabled={!grades || grades.length==0} loading={isLoading}>
              <Icon name='filter' />
              Filter
            </Button>
          </Form>
        </Segment>
        {res && (
          <>
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
                      {p.problemName} {p.grade} <LockSymbol visibility={p.problemVisibility}/> <Rating defaultRating={p.stars} maxRating={p.stars} disabled />
                    </List.Header>
                    <List.Description>
                      {p.areaName} <LockSymbol visibility={p.areaVisibility}/> / {p.sectorName} <LockSymbol visibility={p.sectorVisibility}/>
                    </List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </>
        )}
      </>
    )
  }
}

export default Filter;
