import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams, useHistory } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { Image, Card, List, Header, Segment } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getTodo, getImageUrl } from '../api';

interface UserParams {
  userId: string;
}
const Todo = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  let { userId } = useParams<UserParams>();
  let history = useHistory();
  useEffect(() => {
    if (!loading) {
      const id = userId? parseInt(userId) : -1;
      getTodo(accessToken, id).then((data) => setData(data));
    }
  }, [loading, accessToken, userId]);

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
          {data.picture && <Image circular src={data.picture}/>} 
          <Header.Content>
            {data.name} (To-do list)
            <Header.Subheader>{data.todo.length} {data.metadata.isBouldering? "problems" : "routes"}</Header.Subheader>
          </Header.Content>
        </Header>
        {data.todo.length>0?
          <>
            <Leaflet
              key={"todo="+userId} 
              autoZoom={true}
              height='40vh'
              markers={data.todo.filter(p => p.lat!=0 && p.lng!=0).map(p => ({lat: p.lat, lng: p.lng, label: p.problemName, url: '/problem/' + p.problemId}))}
              defaultCenter={data.metadata.defaultCenter}
              defaultZoom={data.metadata.defaultZoom}
              history={history}
              polylines={null}
              outlines={null}
              onClick={null}
              clusterMarkers={true}
              /><br/>
            <Card.Group doubling stackable itemsPerRow={4}>
              {data.todo.map((p, i) => (
                <Card key={i}>
                  <Card.Content>
                    <Image floated='right' size='mini' src={p.randomMediaId? getImageUrl(p.randomMediaId, 80) : '/png/image.png'} />
                    <Card.Header>
                      {' '}<Link to={`/problem/${p.problemId}`}>{p.problemName}</Link>
                      {' '}{p.problemGrade}
                      {' '}<LockSymbol lockedAdmin={p.problemLockedAdmin} lockedSuperadmin={p.problemLockedSuperadmin} />
                    </Card.Header>
                    <Card.Meta>{p.areaName} / {p.sectorName}</Card.Meta>
                    {p.partners && p.partners.length>0 &&
                      <Card.Description>
                        Also on todo-list:{' '}
                        <List horizontal>
                          {p.partners.map((u, i) =>
                            <List.Item key={i} as={Link} to={`/user/${u.id}`}>{u.name}</List.Item>
                          )}
                        </List>
                      </Card.Description>
                    }
                  </Card.Content>
                </Card>
              ))}
            </Card.Group>
          </>
          :
          <i>Empty list</i>
        }
      </Segment>
    </>
  );
}

export default Todo;
