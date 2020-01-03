import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Label, Grid, Statistic, Icon, Image, Card, Feed, Segment, Placeholder } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { getFrontpage, getImageUrl, numberWithCommas } from '../api';
import { LockSymbol, Stars } from './common/widgets/widgets';

const Frontpage = ({ accessToken }) => {
  const [data, setData] = useState();

  useEffect(() => {
    getFrontpage(accessToken).then((res) => {
      setData(res);
    });
  }, [accessToken]);

  if (!data) {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column mobile={16} tablet={8} computer={4}>
            <Segment>
              <Placeholder>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
              </Placeholder>
            </Segment>
            <Card>
              <Placeholder>
                <Placeholder.Image square />
              </Placeholder>
              <Card.Content>
                <Placeholder>
                  <Placeholder.Header>
                    <Placeholder.Line />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line />
                  </Placeholder.Paragraph>
                </Placeholder>
              </Card.Content>
            </Card>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={8} computer={12}>
            <Segment>
              <Placeholder>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
                <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
              </Placeholder>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  return (
    <>
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
        <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
      </MetaTags>
      <Grid>
        <Grid.Row>
          <Grid.Column mobile={16} tablet={8} computer={4}>
            <Statistic.Group size="mini" horizontal as={Segment}>
              <Statistic as={Link} to="/browse" color="blue">
                <Statistic.Value><Icon name='list' /> {numberWithCommas(data.numProblems)}</Statistic.Value>
                <Statistic.Label>{data.metadata.isBouldering? "Problems" : "Routes"}</Statistic.Label>
              </Statistic>
              <Statistic>
                <Statistic.Value><Icon name='map marker' /> {numberWithCommas(data.numProblemsWithCoordinates)}</Statistic.Value>
                <Statistic.Label>With coordinates</Statistic.Label>
              </Statistic>
              {!data.metadata.isBouldering &&
                <Statistic>
                  <Statistic.Value><Icon name='image outline' /> {numberWithCommas(data.numProblemsWithTopo)}</Statistic.Value>
                  <Statistic.Label>With topo</Statistic.Label>
                </Statistic>
              }
              <Statistic as={Link} to="/ticks/1" color="blue">
                <Statistic.Value><Icon name='check' /> {numberWithCommas(data.numTicks)}</Statistic.Value>
                <Statistic.Label>Public ascents</Statistic.Label>
              </Statistic>
              <Statistic>
                <Statistic.Value><Icon name='image' /> {numberWithCommas(data.numImages)}</Statistic.Value>
                <Statistic.Label>Images</Statistic.Label>
              </Statistic>
              <Statistic>
                <Statistic.Value><Icon name='film' /> {numberWithCommas(data.numMovies)}</Statistic.Value>
                <Statistic.Label>Ascents on video</Statistic.Label>
              </Statistic>
            </Statistic.Group>
            {data.randomMedia &&
              <>
                <Card as={Link} to={`/problem/${data.randomMedia.idProblem}`}>
                  <Image size="medium" style={{maxHeight: '250px', objectFit: 'cover'}} src={getImageUrl(data.randomMedia.idMedia, 275)} />
                  <Card.Content>
                    <Card.Header>
                      {data.randomMedia.problem} {data.randomMedia.grade}
                    </Card.Header>
                    <Card.Description>
                      <Link to={`/area/${data.randomMedia.idArea}`}>{data.randomMedia.area}</Link> / <Link to={`/sector/${data.randomMedia.idSector}`}>{data.randomMedia.sector}</Link>
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Label.Group size="mini">
                      {data.randomMedia.tagged && data.randomMedia.tagged.map((x, i) => (<Label basic key={i} as={Link} to={`/user/${x.id}`}><Icon name="user"/>{x.name}</Label>))}
                      {data.randomMedia.photographer && <Label basic as={Link} to={`/user/${data.randomMedia.photographer.id}`}><Icon name="photo"/>{data.randomMedia.photographer.name}</Label>}
                    </Label.Group>
                  </Card.Content>
                </Card><br/>
              </>
            }
          </Grid.Column>
          <Grid.Column mobile={16} tablet={8} computer={12}>
            <Feed as={Segment}>
              {data.activity && data.activity.map((a, i) => {
                // FA
                if (a.users) {
                  const typeDescription = data.metadata.isBouldering? "problem" : "route";
                  return (
                    <Feed.Event key={i}>
                      <Feed.Label>
                        {a.problemRandomMediaId>0 && <img style={{height: '35px', objectFit: 'cover'}} src={getImageUrl(a.problemRandomMediaId, 35)} />}
                      </Feed.Label>
                      <Feed.Content>
                        <Feed.Summary>
                          New {typeDescription} <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> {a.grade}<LockSymbol visibility={a.problemVisibility}/><Feed.Date>{a.timeAgo}</Feed.Date>
                        </Feed.Summary>
                        <Feed.Extra text>
                          {a.description}
                        </Feed.Extra>
                        {a.media &&
                          <>
                            <Feed.Extra images as={Link} to={`/problem/${a.problemId}`}>
                              {a.media.map((m, i) => (<img key={i} src={getImageUrl(m.id, 115)}/>))}
                            </Feed.Extra>
                            <br/>
                          </>
                        }
                        {a.users &&
                          <Feed.Meta>
                            {a.users.map((u, i) => (
                              <Label basic key={i} as={Link} to={`/user/${u.id}`} image>
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
                        {a.problemRandomMediaId>0 && <img style={{height: '35px', objectFit: 'cover'}} src={getImageUrl(a.problemRandomMediaId, 35)} />}
                      </Feed.Label>
                      <Feed.Content>
                        <Feed.Summary style={{marginBottom: '3px'}}>
                          {summary}on <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> {a.grade}<LockSymbol visibility={a.problemVisibility}/><Feed.Date>{a.timeAgo}</Feed.Date>
                        </Feed.Summary>
                        <Feed.Extra images as={Link} to={`/problem/${a.problemId}`}>
                          {a.media.map((m, i) => (<img key={i} src={getImageUrl(m.id, 115)}/>))}
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
                          <Feed.User as={Link} to={`/user/${a.id}`} style={{color: "black"}}>{a.name}</Feed.User> posted a comment on <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> {a.grade}<LockSymbol visibility={a.problemVisibility}/><Feed.Date>{a.timeAgo}</Feed.Date>
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
                          <Feed.User as={Link} to={`/user/${a.id}`} style={{color: "black"}}>{a.name}</Feed.User> ticked <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> {a.grade}<LockSymbol visibility={a.problemVisibility}/><Feed.Date>{a.timeAgo}</Feed.Date>
                        </Feed.Summary>
                        {a.description && <Feed.Extra text>{a.description}</Feed.Extra>}
                        {a.stars>0 && <Feed.Meta><Stars numStars={a.stars} /></Feed.Meta>}
                      </Feed.Content>
                    </Feed.Event>
                  )
                }
              })}
            </Feed>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
}

export default Frontpage;
