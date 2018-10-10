import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Avatar from 'react-avatar';
import Chart from './common/chart/chart';
import TickModal from './common/tick-modal/tick-modal';
import { LoadingAndRestoreScroll, CroppedText, LockSymbol, Stars } from './common/widgets/widgets';
import { Icon, Table, Label, Button, Header, Segment, Divider, Image } from 'semantic-ui-react';
import { numberWithCommas } from './../api';

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
        <Header>
        {data.picture? <Image circular src={data.picture}/> : <Avatar round name={data.name} size="35" />}
          {data.name}
        </Header>
        {this.state.currTick && <TickModal auth={this.props.auth} idTick={this.state.currTick.id} idProblem={this.state.currTick.idProblem} date={this.state.currTick.date} comment={this.state.currTick.comment} grade={this.state.currTick.grade} grades={data.metadata.grades} stars={this.state.currTick.stars} open={this.state.showTickModal} onClose={this.closeTickModal.bind(this)}/>}
        <Segment>
          <Label.Group size="small">
            <Label color='orange' image><Icon name='check' />{numberWithCommas(numFas)}<Label.Detail>FA</Label.Detail></Label>
            <Label color='olive' image><Icon name='check' />{numberWithCommas(numTicks)}<Label.Detail>Tick</Label.Detail></Label>
            <Label color='green' image><Icon name='photo' />{numberWithCommas(data.numImageTags)}<Label.Detail>Tag</Label.Detail></Label>
            <Label color='teal' image><Icon name='photo' />{numberWithCommas(data.numImagesCreated)}<Label.Detail>Created</Label.Detail></Label>
            <Label color='blue' image><Icon name='video' />{numberWithCommas(data.numVideoTags)}<Label.Detail>Tag</Label.Detail></Label>
            <Label color='violet' image><Icon name='video' />{numberWithCommas(data.numVideosCreated)}<Label.Detail>Created</Label.Detail></Label>
          </Label.Group>
          <Divider />
          {chart}
        </Segment>
        <Table celled compact unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>When</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Grade</Table.HeaderCell>
              <Table.HeaderCell>Comment</Table.HeaderCell>
              <Table.HeaderCell>Stars</Table.HeaderCell>
              <Table.HeaderCell>FA</Table.HeaderCell>
              {this.state.data.readOnly==false && <Table.HeaderCell></Table.HeaderCell>}
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
                {this.state.data.readOnly==false &&
                  <Table.Cell>
                    {t.id!=0 &&
                      <Button compact size="mini" animated='fade' onClick={this.openTickModal.bind(this, t)}>
                        <Button.Content hidden>Edit tick</Button.Content>
                        <Button.Content visible>
                          <Icon name='edit' />
                        </Button.Content>
                      </Button>
                    }
                  </Table.Cell>
                }
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}

export default User;
