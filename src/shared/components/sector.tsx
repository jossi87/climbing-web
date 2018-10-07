import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import Gallery from './common/gallery/gallery';
import { CroppedText, LockSymbol, Stars, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Label, Image, Icon, Button, Card, Tab, Header, Message } from 'semantic-ui-react';
import { getImageUrl, getGradeColor } from '../api';

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
    this.state = {data, tabIndex: 1};
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

  onRemoveMedia(idMediaToRemove) {
    const allMedia = this.state.data.media.filter(m => m.id!=idMediaToRemove);
    this.setState({media: allMedia});
  }

  render() {
    const { data } = this.state;
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
    if (markers.length>0) {
      const defaultCenter = data.lat && data.lat>0? {lat: data.lat, lng: data.lng} : data.metadata.defaultCenter;
      const defaultZoom = data.lat && data.lat>0? 15 : data.metadata.defaultZoom;
      panes.push({ menuItem: 'Map', render: () => <Tab.Pane><Leaflet markers={markers} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/></Tab.Pane> });
    }
    if (data.media && data.media.length>0) {
      panes.push({ menuItem: 'Topo', render: () => <Tab.Pane><Gallery auth={this.props.auth} isAdmin={this.state.data.metadata.isAdmin} alt={data.name + " (" + data.areaName + ")"} media={data.media} showThumbnails={data.media.length>1} removeMedia={this.onRemoveMedia.bind(this)}/></Tab.Pane> });
    }
    const nextNr = data.problems.length>0? data.problems[data.problems.length-1].nr+1 : 1;
    return (
      <React.Fragment>
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
        {this.state && this.state.data && this.state.data.metadata.isAdmin &&
          <span><Button.Group fluid size="mini">
            <Button as={Link} to={{ pathname: `/problem/edit/-1`, query: { idSector: data.id, nr: nextNr, lat: data.lat, lng: data.lng } }}>Add problem</Button>
            <Button as={Link} to={{ pathname: `/sector/edit/${data.id}`, query: { idArea: data.areaId, lat: data.lat, lng: data.lng } }}>Edit sector</Button>
          </Button.Group><br/></span>
        }
        <Header as="h1"><Link to={`/area/${data.areaId}`}>{data.areaName}</Link> | {data.name}</Header>
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
          <span>
            <br/>
            <Card.Group link stackable itemsPerRow={3}>
              {data.problems.map((problem, i) => (
                <Card as={Link} to={`/problem/${problem.id}`} key={i}>
                  <Card.Content>
                    {problem.randomMediaId>0 && <Image floated='right' size='tiny' style={{maxHeight: '65px', objectFit: 'cover'}}  src={getImageUrl(problem.randomMediaId, 130)} />}
                    <Card.Header>
                      {problem.nr}. {problem.name} <Label color={getGradeColor(problem.grade)} circular>{problem.grade}</Label> <LockSymbol visibility={problem.visibility}/>
                    </Card.Header>
                    <Card.Meta>
                      <Stars numStars={problem.stars}/>
                    </Card.Meta>
                    <Card.Description>
                      <CroppedText text={problem.comment} maxLength={150}/>
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Label.Group>
                      <Label><Icon name='check' /> {problem.numTicks}</Label>
                      <Label><Icon name='photo' /> {problem.numImages}</Label>
                      <Label><Icon name='video' /> {problem.numMovies}</Label>
                      {problem.fa && problem.fa.map((u, i) => (
                        <Label as={Link} to={`/user/${u.id}`}><Icon name='at' />{u.firstname} {u.surname}</Label>
                      ))}
                    </Label.Group>
                  </Card.Content>
                </Card>
              ))}
            </Card.Group>
          </span>
        }
      </React.Fragment>
    );
  }
}

export default Sector;
