import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { useParams, useHistory, Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSites } from '../api';

interface TypeParams {
  type: string;
}
const Sites = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  let { type } = useParams<TypeParams>();
  let history = useHistory();
  useEffect(() => {
    if (data) {
      setData(null);
    }
    if (!loading) {
      getSites(accessToken, type).then((data) => setData(data));
    }
  }, [loading, accessToken, type]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  var outlines = data.regions.map(r => {
    const polygon = r.polygonCoords.split(";").map(c => {
      const latLng = c.split(",");
      return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
    });
    return {url: r.url, label: r.name + " (" + r.numProblems + (type==='bouldering'? " boulders" : " routes") + ")", polygon: polygon};
  });
  const map = <Leaflet autoZoom={true} height='85vh' outlines={outlines} defaultCenter={data.metadata.defaultCenter} defaultZoom={data.metadata.defaultZoom} history={history} markers={null} polylines={null} onClick={null} clusterMarkers={false} />;
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
      <Button.Group fluid>
        <Button as={Link} to={'/sites/bouldering'} active={data.isBouldering}>Bouldering sites</Button>
        <Button as={Link} to={'/sites/climbing'}  active={!data.isBouldering}>Climbing sites</Button>
      </Button.Group>
      {map}
    </>
  );
}

export default Sites;
