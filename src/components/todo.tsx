import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { Image, Button, List, Header, Segment } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getTodo, getImageUrl, postTodo } from '../api';

const Todo = ({ match }) => {
  const { accessToken } = useAuth0();
  const [data, setData] = useState();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const id = match.params.userId? match.params.userId : "-1";
    getTodo(accessToken, id).then((data) => setData(data));
  }, [accessToken]);

  function move(up: boolean, ix : number) {
    setSaving(true);
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
    postTodo(accessToken, a.id, a.problemId, a.priority, false)
    .then((response) => {
      postTodo(accessToken, b.id, b.problemId, b.priority, false)
      .then((response) => {
        data.todo.sort((a, b) => a.priority-b.priority);
        setSaving(false);
        setData(data);
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

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  return (
    <>
      <MetaTags>
        <title>{data.metadata.title}</title>
        <meta name="description" content={data.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={data.metadata.description} />
        <meta property="og:url" content={data.metadata.og.url} />
        <meta property="og:title" content={data.metadata.title} />
        <meta property="og:image" content={data.metadata.og.image} />
        <meta property="og:image:width" content={data.metadata.og.imageWidth} />
        <meta property="og:image:height" content={data.metadata.og.imageHeight} />
        <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
      </MetaTags>
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
                        <Button icon="arrow up" size="mini" disabled={i===0 || saving} onClick={() => move(true, i)} />
                        <Button icon="arrow down" size="mini" disabled={i===data.todo.length-1 || saving} onClick={() => move(false, i)} />
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
    </>
  );
}

export default Todo;
