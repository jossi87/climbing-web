import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import { Segment, Button, Header, Icon } from "semantic-ui-react";
import Leaflet from "./common/leaflet/leaflet";
import { Loading } from "./common/widgets/widgets";
import { useAuth0 } from "@auth0/auth0-react";
import { useMeta } from "./common/meta";
import { getSites } from "../api";

const Sites = () => {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const meta = useMeta();
  const [data, setData] = useState<any>(null);
  const { type } = useParams();

  useEffect(() => {
    if (!isLoading) {
      const update = async () => {
        const accessToken = isAuthenticated
          ? await getAccessTokenSilently()
          : null;
        getSites(accessToken, type).then((data) => setData(data));
      };
      update();
    }
  }, [isLoading, isAuthenticated, type, getAccessTokenSilently]);

  if (isLoading || !data) {
    return <Loading />;
  }
  const outlines = data.map((r) => {
    const polygon = r.polygonCoords.split(";").map((c) => {
      const latLng = c.split(",");
      return [parseFloat(latLng[0]), parseFloat(latLng[1])];
    });
    return {
      url: r.url,
      label:
        r.name +
        " (" +
        r.numProblems +
        (type === "boulder" ? " boulders" : " routes") +
        ")",
      polygon: polygon,
    };
  });
  const map = (
    <Leaflet
      autoZoom={true}
      height="85vh"
      outlines={outlines}
      defaultCenter={meta.defaultCenter}
      defaultZoom={meta.defaultZoom}
      markers={null}
      polylines={null}
      onMouseClick={null}
      onMouseMove={null}
      showSateliteImage={false}
      clusterMarkers={false}
      rocks={null}
      flyToId={null}
    />
  );
  let description = data.length;
  if (data[0].system === "BOULDER") {
    description += " bouldering sites";
  } else if (data[0].system === "CLIMBING") {
    description += " rock climbing sites";
  } else if (data[0].system === "ICE") {
    description += " ice climbing sites";
  }
  return (
    <>
      <Helmet>
        <title>Sites</title>
        <meta name="description" content={description}></meta>
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="sitemap" />
          <Header.Content>
            Sites
            <Header.Subheader>{description}</Header.Subheader>
          </Header.Content>
        </Header>
        <Button.Group fluid>
          <Button
            as={Link}
            to={"/sites/boulder"}
            active={data[0].system == "BOULDER"}
          >
            Bouldering
          </Button>
          <Button
            as={Link}
            to={"/sites/climbing"}
            active={data[0].system == "CLIMBING"}
          >
            Route climbing
          </Button>
          <Button as={Link} to={"/sites/ice"} active={data[0].system == "ICE"}>
            Ice climbing
          </Button>
        </Button.Group>
        {map}
      </Segment>
    </>
  );
};

export default Sites;
