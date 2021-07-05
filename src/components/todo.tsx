import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams, useHistory } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { Image, List, Header, Segment } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getTodo } from '../api';

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
      if (data != null) {
        setData(null);
      }
      const id = userId? parseInt(userId) : -1;
      getTodo(accessToken, id).then((data) => setData(data));
    }
  }, [loading, accessToken, userId]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  let markers = [];
  data.areas.forEach((a) => {
    a.sectors.forEach((s) => {
      s.problems.forEach((p) => {
        if (p.lat!=0 && p.lng!=0) {
          markers.push({lat: p.lat, lng: p.lng, label: p.name, url: '/problem/' + p.id});
        }
      })
    })
  })
  console.log(markers)
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
            <Header.Subheader>{data.metadata.description}</Header.Subheader>
          </Header.Content>
        </Header>
        {data.areas.length>0?
          <>
            <Leaflet
              key={"todo="+userId} 
              autoZoom={true}
              height='40vh'
              markers={markers}
              defaultCenter={data.metadata.defaultCenter}
              defaultZoom={data.metadata.defaultZoom}
              history={history}
              polylines={null}
              outlines={null}
              onClick={null}
              showSateliteImage={false}
              clusterMarkers={true}
              rocks={null}
            />
            <List celled>
              {data.areas.map((area, i) => (
                <List.Item key={i}>
                  <List.Header><Link id={area.id} to={{pathname: area.url}} target='_blank'>{area.name}</Link><LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} /></List.Header>
                  {area.sectors.map((sector, i) => (
                    <List.List key={i}>
                      <List.Header><Link to={{pathname: sector.url}} target='_blank'>{sector.name}</Link><LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} /></List.Header>
                      <List.List>
                      {sector.problems.map((problem, i) => (
                        <List.Item key={i}>
                          <List.Header>
                            {`#${problem.nr} `}
                            <Link to={{pathname: problem.url}} target='_blank'>{problem.name}</Link>
                            {' '}{problem.grade}
                            {problem.partners && problem.partners.length>0 &&
                              <small>
                                <i style={{color: "gray"}}>
                                  {problem.partners.map((u, i) => <>{i===0? ' Other users: ' : ', '}<Link key={i} to={`/todo/${u.id}`}>{u.name}</Link></>)}
                                </i>
                              </small>
                            }
                            <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                          </List.Header>
                        </List.Item>
                      ))}
                      </List.List>
                    </List.List>
                  ))}
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
