import React, { ComponentProps } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import ChartGradeDistribution from "./common/chart-grade-distribution/chart-grade-distribution";
import Top from "./common/top/top";
import Activity from "./common/activity/activity";
import Leaflet from "./common/leaflet/leaflet";
import { calculateDistance } from "./common/leaflet/distance-math";
import Media from "./common/media/media";
import Todo from "./common/todo/todo";
import {
  Stars,
  LockSymbol,
  Loading,
  WeatherLabels,
} from "./common/widgets/widgets";
import {
  Table,
  Label,
  Button,
  Tab,
  Item,
  Icon,
  Image,
  Breadcrumb,
  Header,
  List,
  Message,
  Feed,
} from "semantic-ui-react";
import { useMeta } from "./common/meta";
import { getImageUrl, getAreaPdfUrl, useAreas, useAccessToken } from "../api";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";
import ProblemList from "./common/problem-list/problem-list";

const SectorListItem = ({ sector, problem, isClimbing }) => {
  const type = isClimbing
    ? problem.t.subType +
      (problem.numPitches > 1 ? ", " + problem.numPitches + " pitches" : "")
    : null;
  const ascents =
    problem.numTicks &&
    problem.numTicks + (problem.numTicks == 1 ? " ascent" : " ascents");
  let faTypeAscents = problem.fa;
  if (type && ascents) {
    faTypeAscents =
      (faTypeAscents != null ? faTypeAscents + " (" : "(") +
      type +
      ", " +
      ascents +
      ")";
  } else if (type) {
    faTypeAscents =
      (faTypeAscents != null ? faTypeAscents + " (" : "(") + type + ")";
  } else if (ascents) {
    faTypeAscents =
      (faTypeAscents != null ? faTypeAscents + " (" : "(") + ascents + ")";
  }
  let backgroundColor = "#ffffff";
  if (problem.ticked) {
    backgroundColor = "#d2f8d2";
  } else if (problem.todo) {
    backgroundColor = "#d2d2f8";
  }
  return (
    <List.Item style={{ backgroundColor }} key={problem.id}>
      <List.Header>
        {problem.danger && <Icon color="red" name="warning" />}
        <Link to={`/problem/${problem.id}`}>{problem.name}</Link>{" "}
        {problem.grade}
        <Stars numStars={problem.stars} includeNoRating={false} />
        <small>
          <i style={{ color: "gray" }}>
            {" "}
            {sector.name} {`#${problem.nr}`}{" "}
          </i>
        </small>
        {faTypeAscents && <small> {faTypeAscents}</small>}
        <small>
          <i style={{ color: "gray" }}>
            {" "}
            {problem.rock && <>Rock: {problem.rock}. </>}
            {problem.comment}{" "}
          </i>
        </small>
        {problem.lat > 0 && problem.lng > 0 && (
          <Icon size="small" name="map marker alternate" />
        )}
        {problem.hasTopo && <Icon size="small" name="paint brush" />}
        {problem.hasImages && <Icon size="small" color="black" name="photo" />}
        {problem.hasMovies && <Icon size="small" color="black" name="film" />}
        <LockSymbol
          lockedAdmin={problem.lockedAdmin}
          lockedSuperadmin={problem.lockedSuperadmin}
        />
        {problem.ticked && <Icon size="small" color="green" name="check" />}
        {problem.todo && <Icon size="small" color="blue" name="bookmark" />}
      </List.Header>
    </List.Item>
  );
};
const Area = () => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { areaId } = useParams();
  const { data, error } = useAreas(parseInt(areaId ?? "0"));

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

  if (error) {
    return (
      <Message
        size="huge"
        style={{ backgroundColor: "#FFF" }}
        icon="meh"
        header="404"
        content={
          "Cannot find the specified area because it does not exist or you do not have sufficient permissions."
        }
      />
    );
  } else if (!data || data[0].length === 0) {
    return <Loading />;
  }
  const markers = data[0].sectors
    .filter((s) => s.lat != 0 && s.lng != 0)
    .map((s) => {
      return {
        lat: s.lat,
        lng: s.lng,
        url: "/sector/" + s.id,
        isParking: true,
      };
    });
  const outlines: ComponentProps<typeof Leaflet>["outlines"] = [];
  const polylines: ComponentProps<typeof Leaflet>["polylines"] = [];
  for (const s of data[0].sectors) {
    let distance: string | null = null;
    if (s.polyline) {
      const polyline = s.polyline
        .split(";")
        .filter((i) => i)
        .map((e) => e.split(",").map(Number));
      distance = calculateDistance(polyline);
      const label = s.polygonCoords == null && distance;
      polylines.push({ polyline, label });
    }
    if (s.polygonCoords) {
      const polygon = s.polygonCoords
        .split(";")
        .filter((i) => i)
        .map((c) => {
          const latLng = c.split(",");
          return [parseFloat(latLng[0]), parseFloat(latLng[1])];
        });
      const label = s.name + (distance ? " (" + distance + ")" : "");
      outlines.push({ url: "/sector/" + s.id, label, polygon: polygon });
    }
  }
  const panes: ComponentProps<typeof Tab>["panes"] = [];
  const height = "40vh";
  if (data[0].media && data[0].media.length > 0) {
    panes.push({
      menuItem: { key: "image", icon: "image" },
      render: () => (
        <Tab.Pane>
          <Media
            isAdmin={meta.isAdmin}
            numPitches={0}
            media={data[0].media}
            optProblemId={null}
            isBouldering={meta.isBouldering}
          />
        </Tab.Pane>
      ),
    });
  }
  if (
    markers.length > 0 ||
    outlines.length > 0 ||
    (data[0].lat && data[0].lat > 0)
  ) {
    const defaultCenter =
      data[0].lat && data[0].lat > 0
        ? { lat: data[0].lat, lng: data[0].lng }
        : meta.defaultCenter;
    const defaultZoom = data[0].lat && data[0].lat > 0 ? 14 : meta.defaultZoom;
    panes.push({
      menuItem: { key: "map", icon: "map" },
      render: () => (
        <Tab.Pane>
          <Leaflet
            key={"area=" + data[0].id}
            autoZoom={true}
            height={height}
            markers={markers}
            outlines={outlines}
            polylines={polylines}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            onMouseClick={null}
            onMouseMove={null}
            showSateliteImage={false}
            clusterMarkers={false}
            rocks={null}
            flyToId={null}
          />
        </Tab.Pane>
      ),
    });
  }
  if (data[0].sectors.length != 0) {
    panes.push({
      menuItem: { key: "distribution", icon: "area graph" },
      render: () => (
        <Tab.Pane>
          <ChartGradeDistribution
            accessToken={accessToken}
            idArea={data[0].id}
            idSector={0}
            data={null}
          />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "top", icon: "trophy" },
      render: () => (
        <Tab.Pane>
          <Top idArea={data[0].id} idSector={0} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "activity", icon: "time" },
      render: () => (
        <Tab.Pane>
          <Activity idArea={data[0].id} idSector={0} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "todo", icon: "bookmark" },
      render: () => (
        <Tab.Pane>
          <Todo idArea={data[0].id} idSector={0} />
        </Tab.Pane>
      ),
    });
  }

  const sectorPanes: ComponentProps<typeof Tab>["panes"] = [];
  if (data[0].sectors) {
    sectorPanes.push({
      menuItem: "Sectors (" + data[0].sectors.length + ")",
      render: () => (
        <Tab.Pane>
          <Item.Group link unstackable>
            {data[0].sectors.map((sector, i) => (
              <Item as={Link} to={`/sector/${sector.id}`} key={i}>
                <Image
                  size="small"
                  style={{ maxHeight: "150px", objectFit: "cover" }}
                  src={
                    sector.randomMediaId
                      ? getImageUrl(
                          sector.randomMediaId,
                          sector.randomMediaCrc32,
                          150
                        )
                      : "/png/image.png"
                  }
                />
                <Item.Content>
                  <Item.Header>
                    {sector.accessClosed && (
                      <Header as="h3" color="red">
                        {sector.accessClosed}
                      </Header>
                    )}
                    {sector.name}{" "}
                    <LockSymbol
                      lockedAdmin={sector.lockedAdmin}
                      lockedSuperadmin={sector.lockedSuperadmin}
                    />
                  </Item.Header>
                  <Item.Meta>
                    {sector.typeNumTicked.map((x, i) => (
                      <p key={i}>
                        {x.type + ": " + x.num}
                        {x.ticked > 0 && " (" + x.ticked + " ticked)"}
                      </p>
                    ))}
                  </Item.Meta>
                  <Item.Description>
                    {sector.accessInfo && (
                      <Header as="h5" color="red">
                        {sector.accessInfo}
                      </Header>
                    )}
                    {sector.comment}
                  </Item.Description>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        </Tab.Pane>
      ),
    });
    sectorPanes.push({
      menuItem:
        (meta.isBouldering ? "Problems (" : "Routes (") +
        data[0].typeNumTicked.reduce(
          (count, current) => count + current.num,
          0
        ) +
        ")",
      render: () => (
        <Tab.Pane>
          <ProblemList
            isSectorNotUser={true}
            preferOrderByGrade={true}
            rows={data[0].sectors
              .map((s) =>
                s.problems.map((p) => ({
                  element: (
                    <SectorListItem
                      key={p.id}
                      sector={s}
                      problem={p}
                      isClimbing={meta.isClimbing}
                    />
                  ),
                  name: p.name,
                  nr: p.nr,
                  gradeNumber: p.gradeNumber,
                  stars: p.stars,
                  numTicks: p.numTicks,
                  ticked: p.ticked,
                  todo: p.todo,
                  rock: p.rock,
                  subType: p.t.subType,
                  num: null,
                  fa: null,
                }))
              )
              .flat()
              .sort((a, b) => b.gradeNumber - a.gradeNumber)}
          />
        </Tab.Pane>
      ),
    });
  }

  return (
    <>
      <Helmet>
        <title>
          {data[0].name} | {meta.title}
        </title>
        <meta name="description" content={data[0].comment}></meta>
      </Helmet>
      <div style={{ marginBottom: "5px" }}>
        <div style={{ float: "right" }}>
          {meta.isAdmin && (
            <Button.Group size="mini" compact>
              <Button
                animated="fade"
                as={Link}
                to={`/sector/edit/${data[0].id}-0`}
              >
                <Button.Content hidden>Add</Button.Content>
                <Button.Content visible>
                  <Icon name="plus" />
                </Button.Content>
              </Button>
              <Button animated="fade" as={Link} to={`/area/edit/${data[0].id}`}>
                <Button.Content hidden>Edit</Button.Content>
                <Button.Content visible>
                  <Icon name="edit" />
                </Button.Content>
              </Button>
            </Button.Group>
          )}
        </div>
        <Breadcrumb>
          <Breadcrumb.Section>
            <Link to="/areas">Areas</Link>
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section active>
            {data[0].name}{" "}
            <LockSymbol
              lockedAdmin={data[0].lockedAdmin}
              lockedSuperadmin={data[0].lockedSuperadmin}
            />
          </Breadcrumb.Section>
        </Breadcrumb>
      </div>
      {data[0].accessClosed && (
        <Message
          size="huge"
          negative
          icon="attention"
          header="Area closed!"
          content={data[0].accessClosed}
        />
      )}
      <Tab panes={panes} />
      <Table definition unstackable>
        <Table.Body>
          {(data[0].accessInfo || data[0].noDogsAllowed) && (
            <Table.Row warning verticalAlign="top">
              <Table.Cell>
                <Icon name="attention" /> Restrictions:
              </Table.Cell>
              <Table.Cell>
                {data[0].noDogsAllowed && (
                  <Header as="h5" color="red" image>
                    <Image
                      src="/svg/no-animals.svg"
                      alt="No dogs allowed"
                      rounded
                      size="mini"
                    />
                    <Header.Content>
                      The access to our crags are at the mercy of the farmers
                      who own the land.
                      <Header.Subheader>
                        Because of conflicts between dog-owners and farmers we
                        ask you to not bring your dog to this specific crag.
                      </Header.Subheader>
                    </Header.Content>
                  </Header>
                )}
                {data[0].accessInfo && <p>{data[0].accessInfo}</p>}
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row>
            <Table.Cell width={3}>Sectors:</Table.Cell>
            <Table.Cell>{data[0].sectors.length}</Table.Cell>
          </Table.Row>
          {data[0].typeNumTicked.map((t, i) => (
            <Table.Row key={i}>
              <Table.Cell>{t.type + ":"}</Table.Cell>
              <Table.Cell>
                {t.num}
                {t.ticked > 0 && " (" + t.ticked + " ticked)"}
              </Table.Cell>
            </Table.Row>
          ))}
          {data[0].triviaMedia?.length > 0 && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Trivia:</Table.Cell>
              <Table.Cell>
                <Feed.Extra>
                  <Media
                    isAdmin={meta.isAdmin}
                    numPitches={0}
                    media={data[0].triviaMedia}
                    optProblemId={null}
                    isBouldering={meta.isBouldering}
                  />
                </Feed.Extra>
              </Table.Cell>
            </Table.Row>
          )}
          {data[0].lat > 0 && data[0].lng > 0 && (
            <Table.Row>
              <Table.Cell>Weather:</Table.Cell>
              <Table.Cell>
                <WeatherLabels
                  lat={data[0].lat}
                  lng={data[0].lng}
                  label={data[0].name}
                />
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row>
            <Table.Cell>Misc:</Table.Cell>
            <Table.Cell>
              <Label
                href={getAreaPdfUrl(accessToken, data[0].id)}
                rel="noreferrer noopener"
                target="_blank"
                image
                basic
              >
                <Icon name="file pdf outline" />
                area.pdf
              </Label>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Page views:</Table.Cell>
            <Table.Cell>{data[0].hits}</Table.Cell>
          </Table.Row>
          {data[0].forDevelopers && (
            <Table.Row>
              <Table.Cell>For developers:</Table.Cell>
              <Table.Cell>
                <strong>
                  <i>Under development</i>
                </strong>
              </Table.Cell>
            </Table.Row>
          )}
          {data[0].comment && (
            <Table.Row>
              <Table.Cell
                colSpan={2}
                style={{ fontWeight: "normal", backgroundColor: "white" }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: md.render(data[0].comment),
                  }}
                />
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      {sectorPanes.length > 0 && <Tab panes={sectorPanes} />}
    </>
  );
};

export default Area;
