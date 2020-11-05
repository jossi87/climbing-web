import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams, useHistory } from 'react-router-dom';
import AccordionContainer from './common/accordion-container/accordion-container'
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import Activity from './common/activity/activity';
import Leaflet from './common/leaflet/leaflet';
import { calculateDistance } from './common/leaflet/distance-math';
import Media from './common/media/media';
import { LockSymbol, Stars, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Segment, Icon, ButtonGroup, Button, List, Tab, Breadcrumb, Table, Label, TableCell } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSector, getAreaPdfUrl, getSectorPdfUrl } from '../api';
import Linkify from 'react-linkify';

const SectorListItem = ({ history, problem, isBouldering, orderByGrade } ) => {
  var ascents = problem.numTicks>0 && (problem.numTicks + (problem.numTicks==1? " ascent" : " ascents"));
  var typeAscents;
  if (isBouldering && ascents) {
    typeAscents = " (" + ascents + ") ";
  } else if (!isBouldering) {
    let t = problem.t.subType;
    if (problem.numPitches>1) t += ", " + problem.numPitches + " pitches";
    if (ascents) {
      typeAscents = " (" + t + ", " + ascents + ") ";
    } else {
      typeAscents = " (" + t + ") ";
    }
  }
  var comment;
  if (orderByGrade && problem.comment) {
    comment = <small><i style={{color: "gray"}}>{' '}#{problem.nr} - {problem.comment}{' '}</i></small>;
  } else if (orderByGrade) {
    comment = <small><i style={{color: "gray"}}>{' '}#{problem.nr}{' '}</i></small>;
  } else if (problem.comment) {
    comment = <small><i style={{color: "gray"}}>{' '}{problem.comment}{' '}</i></small>;
  }
  return (
    <List.Item key={problem.id} onClick={() => history.push(`/problem/${problem.id}`)}>
      <List.Header>
        {problem.danger && <Icon color="red" name="warning"/>}
        {!orderByGrade && `#${problem.nr} `}
        <Link to={`/problem/${problem.id}`}>{problem.name}</Link>
        {' '}{problem.grade}
        {' '}<Stars numStars={problem.stars}/>
        {problem.fa && <small>{problem.fa}</small>}
        {typeAscents && <small>{typeAscents}</small>}
        {comment}
        {problem.hasImages>0 && <Icon color="black" name="photo"/>}
        {problem.hasMovies>0 && <Icon color="black" name="film"/>}
        <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
        {problem.ticked && <Icon color="green" name="check"/>}
      </List.Header>
    </List.Item>
  ) 
};

interface SectorIdParams {
  sectorId: string;
}
const Sector = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  const [hideTicked, setHideTicked] = useState(false);
  let history = useHistory();
  let { sectorId } = useParams<SectorIdParams>();
  useEffect(() => {
    if (!loading) {
      getSector(accessToken, parseInt(sectorId)).then((data) => setData(data));
    }
  }, [loading, accessToken, sectorId]);

  function sortBy(orderByGrade : boolean) {
    let problems = data.problems.sort((a, b) => {
      if (orderByGrade) {
        if (a.gradeNumber != b.gradeNumber) {
          return b.gradeNumber-a.gradeNumber;
        }
        return a.name.localeCompare(b.name);
      }
      return a.nr-b.nr;
    });
    setData(prevState => ({ ...prevState, orderByGrade, problems }));
  }

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  const problemsInTopo = [];
  if (data.media) {
    data.media.forEach(m => {
      if (m.svgs) {
        m.svgs.forEach(svg => problemsInTopo.push(svg.problemId));
      }
    });
  }

  const markers = data.problems.filter(p => p.lat!=0 && p.lng!=0).map(p => {
    return {
        lat: p.lat,
        lng: p.lng,
        label: p.nr + " - " + p.name + " [" + p.grade + "]",
        url: '/problem/' + p.id
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
  if (data.media && data.media.length>0) {
    panes.push({
      menuItem: { key: 'topo', icon: 'image', content: 'Topo' },
      render: () => <Tab.Pane><Media isAdmin={data.metadata.isAdmin} removeMedia={(idMediaToRemove) => {
        let newMedia = data.media.filter(m => m.id!=idMediaToRemove);
        setData(prevState => ({ ...prevState, media: newMedia }));
      }} media={data.media} useBlueNotRed={data.metadata.useBlueNotRed} /></Tab.Pane>
  });
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
    panes.push({
      menuItem: { key: 'map', icon: 'map', content: 'Map' },
      render: () => <Tab.Pane><Leaflet key={new Date().getTime()} autoZoom={true} height='40vh' markers={markers} outlines={outlines} polylines={polyline && [polyline]} defaultCenter={defaultCenter} defaultZoom={defaultZoom} history={history} onClick={null} /></Tab.Pane>
    });
  }
  if (data.problems.length!=0) {
    panes.push({
      menuItem: { key: 'distribution', icon: 'area graph', content: 'Distribution' },
      render: () => <Tab.Pane><ChartGradeDistribution accessToken={accessToken} idArea={0} idSector={data.id}/></Tab.Pane>
    });
    panes.push({
      menuItem: { key: 'activity', icon: 'time', content: 'Activity' },
      render: () => <Tab.Pane><Activity idArea={0} idSector={data.id}/></Tab.Pane>
    });
  }
  let subTypes = data.problems.map(p => p.t.subType).filter((value, index, self) => self.indexOf(value) === index).sort(); 
  let content = subTypes.map((subType, i) => {
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
  let problems;
  if (data.orderByGrade && subTypes.length>1) {
    let accordionRows = subTypes.map(subType => {
      let rows = data.problems.filter(p => p.t.subType==subType && (!hideTicked || !p.ticked)).map((p, i) => <SectorListItem key={i} history={history} problem={p} orderByGrade={data.orderByGrade} isBouldering={data.metadata.isBouldering} />);
      let label = subType + " (" + rows.length + ")";
      let content = <List selection>{rows}</List>;
      return (
        {label, content}
      );
    });
    problems = <AccordionContainer accordionRows={accordionRows}/>;
  }
  else {
    problems = (
      <Segment attached="bottom">
        <List selection>
          {data.problems.filter(p => !hideTicked || !p.ticked).map((p, i) => <SectorListItem key={i} history={history} problem={p} orderByGrade={data.orderByGrade} isBouldering={data.metadata.isBouldering} />)}
        </List>
      </Segment>
    )
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
              <Table.Cell><Linkify>{data.comment}</Linkify></Table.Cell>
            </Table.Row>
          }
          <Table.Row>
            <Table.Cell>Download PDF:</Table.Cell>
            <Table.Cell>
              <Label href={getSectorPdfUrl(accessToken, data.id)} rel="noreferrer noopener" target="_blank" image basic>
                <Icon name="file pdf outline"/>sector.pdf
              </Label>
              <Label href={getAreaPdfUrl(accessToken, data.areaId)} rel="noreferrer noopener" target="_blank" image basic>
                <Icon name="file pdf outline"/>area.pdf
              </Label>
            </Table.Cell>
          </Table.Row>
          {data.lat>0 && data.lng>0 &&
            <Table.Row>
              <Table.Cell>Navigate to parking:</Table.Cell>
              <Table.Cell>
                <Label href={`https://maps.google.com/maps?q=loc:${data.lat},${data.lng}&navigate=yes`} rel="noopener" target="_blank" image basic >
                  <Icon name="map"/>Google Maps
                </Label>
              </Table.Cell>
            </Table.Row>
          }
          {data.lat>0 && data.lng>0 &&
            <Table.Row>
              <Table.Cell>Forecast and web camera:</Table.Cell>
              <Table.Cell>
                <Label href={`/weather/` + JSON.stringify({lat: data.lat, lng: data.lng, label: data.areaName})} rel="noopener" target="_blank" image basic >
                  <Icon name="sun"/>Weather map
                </Label>
              </Table.Cell>
            </Table.Row>
          }
          <Table.Row>
            <Table.Cell width={3}>Page views:</Table.Cell>
            <Table.Cell>{data.hits}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      {data.problems && data.problems.length!=0 &&
        <>
          <ButtonGroup size="mini" compact attached="top">
            {data.problems.filter(p => p.ticked).length>0 && 
              <Button icon labelPosition="left" onClick={() => setHideTicked(!hideTicked)} toggle primary={hideTicked}><Icon name="check"/>Hide ticked</Button>}
            <Button icon labelPosition="left" onClick={() => sortBy(true)} toggle primary={data.orderByGrade}><Icon name="sort content ascending"/>{data.metadata.isBouldering || subTypes.length===1? "Grade" : "Type and grade"}</Button>
            <Button icon labelPosition="left" onClick={() => sortBy(false)} toggle primary={!data.orderByGrade}><Icon name="sort numeric ascending"/>Number</Button>
          </ButtonGroup>
          {problems}
        </>
      }
    </>
  );
}

export default Sector;