import React, { useState, ComponentProps } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import Leaflet from "../common/leaflet/leaflet";
import { getDistanceWithUnit } from "../common/leaflet/geo-utils";
import GetCenterFromDegrees from "../../utils/map-utils";
import Media from "../common/media/media";
import {
  Button,
  Grid,
  Breadcrumb,
  Tab,
  Label,
  Icon,
  Header,
  Table,
  Feed,
  Image,
  Message,
} from "semantic-ui-react";
import {
  Loading,
  LockSymbol,
  ConditionLabels,
} from "../common/widgets/widgets";
import { useMeta } from "../common/meta";
import { useProblem } from "../../api";
import TickModal from "../common/tick-modal/tick-modal";
import CommentModal from "../common/comment-modal/comment-modal";
import { ApproachProfile } from "../common/ApproachProfile";
import Linkify from "react-linkify";
import { ProblemsOnRock } from "./ProblemsOnRock";
import { ProblemTicks } from "./ProblemTicks";
import { ProblemComments } from "./ProblemComments";
import { componentDecorator } from "../../utils/componentDecorator";
import { DownloadButton } from "../common/DownloadButton";

export const Problem = () => {
  const { problemId } = useParams();
  if (!problemId) {
    throw new Error("Missing problemId from params");
  }

  const [showHiddenMedia, setShowHiddenMedia] = useState(false);
  const meta = useMeta();
  const { data, error, toggleTodo, redirectUi } = useProblem(
    +problemId,
    showHiddenMedia,
  );

  const [showTickModal, setShowTickModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState<any>(null);

  const onTickModalClose = () => {
    setShowTickModal(false);
  };

  function openTickModal() {
    setShowTickModal(true);
  }

  const onCommentModalClosed = () => {
    setShowCommentModal(null);
  };

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
          "Cannot find the specified problem because it does not exist or you do not have sufficient permissions."
        }
      />
    );
  } else if (!data?.id) {
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
  if (data.sections?.length) {
    data.sections.forEach((s) => {
      if (s.media?.length) {
        carouselMedia.push(...s.media);
        if (s.media.length > 1) {
          orderableMedia.push(...s.media);
        }
      }
    });
  }
  if (data.comments?.length) {
    data.comments.forEach((c) => {
      if (c.media?.length) {
        carouselMedia.push(...c.media);
        if (c.media.length > 1) {
          orderableMedia.push(...c.media);
        }
      }
    });
  }
  const markers: ComponentProps<typeof Leaflet>["markers"] = [];
  if (data.coordinates) {
    markers.push({
      coordinates: data.coordinates,
      label: data.name + " [" + data.grade + "]",
      url: "/problem/" + data.id,
    });
  }
  if (data.sectorParking) {
    markers.push({
      coordinates: data.sectorParking,
      url: "/sector/" + data.sectorId,
      isParking: true,
    });
  }
  const panes: ComponentProps<typeof Tab>["panes"] = [];
  if (data.media && data.media.length > 0) {
    const media = data.media;
    panes.push({
      menuItem: { key: "media", icon: "image" },
      render: () => (
        <Tab.Pane>
          <Media
            numPitches={data.sections?.length || 0}
            media={media}
            orderableMedia={orderableMedia}
            carouselMedia={carouselMedia}
            optProblemId={data.id ?? 0}
            showLocation={false}
          />
        </Tab.Pane>
      ),
    });
  }
  if (markers.length > 0) {
    let outlines: ComponentProps<typeof Leaflet>["outlines"];
    let approaches: ComponentProps<typeof Leaflet>["approaches"];
    if (data.sectorOutline?.length && !data.coordinates) {
      const outline = data.sectorOutline;
      outlines = [
        { url: "/sector/" + data.sectorId, label: data.sectorName, outline },
      ];
    }
    if (data.sectorApproach?.coordinates?.length) {
      approaches = [
        {
          approach: data.sectorApproach,
          label: getDistanceWithUnit(data.sectorApproach) ?? undefined,
        },
      ];
    }
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
            approaches={approaches}
            defaultCenter={
              markers[0].coordinates.latitude &&
              markers[0].coordinates.longitude
                ? {
                    lat: markers[0].coordinates.latitude,
                    lng: markers[0].coordinates.longitude,
                  }
                : meta.defaultCenter
            }
            defaultZoom={16}
            showSatelliteImage={true}
            clusterMarkers={false}
            flyToId={null}
          />
        </Tab.Pane>
      ),
    });
  }

  const tickModal = (() => {
    if (!showTickModal) {
      return null;
    }
    const enableTickRepeats = meta.isIce || data.sections?.length;
    const userTicks = data.ticks?.filter((t) => t.writable);
    if (userTicks && userTicks.length && userTicks[0].date) {
      return (
        <TickModal
          idTick={userTicks[0].id ?? 0}
          idProblem={data.id}
          date={userTicks[0].date}
          comment={userTicks[0].comment ?? ""}
          grade={
            userTicks[0].noPersonalGrade
              ? "No personal grade"
              : userTicks[0].suggestedGrade ?? "No personal grade"
          }
          grades={meta.grades}
          stars={userTicks[0].stars ?? 0}
          repeats={userTicks[0].repeats}
          open={showTickModal}
          onClose={onTickModalClose}
          enableTickRepeats={!!enableTickRepeats}
        />
      );
    }
    return (
      <TickModal
        idTick={-1}
        idProblem={data.id}
        grade={data.grade ?? meta.grades[0].grade}
        grades={meta.grades}
        open={showTickModal}
        onClose={onTickModalClose}
        comment={""}
        stars={null}
        repeats={undefined}
        date={undefined}
        enableTickRepeats={!!enableTickRepeats}
      />
    );
  })();

  const [conditionLat, conditionLng] = (() => {
    if (data.coordinates?.latitude && data.coordinates?.longitude) {
      return [+data.coordinates.latitude, +data.coordinates.longitude];
    }

    if (data.sectorOutline?.length) {
      const center = GetCenterFromDegrees(
        data.sectorOutline
          .filter(
            (c): c is Required<Pick<typeof c, "latitude" | "longitude">> =>
              !!(c.latitude && c.longitude),
          )
          .map((c) => [c.latitude, c.longitude]),
      );
      if (center) {
        return [+center[0], +center[1]];
      }
    }

    if (data.sectorParking?.latitude && data.sectorParking?.longitude) {
      return [+data.sectorParking.latitude, +data.sectorParking.longitude];
    }

    if (meta.defaultCenter.lat && meta.defaultCenter.lng) {
      return [meta.defaultCenter.lat, meta.defaultCenter.lng];
    }

    return [0, 0];
  })();

  let ticksComments;
  if (data.ticks?.length && data.comments?.length) {
    ticksComments = (
      <Grid>
        {data.ticks?.length && (
          <Grid.Column mobile={16} tablet={8} computer={8}>
            <ProblemTicks ticks={data.ticks} />
          </Grid.Column>
        )}
        {data.comments?.length && (
          <Grid.Column mobile={16} tablet={8} computer={8}>
            <ProblemComments
              onShowCommentModal={setShowCommentModal}
              problemId={+problemId}
              showHiddenMedia={showHiddenMedia}
            />
          </Grid.Column>
        )}
      </Grid>
    );
  } else if (data.ticks?.length) {
    ticksComments = <ProblemTicks ticks={data.ticks} />;
  } else if (data.comments?.length) {
    ticksComments = (
      <ProblemComments
        onShowCommentModal={setShowCommentModal}
        problemId={+problemId}
        showHiddenMedia={showHiddenMedia}
      />
    );
  }
  const isTicked = data.ticks?.filter((t) => t.writable).length === 1;

  return (
    <>
      <Helmet>
        <title>
          {data.name} [{data.grade}] ({data.areaName} / {data.sectorName})
        </title>
        <meta name="description" content={data.comment}></meta>
      </Helmet>
      {tickModal}
      {showCommentModal && (
        <CommentModal
          // Ensure that a fresh instance is made each time
          key={JSON.stringify(showCommentModal)}
          comment={showCommentModal}
          onClose={onCommentModalClosed}
          showHse={meta.isClimbing}
          id={showCommentModal?.id}
          idProblem={data.id}
        />
      )}
      <div style={{ marginBottom: "5px" }}>
        <div style={{ float: "right" }}>
          {meta.isAuthenticated && (
            <Button.Group size="mini" compact>
              {!isTicked && (
                <Button
                  positive={data.todo}
                  animated="fade"
                  onClick={() => toggleTodo(data.id)}
                >
                  <Button.Content hidden>To-do</Button.Content>
                  <Button.Content visible>
                    <Icon name="bookmark" />
                  </Button.Content>
                </Button>
              )}
              <Button
                positive={isTicked}
                animated="fade"
                onClick={openTickModal}
              >
                <Button.Content hidden>Tick</Button.Content>
                <Button.Content visible>
                  <Icon name="check" />
                </Button.Content>
              </Button>
              <Button
                animated="fade"
                onClick={() =>
                  setShowCommentModal({
                    id: -1,
                    idProblem: data.id,
                    danger: false,
                    resolved: false,
                  })
                }
              >
                <Button.Content hidden>Comment</Button.Content>
                <Button.Content visible>
                  <Icon name="comment" />
                </Button.Content>
              </Button>
              {meta.isAdmin && (
                <Button
                  positive={showHiddenMedia}
                  animated="fade"
                  onClick={async () => {
                    setShowHiddenMedia(!showHiddenMedia);
                  }}
                >
                  <Button.Content hidden>Images</Button.Content>
                  <Button.Content visible>
                    <Icon name="eye" />
                  </Button.Content>
                </Button>
              )}
              {meta.isAdmin ? (
                <Button
                  animated="fade"
                  as={Link}
                  to={`/problem/edit/${data.sectorId}/${data.id}`}
                >
                  <Button.Content hidden>Edit</Button.Content>
                  <Button.Content visible>
                    <Icon name="edit" />
                  </Button.Content>
                </Button>
              ) : (
                <Button
                  animated="fade"
                  as={Link}
                  to={`/problem/edit/media/${data.id}`}
                >
                  <Button.Content hidden>Image</Button.Content>
                  <Button.Content visible>
                    <Icon name="plus" />
                  </Button.Content>
                </Button>
              )}
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
              lockedAdmin={!!data.areaLockedAdmin}
              lockedSuperadmin={!!data.areaLockedSuperadmin}
            />
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section>
            <Link to={`/sector/${data.sectorId}`}>{data.sectorName}</Link>{" "}
            <LockSymbol
              lockedAdmin={!!data.sectorLockedAdmin}
              lockedSuperadmin={!!data.sectorLockedSuperadmin}
            />
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section active>
            <span style={{ fontWeight: "normal" }}>#{data.nr}</span> {data.name}{" "}
            <span style={{ fontWeight: "normal" }}>{data.grade}</span>{" "}
            <LockSymbol
              lockedAdmin={!!data.lockedAdmin}
              lockedSuperadmin={!!data.lockedSuperadmin}
            />
          </Breadcrumb.Section>
        </Breadcrumb>
      </div>
      {data.broken && (
        <Message
          size="huge"
          negative
          icon="attention"
          header={meta.isBouldering ? "Problem broken" : "Route broken"}
          content={data.broken}
        />
      )}
      {(data.areaAccessClosed || data.sectorAccessClosed) && (
        <Message
          size="huge"
          negative
          icon="attention"
          header={(data.areaAccessClosed ? "Area" : "Sector") + " closed!"}
          content={
            (data.areaAccessClosed || "") + (data.sectorAccessClosed || "")
          }
        />
      )}
      {panes?.length && <Tab panes={panes} />}
      <Table definition unstackable>
        <Table.Body>
          {(data.areaAccessInfo ||
            data.sectorAccessInfo ||
            data.areaNoDogsAllowed) && (
            <Table.Row warning verticalAlign="top">
              <Table.Cell>Restrictions:</Table.Cell>
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
                {data.sectorAccessInfo && <p>{data.sectorAccessInfo}</p>}
              </Table.Cell>
            </Table.Row>
          )}
          {(data.neighbourPrev || data.neighbourNext) && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Neighbour(s):</Table.Cell>
              <Table.Cell>
                {data.neighbourPrev && (
                  <Label
                    as={Link}
                    to={`/problem/${data.neighbourPrev.id}`}
                    basic
                  >
                    #{data.neighbourPrev.nr}
                    <Label.Detail>
                      {data.neighbourPrev.name}{" "}
                      <span style={{ fontWeight: "normal" }}>
                        {data.neighbourPrev.grade}
                      </span>
                    </Label.Detail>
                  </Label>
                )}
                {data.neighbourNext && (
                  <Label
                    as={Link}
                    to={`/problem/${data.neighbourNext.id}`}
                    basic
                  >
                    #{data.neighbourNext.nr}
                    <Label.Detail>
                      {data.neighbourNext.name}{" "}
                      <span style={{ fontWeight: "normal" }}>
                        {data.neighbourNext.grade}
                      </span>
                    </Label.Detail>
                  </Label>
                )}
              </Table.Cell>
            </Table.Row>
          )}
          {data.faAid && (
            <Table.Row verticalAlign="top">
              <Table.Cell>First ascent (Aid):</Table.Cell>
              <Table.Cell>
                {data.faAid.dateHr && (
                  <Label basic>
                    <Icon name="calendar check" />
                    {data.faAid.dateHr}
                  </Label>
                )}
                {data.faAid.users && (
                  <>
                    {data.faAid.users.map((u) => (
                      <Label
                        key={u.id}
                        as={Link}
                        to={`/user/${u.id}`}
                        image
                        basic
                      >
                        {u.picture ? (
                          <img src={u.picture} />
                        ) : (
                          <Icon name="user" />
                        )}
                        {u.name}
                      </Label>
                    ))}
                  </>
                )}
                {data.faAid.description && (
                  <Linkify componentDecorator={componentDecorator}>
                    <br />
                    {data.faAid.description}
                  </Linkify>
                )}
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row verticalAlign="top">
            <Table.Cell width={3}>
              {data.faAid ? "First free ascent (FFA):" : "First ascent:"}
            </Table.Cell>
            <Table.Cell>
              <Label basic>
                Grade:<Label.Detail>{data.originalGrade}</Label.Detail>
              </Label>
              {meta.isClimbing && data.t?.subType && (
                <Label basic>
                  <Icon name="tag" />
                  {data.t.subType}
                </Label>
              )}
              {data.faDateHr && (
                <Label basic>
                  <Icon name="calendar check" />
                  {data.faDateHr}
                </Label>
              )}
              {data.fa && (
                <>
                  {data.fa.map((u) => (
                    <Label
                      key={u.id}
                      as={Link}
                      to={`/user/${u.id}`}
                      image
                      basic
                    >
                      {u.picture ? (
                        <img src={u.picture} />
                      ) : (
                        <Icon name="user" />
                      )}
                      {u.name}
                    </Label>
                  ))}
                </>
              )}
              {data.comment && data.comment.trim().length > 0 && (
                <Linkify componentDecorator={componentDecorator}>
                  <br />
                  {data.comment}
                </Linkify>
              )}
              {meta.isIce && (
                <>
                  <br />
                  <b>Starting altitude: </b>
                  {data.startingAltitude}
                  <br />
                  <b>Aspect: </b>
                  {data.aspect}
                  <br />
                  <b>Route length: </b>
                  {data.routeLength}
                  <br />
                  <b>Descent: </b>
                  {data.descent}
                </>
              )}
            </Table.Cell>
          </Table.Row>
          {(data.trivia || data.triviaMedia?.length) && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Trivia:</Table.Cell>
              <Table.Cell>
                {data.trivia && (
                  <Linkify componentDecorator={componentDecorator}>
                    {data.trivia}
                  </Linkify>
                )}
                {data.triviaMedia && (
                  <Feed.Extra>
                    <Media
                      numPitches={data.sections?.length || 0}
                      media={data.triviaMedia}
                      orderableMedia={orderableMedia}
                      carouselMedia={carouselMedia}
                      optProblemId={null}
                      showLocation={false}
                    />
                  </Feed.Extra>
                )}
              </Table.Cell>
            </Table.Row>
          )}
          <ProblemsOnRock
            sectorId={data?.sectorId}
            problemId={+problemId}
            rock={data?.rock}
          />
          {(data.sectorApproach?.coordinates?.length ?? 0) > 1 && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Approach:</Table.Cell>
              <Table.Cell>
                <ApproachProfile approach={data.sectorApproach} />
              </Table.Cell>
            </Table.Row>
          )}
          {data.todos && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Todo:</Table.Cell>
              <Table.Cell>
                {data.todos.map((u) => (
                  <Label
                    size="mini"
                    key={u.idUser}
                    as={Link}
                    to={`/user/${u.idUser}`}
                    image
                    basic
                  >
                    {u.picture ? <img src={u.picture} /> : <Icon name="user" />}
                    {u.name}
                  </Label>
                ))}
              </Table.Cell>
            </Table.Row>
          )}
          {conditionLat > 0 && conditionLng > 0 && (
            <Table.Row>
              <Table.Cell>Conditions:</Table.Cell>
              <Table.Cell>
                <ConditionLabels
                  lat={conditionLat}
                  lng={conditionLng}
                  label={data.name ?? ""}
                  wallDirectionCalculated={data.sectorWallDirectionCalculated}
                  wallDirectionManual={data.sectorWallDirectionManual}
                  sunFromHour={data.areaSunFromHour ?? 0}
                  sunToHour={data.areaSunToHour ?? 0}
                />
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row verticalAlign="top">
            <Table.Cell>Misc:</Table.Cell>
            <Table.Cell>
              <DownloadButton href={`/problem/pdf?id=${data.id}`}>
                {meta.isBouldering ? "boulder.pdf" : "route.pdf"}
              </DownloadButton>
              <DownloadButton href={`/sectors/pdf?id=${data.sectorId}`}>
                sector.pdf
              </DownloadButton>
              <DownloadButton href={`/areas/pdf?id=${data.areaId}`}>
                area.pdf
              </DownloadButton>
              {data.sectorParking && (
                <Label
                  href={`https://www.google.com/maps/search/?api=1&query=${data.sectorParking.latitude},${data.sectorParking.longitude}`}
                  rel="noreferrer noopener"
                  target="_blank"
                  image
                  basic
                >
                  <Icon name="map" />
                  Parking (Google Maps)
                </Label>
              )}
              {data.coordinates && (
                <Label
                  href={`https://www.google.com/maps/search/?api=1&query=${data.coordinates.latitude},${data.coordinates.longitude}`}
                  rel="noreferrer noopener"
                  target="_blank"
                  image
                  basic
                >
                  <Icon name="map" />
                  {meta.isBouldering ? "Boulder" : "Route"} (Google Maps)
                </Label>
              )}
              <Label basic>
                Page views:
                <Label.Detail>{data.hits}</Label.Detail>
              </Label>
            </Table.Cell>
          </Table.Row>
          {data.sections && (
            <Table.Row verticalAlign="top">
              <Table.Cell verticalAlign="top">Pitches:</Table.Cell>
              <Table.Cell>
                <Feed size="small">
                  {data.sections.map((s) => (
                    <Feed.Event key={s.nr}>
                      <Feed.Label style={{ marginTop: "8px" }}>
                        {s.nr}
                      </Feed.Label>
                      <Feed.Content>
                        <Feed.Summary>
                          <Feed.Label>{s.grade}</Feed.Label>
                          <Feed.Date>{s.description}</Feed.Date>
                          {s.media && (
                            <Feed.Extra>
                              <Media
                                numPitches={data.sections?.length || 0}
                                media={s.media}
                                orderableMedia={orderableMedia}
                                carouselMedia={carouselMedia}
                                optProblemId={null}
                                showLocation={false}
                              />
                            </Feed.Extra>
                          )}
                        </Feed.Summary>
                      </Feed.Content>
                    </Feed.Event>
                  ))}
                </Feed>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      {ticksComments}
    </>
  );
};
