import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import Media from './common/media/media';
import { CroppedText, LockSymbol, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Button, Tab, Item, Message, Icon, Image, Breadcrumb } from 'semantic-ui-react';
import { getImageUrl } from '../api';

class Area extends Component<any, any> {
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
      this.refresh(this.props.match.params.areaId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated || prevProps.match.params.areaId !== this.props.match.params.areaId) {
      this.refresh(this.props.match.params.areaId);
    }
  }

  refresh(id) {
    this.props.fetchInitialData(this.props.auth.getAccessToken(), id).then((data) => this.setState(() => ({data})));
  }

  onRemoveMedia = (idMediaToRemove) => {
    const { data } = this.state;
    data.media = data.media.filter(m => m.id!=idMediaToRemove);
    this.setState({data});
  }

  render() {
    if (!this.state.data) {
      return <LoadingAndRestoreScroll />;
    }
    const markers = this.state.data.sectors.filter(s => s.lat!=0 && s.lng!=0).map(s => {
      return {
          lat: s.lat,
          lng: s.lng,
          url: '/sector/' + s.id,
          isParking: true
        }
    });
    const outlines = this.state.data.sectors.filter(s => s.polygonCoords).map(s => {
      const polygon = s.polygonCoords.split(";").map((c, i) => {
        const latLng = c.split(",");
        return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
      });
      return {url: '/sector/' + s.id, label: s.name, polygon: polygon}
    });
    const panes = [];
    const height = '40vh';
    if (this.state.data.media && this.state.data.media.length>0) {
      panes.push({ menuItem: 'Topo', render: () => <Tab.Pane><Media auth={this.props.auth} isAdmin={this.state.data.metadata.isAdmin} removeMedia={this.onRemoveMedia} media={this.state.data.media} /></Tab.Pane> });
    }
    if (markers.length>0 || outlines.length>0) {
      const defaultCenter = this.state.data.lat && this.state.data.lat>0? {lat: this.state.data.lat, lng: this.state.data.lng} : this.state.data.metadata.defaultCenter;
      const defaultZoom = this.state.data.lat && this.state.data.lat>0? 14 : this.state.data.metadata.defaultZoom;
      panes.push({ menuItem: 'Map', render: () => <Tab.Pane><Leaflet height={height} useOpenStreetMap={true} markers={markers} outlines={outlines} defaultCenter={defaultCenter} defaultZoom={defaultZoom}/></Tab.Pane> });
    }
    return (
      <>
        <MetaTags>
          {this.state.data.metadata.canonical && <link rel="canonical" href={this.state.data.metadata.canonical} />}
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(this.state.data.metadata.jsonLd)}} />
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
            {this.state.data.metadata.isAdmin &&
              <Button.Group size="mini" compact>
                <Button animated='fade' as={Link} to={{ pathname: `/sector/edit/-1`, query: { idArea: this.state.data.id, lat: this.state.data.lat, lng: this.state.data.lng } }}>
                  <Button.Content hidden>Add</Button.Content>
                  <Button.Content visible>
                    <Icon name='plus' />
                  </Button.Content>
                </Button>
                <Button animated='fade' as={Link} to={{ pathname: `/area/edit/${this.state.data.id}`, query: { lat: this.state.data.lat, lng: this.state.data.lng } }}>
                  <Button.Content hidden>Edit</Button.Content>
                  <Button.Content visible>
                    <Icon name='edit' />
                  </Button.Content>
                </Button>
              </Button.Group>
            }
          </div>
          <Breadcrumb>
            <Breadcrumb.Section><Link to='/browse'>Browse</Link></Breadcrumb.Section>
            <Breadcrumb.Divider icon='right angle' />
            <Breadcrumb.Section active>{this.state.data.name} <LockSymbol visibility={this.state.data.visibility}/></Breadcrumb.Section>
          </Breadcrumb>
        </div>
        <Tab panes={panes} /><br/>
        {this.state.data.comment &&
          <Message icon>
            <Icon name="info" />
            <Message.Content>
              <div dangerouslySetInnerHTML={{ __html: this.state.data.comment }} />
            </Message.Content>
          </Message>
        }
        {this.state.data.sectors &&
          <>
            <br/>
            <Item.Group link unstackable>
              {this.state.data.sectors.map((sector, i) => (
                <Item as={Link} to={`/sector/${sector.id}`} key={i}>
                  <Image size="small" style={{maxHeight: '150px', objectFit: 'cover'}} src={sector.randomMediaId? getImageUrl(sector.randomMediaId, 150) : '/png/image.png'} />
                  <Item.Content>
                    <Item.Header>
                      {sector.name} <LockSymbol visibility={sector.visibility}/>
                    </Item.Header>
                    <Item.Meta>
                      {sector.numProblems} {this.state.data.metadata.isBouldering? "problem(s)" : "route(s)"}
                    </Item.Meta>
                    <Item.Description>
                      <CroppedText text={sector.comment} maxLength={150}/>
                    </Item.Description>
                  </Item.Content>
                </Item>
              ))}
            </Item.Group>
          </>
        }
      </>
    );
  }
}

export default Area;