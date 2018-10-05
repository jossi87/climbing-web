import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Breadcrumb, Loader, Table, Button, Icon } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { LockSymbol } from './common/widgets/widgets';

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
      return <Loader active inline='centered' />;
    }
    const markers = this.state.data.areas.filter(a => a.lat!=0 && a.lng!=0).map(a => {
      return {
          lat: a.lat,
          lng: a.lng,
          label: a.name,
          url: '/area/' + a.id
        }
    });
    const map = markers.length>0? <Leaflet useOpenStreetMap={true} markers={markers} defaultCenter={this.state.data.metadata.defaultCenter} defaultZoom={this.state.data.metadata.defaultZoom}/> : null;
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

        <Button animated='fade' floated="right">
          <Button.Content visible><Icon name="plus square" /></Button.Content>
          <Button.Content hidden>Add area</Button.Content>
        </Button>

        <Breadcrumb>
          <Breadcrumb.Section link as={Link} to='/'>Home</Breadcrumb.Section>
          <Breadcrumb.Divider />
          <Breadcrumb.Section active>Browse</Breadcrumb.Section>
        </Breadcrumb>
        {map}
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>#sectors</Table.HeaderCell>
              <Table.HeaderCell>#problems</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.state.data.areas.map((area, i) => (
              <Table.Row>
                <Table.Cell><Link to={`/area/${area.id}`}>{area.name}</Link> <LockSymbol visibility={area.visibility}/></Table.Cell>
                <Table.Cell>{area.numSectors}</Table.Cell>
                <Table.Cell>{area.numProblems}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}

export default Browse;
