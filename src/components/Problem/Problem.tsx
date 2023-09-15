import React, { useState, ComponentProps } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import Leaflet from "../common/leaflet/leaflet";
import { getDistanceWithUnit } from "../common/leaflet/geo-utils";
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
import {
  getAreaPdfUrl,
  getSectorPdfUrl,
  getProblemPdfUrl,
  useProblem,
  useAccessToken,
} from "../../api";
import TickModal from "../common/tick-modal/tick-modal";
import CommentModal from "../common/comment-modal/comment-modal";
import { ApproachProfile } from "../common/ApproachProfile";
import Linkify from "react-linkify";
import { ProblemsOnRock } from "./ProblemsOnRock";
import { ProblemTicks } from "./ProblemTicks";
import { ProblemComments } from "./ProblemComments";
import { componentDecorator } from "../../utils/componentDecorator";

export const Problem = () => {
  const accessToken = useAccessToken();
  const { problemId } = useParams();
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

  const orderableMedia = [];
  const carouselMedia = [];
  if (data.media?.length > 0) {
    carouselMedia.push(...data.media);
    if (data.media.length > 1) {
      orderableMedia.push(...data.media);
    }
  }
  if (data.triviaMedia?.length > 0) {
    carouselMedia.push(...data.triviaMedia);
    if (data.triviaMedia.length > 1) {
      orderableMedia.push(...data.triviaMedia);
    }
  }
  if (data.sections?.length > 0) {
    data.sections.forEach((s) => {
      if (s.media?.length > 0) {
        carouselMedia.push(...s.media);
        if (s.media.length > 1) {
          orderableMedia.push(...s.media);
        }
      }
    });
  }
  if (data.comments?.length > 0) {
    data.comments.forEach((c) => {
      if (c.media?.length > 0) {
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
    panes.push({
      menuItem: { key: "media", icon: "image" },
      render: () => (
        <Tab.Pane>
          <Media
            numPitches={data.sections?.length || 0}
            media={data.media}
            orderableMedia={orderableMedia}
            carouselMedia={carouselMedia}
            optProblemId={data.id}
          />
        </Tab.Pane>
      ),
    });
  }
  if (markers.length > 0) {
    let outlines;
    let approaches;
    if (data.sectorOutline?.length > 0 && !data.coordinates) {
      const outline = data.sectorOutline;
      outlines = [
        { url: "/sector/" + data.sectorId, label: data.sectorName, outline },
      ];
    }
    if (data.sectorApproach?.coordinates?.length > 0) {
      approaches = [
        {
          approach: data.sectorApproach,
          label: getDistanceWithUnit(data.sectorApproach),
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
            defaultCenter={{
              lat: markers[0].coordinates.latitude,
              lng: markers[0].coordinates.longitude,
            }}
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
    const enableTickRepeats = meta.isIce || data.sections?.length > 0;
    const userTicks = data.ticks?.filter((t) => t.writable);
    if (userTicks && userTicks.length > 0) {
      return (
        <TickModal
          idTick={userTicks[0].id}
          idProblem={data.id}
          date={userTicks[0].date}
          comment={userTicks[0].comment}
          grade={userTicks[0].suggestedGrade}
          grades={meta.grades}
          stars={userTicks[0].stars}
          repeats={userTicks[0].repeats}
          open={showTickModal}
          onClose={onTickModalClose}
          enableTickRepeats={enableTickRepeats}
        />
      );
    }
    return (
      <TickModal
        idTick={-1}
        idProblem={data.id}
        grade={data.originalGrade}
        grades={meta.grades}
        open={showTickModal}
        onClose={onTickModalClose}
        comment={null}
        stars={null}
        repeats={undefined}
        date={null}
        enableTickRepeats={enableTickRepeats}
      />
    );
  })();

  const [lat, lng] = (() => {
    if (data.coordinates) {
      return [+data.coordinates.latitude, +data.coordinates.longitude];
    }
    if (data.sectorParking) {
      return [+data.sectorParking.latitude, +data.sectorParking.longitude];
    }
    return [0, 0];
  })();

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
              <Button
                positive={
                  data.ticks && data.ticks.filter((t) => t.writable).length > 0
                }
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
              lockedAdmin={data.areaLockedAdmin}
              lockedSuperadmin={data.areaLockedSuperadmin}
            />
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section>
            <Link to={`/sector/${data.sectorId}`}>{data.sectorName}</Link>{" "}
            <LockSymbol
              lockedAdmin={data.sectorLockedAdmin}
              lockedSuperadmin={data.sectorLockedSuperadmin}
            />
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section active>
            {data.name} {data.grade}{" "}
            <LockSymbol
              lockedAdmin={data.lockedAdmin}
              lockedSuperadmin={data.lockedSuperadmin}
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
      <Tab panes={panes} />
      <Table definition unstackable>
        <Table.Body>
          {(data.areaAccessInfo ||
            data.sectorAccessInfo ||
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
                {data.sectorAccessInfo && <p>{data.sectorAccessInfo}</p>}
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row verticalAlign="top">
            <Table.Cell width={3}>Number:</Table.Cell>
            <Table.Cell>{data.nr}</Table.Cell>
          </Table.Row>
          {data.sectorIdProblemPrev > 0 && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Jump:</Table.Cell>
              <Table.Cell>
                <Button.Group size="mini">
                  <Button
                    size="tiny"
                    as={Link}
                    to={`/problem/${data.sectorIdProblemPrev}`}
                    icon
                    labelPosition="left"
                  >
                    <Icon name="angle left" />
                    Prev
                  </Button>
                  <Button
                    size="tiny"
                    as={Link}
                    to={`/problem/${data.sectorIdProblemNext}`}
                    icon
                    labelPosition="right"
                  >
                    <Icon name="angle right" />
                    Next
                  </Button>
                </Button.Group>
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
            <Table.Cell>
              {data.faAid ? "First free ascent (FFA):" : "First ascent:"}
            </Table.Cell>
            <Table.Cell>
              <Label basic>
                Grade:<Label.Detail>{data.originalGrade}</Label.Detail>
              </Label>
              {meta.isClimbing && (
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
          {(data.trivia || data.triviaMedia?.length > 0) && (
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
          {data.sectorApproach?.coordinates?.length > 1 && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Approach:</Table.Cell>
              <Table.Cell>
                <ApproachProfile approach={data.sectorApproach} />
              </Table.Cell>
            </Table.Row>
          )}
          {data.ticks && (
            <Table.Row verticalAlign="top">
              <Table.Cell>Public ascents:</Table.Cell>
              <Table.Cell>{data.ticks.length}</Table.Cell>
            </Table.Row>
          )}
          {data.todos && (
            <Table.Row verticalAlign="top">
              <Table.Cell>On TODO-list:</Table.Cell>
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
          {lat > 0 && lng > 0 && (
            <Table.Row>
              <Table.Cell>Weather:</Table.Cell>
              <Table.Cell>
                <ConditionLabels
                  lat={lat}
                  lng={lng}
                  label={data.name}
                  wallDirection={data.sectorWallDirection}
                  sunFromHour={data.areaSunFromHour}
                  sunToHour={data.areaSunToHour}
                />
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row verticalAlign="top">
            <Table.Cell>Misc:</Table.Cell>
            <Table.Cell>
              <Label
                href={getProblemPdfUrl(accessToken, data.id)}
                rel="noreferrer noopener"
                target="_blank"
                image
                basic
              >
                <Icon name="file pdf outline" />
                {meta.isBouldering ? "boulder.pdf" : "route.pdf"}
              </Label>
              <Label
                href={getSectorPdfUrl(accessToken, data.sectorId)}
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
            </Table.Cell>
          </Table.Row>
          <Table.Row verticalAlign="top">
            <Table.Cell>Page views:</Table.Cell>
            <Table.Cell>{data.hits}</Table.Cell>
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
      <Grid>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          <ProblemTicks ticks={data.ticks ?? []} />
        </Grid.Column>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          <ProblemComments
            onShowCommentModal={setShowCommentModal}
            problemId={+problemId}
            showHiddenMedia={showHiddenMedia}
          />
        </Grid.Column>
      </Grid>
    </>
  );
};
