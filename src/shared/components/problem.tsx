import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import Gallery from './common/gallery/gallery';
import Avatar from 'react-avatar';
import { Button, Message, Grid, Breadcrumb, Tab, Label, Icon, Card, Feed, Image, List } from 'semantic-ui-react';
import { Stars, LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { postComment, getGradeColor } from './../api';
import TickModal from './common/tick-modal/tick-modal';
import CommentModal from './common/comment-modal/comment-modal';

class Problem extends Component<any, any> {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {
      data,
      showTickModal: false,
      showCommentModal: false
    };
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.problemId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.problemId !== this.props.match.params.problemId) {
      this.refresh(this.props.match.params.problemId);
    }
  }

  refresh(id) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), id).then((data) => this.setState(() => ({data})));
  }



  onRemoveMedia(idMediaToRemove) {
    const allMedia = this.state.data.media.filter(m => m.id!=idMediaToRemove);
    this.setState({media: allMedia});
  }

  flagAsDangerous(id) {
    if (confirm('Are you sure you want to flag this comment?')) {
      this.setState({isSaving: true});
      postComment(this.props.auth.getAccessToken(), id, -1, null, true, false)
        .then((response) => {
          this.setState({isSaving: false});
          this.refresh(this.props.match.params.problemId);
        })
        .catch((error) => {
          console.warn(error);
          alert(error.toString());
        });
    }
  }

  closeTickModal() {
    this.setState({ showTickModal: false });
    this.refresh(this.props.match.params.problemId);
  }

  openTickModal() {
    this.setState({ showTickModal: true });
  }

  closeCommentModal() {
    this.setState({ showCommentModal: false });
    this.refresh(this.props.match.params.problemId);
  }

  openCommentModal() {
    this.setState({ showCommentModal: true });
  }

  render() {
    const { data } = this.state;
    if (!data || this.state.isSaving) {
      return <LoadingAndRestoreScroll />;
    }

    const markers = [];
    if (data.lat>0 && data.lng>0) {
      markers.push({
        lat: data.lat,
        lng: data.lng,
        label: data.name + ' [' + data.grade + ']',
        url: '/problem/' + data.id
      });
    }
    if (data.sectorLat>0 && data.sectorLng>0) {
      markers.push({
        lat: data.sectorLat,
        lng: data.sectorLng,
        url: '/sector/' + data.sectorId,
        isParking: true
      });
    }
    const panes = [];
    if (data.media && data.media.length>0) {
      panes.push({
        menuItem: { key: 'media', icon: 'images', content: 'Media' },
        render: () => <Tab.Pane><Gallery auth={this.props.auth} isAdmin={this.state.data.metadata.isAdmin} alt={data.name + ' ' + data.grade + ' (' + data.areaName + " - " + data.sectorName + ')'} media={data.media} showThumbnails={false} removeMedia={this.onRemoveMedia.bind(this)} /></Tab.Pane>
      });
    }
    if (markers.length>0) {
      panes.push({
        menuItem: { key: 'map', icon: 'map', content: 'Map' },
        render: () => <Tab.Pane><Leaflet markers={markers} defaultCenter={{lat: markers[0].lat, lng: markers[0].lng}} defaultZoom={16}/></Tab.Pane>
      });
    }
    
    const ticks = data.ticks && data.ticks.map((t, i) => (
      <Feed.Event key={i}>
        <Feed.Label>
          {t.picture? <Image src={t.picture}/> : <Avatar round name={t.name} size="35" />}
        </Feed.Label>
        <Feed.Content>
          <Feed.Summary>
            <Feed.User as={Link} to={`/user/${t.idUser}`}>{t.name}</Feed.User>
            <Feed.Date>{t.date}</Feed.Date>
            <Label size="tiny" color={getGradeColor(t.suggestedGrade)} circular>{t.suggestedGrade}</Label>
          </Feed.Summary>
          <Feed.Content>{t.comment}</Feed.Content>
          <Feed.Label><Stars numStars={t.stars}/></Feed.Label>
        </Feed.Content>
      </Feed.Event>
    ));
    const comments = data.comments && data.comments.map((c, i) => {
      var extra = null;
      if (c.danger) {
        extra = <Label color="red">Flagged as dangerous</Label>;
      } else if (c.resolved) {
        extra = <Label color="green">Flagged as safe</Label>;
      } else if (data.metadata && data.metadata.isAuthenticated && !data.metadata.isBouldering) {
        extra = <Button basic size="tiny" compact onClick={this.flagAsDangerous.bind(this, c.id)}>Flag as dangerous</Button>;
      }
      return (
        <Feed.Event key={i}>
          <Feed.Label>
            {c.picture? <Image src={c.picture}/> : <Avatar round name={c.name} size="35" />}
          </Feed.Label>
          <Feed.Content>
            <Feed.Summary>
              <Feed.User as={Link} to={`/user/${c.idUser}`}>{c.name}</Feed.User>
              <Feed.Date>{c.date}</Feed.Date>
            </Feed.Summary>
            <Feed.Content>{c.message}</Feed.Content>
          </Feed.Content>
          {extra && <Feed.Extra>{extra}</Feed.Extra>}
        </Feed.Event>
    )});
    var tickModal = null;
    if (data.ticks) {
      const userTicks = data.ticks.filter(t => t.writable);
      if (userTicks && userTicks.length>0) {
        tickModal = <TickModal auth={this.props.auth} idTick={userTicks[0].id} idProblem={data.id} date={userTicks[0].date} comment={userTicks[0].comment} grade={userTicks[0].suggestedGrade} grades={data.metadata.grades} stars={userTicks[0].stars} open={this.state.showTickModal} onClose={this.closeTickModal.bind(this)}/>
      }
    }
    if (!tickModal) {
      tickModal = <TickModal auth={this.props.auth} idTick={-1} idProblem={data.id} grade={data.originalGrade} grades={data.metadata.grades} open={this.state.showTickModal} onClose={this.closeTickModal.bind(this)}/>;
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
        </MetaTags>
        {tickModal}
        <CommentModal auth={this.props.auth} idProblem={data.id} open={this.state.showCommentModal} onClose={this.closeCommentModal.bind(this)} isBouldering={data.metadata.isBouldering}/>
        <Grid divided='vertically'>
          <Grid.Row columns={2}>
            <Grid.Column>
            <Breadcrumb>
              <Breadcrumb.Section><Link to='/browse'>Browse</Link></Breadcrumb.Section>
              <Breadcrumb.Divider icon='right angle' />
              <Breadcrumb.Section><Link to={`/area/${data.areaId}`}>{data.areaName}</Link> <LockSymbol visibility={data.areaVisibility}/></Breadcrumb.Section>
              <Breadcrumb.Divider icon='right angle' />
              <Breadcrumb.Section><Link to={`/sector/${data.sectorId}`}>{data.sectorName}</Link> <LockSymbol visibility={data.sectorVisibility}/></Breadcrumb.Section>
              <Breadcrumb.Divider icon='right angle' />
              <Breadcrumb.Section active>{data.name} <Label color={getGradeColor(data.grade)} circular>{data.grade}</Label> <LockSymbol visibility={data.visibility}/></Breadcrumb.Section>
            </Breadcrumb>
            </Grid.Column>
            <Grid.Column textAlign="right">
              {data.metadata && data.metadata.isAuthenticated &&
                <Button.Group>
                  <Button animated='fade' onClick={this.openTickModal.bind(this)}>
                    <Button.Content hidden>Tick</Button.Content>
                    <Button.Content visible>
                      <Icon name='check' />
                    </Button.Content>
                  </Button>
                  <Button animated='fade' onClick={this.openCommentModal.bind(this)}>
                    <Button.Content hidden>Comment</Button.Content>
                    <Button.Content visible>
                      <Icon name='comment' />
                    </Button.Content>
                  </Button>
                  {data.metadata.isAdmin?
                    <Button animated='fade' as={Link} to={{ pathname: `/problem/edit/${data.id}`, query: { idSector: data.sectorId, lat: data.sectorLat, lng: data.sectorLng } }}>
                      <Button.Content hidden>Edit</Button.Content>
                      <Button.Content visible>
                        <Icon name='edit' />
                      </Button.Content>
                    </Button>
                  :
                    <Button animated='fade' as={Link} to={`/problem/edit/media/${data.id}`}>
                      <Button.Content hidden>Image</Button.Content>
                      <Button.Content visible>
                        <Icon name='edit' />
                      </Button.Content>
                    </Button>
                  }
                </Button.Group>
              }
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Tab panes={panes} />
        <Message icon>
          <Icon name="info" />
          <Message.Content>
            {!data.metadata.isBouldering && <><strong>Type:</strong> {data.t.type + " - " + data.t.subType}<br/></>}
            <strong>Nr:</strong> {data.nr}<br/>
            <strong>Comment:</strong> {data.comment}<br/>
            <strong>FA:</strong> {data.fa && data.fa.map(u => (<Label as={Link} to={`/user/${u.id}`}>{u.firstname} {u.surname}</Label>))}<br/>
            <strong>FA date:</strong> {data.faDateHr}<br/>
            <strong>Original grade:</strong> {data.originalGrade}<br/>
            {data.sectorLat>0 && data.sectorLng>0 &&
              <>
                <strong>Navigation:</strong> 
                <Label as="a" href={`http://maps.google.com/maps?q=loc:${data.sectorLat},${data.sectorLng}&navigate=yes`} rel="noopener" target="_blank"><Icon name="map" />Google Maps</Label>
                <br/>
              </>
            }
            {data.sections &&
              <>
                <strong>Sections:</strong><br/>
                <List divided relaxed>
                  {data.sections.map((s, i) => (
                    <List.Item>
                      <List.Icon verticalAlign='middle'>
                        <Label color={getGradeColor(s.grade)} circular>{s.grade}</Label>
                      </List.Icon>
                      <List.Content>
                        <List.Header>#{s.nr}</List.Header>
                        <List.Description>{s.description}</List.Description>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </>
            }
          </Message.Content>
        </Message>
        {ticks && (
          <Card fluid>
            <Card.Content>
              <Card.Header>Ticks</Card.Header>
            </Card.Content>
            <Card.Content>
              <Feed>
                {ticks}
              </Feed>
            </Card.Content>
          </Card>
        )}
        {comments && (
          <Card fluid>
            <Card.Content>
              <Card.Header>Comments</Card.Header>
            </Card.Content>
            <Card.Content>
              <Feed>
                {comments}
              </Feed>
            </Card.Content>
          </Card>
        )}
      </>
    );
  }
}

export default Problem;
