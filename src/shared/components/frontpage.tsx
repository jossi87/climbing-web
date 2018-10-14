import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Label, List, Grid, Statistic, Icon, Image, Header, Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { getImageUrl, numberWithCommas, getGradeColor } from '../api';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';

class Frontpage extends Component<any, any> {
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
      this.refresh();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated) {
      this.refresh();
    }
  }

  refresh() {
    this.props.fetchInitialData(this.props.auth.getAccessToken()).then((data) => this.setState(() => ({data})));
  }

  render() {
    const { data } = this.state;
    if (!data) {
      return <LoadingAndRestoreScroll />;
    }
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
        <Grid>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Statistic.Group size="mini" horizontal>
                <Statistic color='olive'>
                  <Statistic.Value><Icon name='list' /> {numberWithCommas(data.numProblems)}</Statistic.Value>
                  <Statistic.Label>Problems</Statistic.Label>
                </Statistic>
                <Statistic color='green'>
                  <Statistic.Value><Icon name='map marker' /> {numberWithCommas(data.numProblemsWithCoordinates)}</Statistic.Value>
                  <Statistic.Label>With coordinates</Statistic.Label>
                </Statistic>
                {!data.metadata.isBouldering &&
                  <Statistic color='teal'>
                    <Statistic.Value><Icon name='image outline' /> {numberWithCommas(data.numProblemsWithTopo)}</Statistic.Value>
                    <Statistic.Label>With topo</Statistic.Label>
                  </Statistic>
                }
                <Statistic color='blue'>
                  <Statistic.Value><Icon name='check' /> {numberWithCommas(data.numTicks)}</Statistic.Value>
                  <Statistic.Label>Public ascents</Statistic.Label>
                </Statistic>
                <Statistic color='violet'>
                  <Statistic.Value><Icon name='image' /> {numberWithCommas(data.numImages)}</Statistic.Value>
                  <Statistic.Label>Images</Statistic.Label>
                </Statistic>
                <Statistic color='purple'>
                  <Statistic.Value><Icon name='film' /> {numberWithCommas(data.numMovies)}</Statistic.Value>
                  <Statistic.Label>Ascents on video</Statistic.Label>
                </Statistic>
              </Statistic.Group>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Card as={Link} to={`/problem/${data.randomMedia.idProblem}`}>
                <Image size="medium" src={getImageUrl(data.randomMedia.idMedia, 480)} />
                <Card.Content>
                  <Card.Header>
                    {data.randomMedia.problem} <Label color={getGradeColor(data.randomMedia.grade)} circular>{data.randomMedia.grade}</Label>
                  </Card.Header>
                  <Card.Description><small>
                    <Link to={`/area/${data.randomMedia.idArea}`}>{data.randomMedia.area}</Link> / <Link to={`/sector/${data.randomMedia.idSector}`}>{data.randomMedia.sector}</Link><br/>
                    <Icon name='user' /> {data.randomMedia.inPhoto? data.randomMedia.inPhoto : "Unknown"}<br/>
                    <Icon name='camera' /> <Link to={`/user/${data.randomMedia.idCreator}`}>{data.randomMedia.creator}</Link>
                  </small></Card.Description>
                </Card.Content>
              </Card>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column mobile={16} tablet={8} computer={4}>
              <Header>Newest</Header>
              <List selection>
                {data.fas.map((fa, i) => (
                  <List.Item key={i} as={Link} to={`/problem/${fa.idProblem}`}>
                    <Image size="tiny" style={{maxHeight: '60px', objectFit: 'cover'}} src={fa.randomMediaId? getImageUrl(fa.randomMediaId, 120) : '/png/image.png'} />
                    <List.Content>
                      <List.Header>
                        {fa.problem} <Label size="mini" color={getGradeColor(fa.grade)} circular>{fa.grade}</Label> <LockSymbol visibility={fa.problemVisibility}/>
                      </List.Header>
                      <List.Description>
                        {fa.date}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={4}>
              <Header>Media</Header>
              <List selection>
                {data.medias.map((m, i) => (
                  <List.Item key={i} as={Link} to={`/problem/${m.idProblem}`}>
                    <Image size="tiny" style={{maxHeight: '60px', objectFit: 'cover'}} src={getImageUrl(m.idMedia, 120)} />
                    <List.Content>
                      <List.Header>
                        {m.problem} <Label size="mini" color={getGradeColor(m.grade)} circular>{m.grade}</Label> <LockSymbol visibility={m.visibility}/>
                      </List.Header>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={4}>
              <Header>Ticks</Header>
              <List selection>
                {data.ascents.map((t, i) => (
                  <List.Item key={i} as={Link} to={`/problem/${t.idProblem}`}>
                    <Image avatar size="mini" style={{maxHeight: '30px', objectFit: 'cover'}} src={t.picture? t.picture : '/png/image.png'}/>
                    <List.Content>
                      <List.Header>
                        {t.problem} <Label size="mini" color={getGradeColor(t.grade)} circular>{t.grade}</Label> <LockSymbol visibility={t.visibility}/>
                      </List.Header>
                      <List.Description>
                        {t.user} ({t.date})
                      </List.Description>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={4}>
              <Header>Comments</Header>
              <List selection>
                {data.comments.map((c, i) => (
                  <List.Item key={i} as={Link} to={`/problem/${c.idProblem}`}>
                    <Image avatar size="mini" style={{maxHeight: '30px', objectFit: 'cover'}} src={c.picture? c.picture : '/png/image.png'}/>
                    <List.Content>
                      <List.Header>
                        {c.problem} <Label size="mini" color={getGradeColor(c.grade)} circular>{c.grade}</Label> <LockSymbol visibility={c.visibility}/>
                      </List.Header>
                      <List.Description>
                        {c.date}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}

export default Frontpage;
