import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  Header,
  Button,
  List,
  Icon,
  Segment,
  ButtonGroup,
} from "semantic-ui-react";
import Leaflet from "./common/leaflet/leaflet";
import ChartGradeDistribution from "./common/chart-grade-distribution/chart-grade-distribution";
import { Loading, LockSymbol } from "./common/widgets/widgets";
import { useData } from "../api";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";
import { useMeta } from "./common/meta";

const Areas = () => {
  const { data } = useData(`/areas`);
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
  const typeDescription =
    meta.gradeSystem === "BOULDER" ? "problems" : "routes";
  const markers = data
    .filter(
      (a) => a.forDevelopers === showForDevelopers && a.lat != 0 && a.lng != 0
    )
    .map((a) => {
      return {
        id: a.id,
        lat: a.lat,
        lng: a.lng,
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
              <ChartGradeDistribution
                accessToken={data.accessToken}
                idArea={a.id}
                idSector={0}
                data={null}
              />
            )}
            {a.comment && (
              <div
                dangerouslySetInnerHTML={{
                  __html: md.render(
                    a.comment && a.comment.length > 200
                      ? a.comment.substring(0, 200) + "..."
                      : a.comment
                  ),
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
        polylines={null}
        outlines={null}
        onMouseClick={null}
        onMouseMove={null}
        showSateliteImage={false}
        clusterMarkers={!showForDevelopers}
        rocks={null}
        flyToId={flyToId}
      />
    </div>
  );
  return (
    <>
      <Helmet>
        <title>Areas | {meta.title}</title>
      </Helmet>
      <Segment>
        <ButtonGroup floated="right" size="mini">
          <Button
            active={!showForDevelopers}
            onClick={() => setShowForDevelopers(false)}
          >
            Developed areas
          </Button>
          <Button
            active={showForDevelopers}
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
        </ButtonGroup>
        <Header as="h2">
          <Icon name="list" />
          <Header.Content>
            Areas
            <Header.Subheader>{data.length} areas</Header.Subheader>
          </Header.Content>
        </Header>
        <List celled link horizontal size="small">
          {data
            .filter((a) => a.forDevelopers === showForDevelopers)
            .map((area, i) => (
              <React.Fragment key={i}>
                <List.Item
                  key={i}
                  as="a"
                  onClick={() => {
                    if (area.lat && area.lng) {
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
            .filter((a) => a.forDevelopers === showForDevelopers)
            .map((area, i) => (
              <List.Item key={i}>
                <List.Content as={Link} to={`/area/${area.id}`}>
                  <List.Header>
                    {area.name}{" "}
                    <LockSymbol
                      lockedAdmin={area.lockedAdmin}
                      lockedSuperadmin={area.lockedSuperadmin}
                    />
                  </List.Header>
                  <List.Description>
                    <i>{`${area.numSectors} sectors, ${area.numProblems} ${typeDescription}, ${area.hits} page views`}</i>
                    <br />
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          area.comment && area.comment.length > 350
                            ? area.comment.substring(0, 350) + "..."
                            : area.comment,
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
