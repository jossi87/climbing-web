import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Label, Grid, Statistic, Icon, Image, Card, Feed, Rating } from 'semantic-ui-react';
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
            <Grid.Column mobile={16} tablet={8} computer={4}>
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
              <Card as={Link} to={`/problem/${data.randomMedia.idProblem}`}>
                <Image size="medium" style={{maxHeight: '250px', objectFit: 'cover'}} src={getImageUrl(data.randomMedia.idMedia, 800)} />
                <Card.Content>
                  <Card.Header>
                    {data.randomMedia.problem} <Label color={getGradeColor(data.randomMedia.grade)} circular>{data.randomMedia.grade}</Label>
                  </Card.Header>
                  <Card.Description>
                    <Link to={`/area/${data.randomMedia.idArea}`}>{data.randomMedia.area}</Link> / <Link to={`/sector/${data.randomMedia.idSector}`}>{data.randomMedia.sector}</Link>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Label.Group size="tiny">
                    {data.randomMedia.tagged && data.randomMedia.tagged.map((x, i) => (
                      <Label key={i} as={Link} to={`/user/${x.id}`} image>
                        {x.picture && <img src={x.picture} />}<Icon name="user"/>{x.name}
                      </Label>
                    ))}
                    {data.randomMedia.photographer &&
                      <Label as={Link} to={`/user/${data.randomMedia.photographer.id}`} image>
                        {data.randomMedia.photographer.picture && <img src={data.randomMedia.photographer.picture} />}<Icon name="photo"/>{data.randomMedia.photographer.name}
                      </Label>
                    }
                  </Label.Group>
                </Card.Content>
              </Card><br/>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={12}>
              <Feed>
                {data.activity.map((a, i) => {
                  // FA
                  if (a.users) {
                    return (
                      <Feed.Event key={i}>
                        <Feed.Label>
                          {a.problemRandomMediaId>0 && <img style={{height: '35px', objectFit: 'cover'}}  src={getImageUrl(a.problemRandomMediaId, 50)} />}
                        </Feed.Label>
                        <Feed.Content>
                          <Feed.Summary>
                            New problem <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> <Label size="mini" color={getGradeColor(a.grade)} circular>{a.grade}</Label><LockSymbol visibility={a.problemVisibility}/><Feed.Date>{a.timeAgo}</Feed.Date>
                          </Feed.Summary>
                          <Feed.Extra text>
                            {a.description}
                          </Feed.Extra>
                          {a.users &&
                            <Feed.Meta>
                              {a.users.map((u, i) => (
                                <Label key={i} as={Link} to={`/user/${u.id}`} image>
                                  {u.picture?  <img src={u.picture} /> : <Icon name="user"/>} {u.name}
                                </Label>
                              ))}
                            </Feed.Meta>
                          }
                        </Feed.Content>
                      </Feed.Event>
                    )
                  }
                  // Media
                  else if (a.media) {
                    const numImg = a.media.filter(m => !m.isMovie).length;
                    const img = (numImg>0 && <>{numImg} new <Icon name="photo"/></>);
                    const numMov = a.media.filter(m => m.isMovie).length;
                    const mov = (numMov>0 && <>{numMov} new <Icon name="film"/></>);
                    var summary;
                    if (img && mov) {
                      summary = <>{img}and {mov}</>;
                    } else if (mov) {
                      summary = mov;
                    } else {
                      summary = img;
                    }
                    return (
                      <Feed.Event key={i}>
                        <Feed.Label>
                          {a.problemRandomMediaId>0 && <img style={{height: '35px', objectFit: 'cover'}} src={getImageUrl(a.problemRandomMediaId, 50)} />}
                        </Feed.Label>
                        <Feed.Content>
                          <Feed.Summary>
                            {summary}on <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> <Label size="mini" color={getGradeColor(a.grade)} circular>{a.grade}</Label><LockSymbol visibility={a.problemVisibility}/><Feed.Date>{a.timeAgo}</Feed.Date>
                          </Feed.Summary>
                          <Feed.Extra images>
                            {a.media.map((m, i) => (<img key={i} src={getImageUrl(m.id, 120)}/>))}
                          </Feed.Extra>
                        </Feed.Content>
                      </Feed.Event>
                    )
                  }
                  // Guestbook
                  else if (a.message) {
                    return (
                      <Feed.Event key={i}>
                        <Feed.Label>
                          {a.picture && <img src={a.picture} />}
                        </Feed.Label>
                        <Feed.Content>
                          <Feed.Summary>
                            <Feed.User as={Link} to={`/user/${a.id}`}>{a.name}</Feed.User> posted a comment on <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> <Label size="mini" color={getGradeColor(a.grade)} circular>{a.grade}</Label><LockSymbol visibility={a.problemVisibility}/><Feed.Date>{a.timeAgo}</Feed.Date>
                          </Feed.Summary>
                          <Feed.Extra text>
                            {a.message}
                          </Feed.Extra>
                        </Feed.Content>
                      </Feed.Event>
                    )
                  }
                  // Tick
                  else {
                    return (
                      <Feed.Event key={i}>
                        <Feed.Label>
                          {a.picture && <img src={a.picture} />}
                        </Feed.Label>
                        <Feed.Content>
                          <Feed.Summary>
                            <Feed.User as={Link} to={`/user/${a.id}`}>{a.name}</Feed.User> ticked <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> <Label size="mini" color={getGradeColor(a.grade)} circular>{a.grade}</Label><LockSymbol visibility={a.problemVisibility}/><Feed.Date>{a.timeAgo}</Feed.Date>
                          </Feed.Summary>
                          <Feed.Extra text>{a.description}</Feed.Extra>
                          <Feed.Meta><Rating defaultRating={a.stars} maxRating={3} disabled /></Feed.Meta>
                        </Feed.Content>
                      </Feed.Event>
                    )
                  }
                })}
              </Feed>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}

export default Frontpage;
