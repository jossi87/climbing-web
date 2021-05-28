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
import { Step, Segment, Dropdown, Icon, Button, Checkbox, List, Tab, Breadcrumb, Table, Label, TableCell } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSector, getAreaPdfUrl, getSectorPdfUrl } from '../api';
import Linkify from 'react-linkify';

const SectorListItem = ({ problem, showType, orderBy } ) => {
  var ascents = problem.numTicks>0 && (problem.numTicks + (problem.numTicks==1? " ascent" : " ascents"));
  var typeAscents;
  if (showType) {
    let t = problem.t.subType;
    if (problem.numPitches>1) t += ", " + problem.numPitches + " pitches";
    if (ascents) {
      typeAscents = " (" + t + ", " + ascents + ") ";
    } else {
      typeAscents = " (" + t + ") ";
    }
  } else if (!showType) {
    if (ascents) {
      typeAscents = " (" + ascents + ") ";
    }
    else {
      typeAscents = " ";
    }
  }
  var comment;
  if (orderBy === OrderBy.grade && problem.comment) {
    comment = <small><i style={{color: "gray"}}>{' '}#{problem.nr} - {problem.comment}{' '}</i></small>;
  } else if (orderBy === OrderBy.grade) {
    comment = <small><i style={{color: "gray"}}>{' '}#{problem.nr}{' '}</i></small>;
  } else if (problem.comment) {
    comment = <small><i style={{color: "gray"}}>{' '}{problem.rock && <>Rock: {problem.rock}. </>}{problem.comment}{' '}</i></small>;
  }
  return (
    <List.Item style={{backgroundColor: problem.ticked? "#d2f8d2" : "#ffffff"}} key={problem.id}>
      <List.Header>
        {problem.danger && <Icon color="red" name="warning"/>}
        {orderBy === OrderBy.number && `#${problem.nr} `}
        <Link to={`/problem/${problem.id}`}>{problem.name}</Link>
        {' '}{problem.grade}
        {' '}<Stars numStars={problem.stars} includeNoRating={false} />
        {problem.fa && <small>{problem.fa}</small>}
        {typeAscents && <small>{typeAscents}</small>}
        {comment}
        {problem.lat>0 && problem.lng>0 && <Icon size="small" name="map marker alternate"/>}
        {problem.hasTopo && <Icon size="small" name="paint brush"/>}
        {problem.hasImages>0 && <Icon size="small" color="black" name="photo"/>}
        {problem.hasMovies>0 && <Icon size="small" color="black" name="film"/>}
        <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
        {problem.ticked && <Icon size="small" color="green" name="check"/>}
      </List.Header>
    </List.Item>
  ) 
};

interface SectorIdParams {
  sectorId: string;
}
enum GroupBy {
  type, rock
}
enum OrderBy {
  grade, number, ascents, rating, alphabetical
}
const Sector = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  const [hideTicked, setHideTicked] = useState(false);
  const [uniqueRocks, setUniqueRocks] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [groupByTitle, setGroupByTitle] = useState(null);
  const [groupBy, setGroupBy] = useState(false);
  const [orderBy, setOrderBy] = useState(OrderBy.number);
  let history = useHistory();
  let { sectorId } = useParams<SectorIdParams>();
  useEffect(() => {
    if (!loading) {
      getSector(accessToken, parseInt(sectorId)).then((data) => {
        if (data.problems) {
          const rocks = data.problems.filter(p => p.rock).map(p => p.rock).filter((value, index, self) => self.indexOf(value) === index).sort();
          if (data.problems.filter(p => !p.rock).length>0) {
            rocks.push("<Without rock>");
          }
          setUniqueRocks(rocks);
          let types = data.problems.map(p => p.t.subType).filter((value, index, self) => self.indexOf(value) === index).sort(); 
          setUniqueTypes(types);
          if (data.metadata.gradeSystem==='BOULDER') {
            if (rocks && rocks.length>1) {
              setGroupByTitle(GroupBy.rock);
            }
          } else if (types && types.length>1) {
            setGroupByTitle(GroupBy.type);
          }
          if (data.orderByGrade) {
            setOrderBy(OrderBy.grade);
          }
        }
        setData(data);
      });
    }
  }, [loading, accessToken, sectorId]);

  function order(newOrderBy: OrderBy) {
    setOrderBy(newOrderBy);
    let problems = data.problems.sort((a, b) => {
      if (newOrderBy === OrderBy.grade) {
        if (a.gradeNumber != b.gradeNumber) return b.gradeNumber-a.gradeNumber;
        return a.name.localeCompare(b.name);
      } else if (newOrderBy === OrderBy.number) {
        return a.nr-b.nr;
      } else if (newOrderBy === OrderBy.ascents) {
        if (a.numTicks != b.numTicks) return b.numTicks-a.numTicks;
        return a.name.localeCompare(b.name);
      } else if (newOrderBy === OrderBy.rating) {
        if (a.stars != b.stars) return b.stars-a.stars;
        return a.name.localeCompare(b.name);
      } else if (newOrderBy === OrderBy.alphabetical) {
        return a.name.localeCompare(b.name);
      }
    });
    setData(prevState => ({ ...prevState, problems }));
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
  if (data.media && data.media.length>0) {
    panes.push({
      menuItem: { key: 'topo', icon: 'image', content: 'Topo' },
      render: () => <Tab.Pane><Media isAdmin={data.metadata.isAdmin} removeMedia={(idMediaToRemove) => {
        let newMedia = data.media.filter(m => m.id!=idMediaToRemove);
        setData(prevState => ({ ...prevState, media: newMedia }));
      }} media={data.media} optProblemId={null} isBouldering={data.metadata.gradeSystem==='BOULDER'} /></Tab.Pane>
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
      render: () => <Tab.Pane><Leaflet key={"sector="+data.id} autoZoom={true} height='40vh' markers={markers} outlines={outlines} polylines={polyline && [polyline]} defaultCenter={defaultCenter} defaultZoom={defaultZoom} history={history} onClick={null} showSateliteImage={true} clusterMarkers={true} rocks={uniqueRocks && uniqueRocks.length>1? uniqueRocks : null} /></Tab.Pane>
    });
  }
  if (data.problems.length!=0) {
    panes.push({
      menuItem: { key: 'distribution', icon: 'area graph', content: 'Distribution' },
      render: () => <Tab.Pane><ChartGradeDistribution accessToken={accessToken} idArea={0} idSector={data.id}/></Tab.Pane>
    });
    panes.push({
      menuItem: { key: 'activity', icon: 'time', content: 'Activity' },
      render: () => <Tab.Pane><Activity metadata={data.metadata} idArea={0} idSector={data.id}/></Tab.Pane>
    });
  }
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
  let problems;
  if (groupBy && groupByTitle === GroupBy.rock) {
    let accordionRows = uniqueRocks.map(rock => {
      let rows = data.problems.filter(p => (rock==='<Without rock>' && !p.rock) || p.rock==rock && (!hideTicked || !p.ticked)).map((p, i) => <SectorListItem key={i} problem={p} orderBy={orderBy} showType={data.metadata.gradeSystem==='CLIMBING'} />);
      let label = rock + " (" + rows.length + ")";
      let content = <List selection>{rows}</List>;
      return (
        {label, content}
      );
    });
    problems = <AccordionContainer accordionRows={accordionRows}/>;
  } else if (groupBy && groupByTitle === GroupBy.type) {
    let accordionRows = uniqueTypes.map(subType => {
      let rows = data.problems.filter(p => p.t.subType==subType && (!hideTicked || !p.ticked)).map((p, i) => <SectorListItem key={i} problem={p} orderBy={orderBy} showType={data.metadata.gradeSystem==='CLIMBING'} />);
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
          {data.problems.filter(p => !hideTicked || !p.ticked).map((p, i) => <SectorListItem key={i} problem={p} orderBy={orderBy} showType={data.metadata.gradeSystem==='CLIMBING'} />)}
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
      {data.problems && data.problems.length!=0 &&
        <>
          <Step.Group attached="top" size="mini" unstackable fluid>
            <Step>
              <Step.Content>
                <Step.Title>Order by</Step.Title>
                <Step.Description>
                  <Dropdown options={[
                    {key: OrderBy.grade, text: OrderBy[OrderBy.grade], value: OrderBy[OrderBy.grade]},
                    {key: OrderBy.number, text: OrderBy[OrderBy.number], value: OrderBy[OrderBy.number]},
                    {key: OrderBy.ascents, text: OrderBy[OrderBy.ascents], value: OrderBy[OrderBy.ascents]},
                    {key: OrderBy.rating, text: OrderBy[OrderBy.rating], value: OrderBy[OrderBy.rating]},
                    {key: OrderBy.alphabetical, text: OrderBy[OrderBy.alphabetical], value: OrderBy[OrderBy.alphabetical]}
                  ]} defaultValue={OrderBy[orderBy]} onChange={(e, { value }) => order(OrderBy[value as keyof typeof OrderBy])} />
                </Step.Description>
              </Step.Content>
            </Step>
            {groupByTitle != null && 
              <Step>
                <Step.Content>
                  <Step.Title>Group by {GroupBy[groupByTitle]}</Step.Title>
                  <Step.Description>
                    <Checkbox toggle active={groupBy} onClick={() => setGroupBy(!groupBy)} />
                  </Step.Description>
                </Step.Content>
              </Step>
            }
            {data.problems.filter(p => p.ticked).length>0 && 
              <Step>
                <Step.Content>
                  <Step.Title>Hide ticked</Step.Title>
                  <Step.Description>
                    <Checkbox toggle active={hideTicked} onClick={() => setHideTicked(!hideTicked)} />
                  </Step.Description>
                </Step.Content>
              </Step>
            }
          </Step.Group>
          {problems}
        </>
      }
    </>
  );
}

export default Sector;