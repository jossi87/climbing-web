import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { Image, Button, List, Header, Segment } from 'semantic-ui-react';
import { getImageUrl, postTodo } from './../api';

class Todo extends Component<any, any> {
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
      this.refresh(this.props.match.params.userId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.userId !== this.props.match.params.userId) {
      this.refresh(this.props.match.params.userId);
    }
  }

  refresh(id) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), id).then((data) => this.setState(() => ({data})));
  }

  move = (up: boolean, ix : number) => {
    const { data } = this.state;
    this.setState({isSaving: true});
    let a;
    let b;
    if (up) {
      a = data.todo[ix-1];
      b = data.todo[ix];
    } else {
      a = data.todo[ix];
      b = data.todo[ix+1];
    }
    a.priority = a.priority+1;
    b.priority = b.priority-1;
    postTodo(this.props.auth.getAccessToken(), a.id, a.problemId, a.priority, false)
    .then((response) => {
      postTodo(this.props.auth.getAccessToken(), b.id, b.problemId, b.priority, false)
      .then((response) => {
        data.todo.sort((a, b) => a.priority-b.priority);
        this.setState({isSaving: false, data});
      })
      .catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    })
    .catch((error) => {
      console.warn(error);
      alert(error.toString());
    });
  }

  render() {
    const { data } = this.state;
    if (!data) {
      return <LoadingAndRestoreScroll />;
    }
    return (
      <React.Fragment>
        <Segment>
          <Header as="h2">
            {data.picture && <Image circular src={data.picture}/>} {data.name} (To-do list)
          </Header>
        </Segment>
        <Segment>
          {data.todo.length>0?
            <>
              <Leaflet
                height='40vh'
                markers={data.todo.filter(p => p.problemLat!=0 && p.problemLng!=0).map(p => ({lat: p.problemLat, lng: p.problemLng, label: p.problemName, url: '/problem/' + p.problemId}))}
                defaultCenter={data.metadata.defaultCenter}
                defaultZoom={data.metadata.defaultZoom}/>
              <List selection>
                {data.todo.map((p, i) => (
                  <List.Item key={i}>
                    <Image size="tiny" style={{maxHeight: '80px', objectFit: 'cover'}} src={p.randomMediaId? getImageUrl(p.randomMediaId, 80) : '/png/image.png'} />
                    <List.Content>
                      {!data.readOnly &&
                        <>
                          <Button icon="arrow up" size="mini" disabled={i===0 || this.state.isSaving} onClick={() => this.move(true, i)} />
                          <Button icon="arrow down" size="mini" disabled={i===data.todo.length-1 || this.state.isSaving} onClick={() => this.move(false, i)} />
                        </>
                      }
                      <List.Header>
                        {' '}<Link to={`/problem/${p.problemId}`}>{p.problemName}</Link>
                        {' '}{p.problemGrade}
                        {' '}<LockSymbol visibility={p.problemVisibility}/>
                      </List.Header>
                      <List.Content>
                        {p.areaName} / {p.sectorName}
                      </List.Content>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </>
            :
            <i>Empty list</i>
          }
        </Segment>
      </React.Fragment>
    );
  }
}

export default Todo;
