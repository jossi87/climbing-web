import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import Media from './common/media/media';
import { Button, Message, Grid, Breadcrumb, Tab, Label, Icon, List, Comment, Header, Segment } from 'semantic-ui-react';
import { LoadingAndRestoreScroll, LockSymbol, Stars } from './common/widgets/widgets';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getProblem, getTodo, postComment, postTodo } from '../api';
import TickModal from './common/tick-modal/tick-modal';
import CommentModal from './common/comment-modal/comment-modal';

const Problem = ({ match }) => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState();
  const [forceUpdate, setForceUpdate] = useState(1);
  const [showTickModal, setShowTickModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!loading) {
      const id = match.params.problemId;
      getProblem(accessToken, id).then((data) => setData(data));
    }
  }, [loading, accessToken, match, forceUpdate]);

  function onRemoveMedia(idMediaToRemove) {
    data.media = data.media.filter(m => m.id!=idMediaToRemove);
    setData(data);
    setForceUpdate(forceUpdate+1);
  }

  function flagAsDangerous(id) {
    if (confirm('Are you sure you want to flag this comment?')) {
      setSaving(true);
      postComment(accessToken, id, -1, null, true, false)
        .then((response) => {
          setSaving(false);
          setForceUpdate(forceUpdate+1);
        })
        .catch((error) => {
          console.warn(error);
          alert(error.toString());
        });
    }
  }

  function toggleTodo(problemId : number) {
    setSaving(true);
    getTodo(accessToken, "-1")
    .then((data) => {
      const todo = data.todo.filter(x => x.problemId==problemId);
      let id = -1;
      let priority = 1;
      let isDelete = false;
      if (todo.length === 1) {
        id = todo[0].id;
        priority = todo[0].priority;
        isDelete = true;
      }
      postTodo(accessToken, id, problemId, priority, isDelete)
      .then((response) => {
        setSaving(false);
        setForceUpdate(forceUpdate+1);
      })
      .catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    })
    .catch((error) => {
      console.warn(error);
      alert(error.toString());
    });
  }

  function closeTickModal() {
    setShowTickModal(false);
    setForceUpdate(forceUpdate+1);
  }

  function openTickModal() {
    setShowTickModal(true);
  }

  function closeCommentModal() {
    setShowCommentModal(false);
    setForceUpdate(forceUpdate+1);
  }

  function openCommentModal() {
    setShowCommentModal(true);
  }

  if (!data || saving) {
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
      render: () => <Tab.Pane><Media accessToken={accessToken} isAdmin={data.metadata.isAdmin} removeMedia={onRemoveMedia} media={data.media} useBlueNotRed={data.metadata.useBlueNotRed} /></Tab.Pane>
    });
  }
  if (markers.length>0) {
    var outlines;
    if (data.sectorPolygonCoords && markers.filter(m => !m.isParking).length===0) {
      const polygon = data.sectorPolygonCoords.split(";").map(c => {
        const latLng = c.split(",");
        return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
      });
      outlines = [{url: '/sector/' + data.sectorId, label: data.sectorName, polygon: polygon}];
    }
    const polyline = data.sectorPolyline && {
      label: data.sectorName,
      polyline: data.sectorPolyline.split(";").map(e => {
        return e.split(",").map(Number);
      })
    };
    panes.push({
      menuItem: { key: 'map', icon: 'map', content: 'Map' },
      render: () => <Tab.Pane><Leaflet height='40vh' markers={markers} outlines={outlines} polylines={polyline && [polyline]} defaultCenter={{lat: markers[0].lat, lng: markers[0].lng}} defaultZoom={16}/></Tab.Pane>
    });
  }
  
  const ticks = (
    <Comment.Group as={Segment}>
      <Header as="h3" dividing>Ticks:</Header>
      {data.ticks?
        data.ticks.map((t, i) => (
          <Comment key={i}>
            <Comment.Avatar src={t.picture? t.picture : '/png/image.png'} />
            <Comment.Content>
              <Comment.Author as={Link} to={`/user/${t.idUser}`}>{t.name}</Comment.Author>
              <Comment.Metadata>{t.date}</Comment.Metadata>
              <Comment.Text><Stars numStars={t.stars} /> {t.suggestedGrade}<br/>{t.comment}</Comment.Text>
            </Comment.Content>
          </Comment>
        ))
      :
        <i>No ticks</i>
      }
    </Comment.Group>
  );
  const comments = (
    <Comment.Group as={Segment}>
      <Header as="h3" dividing>Comments:</Header>
      {data.comments?
        data.comments.map((c, i) => {
          var extra = null;
          if (c.danger) {
            extra = <Label color="red">Flagged as dangerous</Label>;
          } else if (c.resolved) {
            extra = <Label color="green">Flagged as safe</Label>;
          } else if (data.metadata && data.metadata.isAuthenticated && !data.metadata.isBouldering) {
            extra = <Button basic size="tiny" compact onClick={() => flagAsDangerous(c.id)}>Flag as dangerous</Button>;
          }
          return (
            <Comment key={i}>
              <Comment.Avatar src={c.picture? c.picture : '/png/image.png'} />
              <Comment.Content>
                <Comment.Author as={Link} to={`/user/${c.idUser}`}>{c.name}</Comment.Author>
                <Comment.Metadata>{c.date}</Comment.Metadata>
                <Comment.Text>{c.message}</Comment.Text>
                {extra && <Comment.Actions>{extra}</Comment.Actions>}
              </Comment.Content>
            </Comment>
        )})
      :
        <i>No comments</i>
      }
    </Comment.Group>
  );
  
  var tickModal = null;
  if (data.ticks) {
    const userTicks = data.ticks.filter(t => t.writable);
    if (userTicks && userTicks.length>0) {
      tickModal = <TickModal accessToken={accessToken} idTick={userTicks[0].id} idProblem={data.id} date={userTicks[0].date} comment={userTicks[0].comment} grade={userTicks[0].suggestedGrade} grades={data.metadata.grades} stars={userTicks[0].stars} open={showTickModal} onClose={closeTickModal}/>
    }
  }
  if (!tickModal) {
    tickModal = <TickModal accessToken={accessToken} idTick={-1} idProblem={data.id} grade={data.originalGrade} grades={data.metadata.grades} open={showTickModal} onClose={closeTickModal} comment={null} stars={null} date={null} />;
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
      {tickModal}
      <CommentModal accessToken={accessToken} idProblem={data.id} open={showCommentModal} onClose={closeCommentModal} isBouldering={data.metadata.isBouldering}/>
      <div style={{marginBottom: '5px'}}>
        <div style={{float: 'right'}}>
          {data.metadata && data.metadata.isAuthenticated &&
            <Button.Group size="mini" compact>
              <Button positive={data.todo} animated='fade' onClick={() => toggleTodo(data.id)}>
                <Button.Content hidden>To-do</Button.Content>
                <Button.Content visible>
                  <Icon name='bookmark' />
                </Button.Content>
              </Button>
              <Button positive={data.ticks && data.ticks.filter(t => t.writable).length>0} animated='fade' onClick={openTickModal}>
                <Button.Content hidden>Tick</Button.Content>
                <Button.Content visible>
                  <Icon name='check' />
                </Button.Content>
              </Button>
              <Button animated='fade' onClick={openCommentModal}>
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
        </div>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/browse'>Browse</Link></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section><Link to={`/area/${data.areaId}`}>{data.areaName}</Link> <LockSymbol visibility={data.areaVisibility}/></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section><Link to={`/sector/${data.sectorId}`}>{data.sectorName}</Link> <LockSymbol visibility={data.sectorVisibility}/></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>{data.name} {data.grade} <LockSymbol visibility={data.visibility}/></Breadcrumb.Section>
        </Breadcrumb>
      </div>
      <Tab panes={panes} />
      <Message icon>
        <Icon name="info" />
        <Message.Content>
          {!data.metadata.isBouldering && <><strong>Type:</strong> {data.t.subType}<br/></>}
          <strong>Nr:</strong> {data.nr}<br/>
          <strong>Comment:</strong> {data.comment}<br/>
          <strong>FA:</strong> {data.fa && data.fa.map((u, i) => (
            <Label key={i} as={Link} to={`/user/${u.id}`} image>
              {u.picture ? <img src={u.picture} /> : <Icon name="user"/>}{u.name}
            </Label>
          ))}<br/>
          <strong>FA date:</strong> {data.faDateHr}<br/>
          <strong>Original grade:</strong> {data.originalGrade}<br/>
          {data.sectorLat>0 && data.sectorLng>0 &&
            <>
              <strong>Navigation:</strong> 
              <Label as="a" href={`https://maps.google.com/maps?q=loc:${data.sectorLat},${data.sectorLng}&navigate=yes`} rel="noopener" target="_blank"><Icon name="map" />Google Maps</Label><br/>
            </>
          }
          <strong>Page views (since 2019.10.09):</strong> {data.hits}<br/>
          {data.sections &&
            <>
              <strong>Pitches:</strong>
              <List ordered>
                {data.sections.map((s, i) => (
                  <List.Item key={i}>
                    <List.Content>
                      <List.Header>{s.grade}</List.Header>
                      <List.Description>{s.description}</List.Description>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </>
          }
        </Message.Content>
      </Message>
      <Grid>
        <Grid.Column mobile={16} tablet={8} computer={8}>{ticks}</Grid.Column>
        <Grid.Column mobile={16} tablet={8} computer={8}>{comments}</Grid.Column>
      </Grid>
    </>
  );
}

export default Problem;
