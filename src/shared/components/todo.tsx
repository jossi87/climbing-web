import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { Image, Button, List, Header, Segment } from 'semantic-ui-react';
import { postTodo } from './../api';

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
            <List selection>
              {data.todo.map((p, i) => (
                <List.Item key={i}>
                  <List.Header>
                    {!data.readOnly &&
                      <>
                        <Button icon="arrow up" size="mini" disabled={i===0 || this.state.isSaving} onClick={() => this.move(true, i)} />
                        <Button icon="arrow down" size="mini" disabled={i===data.todo.length-1 || this.state.isSaving} onClick={() => this.move(false, i)} />
                      </>
                    }
                    {' '}<Link to={`/problem/${p.problemId}`}>{p.problemName}</Link>
                    {' '}{p.problemGrade}
                    {' '}<LockSymbol visibility={p.problemVisibility}/>
                    {' '}<small>({p.areaName} / {p.sectorName})</small>
                  </List.Header>
                </List.Item>
              ))}
            </List>
            :
            <i>Empty list</i>
          }
        </Segment>
      </React.Fragment>
    );
  }
}

export default Todo;
