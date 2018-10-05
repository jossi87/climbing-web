import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { List, Grid, Loader, Statistic, Card, Icon, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';

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

  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  render() {
    if (!this.state || !this.state.data) {
      return <Loader active inline='centered' />;
    }

    return (
      <React.Fragment>
        <MetaTags>
          <title>{this.state.data.metadata.title}</title>
          <meta name="description" content={this.state.data.metadata.description} />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={this.state.data.metadata.description} />
          <meta property="og:url" content={this.state.data.metadata.og.url} />
          <meta property="og:title" content={this.state.data.metadata.title} />
          <meta property="og:image" content={this.state.data.metadata.og.image} />
          <meta property="og:image:width" content={this.state.data.metadata.og.imageWidth} />
          <meta property="og:image:height" content={this.state.data.metadata.og.imageHeight} />
        </MetaTags>
        <Grid divided inverted stackable>
          <Grid.Row>
            <Grid.Column width={6}>
            <Card>
              <Card.Content>
                <Card.Description>
                  <Statistic.Group horizontal size='small'>
                    <Statistic>
                      <Statistic.Value>{this.numberWithCommas(this.state.data.numProblems)}</Statistic.Value>
                      <Statistic.Label>Problems</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>{this.numberWithCommas(this.state.data.numProblemsWithCoordinates)}</Statistic.Value>
                      <Statistic.Label>Coordinates</Statistic.Label>
                    </Statistic>
                    {!this.state.data.metadata.isBouldering &&
                      <Statistic>
                        <Statistic.Value>{this.numberWithCommas(this.state.data.numProblemsWithTopo)}</Statistic.Value>
                        <Statistic.Label>On topo</Statistic.Label>
                      </Statistic>
                    }
                    <Statistic>
                      <Statistic.Value>{this.numberWithCommas(this.state.data.numTicks)}</Statistic.Value>
                      <Statistic.Label>Public ascents</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>{this.numberWithCommas(this.state.data.numImages)}</Statistic.Value>
                      <Statistic.Label>Images</Statistic.Label>
                    </Statistic>
                    <Statistic>
                      <Statistic.Value>{this.numberWithCommas(this.state.data.numMovies)}</Statistic.Value>
                      <Statistic.Label>Ascents on video</Statistic.Label>
                    </Statistic>
                  </Statistic.Group>
                </Card.Description>
              </Card.Content>
            </Card>
            </Grid.Column>
            <Grid.Column width={8}>
              <Card>
                <Image style={{maxWidth: '100%'}} src={getImageUrl(this.state.data.randomMedia.idMedia, 480)} />
                <Card.Content>
                  <Card.Header>
                    <Link to={`/problem/${this.state.data.randomMedia.idProblem}`}>{this.state.data.randomMedia.problem}</Link> {this.state.data.randomMedia.grade}
                  </Card.Header>
                  <Card.Meta>
                    <Link to={`/area/${this.state.data.randomMedia.idArea}`}>{this.state.data.randomMedia.area}</Link>/ <Link to={`/area/${this.state.data.randomMedia.idSector}`}>{this.state.data.randomMedia.sector}</Link>
                  </Card.Meta>
                  <Card.Description>
                    <Icon name='user' />
                    {this.state.data.randomMedia.inPhoto? this.state.data.randomMedia.inPhoto : "Unknown"}
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Link to={`/user/${this.state.data.randomMedia.idCreator}`}>
                    <Icon name='camera' />
                    {this.state.data.randomMedia.creator}
                  </Link>
                </Card.Content>
              </Card>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <List>
                <List.Item>
                  <Image avatar src='https://react.semantic-ui.com/images/avatar/small/rachel.png' />
                  <List.Content>
                    <List.Header as='a'>Rachel</List.Header>
                    <List.Description>
                      Last seen watching{' '}
                      <a>
                        <b>Arrested Development</b>
                      </a>{' '}
                      just now.
                    </List.Description>
                  </List.Content>
                </List.Item>
              </List>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}

export default Frontpage;
