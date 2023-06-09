import React from "react";
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import { Segment, Button, Header, Icon } from "semantic-ui-react";
import Leaflet from "./common/leaflet/leaflet";
import { Loading } from "./common/widgets/widgets";
import { useMeta } from "./common/meta";

const Sites = () => {
  const meta = useMeta();
  const { type } = useParams();

  if (!meta || !meta.sites || meta.sites.length === 0) {
    return <Loading />;
  }
  const outlines = meta.sites
    .filter((s) => s.group.toLowerCase() === type)
    .map((s) => {
      const polygon = s.polygonCoords.split(";").map((c) => {
        const latLng = c.split(",");
        return [parseFloat(latLng[0]), parseFloat(latLng[1])];
      });
      return {
        url: s.url,
        label: s.name,
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
  let description =
    meta.sites.filter((s) => s.group.toLowerCase() === type).length + " ";
  if (type === "bouldering") {
    description += "bouldering sites";
  } else if (type === "climbing") {
    description += "rock climbing sites";
  } else if (type === "ice") {
    description += "ice climbing sites";
  }
  return (
    <>
      <Helmet>
        <title>Sites</title>
        <meta name="description" content={description}></meta>
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="world" />
          <Header.Content>
            Sites
            <Header.Subheader>{description}</Header.Subheader>
          </Header.Content>
        </Header>
        <Button.Group fluid>
          <Button
            as={Link}
            to={"/sites/bouldering"}
            active={type === "bouldering"}
          >
            Bouldering
          </Button>
          <Button as={Link} to={"/sites/climbing"} active={type === "climbing"}>
            Route climbing
          </Button>
          <Button as={Link} to={"/sites/ice"} active={type === "ice"}>
            Ice climbing
          </Button>
        </Button.Group>
        {map}
      </Segment>
    </>
  );
};

export default Sites;
