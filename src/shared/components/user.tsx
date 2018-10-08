import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Chart from './common/chart/chart';
import TickModal from './common/tick-modal/tick-modal';
import { LoadingAndRestoreScroll, CroppedText, LockSymbol, Stars } from './common/widgets/widgets';
import { Icon, Table, Container } from 'semantic-ui-react';

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
      return <LoadingAndRestoreScroll />;
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
        <Container>First ascents: {numFas}<br/>Public ascents: {numTicks}<br/>Pictures taken: {data.numImagesCreated}<br/>Appearance in pictures: {data.numImageTags}<br/>Videos created: {data.numVideosCreated}<br/>Appearance in videos: {data.numVideoTags}</Container>
        {chart}<br/>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>When</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Grade</Table.HeaderCell>
              <Table.HeaderCell>Comment</Table.HeaderCell>
              <Table.HeaderCell>Stars</Table.HeaderCell>
              <Table.HeaderCell>FA</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.ticks.map((t, i) => (
              <Table.Row key={i}>
                <Table.Cell>{t.dateHr}</Table.Cell>
                <Table.Cell><Link to={`/problem/${t.idProblem}`}>{t.name}</Link> <LockSymbol visibility={t.visibility}/></Table.Cell>
                <Table.Cell>{t.grade}</Table.Cell>
                <Table.Cell><CroppedText text={t.comment} i={t.idProblem} maxLength={40}/></Table.Cell>
                <Table.Cell><Stars numStars={t.stars}/></Table.Cell>
                <Table.Cell>{t.fa && <Icon name="check" />}</Table.Cell>
                <Table.Cell>{this.state.data.readOnly==false && t.id!=0 && <OverlayTrigger placement="top" overlay={<Tooltip id={i}>Edit tick</Tooltip>}><Button bsSize="xsmall" bsStyle="primary" onClick={this.openTickModal.bind(this, t)}><Icon name="edit" inverse={true} /></Button></OverlayTrigger>}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}

export default User;
