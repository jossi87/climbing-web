import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import Gallery from './common/gallery/gallery';
import { Loader, Button, Table, Container } from 'semantic-ui-react';
import TickModal from './common/tick-modal/tick-modal';
import CommentModal from './common/comment-modal/comment-modal';
import { Stars } from './common/widgets/widgets';
import { postComment } from './../api';

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

  handleTabsSelection(key) {
    this.setState({tabIndex: key});
  }

  /* intersperse: Return an array with the separator interspersed between
   * each element of the input array.
   *
   * > _([1,2,3]).intersperse(0)
   * [1,0,2,0,3]
  */
  intersperse(arr, sep) {
    if (arr.length === 0) {
      return [];
    }
    return arr.slice(1).reduce((xs, x, i) => {
      return (xs.concat([sep, x]));
    }, [arr[0]]);
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
      return <Loader active inline='centered' />;
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
    const map = markers.length>0 && <Leaflet markers={markers} defaultCenter={{lat: markers[0].lat, lng: markers[0].lng}} defaultZoom={16}/>;
    const gallery = data.media && data.media.length>0? <Gallery auth={this.props.auth} isAdmin={this.state.data.metadata.isAdmin} alt={data.name + ' ' + data.grade + ' (' + data.areaName + " - " + data.sectorName + ')'} media={data.media} showThumbnails={false} removeMedia={this.onRemoveMedia.bind(this)} /> : null;
    var topoContent = null;
    if (map && gallery) {
      topoContent = (
        <Tabs activeKey={this.state.tabIndex} animation={false} onSelect={this.handleTabsSelection.bind(this)} id="problem_tab" unmountOnExit={true}>
          <Tab eventKey={1} title="Media">{this.state.tabIndex==1? gallery : false}</Tab>
          <Tab eventKey={2} title="Map">{this.state.tabIndex==2? map : false}</Tab>
        </Tabs>
      );
    } else if (map) {
      topoContent = map;
    } else if (gallery) {
      topoContent = gallery;
    }
    var fa = data.fa? data.fa.map((u, i) => {return (<Link key={i} to={`/user/${u.id}`}>{u.firstname} {u.surname}</Link>)}) : [];
    fa = this.intersperse(fa, ", ");

    var table = null;
    if (data.ticks) {
      const rows = data.ticks.map((t, i) => {
        const isTickedClassName = t.writable? 'success' : '';
        return (
          <Table.Row key={i}>
            <Table.Cell>{t.date}</Table.Cell>
            <Table.Cell><Link to={`/user/${t.idUser}`}>{t.name}</Link></Table.Cell>
            <Table.Cell>{t.suggestedGrade}</Table.Cell>
            <Table.Cell>{t.comment}</Table.Cell>
            <Table.Cell><Stars numStars={t.stars}/></Table.Cell>
          </Table.Row>
        );
      });
      table = (
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>When</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Grade</Table.HeaderCell>
              <Table.HeaderCell>Comment</Table.HeaderCell>
              <Table.HeaderCell>Stars</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows}
          </Table.Body>
        </Table>
      );
    }

    var comment = null;
    if (data.comments) {
      const comments = data.comments.map((c, i) => {
        var extra = null;
        var bsStyle = "default";
        if (c.danger) {
          extra = " | Flagged as dangerous";
          bsStyle = "danger";
        } else if (c.resolved) {
          extra = " | Flagged as safe";
          bsStyle = "success";
        } else if (data.metadata && data.metadata.isAuthenticated && !data.metadata.isBouldering) {
          extra = <Button bsStyle="warning" bsSize="xsmall" onClick={this.flagAsDangerous.bind(this, c.id)}>Flag as dangerous</Button>;
        }
        const header = <span><Link to={`/user/${c.idUser}`}>{c.name}</Link> <small><i>{c.date}</i></small> {extra}</span>;
        return (
          <Panel key={i} bsStyle={bsStyle}>
      			<Panel.Heading>{header}</Panel.Heading>
      			<Panel.Body>{c.message}</Panel.Body>
      		</Panel>
        );
      });
      comment = <span>{comments}</span>;
    };

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
        <span>
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
        </span>
      );
    };

    var tickModal = null;
    if (data.ticks) {
      const userTicks = data.ticks.filter(t => t.writable);
      if (userTicks && userTicks.length>0) {
        tickModal = <TickModal auth={this.props.auth} idTick={userTicks[0].id} idProblem={data.id} date={userTicks[0].date} comment={userTicks[0].comment} grade={userTicks[0].suggestedGrade} grades={data.metadata.grades} stars={userTicks[0].stars} show={this.state.showTickModal} onHide={this.closeTickModal.bind(this)}/>
      }
    }
    if (!tickModal) {
      tickModal = <TickModal auth={this.props.auth} idTick={-1} idProblem={data.id} grade={data.originalGrade} grades={data.metadata.grades} show={this.state.showTickModal} onHide={this.closeTickModal.bind(this)}/>;
    }

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

        {tickModal}
        <CommentModal auth={this.props.auth} idProblem={data.id} show={this.state.showCommentModal} onHide={this.closeCommentModal.bind(this)} isBouldering={data.metadata.isBouldering}/>
        {data.metadata && data.metadata.isAuthenticated &&
          <span><Button.Group fluid size="mini">
            <Button onClick={this.openTickModal.bind(this)}>Tick</Button>
            <Button onClick={this.openCommentModal.bind(this)}>Add comment</Button>
            {data.metadata.isAdmin?
              <Button as={Link} to={{ pathname: `/problem/edit/${data.id}`, query: { idSector: data.sectorId, lat: data.sectorLat, lng: data.sectorLng } }}>Edit problem</Button>
              :
              <Button as={Link} to={`/problem/edit/media/${data.id}`}>Add image(s)</Button>
            }
          </Button.Group><br/></span>
        }
        {topoContent}
        <Container>
          {!data.metadata.isBouldering && <span><strong>Type:</strong> {data.t.type + " - " + data.t.subType}<br/></span>}
          <strong>Nr:</strong> {data.nr}<br/>
          <strong>Comment:</strong> {data.comment}<br/>
          <strong>FA:</strong> {fa}<br/>
          <strong>FA date:</strong> {data.faDateHr}<br/>
          <strong>Original grade:</strong> {data.originalGrade}<br/>
          {data.sectorLat>0 && data.sectorLng>0 &&
            <span><a href={`http://maps.google.com/maps?q=loc:${data.sectorLat},${data.sectorLng}&navigate=yes`} rel="noopener" target="_blank">Start navigation</a><br/></span>}
          {section}
        </Container>
        {table}<br/>
        {comment}
      </React.Fragment>
    );
  }
}

export default Problem;
