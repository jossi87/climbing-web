import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Button, Card, Breadcrumb, Icon } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';

class Browse extends Component<any, any> {
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
      this.props.fetchInitialData(this.props.auth.getAccessToken()).then((data) => this.setState(() => ({data})));
    }
  }

  render() {
    if (!this.state || !this.state.data) {
      return <LoadingAndRestoreScroll />;
    }
    const typeDescription = this.state.data.metadata.isBouldering? "problem(s)" : "routes(s)";
    const markers = this.state.data.areas.filter(a => a.lat!=0 && a.lng!=0).map(a => {
      return {
          lat: a.lat,
          lng: a.lng,
          label: a.name,
          url: '/area/' + a.id
        }
    });
    const map = markers.length>0 && <><Leaflet height='40vh' useOpenStreetMap={true} markers={markers} defaultCenter={this.state.data.metadata.defaultCenter} defaultZoom={this.state.data.metadata.defaultZoom}/><br/></>;
    return (
      <>
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
        <div style={{marginBottom: '5px'}}>
          <div style={{float: 'right'}}>
            {this.state && this.state.data && this.state.data.metadata.isAdmin &&
              <Button.Group size="mini" compact>
                <Button animated='fade' as={Link} to={`/area/edit/-1`}>
                  <Button.Content hidden>Add</Button.Content>
                  <Button.Content visible>
                    <Icon name='plus' />
                  </Button.Content>
                </Button>
              </Button.Group>
            }
          </div>
          <Breadcrumb>
            <Breadcrumb.Section active>Browse areas</Breadcrumb.Section>
          </Breadcrumb>
        </div>
        {map}
        <Card.Group itemsPerRow={3} stackable>
          {this.state.data.areas.map((area, i) => (
            <Card as={Link} to={`/area/${area.id}`} key={i}>
              <Card.Content>
                <Card.Header>{area.name}  <LockSymbol visibility={area.visibility}/></Card.Header>
                <Card.Meta>
                  {`${area.numSectors} sector(s), ${area.numProblems} ${typeDescription}`}
                </Card.Meta>
                <Card.Description>
                  {area.comment && area.comment.length>50? area.comment.substring(0,50) + "..." : area.comment}
                </Card.Description>
              </Card.Content>
            </Card>
          ))}
        </Card.Group>
      </>
    );
  }
}

export default Browse;
