import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useNavigate } from 'react-router-dom';
import { Button, List, Icon, Segment } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import { Loading, LockSymbol } from './common/widgets/widgets';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getBrowse } from '../api';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';

const Browse = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  const [showForDevelopers, setShowForDevelopers] = useState(false);
  let navigate = useNavigate();
  let md = new Remarkable({breaks: true}).use(linkify);
  // open links in new windows
  md.renderer.rules.link_open = (function() {
    var original = md.renderer.rules.link_open;
    return function() {
      var link = original.apply(null, arguments);
      return link.substring(0, link.length - 1) + ' rel="noreferrer noopener" target="_blank">';
    };
  })();
  useEffect(() => {
    if (!loading) {
      getBrowse(accessToken).then((data) => setData(data));
    }
  }, [loading, accessToken]);

  if (!data) {
    return <Loading />;
  }
  const typeDescription = data.metadata.gradeSystem==='BOULDER'? "problems" : "routes";
  const markers = data.areas.filter(a => a.forDevelopers === showForDevelopers && a.lat!=0 && a.lng!=0).map(a => {
    return {
        lat: a.lat,
        lng: a.lng,
        label: a.name,
        url: '/area/' + a.id,
        html: <>
          <Button floated="right" compact size="mini" icon as={Link} to={'/area/' + a.id} target="_blank" rel="noreferrer noopener"><Icon name="external"/></Button>
          <a href={'/area/' + a.id}><b>{a.name}</b> <LockSymbol lockedAdmin={a.lockedAdmin} lockedSuperadmin={a.lockedSuperadmin} /></a>
          <i>{`(${a.numSectors} sectors, ${a.numProblems} ${typeDescription})`}</i><br/>
          {a.numProblems>0 && <ChartGradeDistribution accessToken={accessToken} idArea={a.id} idSector={0} data={null}/>}
          {a.comment && <div dangerouslySetInnerHTML={{ __html: md.render(a.comment && a.comment.length>200? a.comment.substring(0,200) + "..." : a.comment) }} />}
        </>
      }
  });
  const map = markers.length>0 && <><Leaflet autoZoom={true} height='75vh' markers={markers} defaultCenter={data.metadata.defaultCenter} defaultZoom={data.metadata.defaultZoom} navigate={navigate} polylines={null} outlines={null} onClick={null} showSateliteImage={false}  clusterMarkers={!showForDevelopers} rocks={null} /><br/></>;
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
                <i>{`${area.numSectors} sectors, ${area.numProblems} ${typeDescription}, ${area.hits} page views`}</i><br/>
                <div dangerouslySetInnerHTML={{ __html: area.comment && area.comment.length>350? area.comment.substring(0,350) + "..." : area.comment}}/>
              </List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </>
  );
}

export default Browse;
