import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Leaflet from '../../common/leaflet/leaflet';
import { LoadingAndRestoreScroll, LockSymbol } from '../../common/widgets/widgets';
import { List, Segment } from 'semantic-ui-react';
import { getProfileTodo } from '../../../api';

const ProfileTodo = ({accessToken, userId, defaultCenter, defaultZoom}) => {
  const [data, setData] = useState(null);
  let history = useHistory();
  useEffect(() => {
    if (data != null) {
      setData(null);
    }
    getProfileTodo(accessToken, userId).then((data) => setData(data));
  }, [accessToken, userId]);

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
  return (
    <Segment>
      {data.areas.length>0?
        <>
        <Leaflet
            key={"todo="+userId} 
            autoZoom={true}
            height='40vh'
            markers={markers}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
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
                                {problem.partners.map((u, i) => <>{i===0? ' Other users: ' : ', '}<Link key={i} to={`/user/${u.id}/todo`}>{u.name}</Link></>)}
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
  );
}

export default ProfileTodo;