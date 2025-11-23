import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Segment, Button, Header, Icon } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { Loading } from './common/widgets/widgets';
import { useMeta } from './common/meta';

const Sites = () => {
  const meta = useMeta();
  const { type } = useParams();

  if (!meta || !meta.sites || meta.sites.length === 0) {
    return <Loading />;
  }
  const outlines = meta.sites
    .filter((s) => s.group.toLowerCase() === type)
    .map((s) => ({
      url: s.url,
      label: s.name,
      outline: s.outline,
    }));
  const map = (
    <Leaflet
      autoZoom={true}
      height='85vh'
      outlines={outlines}
      defaultCenter={meta.defaultCenter}
      defaultZoom={meta.defaultZoom}
      markers={null}
      slopes={null}
      onMouseClick={null}
      onMouseMove={null}
      showSatelliteImage={false}
      clusterMarkers={false}
      rocks={null}
      flyToId={null}
    />
  );
  let description = meta.sites.filter((s) => s.group.toLowerCase() === type).length + ' ';
  if (type === 'bouldering') {
    description += 'bouldering sites';
  } else if (type === 'climbing') {
    description += 'rock climbing sites';
  } else if (type === 'ice') {
    description += 'ice climbing sites';
  }
  return (
    <>
      <title>{`Sites | ${meta?.title}`}</title>
      <meta name='description' content={description}></meta>
      <Segment>
        <Header as='h2'>
          <Icon name='world' />
          <Header.Content>
            Sites
            <Header.Subheader>{description}</Header.Subheader>
          </Header.Content>
        </Header>
        <Button.Group fluid>
          <Button as={Link} to={'/sites/bouldering'} primary={type === 'bouldering'}>
            Bouldering
          </Button>
          <Button as={Link} to={'/sites/climbing'} primary={type === 'climbing'}>
            Route climbing
          </Button>
          <Button as={Link} to={'/sites/ice'} primary={type === 'ice'}>
            Ice climbing
          </Button>
        </Button.Group>
        {map}
      </Segment>
    </>
  );
};

export default Sites;
