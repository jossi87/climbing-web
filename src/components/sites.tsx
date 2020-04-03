import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { useParams, useHistory, Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getSites } from '../api';

const Sites = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  let { type } = useParams();
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
  const typeDescription = type==='bouldering'? "Bouldering sites" : "Climbing sites";
  var outlines = data.map(r => {
    const polygon = r.polygonCoords.split(";").map(c => {
      const latLng = c.split(",");
      return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
    });
    return {url: r.url, label: r.name + " (" + r.numProblems + (type==='bouldering'? " boulders" : " routes") + ")", polygon: polygon};
  });
  const map = <Leaflet height='85vh' outlines={outlines} defaultCenter={{lat: 65.27462, lng: 18.55251}} defaultZoom="5" history={history} markers={null} polylines={null} onClick={null} />;
  return (
    <>
      <MetaTags>
        <title>{typeDescription}</title>
      </MetaTags>
      <Button.Group fluid>
        <Button as={Link} to={'/sites/bouldering'} active={type==='bouldering'}>Bouldering sites</Button>
        <Button as={Link} to={'/sites/climbing'}  active={type==='climbing'}>Climbing sites</Button>
      </Button.Group>
      {map}
    </>
  );
}

export default Sites;
