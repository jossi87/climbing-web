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
  ConditionLabels,
  WallDirection,
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
  Progress,
  Feed,
} from "semantic-ui-react";
import { useMeta } from "./common/meta";
import { getImageUrl, getAreaPdfUrl, useAccessToken, useArea } from "../api";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";
import ProblemList from "./common/problem-list/problem-list";
import { components } from "../@types/buldreinfo/swagger";

type Props = {
  sector: components["schemas"]["Area"]["sectors"][number];
  problem: components["schemas"]["Area"]["sectors"][number]["problems"][number];
};

const SectorListItem = ({ sector, problem }: Props) => {
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
        {problem.coordinates && (
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
  const { data, error, redirectUi } = useArea(+areaId);
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

  if (redirectUi) {
    return redirectUi;
  }

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
  }

  if (!data) {
    return <Loading />;
  }

  const markers = data.sectors
    .filter((s) => s.parking)
    .map((s) => {
      return {
        coordinates: s.parking,
        url: "/sector/" + s.id,
        isParking: true,
      };
    });
  const outlines: ComponentProps<typeof Leaflet>["outlines"] = [];
  const approaches: ComponentProps<typeof Leaflet>["approaches"] = [];
  for (const s of data.sectors) {
    let distance: string | null = null;
    if (s.approach?.length > 0) {
      distance = calculateDistance(s.approach);
      const label = (s.outline == null || s.outline.length === 0) && distance;
      approaches.push({ approach: s.approach, label });
    }
    if (s.outline?.length > 0) {
      const label = s.name + (distance ? " (" + distance + ")" : "");
      outlines.push({
        url: "/sector/" + s.id,
        label,
        outline: s.outline,
      });
    }
  }
  const panes: ComponentProps<typeof Tab>["panes"] = [];
  const height = "40vh";
  if (data.media && data.media.length > 0) {
    panes.push({
      menuItem: { key: "image", icon: "image" },
      render: () => (
        <Tab.Pane>
          <Media numPitches={0} media={data.media} optProblemId={null} />
        </Tab.Pane>
      ),
    });
  }
  if (markers.length > 0 || outlines.length > 0 || data.coordinates) {
    const defaultCenter = data.coordinates
      ? { lat: data.coordinates.latitude, lng: data.coordinates.longitude }
      : meta.defaultCenter;
    const defaultZoom = data.coordinates ? 14 : meta.defaultZoom;
    panes.push({
      menuItem: { key: "map", icon: "map" },
      render: () => (
        <Tab.Pane>
          <Leaflet
            key={"area=" + data.id}
            autoZoom={true}
            height={height}
            markers={markers}
            outlines={outlines}
            approaches={approaches}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            onMouseClick={null}
            onMouseMove={null}
            showSatelliteImage={false}
            clusterMarkers={false}
            rocks={null}
            flyToId={null}
          />
        </Tab.Pane>
      ),
    });
  }
  if (data.sectors.length != 0) {
    panes.push({
      menuItem: { key: "distribution", icon: "area graph" },
      render: () => (
        <Tab.Pane>
          <ChartGradeDistribution idArea={data.id} idSector={0} data={null} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "top", icon: "trophy" },
      render: () => (
        <Tab.Pane>
          <Top idArea={data.id} idSector={0} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "activity", icon: "time" },
      render: () => (
        <Tab.Pane>
          <Activity idArea={data.id} idSector={0} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "todo", icon: "bookmark" },
      render: () => (
        <Tab.Pane>
          <Todo idArea={data.id} idSector={0} />
        </Tab.Pane>
      ),
    });
  }

  const sectorPanes: ComponentProps<typeof Tab>["panes"] = [];
  if (data.sectors) {
    const numTickedProblemsInArea = data.sectors.reduce(
      (count, current) =>
        count + current.problems.filter((p) => p.ticked).length,
      0,
    );
    sectorPanes.push({
      menuItem: "Sectors (" + data.sectors.length + ")",
      render: () => (
        <Tab.Pane>
          <Item.Group link unstackable>
            {data.sectors.map((sector) => {
              let percent;
              if (numTickedProblemsInArea > 0) {
                const [total, ticked] = sector.typeNumTicked
                  .filter((s) => s.type != "Projects" && s.type != "Broken")
                  .reduce(
                    ([total, failure], d) => [
                      total + d.num,
                      failure + d.ticked,
                    ],
                    [0, 0],
                  );
                percent = Math.round((ticked / total) * 100);
              }
              return (
                <Item as={Link} to={`/sector/${sector.id}`} key={sector.id}>
                  <Image
                    size="small"
                    style={{ maxHeight: "150px", objectFit: "cover" }}
                    src={
                      sector.randomMediaId
                        ? getImageUrl(
                            sector.randomMediaId,
                            sector.randomMediaCrc32,
                            150,
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
                      <WallDirection wallDirection={sector.wallDirection} />
                    </Item.Header>
                    <Item.Extra>
                      {numTickedProblemsInArea > 0 &&
                        sector.typeNumTicked?.filter(
                          (x) => x.type != "Projects",
                        ).length > 0 && (
                          <Progress
                            percent={percent}
                            progress={true}
                            autoSuccess
                            size="small"
                            inverted={true}
                          />
                        )}
                      {sector.typeNumTicked.map((x) => (
                        <p key={`${x.type}/${x.num}/${x.ticked}`}>
                          {x.type + ": " + x.num}
                          {x.ticked > 0 && " (" + x.ticked + " ticked)"}
                        </p>
                      ))}
                    </Item.Extra>
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
              );
            })}
          </Item.Group>
        </Tab.Pane>
      ),
    });
    sectorPanes.push({
      menuItem:
        (meta.isBouldering ? "Problems (" : "Routes (") +
        data.typeNumTicked.reduce((count, current) => count + current.num, 0) +
        ")",
      render: () => (
        <Tab.Pane>
          <ProblemList
            isSectorNotUser={true}
            preferOrderByGrade={true}
            rows={data.sectors
              .reduce(
                (acc, s) => [
                  ...acc,
                  ...s.problems.map((p) => ({
                    element: (
                      <SectorListItem key={p.id} sector={s} problem={p} />
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
                  })),
                ],
                [],
              )
              .sort((a, b) => b.gradeNumber - a.gradeNumber)}
          />
        </Tab.Pane>
      ),
    });
  }

  return (
    <>
      <Helmet>
        <title>{data.name}</title>
        <meta name="description" content={data.comment}></meta>
      </Helmet>
      <div style={{ marginBottom: "5px" }}>
        <div style={{ float: "right" }}>
          {meta.isAdmin && (
            <Button.Group size="mini" compact>
              <Button
                animated="fade"
                as={Link}
                to={`/sector/edit/${data.id}/0`}
              >
                <Button.Content hidden>Add</Button.Content>
                <Button.Content visible>
                  <Icon name="plus" />
                </Button.Content>
              </Button>
              <Button animated="fade" as={Link} to={`/area/edit/${data.id}`}>
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
            {data.name}{" "}
            <LockSymbol
              lockedAdmin={data.lockedAdmin}
              lockedSuperadmin={data.lockedSuperadmin}
            />
          </Breadcrumb.Section>
        </Breadcrumb>
      </div>
      {data.accessClosed && (
        <Message
          size="huge"
          negative
          icon="attention"
          header="Area closed!"
          content={data.accessClosed}
        />
      )}
      <Tab panes={panes} />
      <Table definition unstackable>
        <Table.Body>
          {(data.accessInfo || data.noDogsAllowed) && (
            <Table.Row warning verticalAlign="top">
              <Table.Cell>
                <Icon name="attention" /> Restrictions:
              </Table.Cell>
              <Table.Cell>
                {data.noDogsAllowed && (
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
                {data.accessInfo && <p>{data.accessInfo}</p>}
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row>
            <Table.Cell width={3}>Sectors:</Table.Cell>
            <Table.Cell>{data.sectors.length}</Table.Cell>
          </Table.Row>
          {data.typeNumTicked.map((t) => (
            <Table.Row key={t.type}>
              <Table.Cell>{t.type + ":"}</Table.Cell>
              <Table.Cell>
                {t.num}
                {t.ticked > 0 && " (" + t.ticked + " ticked)"}
              </Table.Cell>
            </Table.Row>
          ))}
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
          {data.coordinates && (
            <Table.Row>
              <Table.Cell>Conditions:</Table.Cell>
              <Table.Cell>
                <ConditionLabels
                  lat={data.coordinates.latitude}
                  lng={data.coordinates.longitude}
                  label={data.name}
                  wallDirection={null}
                  sunFromHour={data.sunFromHour}
                  sunToHour={data.sunToHour}
                />
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row>
            <Table.Cell>Misc:</Table.Cell>
            <Table.Cell>
              <Label
                href={getAreaPdfUrl(accessToken, data.id)}
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
            <Table.Cell>{data.hits}</Table.Cell>
          </Table.Row>
          {data.forDevelopers && (
            <Table.Row>
              <Table.Cell>For developers:</Table.Cell>
              <Table.Cell>
                <strong>
                  <i>Under development</i>
                </strong>
              </Table.Cell>
            </Table.Row>
          )}
          {data.comment && (
            <Table.Row>
              <Table.Cell
                colSpan={2}
                style={{ fontWeight: "normal", backgroundColor: "white" }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: md.render(data.comment),
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
