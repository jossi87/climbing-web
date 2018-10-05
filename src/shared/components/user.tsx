import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Button, OverlayTrigger, Tooltip, Well, Breadcrumb, Table } from 'react-bootstrap';
import Chart from './common/chart/chart';
import TickModal from './common/tick-modal/tick-modal';
import { CroppedText, LockSymbol, Stars } from './common/widgets/widgets';
import { Loader, Image } from 'semantic-ui-react';

class User extends Component<any, any> {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data, showTickModal: false};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.refresh(this.props.match.params.userId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.userId !== this.props.match.params.userId) {
      this.refresh(this.props.match.params.userId);
    }
  }

  refresh(id) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), id).then((data) => this.setState(() => ({data})));
  }

  closeTickModal(event) {
    this.setState({ showTickModal: false });
    this.refresh(this.props.match.params.userId);
  }

  openTickModal(t, event) {
    this.setState({ currTick: t, showTickModal: true });
  }

  render() {
    const { data } = this.state;
    if (!data) {
      return <Loader active inline='centered' />;
    }

    var numTicks = data.ticks.filter(t => !t.fa).length;
    var numFas = data.ticks.filter(t => t.fa).length;

    const chart = data.ticks.length>0? <Chart data={data.ticks}/> : null;

    return (
      <React.Fragment>
        <MetaTags>
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

        {this.state.currTick? <TickModal auth={this.props.auth} idTick={this.state.currTick.id} idProblem={this.state.currTick.idProblem} date={this.state.currTick.date} comment={this.state.currTick.comment} grade={this.state.currTick.grade} grades={data.metadata.grades} stars={this.state.currTick.stars} show={this.state.showTickModal} onHide={this.closeTickModal.bind(this)}/> : ""}
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / {data.name}
        </Breadcrumb>
        <Well bsSize="small">First ascents: {numFas}<br/>Public ascents: {numTicks}<br/>Pictures taken: {data.numImagesCreated}<br/>Appearance in pictures: {data.numImageTags}<br/>Videos created: {data.numVideosCreated}<br/>Appearance in videos: {data.numVideoTags}</Well>
        {chart}<br/>
        <Table striped condensed hover>
          <thead>
            <tr>
              <th>When</th>
              <th>Name</th>
              <th>Grade</th>
              <th>Comment</th>
              <th>Stars</th>
              <th>FA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.ticks.map((t, i) => (
              <tr key={i}>
                <td>{t.dateHr}</td>
                <td><Link to={`/problem/${t.idProblem}`}>{t.name}</Link> <LockSymbol visibility={t.visibility}/></td>
                <td>{t.grade}</td>
                <td><CroppedText text={t.comment} i={t.idProblem} maxLength={40}/></td>
                <td><Stars numStars={t.stars}/></td>
                <td>{t.fa && <Image name="check" />}</td>
                <td>{this.state.data.readOnly==false && t.id!=0 && <OverlayTrigger placement="top" overlay={<Tooltip id={i}>Edit tick</Tooltip>}><Button bsSize="xsmall" bsStyle="primary" onClick={this.openTickModal.bind(this, t)}><Image name="edit" inverse={true} /></Button></OverlayTrigger>}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </React.Fragment>
    );
  }
}

export default User;
