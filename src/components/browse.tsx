import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useHistory } from 'react-router-dom';
import { Button, List, Icon, Segment } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getBrowse } from '../api';

const Browse = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  const [showForDevelopers, setShowForDevelopers] = useState(false);
  let history = useHistory();
  useEffect(() => {
    if (!loading) {
      getBrowse(accessToken).then((data) => setData(data));
    }
  }, [loading, accessToken]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  const typeDescription = data.metadata.isBouldering? "problem(s)" : "route(s)";
  const markers = data.areas.filter(a => a.forDevelopers === showForDevelopers && a.lat!=0 && a.lng!=0).map(a => {
    return {
        lat: a.lat,
        lng: a.lng,
        label: a.name,
        url: '/area/' + a.id
      }
  });
  const map = markers.length>0 && <><Leaflet autoZoom={true} height='75vh' markers={markers} defaultCenter={data.metadata.defaultCenter} defaultZoom={data.metadata.defaultZoom} history={history} polylines={null} outlines={null} onClick={null} clusterMarkers={true} /><br/></>;
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
      <div style={{float: 'right'}}>
        {data.metadata.isAdmin &&
          <Button.Group size="mini" compact>
            <Button animated='fade' as={Link} to={`/area/edit/-1`}>
              <Button.Content hidden>Add</Button.Content>
              <Button.Content visible>
                <Icon name='plus' />
              </Button.Content>
            </Button>
          </Button.Group>
        }
      </div>
      <Button.Group>
        <Button active={!showForDevelopers} onClick={() => setShowForDevelopers(false)}>Developed areas</Button>
        <Button active={showForDevelopers} onClick={() => setShowForDevelopers(true)}>Areas for developers</Button>
      </Button.Group>
      {map}
      <List divided relaxed as={Segment}>
        {data.areas.filter(a => a.forDevelopers === showForDevelopers).map((area, i) => (
          <List.Item key={i}>
            <List.Content as={Link} to={`/area/${area.id}`}>
              <List.Header>{area.name} <LockSymbol lockedAdmin={area.lockedAdmin} lockedSuperadmin={area.lockedSuperadmin} /></List.Header>
              <List.Description>
                <i>{`${area.numSectors} sector(s), ${area.numProblems} ${typeDescription}, ${area.hits} page views`}</i><br/>
                {area.comment && area.comment.length>350? area.comment.substring(0,350) + "..." : area.comment}
              </List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </>
  );
}

export default Browse;
