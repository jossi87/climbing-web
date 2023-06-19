import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import Leaflet from "./common/leaflet/leaflet";
import { Loading } from "./common/widgets/widgets";
import { useAuth0 } from "@auth0/auth0-react";
import { getSites } from "../api";

const Sites = () => {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState(null);
  const { type } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (data) {
      setData(null);
    }
    if (!isLoading) {
      const update = async () => {
        const accessToken = isAuthenticated
          ? await getAccessTokenSilently()
          : null;
        getSites(accessToken, type).then((data) => setData(data));
      };
      update();
    }
  }, [isLoading, isAuthenticated, type]);

  if (isLoading || !data) {
    return <Loading />;
  }
  const outlines = data.regions.map((r) => {
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
      defaultCenter={data.metadata.defaultCenter}
      defaultZoom={data.metadata.defaultZoom}
      navigate={navigate}
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
  return (
    <>
      <Helmet>
        <title>{data.metadata.title}</title>
        <meta name="description" content={data.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={data.metadata.description} />
        <meta property="og:url" content={data.metadata.og.url} />
        <meta property="og:title" content={data.metadata.title} />
        <meta property="og:image" content={data.metadata.og.image} />
        <meta property="og:image:width" content={data.metadata.og.imageWidth} />
        <meta
          property="og:image:height"
          content={data.metadata.og.imageHeight}
        />
        <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
      </Helmet>
      <Button.Group fluid>
        <Button as={Link} to={"/sites/boulder"} active={data.type == "BOULDER"}>
          Bouldering
        </Button>
        <Button
          as={Link}
          to={"/sites/climbing"}
          active={data.type == "CLIMBING"}
        >
          Route climbing
        </Button>
        <Button as={Link} to={"/sites/ice"} active={data.type == "ICE"}>
          Ice climbing
        </Button>
      </Button.Group>
      {map}
    </>
  );
};

export default Sites;
