import React from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import ProblemList from "./common/problem-list/problem-list";
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
  Icon,
  Button,
  Tab,
  Breadcrumb,
  Table,
  Label,
  TableCell,
  List,
  Header,
  Image,
  Message,
  Feed,
} from "semantic-ui-react";
import { useMeta } from "./common/meta";
import {
  getAreaPdfUrl,
  getSectorPdfUrl,
  useAccessToken,
  useSector,
} from "../api";
import Linkify from "react-linkify";
import { useRedirect } from "../utils/useRedirect";
import { componentDecorator } from "../utils/componentDecorator";

type Props = {
  problem: any;
};

const SectorListItem = ({ problem }: Props) => {
  const { isClimbing } = useMeta();
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
        {`#${problem.nr} `}
        <Link to={`/problem/${problem.id}`}>{problem.name}</Link>{" "}
        {problem.grade}
        <Stars numStars={problem.stars} includeNoRating={false} />
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

const Sector = () => {
  const accessToken = useAccessToken();
  const { sectorId } = useParams();
  const meta = useMeta();
  const { data: data, error, isLoading } = useSector(+sectorId);
  const redirect = useRedirect(data);

  if (redirect) {
    return redirect;
  }

  if (error) {
    return (
      <Message
        size="huge"
        style={{ backgroundColor: "#FFF" }}
        icon="meh"
        header="404"
        content={String(error)}
      />
    );
  }

  if (isLoading || !data) {
    return <Loading />;
  }

  const isBouldering = meta.isBouldering;
  const markers = data.problems
    .filter((p) => p.lat != 0 && p.lng != 0)
    .map((p) => {
      return {
        lat: p.lat,
        lng: p.lng,
        label: p.nr + " - " + p.name + " [" + p.grade + "]",
        url: "/problem/" + p.id,
        rock: p.rock,
      };
    });
  // Only add polygon if problemMarkers=0 or site is showing sport climbing
  const addPolygon = meta.isClimbing || markers.length == 0;
  if (data.lat > 0 && data.lng > 0) {
    markers.push({
      lat: data.lat,
      lng: data.lng,
      isParking: true,
    });
  }
  const panes = [];

  let topoImages = null;
  if (data.media && data.media.length > 0) {
    let media = data.media;
    if (isBouldering) {
      media = data.media.filter((m) => m.svgs == null || m.svgs.length === 0);
      topoImages = data.media.filter((m) => m.svgs && m.svgs.length !== 0);
    }
    if (media && media.length > 0) {
      panes.push({
        menuItem: { key: "topo", icon: "image" },
        render: () => (
          <Tab.Pane>
            <Media numPitches={0} media={media} optProblemId={null} />
          </Tab.Pane>
        ),
      });
    }
  }
  if (markers.length > 0 || data.polygonCoords) {
    const defaultCenter =
      data.lat && data.lat > 0
        ? { lat: data.lat, lng: data.lng }
        : meta.defaultCenter;
    const defaultZoom = data.lat && data.lat > 0 ? 15 : meta.defaultZoom;
    const polyline =
      data.polyline &&
      data.polyline
        .split(";")
        .filter((i) => i)
        .map((e) => e.split(",").map(Number));
    let outlines;
    let polylines;
    if (data.polygonCoords && addPolygon) {
      const polygon = data.polygonCoords
        .split(";")
        .filter((i) => i)
        .map((c) => {
          const latLng = c.split(",");
          return [parseFloat(latLng[0]), parseFloat(latLng[1])];
        });
      const label =
        data.name + (polyline ? " (" + calculateDistance(polyline) + ")" : "");
      outlines = [{ url: "/sector/" + data.id, label, polygon: polygon }];
    }
    if (polyline) {
      const label = outlines == null ? calculateDistance(polyline) : null;
      polylines = [{ polyline, label: label }];
    }
    const uniqueRocks = data.problems
      .filter((p) => p.rock)
      .map((p) => p.rock)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    panes.push({
      menuItem: { key: "map", icon: "map" },
      render: () => (
        <Tab.Pane>
          <Leaflet
            key={"sector=" + data.id}
            autoZoom={true}
            height="40vh"
            markers={markers}
            outlines={outlines}
            polylines={polylines}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            onMouseClick={null}
            onMouseMove={null}
            showSatelliteImage={isBouldering}
            clusterMarkers={true}
            rocks={uniqueRocks}
            flyToId={null}
          />
        </Tab.Pane>
      ),
    });
  }
  if (topoImages && topoImages.length > 0) {
    panes.push({
      menuItem: { key: "topo", icon: "images" },
      render: () => (
        <Tab.Pane>
          <Media numPitches={0} media={topoImages} optProblemId={null} />
        </Tab.Pane>
      ),
    });
  }
  if (data.problems.length != 0) {
    panes.push({
      menuItem: { key: "distribution", icon: "area graph" },
      render: () => (
        <Tab.Pane>
          <ChartGradeDistribution idArea={0} idSector={data.id} data={null} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "top", icon: "trophy" },
      render: () => (
        <Tab.Pane>
          <Top idArea={0} idSector={data.id} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "activity", icon: "time" },
      render: () => (
        <Tab.Pane>
          <Activity idArea={0} idSector={data.id} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "todo", icon: "bookmark" },
      render: () => (
        <Tab.Pane>
          <Todo idArea={0} idSector={data.id} />
        </Tab.Pane>
      ),
    });
  }
  const uniqueTypes = data.problems
    .map((p) => p.t.subType)
    .filter((value, index, self) => self.indexOf(value) === index);
  if (data.problems.filter((p) => p.gradeNumber === 0).length > 0) {
    uniqueTypes.push("Projects");
  }
  uniqueTypes.sort();
  const content = uniqueTypes.map((subType) => {
    const header = subType ? subType : "Boulders";
    const problemsOfType = data.problems.filter(
      (p) =>
        (subType === "Projects" && p.gradeNumber === 0) ||
        (p.t.subType === subType && p.gradeNumber !== 0),
    );
    const numTicked = problemsOfType.filter((p) => p.ticked).length;
    const txt =
      numTicked === 0
        ? problemsOfType.length
        : problemsOfType.length + " (" + numTicked + " ticked)";
    return (
      <Table.Row key={[header, txt].join("/")}>
        <TableCell>{header}:</TableCell>
        <TableCell>{txt}</TableCell>
      </Table.Row>
    );
  });

  return (
    <>
      <Helmet>
        <title>
          {data.name} ({data.areaName})
        </title>
        <meta name="description" content={data.comment}></meta>
      </Helmet>
      <div style={{ marginBottom: "5px" }}>
        <div style={{ float: "right" }}>
          {data && meta.isAdmin && (
            <Button.Group size="mini" compact>
              <Button
                animated="fade"
                as={Link}
                to={`/problem/edit/${data.id}/0`}
              >
                <Button.Content hidden>Add</Button.Content>
                <Button.Content visible>
                  <Icon name="plus" />
                </Button.Content>
              </Button>
              <Button
                animated="fade"
                as={Link}
                to={`/sector/edit/${data.areaId}/${data.id}`}
              >
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
          <Breadcrumb.Section>
            <Link to={`/area/${data.areaId}`}>{data.areaName}</Link>{" "}
            <LockSymbol
              lockedAdmin={data.areaLockedAdmin}
              lockedSuperadmin={data.areaLockedSuperadmin}
            />
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section active>
            {data.name}{" "}
            <LockSymbol
              lockedAdmin={data.lockedAdmin}
              lockedSuperadmin={data.lockedSuperadmin}
            />
          </Breadcrumb.Section>
        </Breadcrumb>
      </div>
      {(data.areaAccessClosed || data.accessClosed) && (
        <Message
          size="huge"
          negative
          icon="attention"
          header={(data.areaAccessClosed ? "Area" : "Sector") + " closed!"}
          content={(data.areaAccessClosed || "") + (data.accessClosed || "")}
        />
      )}
      <Tab panes={panes} />
      <Table definition unstackable>
        <Table.Body>
          {(data.areaAccessInfo ||
            data.accessInfo ||
            data.areaNoDogsAllowed) && (
            <Table.Row warning verticalAlign="top">
              <Table.Cell>
                <Icon name="attention" /> Restrictions:
              </Table.Cell>
              <Table.Cell>
                {data.areaNoDogsAllowed && (
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
                {data.areaAccessInfo && <p>{data.areaAccessInfo}</p>}
                {data.accessInfo && <p>{data.accessInfo}</p>}
              </Table.Cell>
            </Table.Row>
          )}
          {content}
          {data.comment && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Description:</Table.Cell>
              <Table.Cell>
                <Linkify componentDecorator={componentDecorator}>
                  {data.comment}
                </Linkify>
              </Table.Cell>
            </Table.Row>
          )}
          {data.sectors.length > 1 && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Sectors:</Table.Cell>
              <Table.Cell>
                <Label.Group size="tiny">
                  {data.sectors.map((s) => (
                    <Label
                      key={s.id}
                      as={Link}
                      to={`/sector/${s.id}`}
                      active={data.id === s.id}
                    >
                      <LockSymbol
                        lockedAdmin={s.lockedAdmin}
                        lockedSuperadmin={s.lockedSuperadmin}
                      />
                      {s.name}
                    </Label>
                  ))}
                </Label.Group>
              </Table.Cell>
            </Table.Row>
          )}
          {data.triviaMedia?.length > 0 && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Trivia:</Table.Cell>
              <Table.Cell>
                <Feed.Extra>
                  <Media
                    numPitches={0}
                    media={data.triviaMedia}
                    optProblemId={null}
                  />
                </Feed.Extra>
              </Table.Cell>
            </Table.Row>
          )}
          {data.lat > 0 && data.lng > 0 && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Weather:</Table.Cell>
              <Table.Cell>
                <WeatherLabels
                  lat={data.lat}
                  lng={data.lng}
                  label={data.name}
                />
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row verticalAlign="top">
            <Table.Cell>Misc:</Table.Cell>
            <Table.Cell>
              <Label
                href={getSectorPdfUrl(accessToken, data.id)}
                rel="noreferrer noopener"
                target="_blank"
                image
                basic
              >
                <Icon name="file pdf outline" />
                sector.pdf
              </Label>
              <Label
                href={getAreaPdfUrl(accessToken, data.areaId)}
                rel="noreferrer noopener"
                target="_blank"
                image
                basic
              >
                <Icon name="file pdf outline" />
                area.pdf
              </Label>
              {data.lat > 0 && data.lng > 0 && (
                <Label
                  href={`https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`}
                  rel="noreferrer noopener"
                  target="_blank"
                  image
                  basic
                >
                  <Icon name="map" />
                  Parking (Google Maps)
                </Label>
              )}
            </Table.Cell>
          </Table.Row>
          <Table.Row verticalAlign="top">
            <Table.Cell width={3}>Page views:</Table.Cell>
            <Table.Cell>{data.hits}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <ProblemList
        isSectorNotUser={true}
        preferOrderByGrade={data.orderByGrade}
        rows={data.problems.map((p) => {
          return {
            element: <SectorListItem key={p.id} problem={p} />,
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
          };
        })}
      />
    </>
  );
};

export default Sector;
