import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Leaflet from "./common/leaflet/leaflet";
import { Segment, Header, Icon } from "semantic-ui-react";
import { Loading } from "./common/widgets/widgets";
import { useData } from "../api";

const WebcamMap = () => {
  const { data } = useData(`/cameras`);
  const { json } = useParams();
  const navigate = useNavigate();

  if (!data) {
    return <Loading />;
  }

  const markers = data.cameras
    .filter((c) => c.lat != 0 && c.lng != 0)
    .map((c) => {
      return {
        lat: c.lat,
        lng: c.lng,
        isCamera: true,
        name: c.name,
        lastUpdated: c.lastUpdated,
        urlStillImage: c.urlStillImage,
        urlYr: c.urlYr,
        urlOther: c.urlOther,
      };
    });
  let defaultCenter = data.metadata.defaultCenter;
  let defaultZoom = data.metadata.defaultZoom;
  let subHeader;
  if (json) {
    const { lat, lng, label } = JSON.parse(json);
    subHeader = label;
    defaultCenter = { lat, lng };
    defaultZoom = 10;
    markers.push({ lat, lng, label });
  }
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
      <Segment>
        <Header as="h2">
          <Icon name="camera" />
          <Header.Content>
            Webcam Map
            {subHeader && <Header.Subheader>{subHeader}</Header.Subheader>}
          </Header.Content>
        </Header>
        <Leaflet
          height="85vh"
          autoZoom={false}
          outlines={null}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          navigate={navigate}
          markers={markers}
          polylines={null}
          onMouseClick={null}
          onMouseMove={null}
          showSateliteImage={false}
          clusterMarkers={false}
          rocks={null}
          flyToId={null}
        />
      </Segment>
    </>
  );
};

export default WebcamMap;
