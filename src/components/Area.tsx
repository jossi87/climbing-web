import React, { ComponentProps, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import ChartGradeDistribution from "./common/chart-grade-distribution/chart-grade-distribution";
import Top from "./common/top/top";
import Activity from "./common/activity/activity";
import Leaflet from "./common/leaflet/leaflet";
import { getDistanceWithUnit } from "./common/leaflet/geo-utils";
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
  Segment,
} from "semantic-ui-react";
import { useMeta } from "./common/meta";
import { getImageUrl, useArea } from "../api";
import { Remarkable } from "remarkable";
import { linkify } from "remarkable/linkify";
import ProblemList from "./common/problem-list";
import { components } from "../@types/buldreinfo/swagger";
import { DownloadButton } from "./common/DownloadButton";

type Props = {
  sectorName: string;
  problem: NonNullable<
    NonNullable<components["schemas"]["Area"]["sectors"]>[number]["problems"]
  >[number];
};

const SectorListItem = ({ sectorName, problem }: Props) => {
  const { isClimbing } = useMeta();
  const type = isClimbing
    ? problem.t?.subType +
      ((problem.numPitches ?? 1) > 1
        ? ", " + problem.numPitches + " pitches"
        : "")
    : null;
  const ascents =
    problem.numTicks &&
    problem.numTicks + (problem.numTicks == 1 ? " ascent" : " ascents");
  let faTypeAscents = problem.fa;
  if (problem.faDate) {
    faTypeAscents += " " + problem.faDate.substring(0, 4);
  }
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
        {problem.danger ? <Icon color="red" name="warning" /> : null}
        <Link to={`/problem/${problem.id}`}>{problem.name}</Link>{" "}
        {problem.grade}
        <Stars numStars={problem.stars ?? 0} includeStarOutlines={false} />
        <small>
          <i style={{ color: "gray" }}>
            {" "}
            {sectorName} {`#${problem.nr}`}{" "}
          </i>
        </small>
        {faTypeAscents && <small> {faTypeAscents}</small>}
        <small>
          <i style={{ color: "gray" }}>
            {" "}
            {problem.rock ? <>Rock: {problem.rock}. </> : null}
            {problem.comment}{" "}
          </i>
        </small>
        {problem.coordinates ? (
          <Icon size="small" name="map marker alternate" />
        ) : null}
        {problem.hasTopo ? <Icon size="small" name="paint brush" /> : null}
        {problem.hasImages ? (
          <Icon size="small" color="black" name="photo" />
        ) : null}
        {problem.hasMovies ? (
          <Icon size="small" color="black" name="film" />
        ) : null}
        <LockSymbol
          lockedAdmin={!!problem.lockedAdmin}
          lockedSuperadmin={!!problem.lockedSuperadmin}
        />
        {problem.ticked ? (
          <Icon size="small" color="green" name="check" />
        ) : null}
        {problem.todo ? (
          <Icon size="small" color="blue" name="bookmark" />
        ) : null}
      </List.Header>
    </List.Item>
  );
};

const md = (() => {
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
  return md;
})();

type AreaSectorType = NonNullable<
  components["schemas"]["Area"]["sectors"]
>[number];
type SectorWithParking = AreaSectorType &
  (Pick<AreaSectorType, "parking"> & {
    parking: Required<
      Pick<NonNullable<AreaSectorType["parking"]>, "latitude" | "longitude">
    >;
  });

const isSectorWithParking = (s: AreaSectorType): s is SectorWithParking => {
  return !!(s.parking && s.parking.latitude && s.parking.longitude);
};

const Area = () => {
  const meta = useMeta();
  const { areaId } = useParams();
  if (areaId === undefined) {
    throw new Error("Missing areaId parameter");
  }

  const { data, error, redirectUi } = useArea(+areaId);

  const markers: ComponentProps<typeof Leaflet>["markers"] = useMemo(() => {
    if (!data?.sectors) {
      return [];
    }

    type SectorParkingMarker = Pick<
      SectorWithParking["parking"],
      "latitude" | "longitude"
    > & {
      sectors: Pick<NonNullable<SectorWithParking>, "id" | "name">[];
    };

    const uniqueSectors: Record<string /* lat,lng */, SectorParkingMarker> =
      data.sectors
        ?.filter(isSectorWithParking)
        ?.reduce((acc, { parking, name, id }) => {
          const key = `${parking.latitude},${parking.longitude}`;
          return {
            ...acc,
            [key]: {
              ...acc[key],
              latitude: parking.latitude,
              longitude: parking.longitude,
              sectors: [...(acc[key]?.sectors ?? []), { name, id }],
            } satisfies SectorParkingMarker,
          };
        }, {});

    return (
      Object.values(uniqueSectors)?.map((info) => ({
        coordinates: {
          latitude: info.latitude,
          longitude: info.longitude,
        },

        isParking: true,
      })) ?? []
    );
  }, [data?.sectors]);

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

  const orderableMedia: ComponentProps<typeof Media>["orderableMedia"] = [];
  const carouselMedia: ComponentProps<typeof Media>["carouselMedia"] = [];
  if (data.media?.length) {
    carouselMedia.push(...data.media);
    if (data.media.length > 1) {
      orderableMedia.push(...data.media);
    }
  }
  if (data.triviaMedia?.length) {
    carouselMedia.push(...data.triviaMedia);
    if (data.triviaMedia.length > 1) {
      orderableMedia.push(...data.triviaMedia);
    }
  }

  const outlines: ComponentProps<typeof Leaflet>["outlines"] = [];
  const approaches: ComponentProps<typeof Leaflet>["approaches"] = [];
  const showApproachLengthOnOutline =
    (data.sectors?.filter((s) => s.approach && s.outline).length ?? 0) > 1;

  for (const s of data.sectors ?? []) {
    let distance: string | null = null;
    if (s.approach?.coordinates?.length) {
      distance = getDistanceWithUnit(s.approach);
      const label =
        (!s.outline || !showApproachLengthOnOutline) && distance
          ? distance
          : "";
      approaches.push({ approach: s.approach, label: label ?? "" });
    }
    if (s.outline?.length) {
      const label =
        s.name +
        (showApproachLengthOnOutline && distance ? " (" + distance + ")" : "");
      outlines.push({
        url: "/sector/" + s.id,
        label,
        outline: s.outline,
      });
    }
  }
  const panes: ComponentProps<typeof Tab>["panes"] = [];
  const height = "40vh";
  if (data.media && data.media.length) {
    panes.push({
      menuItem: { key: "image", icon: "image" },
      render: () => (
        <Tab.Pane>
          <Media
            numPitches={0}
            media={data.media ?? []}
            orderableMedia={orderableMedia}
            carouselMedia={carouselMedia}
            optProblemId={null}
            optProblemSectionId={null}
            showLocation={false}
          />
        </Tab.Pane>
      ),
    });
  }
  if (markers.length || outlines.length || data.coordinates) {
    const defaultCenter =
      data.coordinates &&
      data.coordinates.latitude &&
      data.coordinates.longitude
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
            showSatelliteImage={false}
            clusterMarkers={false}
            flyToId={null}
          />
        </Tab.Pane>
      ),
    });
  }
  if (data.sectors?.length) {
    panes.push({
      menuItem: { key: "distribution", icon: "area graph" },
      render: () => (
        <Tab.Pane>
          <ChartGradeDistribution idArea={data.id ?? 0} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "top", icon: "trophy" },
      render: () => (
        <Tab.Pane>
          <Top idArea={data.id ?? 0} idSector={0} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "activity", icon: "time" },
      render: () => (
        <Tab.Pane>
          <Activity idArea={data.id ?? 0} idSector={0} />
        </Tab.Pane>
      ),
    });
    panes.push({
      menuItem: { key: "todo", icon: "bookmark" },
      render: () => (
        <Tab.Pane>
          <Todo idArea={data.id ?? 0} idSector={0} />
        </Tab.Pane>
      ),
    });
  }

  const sectorPanes: ComponentProps<typeof Tab>["panes"] = [];
  if (data.sectors) {
    const numTickedProblemsInArea = data.sectors.reduce(
      (count, current) =>
        count + (current.problems?.filter((p) => p.ticked)?.length ?? 0),
      0,
    );
    sectorPanes.push({
      menuItem: "Sectors (" + data.sectors.length + ")",
      render: () => (
        <Tab.Pane>
          <Item.Group link unstackable>
            {data.sectors?.map((sector) => {
              let percent;
              if (numTickedProblemsInArea > 0) {
                const [total, ticked] = sector.typeNumTicked
                  ?.filter((s) => s.type != "Projects" && s.type != "Broken")
                  ?.reduce(
                    ([total, ticked], d) => [
                      total + (d.num ?? 0),
                      ticked + (d.ticked ?? 0),
                    ],
                    [0, 0],
                  ) ?? [0, 0];
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
                            sector.randomMediaCrc32 ?? 0,
                            150,
                          )
                        : "/png/image.png"
                    }
                  />
                  <Item.Content>
                    <Item.Header>
                      {sector.accessClosed ? (
                        <Header as="h3" color="red">
                          {sector.accessClosed}
                        </Header>
                      ) : null}
                      {sector.name}{" "}
                      <LockSymbol
                        lockedAdmin={!!sector.lockedAdmin}
                        lockedSuperadmin={!!sector.lockedSuperadmin}
                      />
                      <WallDirection
                        wallDirectionCalculated={sector.wallDirectionCalculated}
                        wallDirectionManual={sector.wallDirectionManual}
                      />
                    </Item.Header>
                    <Item.Extra>
                      {numTickedProblemsInArea &&
                      sector.typeNumTicked?.find(
                        (x) => x.type != "Projects",
                      ) ? (
                        <Progress
                          percent={percent}
                          progress={true}
                          autoSuccess
                          size="small"
                          inverted={true}
                        />
                      ) : null}
                      {sector.typeNumTicked?.map((x) => (
                        <p key={`${x.type}/${x.num}/${x.ticked}`}>
                          {x.type + ": " + x.num}
                          {x.ticked ? " (" + x.ticked + " ticked)" : ""}
                        </p>
                      ))}
                    </Item.Extra>
                    <Item.Description>
                      {sector.accessInfo ? (
                        <Header as="h5" color="red">
                          {sector.accessInfo}
                        </Header>
                      ) : null}
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
        (data.typeNumTicked?.reduce(
          (count, current) => count + (current?.num ?? 0),
          0,
        ) ?? []) +
        ")",
      render: () => {
        type Rows = ComponentProps<typeof ProblemList>["rows"];
        const rows: Rows =
          data.sectors
            ?.flatMap(({ name = "", problems = [] }) => {
              return problems.map(
                (p) =>
                  ({
                    element: (
                      <SectorListItem
                        key={p.id}
                        sectorName={name}
                        problem={p}
                      />
                    ),
                    name: p.name ?? "",
                    areaName: data.name ?? "",
                    sectorName: name,
                    nr: p.nr ?? 0,
                    gradeNumber: p.gradeNumber ?? 0,
                    stars: p.stars ?? 0,
                    numTicks: p.numTicks ?? 0,
                    ticked: p.ticked ?? false,
                    rock: p.rock ?? "",
                    subType: p.t?.subType ?? "",
                    num: p.nr ?? 0,
                    fa: !!p.fa,
                    faDate: p.faDate,
                  }) satisfies Rows[number],
              );
            })
            ?.sort((a, b) => b.gradeNumber - a.gradeNumber) ?? [];
        return (
          <ProblemList
            storageKey={`area/${areaId}`}
            mode="sector"
            defaultOrder="grade-desc"
            rows={rows}
          />
        );
      },
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
          {meta.isAdmin ? (
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
          ) : null}
        </div>
        <Breadcrumb>
          <Breadcrumb.Section>
            <Link to="/areas">Areas</Link>
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section active>
            {data.name}
            {data.forDevelopers ? (
              <span style={{ fontWeight: "normal" }}> (under development)</span>
            ) : null}{" "}
            <LockSymbol
              lockedAdmin={!!data.lockedAdmin}
              lockedSuperadmin={!!data.lockedSuperadmin}
            />
          </Breadcrumb.Section>
        </Breadcrumb>
      </div>
      {data.accessClosed ? (
        <Message
          size="huge"
          negative
          icon="attention"
          header="Area closed!"
          content={data.accessClosed}
        />
      ) : null}

      <Tab panes={panes} />

      {data.noDogsAllowed ? (
        <Message warning>
          {data.noDogsAllowed ? (
            <Header as="h5" color="red" image>
              <Image
                src="/svg/no-animals.svg"
                alt="No dogs allowed"
                rounded
                size="mini"
              />
              <Header.Content>
                The access to our crags are at the mercy of the farmers who own
                the land.
                <Header.Subheader>
                  Because of conflicts between dog-owners and farmers we ask you
                  to not bring your dog to this specific crag.
                </Header.Subheader>
              </Header.Content>
            </Header>
          ) : null}
        </Message>
      ) : null}

      {data.accessInfo ? (
        <Message warning>
          <Message.Header>Restrictions:</Message.Header>
          {data.accessInfo}
        </Message>
      ) : null}

      <Segment>
        <Label.Group>
          <Label basic>
            Sectors:
            <Label.Detail>{data.sectors?.length}</Label.Detail>
          </Label>
          {data.typeNumTicked?.map((t) => (
            <Label key={t.type} basic>
              {t.type}:
              <Label.Detail>
                {t.num}
                {t.ticked ? " (" + t.ticked + " ticked)" : ""}
              </Label.Detail>
            </Label>
          ))}
          <Label basic>
            Page views:
            <Label.Detail>{data.hits}</Label.Detail>
          </Label>
          <DownloadButton href={`/areas/pdf?id=${data.id}`}>
            area.pdf
          </DownloadButton>
          {data.coordinates &&
          data.coordinates.latitude &&
          data.coordinates.longitude ? (
            <ConditionLabels
              lat={data.coordinates.latitude}
              lng={data.coordinates.longitude}
              label={data.name ?? ""}
              wallDirectionCalculated={undefined}
              wallDirectionManual={undefined}
              sunFromHour={data.sunFromHour ?? 0}
              sunToHour={data.sunToHour ?? 0}
            />
          ) : null}
        </Label.Group>
        {data.comment ? (
          <div
            style={{ paddingTop: "10px" }}
            dangerouslySetInnerHTML={{
              __html: md.render(data.comment),
            }}
          />
        ) : null}
        {data.triviaMedia?.length ? (
          <Feed.Extra style={{ paddingTop: "10px" }}>
            <Media
              numPitches={0}
              media={data.triviaMedia}
              orderableMedia={orderableMedia}
              carouselMedia={carouselMedia}
              optProblemId={null}
              optProblemSectionId={null}
              showLocation={false}
            />
          </Feed.Extra>
        ) : null}
      </Segment>

      {sectorPanes.length ? <Tab panes={sectorPanes} /> : null}
    </>
  );
};

export default Area;
