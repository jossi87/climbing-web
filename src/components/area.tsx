import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams } from 'react-router-dom';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import Leaflet from './common/leaflet/leaflet';
import Media from './common/media/media';
import { LockSymbol, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Button, Tab, Item, Message, Icon, Image, Breadcrumb, Segment, Header } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { useHistory } from 'react-router-dom';
import { getArea, getImageUrl } from '../api';

const Area = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState();
  const [forceUpdate, setForceUpdate] = useState(1);
  let { areaId } = useParams();
  let history = useHistory();
  useEffect(() => {
    if (!loading) {
      getArea(accessToken, parseInt(areaId)).then((data) => setData(data));
    }
  }, [loading, accessToken, areaId]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  const markers = data.sectors.filter(s => s.lat!=0 && s.lng!=0).map(s => {
    return {
        lat: s.lat,
        lng: s.lng,
        url: '/sector/' + s.id,
        isParking: true
      }
  });
  const outlines = data.sectors.filter(s => s.polygonCoords).map(s => {
    const polygon = s.polygonCoords.split(";").map((c, i) => {
      const latLng = c.split(",");
      return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
    });
    return {url: '/sector/' + s.id, label: s.name, polygon: polygon}
  });
  const polylines = data.sectors.filter(s => s.polyline).map(s => {
    return {
      label: s.name,
      polyline: s.polyline.split(";").map(e => {
        return e.split(",").map(Number);
      })
    }
  });
  const panes = [];
  const height = '40vh';
  if (data.media && data.media.length>0) {
    panes.push({ menuItem: 'Topo', render: () => <Tab.Pane><Media accessToken={accessToken} isAdmin={data.metadata.isAdmin} removeMedia={(idMediaToRemove) => {
      data.media = data.media.filter(m => m.id!=idMediaToRemove);
      setData(data);
      setForceUpdate(forceUpdate+1);
    }} media={data.media} useBlueNotRed={data.metadata.useBlueNotRed} /></Tab.Pane> });
  }
  if (markers.length>0 || outlines.length>0) {
    const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
    const defaultZoom = data.lat && data.lat>0? 14 : data.metadata.defaultZoom;
    panes.push({ menuItem: 'Map', render: () => <Tab.Pane><Leaflet height={height} markers={markers} outlines={outlines} polylines={polylines} defaultCenter={defaultCenter} defaultZoom={defaultZoom} history={history} /></Tab.Pane> });
  }
  if (data.sectors.length!=0) {
    panes.push({ menuItem: 'Distribution', render: () => <Tab.Pane><ChartGradeDistribution accessToken={accessToken} idArea={data.id} idSector={0}/></Tab.Pane> });
  }
  return (
    <>
      <MetaTags>
        {data.metadata.canonical && <link rel="canonical" href={data.metadata.canonical} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data.metadata.jsonLd)}} />
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
      <div style={{marginBottom: '5px'}}>
        <div style={{float: 'right'}}>
          {data.metadata.isAdmin &&
            <Button.Group size="mini" compact>
              <Button animated='fade' as={Link} to={`/sector/edit/${data.id}-0`}>
                <Button.Content hidden>Add</Button.Content>
                <Button.Content visible>
                  <Icon name='plus' />
                </Button.Content>
              </Button>
              <Button animated='fade' as={Link} to={`/area/edit/${data.id}`}>
                <Button.Content hidden>Edit</Button.Content>
                <Button.Content visible>
                  <Icon name='edit' />
                </Button.Content>
              </Button>
            </Button.Group>
          }
        </div>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/browse'>Browse</Link></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>{data.name} <LockSymbol visibility={data.visibility}/></Breadcrumb.Section>
        </Breadcrumb>
      </div>
      <Tab panes={panes} />
      <Message icon>
        <Icon name="info" />
        <Message.Content>
          <strong>Page views (since 2019.10.09):</strong> {data.hits}<br/>
          {data.comment && <div dangerouslySetInnerHTML={{ __html: data.comment }} />}
        </Message.Content>
      </Message>
      {data.sectors &&
        <Segment>
          <Header as="h3">Sectors:</Header>
          <Item.Group link unstackable>
            {data.sectors.map((sector, i) => (
              <Item as={Link} to={`/sector/${sector.id}`} key={i}>
                <Image size="small" style={{maxHeight: '150px', objectFit: 'cover'}} src={sector.randomMediaId? getImageUrl(sector.randomMediaId, 150) : '/png/image.png'} />
                <Item.Content>
                  <Item.Header>
                    {sector.name} <LockSymbol visibility={sector.visibility}/>
                  </Item.Header>
                  <Item.Meta>
                    {sector.numProblems} {data.metadata.isBouldering? "problem(s)" : "route(s)"}
                  </Item.Meta>
                  <Item.Description>
                    {sector.comment}
                  </Item.Description>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        </Segment>
      }
    </>
  );
}

export default Area;
