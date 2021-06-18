import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams, useHistory } from 'react-router-dom';
import ProblemList from './common/problem-list/problem-list';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import Activity from './common/activity/activity';
import Leaflet from './common/leaflet/leaflet';
import { calculateDistance } from './common/leaflet/distance-math';
import Media from './common/media/media';
import { Stars, LockSymbol, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Icon, Button, Tab, Breadcrumb, Table, Label, TableCell, List } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSector, getAreaPdfUrl, getSectorPdfUrl } from '../api';
import Linkify from 'react-linkify';

interface SectorIdParams {
  sectorId: string;
}
const SectorListItem = ({ problem, isClimbing }) => {
  var ascents = problem.numTicks>0 && (problem.numTicks + (problem.numTicks==1? " ascent" : " ascents"));
  var typeAscents;
  if (isClimbing) {
    let t = problem.t.subType;
    if (problem.numPitches>1) t += ", " + problem.numPitches + " pitches";
    if (ascents) {
      typeAscents = " (" + t + ", " + ascents + ") ";
    } else {
      typeAscents = " (" + t + ") ";
    }
  } else {
    if (ascents) {
      typeAscents = " (" + ascents + ") ";
    }
    else {
      typeAscents = " ";
    }
  }
  let comment = <small><i style={{color: "gray"}}>{' '}{problem.rock && <>Rock: {problem.rock}. </>}{problem.comment}{' '}</i></small>;
  return (
    <List.Item style={{backgroundColor: problem.ticked? "#d2f8d2" : "#ffffff"}} key={problem.id}>
      <List.Header>
        {problem.danger && <Icon color="red" name="warning"/>}
        {`#${problem.nr} `}
        <Link to={`/problem/${problem.id}`}>{problem.name}</Link>
        {' '}{problem.grade}
        {' '}<Stars numStars={problem.stars} includeNoRating={false} />
        {problem.fa && <small>{problem.fa}</small>}
        {typeAscents && <small>{typeAscents}</small>}
        {comment}
        {problem.lat>0 && problem.lng>0 && <Icon size="small" name="map marker alternate"/>}
        {problem.hasTopo && <Icon size="small" name="paint brush"/>}
        {problem.hasImages && <Icon size="small" color="black" name="photo"/>}
        {problem.hasMovies && <Icon size="small" color="black" name="film"/>}
        <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
        {problem.ticked && <Icon size="small" color="green" name="check"/>}
      </List.Header>
    </List.Item>
  )
}
const Sector = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  let { sectorId } = useParams<SectorIdParams>();
  let history = useHistory();
  useEffect(() => {
    if (!loading) {
      getSector(accessToken, parseInt(sectorId)).then((data) => {
        setData(data);
      });
    }
  }, [loading, accessToken, sectorId]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }

  let isBouldering = data.metadata.gradeSystem==='BOULDER';
  const markers = data.problems.filter(p => p.lat!=0 && p.lng!=0).map(p => {
    return {
        lat: p.lat,
        lng: p.lng,
        label: p.nr + " - " + p.name + " [" + p.grade + "]",
        url: '/problem/' + p.id,
        rock: p.rock
      }
  });
  if (data.lat>0 && data.lng>0) {
    markers.push({
      lat: data.lat,
      lng: data.lng,
      isParking: true
    });
  }
  const panes = [];

  let topoImages = null;
  if (data.media && data.media.length>0) {
    let media = data.media;
    if (isBouldering) {
      media = data.media.filter(m => m.svgs == null || m.svgs.length === 0);
      topoImages = data.media.filter(m => m.svgs && m.svgs.length !== 0);
    }
    if (media && media.length>0) {
      panes.push({
        menuItem: { key: 'topo', icon: 'image' },
        render: () => <Tab.Pane><Media isAdmin={data.metadata.isAdmin} removeMedia={(idMediaToRemove) => setData(prevState => ({ ...prevState, media: media.filter(m => m.id!=idMediaToRemove) })) } media={media} optProblemId={null} isBouldering={isBouldering} /></Tab.Pane>
      });
    }
  }
  if (markers.length>0) {
    const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
    const defaultZoom = data.lat && data.lat>0? 15 : data.metadata.defaultZoom;
    let polyline = data.polyline && data.polyline.split(";").map(e => e.split(",").map(Number));
    var outlines;
    if (data.polygonCoords) {
      const polygon = data.polygonCoords.split(";").map(c => {
        const latLng = c.split(",");
        return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
      });
      let label = data.name + (polyline? " (" + calculateDistance(polyline) + ")" : "");
      outlines = [{url: '/sector/' + data.id, label, polygon: polygon}];
    }
    const uniqueRocks = data.problems.filter(p => p.rock).map(p => p.rock).filter((value, index, self) => self.indexOf(value) === index).sort();
    panes.push({
      menuItem: { key: 'map', icon: 'map' },
      render: () => <Tab.Pane><Leaflet key={"sector="+data.id} autoZoom={true} height='40vh' markers={markers} outlines={outlines} polylines={polyline && [polyline]} defaultCenter={defaultCenter} defaultZoom={defaultZoom} history={history} onClick={null} showSateliteImage={true} clusterMarkers={true} rocks={uniqueRocks} /></Tab.Pane>
    });
  }
  if (topoImages && topoImages.length>0) {
    panes.push({
      menuItem: { key: 'topo', icon: 'images' },
      render: () => <Tab.Pane><Media isAdmin={data.metadata.isAdmin} removeMedia={(idMediaToRemove) => setData(prevState => ({ ...prevState, media: topoImages.filter(m => m.id!=idMediaToRemove) })) } media={topoImages} optProblemId={null} isBouldering={isBouldering} /></Tab.Pane>
    });
  }
  if (data.problems.length!=0) {
    panes.push({
      menuItem: { key: 'distribution', icon: 'area graph' },
      render: () => <Tab.Pane><ChartGradeDistribution accessToken={accessToken} idArea={0} idSector={data.id}/></Tab.Pane>
    });
    panes.push({
      menuItem: { key: 'activity', icon: 'time' },
      render: () => <Tab.Pane><Activity metadata={data.metadata} idArea={0} idSector={data.id}/></Tab.Pane>
    });
  }
  let uniqueTypes = data.problems.map(p => p.t.subType).filter((value, index, self) => self.indexOf(value) === index).sort(); 
  let content = uniqueTypes.map((subType, i) => {
    let problemsOfType = data.problems.filter(p => p.t.subType === subType);
    let numTicked = problemsOfType.filter(p => p.ticked).length;
    let txt = numTicked === 0? problemsOfType.length : problemsOfType.length + " (" + numTicked + " ticked)";
    return (
      <Table.Row key={i}>
        <TableCell>{subType? subType : "Boulders"}:</TableCell>
        <TableCell>{txt}</TableCell>
      </Table.Row>
    );
  })

  const componentDecorator = (href, text, key) => (
    <a href={href} key={key} target="_blank">
      {text}
    </a>
  );

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
          {data && data.metadata.isAdmin &&
            <Button.Group size="mini" compact>
              <Button animated='fade' as={Link} to={`/problem/edit/${data.id}-0`}>
                <Button.Content hidden>Add</Button.Content>
                <Button.Content visible>
                  <Icon name='plus' />
                </Button.Content>
              </Button>
              <Button animated='fade' as={Link} to={ `/sector/edit/${data.areaId}-${data.id}`}>
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
          <Breadcrumb.Section><Link to={`/area/${data.areaId}`}>{data.areaName}</Link> <LockSymbol lockedAdmin={data.areaLockedAdmin} lockedSuperadmin={data.areaLockedSuperadmin} /></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>{data.name} <LockSymbol lockedAdmin={data.lockedAdmin} lockedSuperadmin={data.lockedSuperadmin} /></Breadcrumb.Section>
        </Breadcrumb>
      </div>
      <Tab panes={panes} />
      <Table definition unstackable>
        <Table.Body>
          {content}
          {data.comment &&
            <Table.Row>
              <Table.Cell>Description:</Table.Cell>
              <Table.Cell><Linkify componentDecorator={componentDecorator}>{data.comment}</Linkify></Table.Cell>
            </Table.Row>
          }
          <Table.Row>
            <Table.Cell>Files and links:</Table.Cell>
            <Table.Cell>
              <Label href={getSectorPdfUrl(accessToken, data.id)} rel="noreferrer noopener" target="_blank" image basic>
                <Icon name="file pdf outline"/>sector.pdf
              </Label>
              <Label href={getAreaPdfUrl(accessToken, data.areaId)} rel="noreferrer noopener" target="_blank" image basic>
                <Icon name="file pdf outline"/>area.pdf
              </Label>
              {data.lat>0 && data.lng>0 &&
                <Label href={`https://maps.google.com/maps?q=loc:${data.lat},${data.lng}&navigate=yes`} rel="noopener" target="_blank" image basic >
                  <Icon name="map"/>Google Maps (navigate to parking)
                </Label>
              }
              {data.lat>0 && data.lng>0 &&
                <Label href={`/weather/` + JSON.stringify({lat: data.lat, lng: data.lng, label: data.areaName})} rel="noopener" target="_blank" image basic >
                  <Icon name="sun"/>Weather map
                </Label>
              }
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell width={3}>Page views:</Table.Cell>
            <Table.Cell>{data.hits}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <ProblemList isSectorNotUser={true} preferOrderByGrade={data.orderByGrade}
        rows={data.problems.map(p => {
          return ({
            element: <SectorListItem problem={p} isClimbing={data.metadata.gradeSystem==='CLIMBING'} />,
            name: p.name, nr: p.nr, gradeNumber: p.gradeNumber, stars: p.stars,
            numTicks: p.numTicks, ticked: p.ticked,
            rock: p.rock, subType: p.t.subType,
            num: null, fa: null
          });
        })}
      />
    </>
  );
}

export default Sector;