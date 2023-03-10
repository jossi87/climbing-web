import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import Top from './common/top/top';
import Activity from './common/activity/activity';
import Leaflet from './common/leaflet/leaflet';
import { calculateDistance } from './common/leaflet/distance-math';
import Media from './common/media/media';
import Todo from './common/todo/todo';
import { LockSymbol, Loading, WeatherLabels } from './common/widgets/widgets';
import { Table, Label, Button, Tab, Item, Icon, Image, Breadcrumb, Segment, Header } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getArea, getImageUrl, getAreaPdfUrl } from '../api';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';

const Area = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  let { areaId } = useParams();
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
      getArea(accessToken, parseInt(areaId)).then((data) => setData(data));
    }
  }, [loading, accessToken, areaId]);

  if (!data) {
    return <Loading />;
  }
  const markers = data.sectors.filter(s => s.lat!=0 && s.lng!=0).map(s => {
    return {
        lat: s.lat,
        lng: s.lng,
        url: '/sector/' + s.id,
        isParking: true
      }
  });
  let outlines = [];
  let polylines = [];
  for (let s of data.sectors) {
    let distance = null;
    if (s.polyline) {
      let polyline = s.polyline.split(";").map(e => e.split(",").map(Number));
      distance = calculateDistance(polyline);
      let label = s.polygonCoords == null && distance;
      polylines.push({polyline, label});
    }
    if (s.polygonCoords) {
      const polygon = s.polygonCoords.split(";").map((c, i) => {
        const latLng = c.split(",");
        return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
      });
      let label = s.name + (distance? " (" + distance + ")" : "");
      outlines.push({url: '/sector/' + s.id, label, polygon: polygon});
    }
  }
  const panes = [];
  const height = '40vh';
  if (data.media && data.media.length>0) {
    panes.push({
      menuItem: { key: 'image', icon: 'image' },
      render: () => <Tab.Pane><Media isAdmin={data.metadata.isAdmin} removeMedia={(idMediaToRemove) => {
        let newMedia = data.media.filter(m => m.id!=idMediaToRemove);
        setData(prevState => ({ ...prevState, media: newMedia }));
      }} media={data.media} optProblemId={null} isBouldering={data.metadata.gradeSystem==='BOULDER'} /></Tab.Pane> });
  }
  if (markers.length>0 || outlines.length>0 || (data.lat && data.lat>0)) {
    const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
    const defaultZoom = data.lat && data.lat>0? 14 : data.metadata.defaultZoom;
    panes.push({
      menuItem: { key: 'map', icon: 'map' },
      render: () => <Tab.Pane><Leaflet key={"area="+data.id} autoZoom={true} height={height} markers={markers} outlines={outlines} polylines={polylines} defaultCenter={defaultCenter} defaultZoom={defaultZoom} navigate={navigate} onMouseClick={null} onMouseMove={null} showSateliteImage={true} clusterMarkers={false} rocks={null} flyToId={null} /></Tab.Pane>
    });
  }
  if (data.sectors.length!=0) {
    panes.push({
      menuItem: { key: 'distribution', icon: 'area graph' },
      render: () => <Tab.Pane><ChartGradeDistribution accessToken={accessToken} idArea={data.id} idSector={0} data={null}/></Tab.Pane>
    });
    panes.push({
      menuItem: { key: 'top', icon: 'trophy' },
      render: () => <Tab.Pane><Top idArea={data.id} idSector={0}/></Tab.Pane>
    });
    panes.push({
      menuItem: { key: 'activity', icon: 'time' },
      render: () => <Tab.Pane><Activity metadata={data.metadata} idArea={data.id} idSector={0}/></Tab.Pane>
    });
    panes.push({
      menuItem: { key: 'todo', icon: 'bookmark' },
      render: () => <Tab.Pane><Todo accessToken={accessToken} idArea={data.id} idSector={0}/></Tab.Pane>
    });
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
          <Breadcrumb.Section active>{data.name} <LockSymbol lockedAdmin={data.lockedAdmin} lockedSuperadmin={data.lockedSuperadmin} /></Breadcrumb.Section>
        </Breadcrumb>
      </div>
      <Tab panes={panes} />
      <Table definition unstackable>
        <Table.Body>
          {data.noDogsAllowed &&
            <Table.Row negative verticalAlign="top">
              <Table.Cell>Area restrictions:</Table.Cell>
              <Table.Cell>
                <Header as="h5" color="red">
                  <Image src="/svg/no-animals.svg" alt="No dogs allowed"/><br/>
                  The access to our crags are at the mercy of the farmers who own the land. Because of conflicts between dog-owners and farmers (loose dogs scaring & killing the farmers animals) we ask you to not bring your dog to this spesific crag, thank you.
                </Header>
              </Table.Cell>
            </Table.Row>
          }
          <Table.Row>
            <Table.Cell width={3}>Sectors:</Table.Cell>
            <Table.Cell>{data.sectors.length}</Table.Cell>
          </Table.Row>
          {data.typeNumTicked.map((t, i) => (
            <Table.Row key={i}>
              <Table.Cell>{t.type + ":"}</Table.Cell>
              <Table.Cell>{t.num}{t.ticked>0 && " (" + t.ticked + " ticked)"}</Table.Cell>
            </Table.Row>
          ))}
          {data.lat>0 && data.lng>0 &&
            <Table.Row>
              <Table.Cell>Weather:</Table.Cell>
              <Table.Cell>
                <WeatherLabels lat={data.lat} lng={data.lng} label={data.name} />
              </Table.Cell>
            </Table.Row>
          }
          <Table.Row>
            <Table.Cell>Misc:</Table.Cell>
            <Table.Cell>
              <Label href={getAreaPdfUrl(accessToken, data.id)} rel="noreferrer noopener" target="_blank" image basic>
                <Icon name="file pdf outline"/>area.pdf
              </Label>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Page views:</Table.Cell>
            <Table.Cell>{data.hits}</Table.Cell>
          </Table.Row>
          {data.forDevelopers && 
            <Table.Row>
              <Table.Cell>For developers:</Table.Cell>
              <Table.Cell><strong><i>Under development</i></strong></Table.Cell>
            </Table.Row>}
          {data.comment && <Table.Row><Table.Cell colSpan={2} style={{fontWeight: 'normal', backgroundColor: 'white'}}><div dangerouslySetInnerHTML={{ __html: md.render(data.comment) }} /></Table.Cell></Table.Row>}
        </Table.Body>
      </Table>
      {data.sectors &&
        <Segment>
          <Header as="h3">Sectors:</Header>
          <Item.Group link unstackable>
            {data.sectors.map((sector, i) => (
              <Item as={Link} to={`/sector/${sector.id}`} key={i}>
                <Image size="small" style={{maxHeight: '150px', objectFit: 'cover'}} src={sector.randomMediaId? getImageUrl(sector.randomMediaId, sector.randomMediaCrc32, 150) : '/png/image.png'} />
                <Item.Content>
                  <Item.Header>
                    {sector.name} <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
                  </Item.Header>
                  <Item.Meta>
                    {sector.typeNumTicked.map((x, i) => <p key={i}>{x.type + ": " + x.num}{x.ticked>0 && " (" + x.ticked + " ticked)"}</p>)}
                  </Item.Meta>
                  <Item.Description>
                    {sector.accessInfo && <Header as="h5" color="red">{sector.accessInfo}</Header>}
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
