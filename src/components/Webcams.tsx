import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Leaflet from "./common/leaflet/leaflet";
import { Segment, Header, Icon } from "semantic-ui-react";
import { Loading } from "./common/widgets/widgets";
import { useMeta } from "./common/meta";
import { useData } from "../api";

const Webcams = () => {
  const meta = useMeta();
  const { data } = useData(`/webcams`);
  const { json } = useParams();

  if (!data) {
    return <Loading />;
  }

  const markers = data
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
  let defaultCenter = meta.defaultCenter;
  let defaultZoom = meta.defaultZoom;
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
        <title>Webcams | {meta.title}</title>
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="camera" />
          <Header.Content>
            Webcams
            {subHeader && <Header.Subheader>{subHeader}</Header.Subheader>}
          </Header.Content>
        </Header>
        <Leaflet
          height="85vh"
          autoZoom={false}
          outlines={null}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
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

export default Webcams;
