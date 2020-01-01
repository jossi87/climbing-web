import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import Leaflet from './common/leaflet/leaflet';
import Media from './common/media/media';
import { LockSymbol, Stars, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Segment, Icon, Button, List, Tab, Breadcrumb, Message, Header } from 'semantic-ui-react';
import { getSector } from '../api';

class Sector extends Component<any, any> {
  componentDidMount() {
    if (!this.state || !this.state.data) {
      this.refresh(this.props.match.params.sectorId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.sectorId !== this.props.match.params.sectorId) {
      this.refresh(this.props.match.params.sectorId);
    }
  }

  refresh(id) {
    getSector(this.props.accessToken, id).then((data) => this.setState(() => ({data})));
  }

  onRemoveMedia = (idMediaToRemove) => {
    const { data } = this.state;
    data.media = data.media.filter(m => m.id!=idMediaToRemove);
    this.setState({data});
  }

  order = () => {
    const { data } = this.state;
    data.orderByGrade = !data.orderByGrade;
    data.problems.sort((a, b) => {
      if (data.orderByGrade) {
        if (a.gradeNumber != b.gradeNumber) {
          return b.gradeNumber-a.gradeNumber;
        }
        return a.name.localeCompare(b.name);
      }
      return a.nr-b.nr;
    });
    this.setState({data});
  }

  render() {
    if (!this.state || !this.state.data) {
      return <LoadingAndRestoreScroll />;
    }
    const { data } = this.state;
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
      panes.push({ menuItem: 'Topo', render: () => <Tab.Pane><Media accessToken={this.props.accessToken} isAdmin={data.metadata.isAdmin} removeMedia={this.onRemoveMedia} media={data.media} useBlueNotRed={data.metadata.useBlueNotRed} /></Tab.Pane> });
    }
    if (markers.length>0) {
      const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
      const defaultZoom = data.lat && data.lat>0? 15 : data.metadata.defaultZoom;
      var outlines;
      if (data.polygonCoords && markers.filter(m => !m.isParking).length===0) {
        const polygon = data.polygonCoords.split(";").map(c => {
          const latLng = c.split(",");
          return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
        });
        outlines = [{url: '/sector/' + data.id, label: data.name, polygon: polygon}];
      }
      const polyline = data.polyline && {
        label: data.name,
        polyline: data.polyline.split(";").map(e => {
          return e.split(",").map(Number);
        })
      };
      panes.push({ menuItem: 'Map', render: () => <Tab.Pane><Leaflet height='40vh' markers={markers} outlines={outlines} polylines={polyline && [polyline]} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/></Tab.Pane> });
    }
    if (data.problems.length!=0) {
      panes.push({ menuItem: 'Distribution', render: () => <Tab.Pane><ChartGradeDistribution accessToken={this.props.accessToken} idArea={0} idSector={data.id}/></Tab.Pane> });
    }
    const nextNr = data.problems.length>0? data.problems[data.problems.length-1].nr+1 : 1;
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
                <Button animated='fade' as={Link} to={{ pathname: `/problem/edit/-1`, query: { idSector: data.id, nr: nextNr, lat: data.lat, lng: data.lng } }}>
                  <Button.Content hidden>Add</Button.Content>
                  <Button.Content visible>
                    <Icon name='plus' />
                  </Button.Content>
                </Button>
                <Button animated='fade' as={Link} to={{ pathname: `/sector/edit/${data.id}`, query: { idArea: data.areaId, lat: data.lat, lng: data.lng } }}>
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
            <Breadcrumb.Section><Link to={`/area/${data.areaId}`}>{data.areaName}</Link> <LockSymbol visibility={data.areaVisibility}/></Breadcrumb.Section>
            <Breadcrumb.Divider icon='right angle' />
            <Breadcrumb.Section active>{data.name} <LockSymbol visibility={data.visibility}/></Breadcrumb.Section>
          </Breadcrumb>
        </div>
        <Tab panes={panes} />
        <Message icon>
          <Icon name="info" />
          <Message.Content>
            <strong>Page views (since 2019.10.09):</strong> {data.hits}<br/>
            {data.comment}
          </Message.Content>
        </Message>
        {data.problems &&
          <Segment>
            <div>
              <div style={{float: 'right'}}>
                <Button icon labelPosition="left" onClick={this.order} size="mini">
                  <Icon name="sort"/>
                  {data.orderByGrade? "Order by number" : "Order by grade"}
                </Button>  
              </div>
              <Header as="h3">{data.metadata.isBouldering? "Problems:" : "Routes:"}</Header>
            </div>
            <List selection>
              {data.problems.map((problem, i) => {
                var ascents = problem.numTicks>0 && (problem.numTicks + (problem.numTicks==1? " ascent" : " ascents"));
                var typeAscents;
                if (data.metadata.isBouldering && ascents) {
                  typeAscents = " (" + ascents + ") ";
                } else if (!data.metadata.isBouldering) {
                  let t = problem.t.subType;
                  if (problem.numPitches>1) t += ", " + problem.numPitches + " pitches";
                  if (ascents) {
                    typeAscents = " (" + t + ", " + ascents + ") ";
                  } else {
                    typeAscents = " (" + t + ") ";
                  }
                }
                return (
                  <List.Item key={i} as={Link} to={`/problem/${problem.id}`}>
                    <List.Header>
                      {problem.danger && <Icon color="red" name="warning"/>}
                      {!data.orderByGrade && `#${problem.nr} `}
                      <a>{problem.name}</a>
                      {' '}{problem.grade}
                      {' '}<Stars numStars={problem.stars}/>
                      {problem.fa && <small>{problem.fa}</small>}
                      {typeAscents && <small>{typeAscents}</small>}
                      {problem.comment && <small><i style={{color: "gray"}}>{' '}{problem.comment}{' '}</i></small>}
                      {problem.hasImages>0 && <Icon color="black" name="photo"/>}
                      {problem.hasMovies>0 && <Icon color="black" name="film"/>}
                      <LockSymbol visibility={problem.visibility}/>
                      {problem.ticked && <Icon color="green" name="check"/>}
                    </List.Header>
                  </List.Item>
                )})}
            </List>
          </Segment>
        }
      </>
    );
  }
}

export default Sector;
