import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import Media from './common/media/media';
import { LockSymbol, Stars, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Segment, Icon, Button, List, Tab, Breadcrumb, Message, Header } from 'semantic-ui-react';

class Sector extends Component<any, any> {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data, orderByGrade: true};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.sectorId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.sectorId !== this.props.match.params.sectorId) {
      this.refresh(this.props.match.params.sectorId);
    }
  }

  refresh(id) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), id).then((data) => this.setState(() => ({data})));
  }

  onRemoveMedia = (idMediaToRemove) => {
    const { data } = this.state;
    data.media = data.media.filter(m => m.id!=idMediaToRemove);
    this.setState({data});
  }

  order = () => {
    const orderByGrade = !this.state.orderByGrade;
    this.state.data.problems.sort((a, b) => {
      if (orderByGrade && a.gradeNumber != b.gradeNumber) {
        return b.gradeNumber-a.gradeNumber;
      }
      return a.nr-b.nr;
    });
    this.setState({orderByGrade});
  }

  render() {
    const { data, orderByGrade } = this.state;
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
      panes.push({ menuItem: 'Topo', render: () => <Tab.Pane><Media auth={this.props.auth} isAdmin={data.metadata.isAdmin} removeMedia={this.onRemoveMedia} media={data.media} /></Tab.Pane> });
    }
    if (markers.length>0) {
      const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
      const defaultZoom = data.lat && data.lat>0? 15 : data.metadata.defaultZoom;
      panes.push({ menuItem: 'Map', render: () => <Tab.Pane><Leaflet height='40vh' markers={markers} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/></Tab.Pane> });
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
        {data.comment &&
          <Message icon>
            <Icon name="info" />
            <Message.Content>
              {data.comment}
            </Message.Content>
          </Message>
        }
        {data.problems &&
          <Segment>
            <div style={{marginBottom: '5px'}}>
              <div style={{float: 'right'}}>
                <Button secondary icon labelPosition="left" onClick={this.order} size="tiny">
                  <Icon name="filter"/>
                  {orderByGrade? "Order by number" : "Order by grade"}
                </Button>  
              </div>
              <Header as="h2">{data.metadata.isBouldering? "Problems:" : "Routes:"}</Header>
            </div>
            <List selection>
              {data.problems.map((problem, i) => (
                <List.Item key={i} as={Link} to={`/problem/${problem.id}`}>
                  <List.Content floated="left">
                    <List.Header>
                      {problem.danger && <Icon color="red" name="warning"/>}
                      {!orderByGrade && `#${problem.nr} `}
                      <a>{problem.name}</a>
                      {' '}{problem.grade}
                      {' '}<Stars numStars={problem.stars}/>
                      {problem.fa && <i style={{color: "gray"}}>{problem.fa} </i>}
                      {problem.hasImages>0 && <Icon color="black" name="photo"/>}
                      {problem.hasMovies>0 && <Icon color="black" name="film"/>}
                      <LockSymbol visibility={problem.visibility}/>
                      {problem.ticked && <Icon color="green" name="check"/>}
                    </List.Header>
                  </List.Content>
                  <List.Content floated="right">
                    <List.Description>
                      {!data.metadata.isBouldering && ` ${problem.t.type} - ${problem.t.subType}`}
                    </List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Segment>
        }
      </>
    );
  }
}

export default Sector;
