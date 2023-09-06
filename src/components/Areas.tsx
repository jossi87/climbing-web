import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { Button, List, Icon, Segment } from "semantic-ui-react";
import Leaflet from "./common/leaflet/leaflet";
import ChartGradeDistribution from "./common/chart-grade-distribution/chart-grade-distribution";
import { Loading, LockSymbol, SunOnWall } from "./common/widgets/widgets";
import { useAreas } from "../api";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";
import { useMeta } from "./common/meta";
import { HeaderButtons } from "./common/HeaderButtons";
import "./Areas.css";

const Areas = () => {
  const { data } = useAreas();
  const meta = useMeta();
  const [flyToId, setFlyToId] = useState<any>(null);
  const [showForDevelopers, setShowForDevelopers] = useState(false);
  const leafletRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const md = new Remarkable({ breaks: true }).use(linkify);
  // open links in new windows
  md.renderer.rules.link_open = (function () {
    const original = md.renderer.rules.link_open;
    return function (...args: Parameters<typeof original>) {
      const link = original(...args);
      return (
        link.substring(0, link.length - 1) +
        ' rel="noreferrer noopener" target="_blank">'
      );
    };
  })();

  if (!data) {
    return <Loading />;
  }
  const typeDescription = meta.isBouldering ? "problems" : "routes";
  const markers = data
    .filter((a) => a.forDevelopers === showForDevelopers && a.coordinates)
    .map((a) => {
      return {
        id: a.id,
        coordinates: a.coordinates,
        label: a.name,
        url: "/area/" + a.id,
        html: (
          <div style={{ minWidth: "300px" }}>
            <Button
              floated="right"
              compact
              size="mini"
              icon
              as={Link}
              to={"/area/" + a.id}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="external" />
            </Button>
            <Link to={"/area/" + a.id}>
              <b>{a.name}</b>{" "}
              <LockSymbol
                lockedAdmin={a.lockedAdmin}
                lockedSuperadmin={a.lockedSuperadmin}
              />
            </Link>
            <i>{`(${a.numSectors} sectors, ${a.numProblems} ${typeDescription})`}</i>
            <br />
            {a.numProblems > 0 && (
              <ChartGradeDistribution idArea={a.id} idSector={0} data={null} />
            )}
            {a.comment && (
              <div
                className="area-description"
                dangerouslySetInnerHTML={{
                  __html: md.render(a.comment),
                }}
              />
            )}
          </div>
        ),
      };
    });
  const map = markers.length > 0 && (
    <div ref={leafletRef}>
      <Leaflet
        autoZoom={true}
        height="75vh"
        markers={markers}
        defaultCenter={meta.defaultCenter}
        defaultZoom={meta.defaultZoom}
        showSatelliteImage={false}
        clusterMarkers={!showForDevelopers}
        flyToId={flyToId}
      />
    </div>
  );
  return (
    <>
      <Helmet>
        <title>Areas</title>
        <meta
          name="description"
          content={`${data.length} areas for climbing.`}
        />
      </Helmet>
      <Segment>
        <HeaderButtons
          header="Areas"
          subheader={data.length ? `${data.length} areas` : ""}
          icon="list"
        >
          <Button
            positive={!showForDevelopers}
            onClick={() => setShowForDevelopers(false)}
          >
            Developed areas
          </Button>
          <Button
            positive={showForDevelopers}
            onClick={() => setShowForDevelopers(true)}
          >
            Areas for developers
          </Button>
          {meta.isAdmin && (
            <Button animated="fade" as={Link} to={`/area/edit/-1`}>
              <Button.Content hidden>Add</Button.Content>
              <Button.Content visible>
                <Icon name="plus" />
              </Button.Content>
            </Button>
          )}
        </HeaderButtons>
        <List celled link horizontal size="small">
          {data
            .filter((area) => area.forDevelopers === showForDevelopers)
            .map((area) => (
              <React.Fragment key={area.id}>
                <List.Item
                  as="a"
                  onClick={() => {
                    if (area.coordinates) {
                      setFlyToId(area.id);
                      leafletRef?.current?.scrollIntoView({ block: "center" });
                    } else {
                      navigate("/area/" + area.id);
                    }
                  }}
                >
                  {area.name}
                </List.Item>
                <LockSymbol
                  lockedAdmin={area.lockedAdmin}
                  lockedSuperadmin={area.lockedSuperadmin}
                />
              </React.Fragment>
            ))}
        </List>
        {map}
        <List divided relaxed>
          {data
            .filter((area) => area.forDevelopers === showForDevelopers)
            .map((area) => (
              <List.Item key={area.id}>
                <List.Content as={Link} to={`/area/${area.id}`}>
                  <List.Header>
                    {area.name}{" "}
                    <LockSymbol
                      lockedAdmin={area.lockedAdmin}
                      lockedSuperadmin={area.lockedSuperadmin}
                    />
                    <SunOnWall
                      sunFromHour={area.sunFromHour}
                      sunToHour={area.sunToHour}
                    />
                  </List.Header>
                  <List.Description>
                    <i>{`${area.numSectors} sectors, ${area.numProblems} ${typeDescription}, ${area.hits} page views`}</i>
                    <br />
                    <div
                      className="area-description"
                      dangerouslySetInnerHTML={{
                        __html: area.comment,
                      }}
                    />
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
        </List>
      </Segment>
    </>
  );
};

export default Areas;
