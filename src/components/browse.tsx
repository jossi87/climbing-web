import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Button, List, Breadcrumb, Icon, Segment } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { getBrowse } from '../api';

class Browse extends Component<any, any> {
  componentDidMount() {
    if (!this.state || !this.state.data) {
      getBrowse(this.props.accessToken).then((data) => this.setState(() => ({data})));
    }
  }

  render() {
    if (!this.state || !this.state.data) {
      return <LoadingAndRestoreScroll />;
    }
    const typeDescription = this.state.data.metadata.isBouldering? "problem(s)" : "route(s)";
    const markers = this.state.data.areas.filter(a => a.lat!=0 && a.lng!=0).map(a => {
      return {
          lat: a.lat,
          lng: a.lng,
          label: a.name,
          url: '/area/' + a.id
        }
    });
    const map = markers.length>0 && <><Leaflet height='75vh' markers={markers} defaultCenter={this.state.data.metadata.defaultCenter} defaultZoom={this.state.data.metadata.defaultZoom}/><br/></>;
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
          <meta property="fb:app_id" content={this.state.data.metadata.og.fbAppId} />
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
        <List divided relaxed as={Segment}>
          {this.state.data.areas.map((area, i) => (
            <List.Item key={i}>
              <List.Content as={Link} to={`/area/${area.id}`}>
                <List.Header><Link to={`/area/${area.id}`}>{area.name}</Link> <LockSymbol visibility={area.visibility}/></List.Header>
                <List.Description>
                  <i>{`${area.numSectors} sector(s), ${area.numProblems} ${typeDescription}, ${area.hits} page views (since 2019.10.09)`}</i><br/>
                  {area.comment && area.comment.length>350? area.comment.substring(0,350) + "..." : area.comment}
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </>
    );
  }
}

export default Browse;
