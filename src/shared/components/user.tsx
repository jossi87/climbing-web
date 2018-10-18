import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Chart from './common/chart/chart';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { Icon, List, Label, Header, Segment, Divider, Image, Rating } from 'semantic-ui-react';
import { numberWithCommas, getGradeColor } from './../api';

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
    this.state = {data};
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
          {data.picture && <Image circular src={data.picture}/>} {data.name}
        </Header>
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
        <Segment>
          <List divided relaxed>
            {data.ticks.map((t, i) => (
              <List.Item key={i}>
                <List.Content>
                  <List.Header>
                    <Link to={`/problem/${t.idProblem}`}>{t.name}</Link> <LockSymbol visibility={t.visibility}/> <Label size="mini" color={getGradeColor(t.grade)} circular>{t.grade}</Label> {t.fa && <Label color="red" size="mini" content="FA"/>}
                  </List.Header>
                  <List.Description>
                    <Rating defaultRating={t.stars} maxRating={3} disabled /><br/>
                    {t.dateHr && <small>{t.dateHr}<br/></small>}
                    {t.comment}
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Segment>
      </React.Fragment>
    );
  }
}

export default User;