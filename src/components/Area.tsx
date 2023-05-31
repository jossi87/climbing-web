import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import Top from './common/top/top';
import Activity from './common/activity/activity';
import Leaflet from './common/leaflet/leaflet';
import { calculateDistance } from './common/leaflet/distance-math';
import Media from './common/media/media';
import Todo from './common/todo/todo';
import { Stars, LockSymbol, Loading, WeatherLabels } from './common/widgets/widgets';
import { Table, Label, Button, Tab, Item, Icon, Image, Breadcrumb, Header, List, Message } from 'semantic-ui-react';
import { useAuth0 } from '@auth0/auth0-react';
import { getArea, getImageUrl, getAreaPdfUrl } from '../api';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import ProblemList from './common/problem-list/problem-list';

const SectorListItem = ({ sector, problem, isClimbing }) => {
  let type = isClimbing? problem.t.subType + (problem.numPitches>1? ", " + problem.numPitches + " pitches" : "") : null;
  let ascents = problem.numTicks && problem.numTicks + (problem.numTicks==1? " ascent" : " ascents");
  let faTypeAscents = problem.fa;
  if (type && ascents) {
    faTypeAscents = (faTypeAscents != null? faTypeAscents + " (" : "(") + type + ", " + ascents + ")";
  } else if (type) {
    faTypeAscents = (faTypeAscents != null? faTypeAscents + " (" : "(") + type + ")";
  } else if (ascents) {
    faTypeAscents = (faTypeAscents != null? faTypeAscents + " (" : "(") + ascents + ")";
  }
  let backgroundColor = "#ffffff";
  if (problem.ticked) {
    backgroundColor = "#d2f8d2";
  }
  else if (problem.todo) {
    backgroundColor = "#d2d2f8";
  }
  return (
    <List.Item style={{backgroundColor}} key={problem.id}>
      <List.Header>
        {problem.danger && <Icon color="red" name="warning"/>}
        <Link to={`/problem/${problem.id}`}>{problem.name}</Link>
        {' '}
        {problem.grade}
        <Stars numStars={problem.stars} includeNoRating={false} />
        <small><i style={{color: "gray"}}> {sector.name} {`#${problem.nr}`} </i></small>
        {faTypeAscents && <small>{' '}{faTypeAscents}</small>}
        <small><i style={{color: "gray"}}>{' '}{problem.rock && <>Rock: {problem.rock}. </>}{problem.comment}{' '}</i></small>
        {problem.lat>0 && problem.lng>0 && <Icon size="small" name="map marker alternate"/>}
        {problem.hasTopo && <Icon size="small" name="paint brush"/>}
        {problem.hasImages && <Icon size="small" color="black" name="photo"/>}
        {problem.hasMovies && <Icon size="small" color="black" name="film"/>}
        <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
        {problem.ticked && <Icon size="small" color="green" name="check"/>}
        {problem.todo && <Icon size="small" color="blue" name="bookmark"/>}
      </List.Header>
    </List.Item>
  )
}
const Area = () => {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [error, setError] = useState(null);
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
    if (!isLoading) {
      const update = async() => {
        const accessToken = isAuthenticated? await getAccessTokenSilently() : null;
        getArea(accessToken, parseInt(areaId))
        .then((data) => setData({...data, accessToken}))
        .catch(error => setError(error));
      }
      update();
    }
  }, [isLoading, isAuthenticated, areaId]);

  if (error) {
    return <Message size="huge" style={{backgroundColor: "#FFF"}} icon="meh" header="404" content={error} />;
  }
  else if (!data || !data.id) {
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
      let polyline = s.polyline.split(";").filter(i => i).map(e => e.split(",").map(Number));
      distance = calculateDistance(polyline);
      let label = s.polygonCoords == null && distance;
      polylines.push({polyline, label});
    }
    if (s.polygonCoords) {
      const polygon = s.polygonCoords.split(";").filter(i => i).map((c, i) => {
        const latLng = c.split(",");
        return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
      });
      let label = s.name + (distance? " (" + distance + ")" : "");
      outlines.push({url: '/sector/' + s.id, label, polygon: polygon});
    }
  }
  let isBouldering = data.metadata.gradeSystem==='BOULDER';
  const panes = [];
  const height = '40vh';
  if (data.media && data.media.length>0) {
    panes.push({
      menuItem: { key: 'image', icon: 'image' },
      render: () => <Tab.Pane><Media isAdmin={data.metadata.isAdmin} numPitches={0} removeMedia={(idMediaToRemove) => {
        let newMedia = data.media.filter(m => m.id!=idMediaToRemove);
        setData(prevState => ({ ...prevState, media: newMedia }));
      }} media={data.media} optProblemId={null} isBouldering={isBouldering} /></Tab.Pane> });
  }
  if (markers.length>0 || outlines.length>0 || (data.lat && data.lat>0)) {
    const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
    const defaultZoom = data.lat && data.lat>0? 14 : data.metadata.defaultZoom;
    panes.push({
      menuItem: { key: 'map', icon: 'map' },
      render: () => <Tab.Pane><Leaflet key={"area="+data.id} autoZoom={true} height={height} markers={markers} outlines={outlines} polylines={polylines} defaultCenter={defaultCenter} defaultZoom={defaultZoom} navigate={navigate} onMouseClick={null} onMouseMove={null} showSateliteImage={false} clusterMarkers={false} rocks={null} flyToId={null} /></Tab.Pane>
    });
  }
  if (data.sectors.length!=0) {
    panes.push({
      menuItem: { key: 'distribution', icon: 'area graph' },
      render: () => <Tab.Pane><ChartGradeDistribution accessToken={data.accessToken} idArea={data.id} idSector={0} data={null}/></Tab.Pane>
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
      render: () => <Tab.Pane><Todo accessToken={data.accessToken} idArea={data.id} idSector={0}/></Tab.Pane>
    });
  }

  let sectorPanes = null;
  if (data.sectors) {
    sectorPanes = [];
    sectorPanes.push({
      menuItem: "Sectors (" + data.sectors.length + ")",
      render: () => (
        <Tab.Pane>
          <Item.Group link unstackable>
            {data.sectors.map((sector, i) => (
              <Item as={Link} to={`/sector/${sector.id}`} key={i}>
                <Image size="small" style={{maxHeight: '150px', objectFit: 'cover'}} src={sector.randomMediaId? getImageUrl(sector.randomMediaId, sector.randomMediaCrc32, 150) : '/png/image.png'} />
                <Item.Content>
                  <Item.Header>
                    {sector.accessClosed && <Header as="h3" color="red">{sector.accessClosed}</Header>}
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
        </Tab.Pane>
      )
    });
    sectorPanes.push({
      menuItem: (isBouldering? "Problems (" : "Routes (") + data.typeNumTicked.reduce((count, current) => count + current.num, 0) + ")",
      render: () => (
        <Tab.Pane>
          <ProblemList isSectorNotUser={true} preferOrderByGrade={true}
            rows={data.sectors.map(s => (s.problems.map(p => ({
                element: <SectorListItem key={p.id} sector={s} problem={p} isClimbing={data.metadata.gradeSystem==='CLIMBING'} />,
                name: p.name, nr: p.nr, gradeNumber: p.gradeNumber, stars: p.stars,
                numTicks: p.numTicks, ticked: p.ticked, todo: p.todo,
                rock: p.rock, subType: p.t.subType,
                num: null, fa: null
              })))
            ).flat().sort((a, b) => b.gradeNumber-a.gradeNumber)}
          />
        </Tab.Pane>
      )
    });
  }
  
  return (
    <>
      <Helmet>
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
      </Helmet>
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
      {data.accessClosed && <Message size="huge" negative icon="attention" header="Climbing not allowed!" content={data.accessClosed} />}
      <Tab panes={panes} />
      <Table definition unstackable>
        <Table.Body>
          {(data.accessInfo || data.noDogsAllowed) &&
            <Table.Row warning verticalAlign="top">
              <Table.Cell><Icon name='attention' /> Restrictions:</Table.Cell>
              <Table.Cell>
                {data.noDogsAllowed &&
                  <Header as="h5" color="red" image>
                    <Image src="/svg/no-animals.svg" alt="No dogs allowed" rounded size='mini'/>
                    <Header.Content>
                      The access to our crags are at the mercy of the farmers who own the land.
                      <Header.Subheader>Because of conflicts between dog-owners and farmers we ask you to not bring your dog to this specific crag.</Header.Subheader>
                    </Header.Content>
                  </Header>
                }
                {data.accessInfo && <p>{data.accessInfo}</p>}
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
              <Label href={getAreaPdfUrl(data.accessToken, data.id)} rel="noreferrer noopener" target="_blank" image basic>
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
      {sectorPanes && <Tab panes={sectorPanes}/>}
    </>
  );
}

export default Area;
