import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import Gallery from './common/gallery/gallery';
import { Button, Table, Message, Breadcrumb, Tab, Label, Icon, Card, Feed } from 'semantic-ui-react';
import TickModal from './common/tick-modal/tick-modal';
import CommentModal from './common/comment-modal/comment-modal';
import { Stars, LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { postComment, getGradeColor } from './../api';

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
      tabIndex: 1,
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

  closeTickModal(event) {
    this.setState({ showTickModal: false });
    this.refresh(this.props.match.params.problemId);
  }

  openTickModal(event) {
    this.setState({ showTickModal: true });
  }

  closeCommentModal(event) {
    this.setState({ showCommentModal: false });
    this.refresh(this.props.match.params.problemId);
  }

  openCommentModal(event) {
    this.setState({ showCommentModal: true });
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
      panes.push({ menuItem: 'Media', render: () => <Tab.Pane><Gallery auth={this.props.auth} isAdmin={this.state.data.metadata.isAdmin} alt={data.name + ' ' + data.grade + ' (' + data.areaName + " - " + data.sectorName + ')'} media={data.media} showThumbnails={false} removeMedia={this.onRemoveMedia.bind(this)} /></Tab.Pane> });
    }
    if (markers.length>0) {
      panes.push({ menuItem: 'Map', render: () => <Tab.Pane><Leaflet markers={markers} defaultCenter={{lat: markers[0].lat, lng: markers[0].lng}} defaultZoom={16}/></Tab.Pane> });
    }
    
    var section = null;
    if (data.sections) {
      const sections = data.sections.map((s, i) => {
        return (
          <tr key={i}>
            <Table.Cell>{s.nr}</Table.Cell>
            <Table.Cell>{s.grade}</Table.Cell>
            <Table.Cell>{s.description}</Table.Cell>
          </tr>
        );
      });
      section = (
        <>
          <strong>Sections:</strong><br/>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>#</Table.HeaderCell>
                <Table.HeaderCell>Grade</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sections}
            </Table.Body>
          </Table>
        </>
      );
    };
    const ticks = data.ticks && data.ticks.map((t, i) => (
      <Feed.Event key={i}>
        <Feed.Label image='https://lh6.googleusercontent.com/-s_VyX0LiBvQ/AAAAAAAAAAI/AAAAAAABcLk/VYX29AjXHAw/photo.jpg' />
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
    const comments = data.comments && data.comments.map((c, i) => (
      <Feed.Event key={i}>
        <Feed.Label image='https://lh6.googleusercontent.com/-s_VyX0LiBvQ/AAAAAAAAAAI/AAAAAAABcLk/VYX29AjXHAw/photo.jpg' />
        <Feed.Content>
          <Feed.Summary>
            <Feed.User as={Link} to={`/user/${c.idUser}`}>{c.name}</Feed.User>
            <Feed.Date>{c.date}</Feed.Date>
          </Feed.Summary>
          <Feed.Content>{c.message}</Feed.Content>
        </Feed.Content>
      </Feed.Event>
    ));
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
        <Breadcrumb>
          <Breadcrumb.Section><Link to={`/area/${data.areaId}`}>{data.areaName}</Link> <LockSymbol visibility={data.areaVisibility}/></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section><Link to={`/sector/${data.sectorId}`}>{data.sectorName}</Link> <LockSymbol visibility={data.sectorVisibility}/></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>{data.name} <Label color={getGradeColor(data.grade)} circular>{data.grade}</Label> <LockSymbol visibility={data.visibility}/></Breadcrumb.Section>
        </Breadcrumb><br/><br/>
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
                <Label as={Link} to={`http://maps.google.com/maps?q=loc:${data.sectorLat},${data.sectorLng}&navigate=yes`} rel="noopener" target="_blank">Start navigation</Label>}
              {section}
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
        TODO HSE
      </>
    );
  }
}

export default Problem;
