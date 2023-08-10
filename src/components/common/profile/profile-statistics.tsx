import React, { useState } from "react";
import { Link } from "react-router-dom";
import Chart from "../chart/chart";
import ProblemList from "../problem-list/problem-list";
import Leaflet from "../../common/leaflet/leaflet";
import { Loading, LockSymbol, Stars } from "../widgets/widgets";
import {
  Icon,
  List,
  Label,
  Divider,
  Button,
  Tab,
  Message,
} from "semantic-ui-react";
import {
  numberWithCommas,
  getUsersTicks,
  useAccessToken,
  useProfileStatistics,
} from "../../../api";
import { saveAs } from "file-saver";
import { useMeta } from "../meta";
import * as Sentry from "@sentry/react";
import { definitions } from "../../../@types/buldreinfo/swagger";

type TickListItemProps = {
  tick: definitions["ProfileStatistics"]["ticks"][number];
};

const TickListItem = ({ tick }: TickListItemProps) => (
  <List.Item key={tick.idProblem}>
    <List.Header>
      <small>{tick.dateHr}</small>{" "}
      <small style={{ color: "gray" }}>
        {tick.areaName}{" "}
        <LockSymbol
          lockedAdmin={tick.areaLockedAdmin}
          lockedSuperadmin={tick.areaLockedSuperadmin}
        />{" "}
        / {tick.sectorName}
        <LockSymbol
          lockedAdmin={tick.sectorLockedAdmin}
          lockedSuperadmin={tick.sectorLockedSuperadmin}
        />{" "}
        /
      </small>{" "}
      <Link to={`/problem/${tick.idProblem}`}>{tick.name}</Link> {tick.grade}
      <LockSymbol
        lockedAdmin={tick.lockedAdmin}
        lockedSuperadmin={tick.lockedSuperadmin}
      />
      {tick.stars != 0 && (
        <>
          {" "}
          <Stars numStars={tick.stars} includeNoRating={true} />{" "}
        </>
      )}
      {tick.fa && <Label color="red" size="mini" content="FA" />}
      {tick.idTickRepeat > 0 && <Label size="mini" basic content="Repeat" />}
      {tick.subType && (
        <Label
          basic
          size="mini"
          content={tick.subType}
          detail={tick.numPitches > 1 ? tick.numPitches + " pitches" : null}
        />
      )}{" "}
      {tick.comment && (
        <small style={{ color: "gray" }}>
          <i>{tick.comment}</i>
        </small>
      )}
    </List.Header>
  </List.Item>
);

type ProfileStatisticsProps = {
  userId: number;
  canDownload: boolean;
};

const ProfileStatistics = ({ userId, canDownload }: ProfileStatisticsProps) => {
  const { defaultCenter, defaultZoom } = useMeta();
  const accessToken = useAccessToken();
  const { data, isLoading, error } = useProfileStatistics(userId);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    Sentry.captureException(error, { extra: { userId } });
    return (
      <Message
        size="huge"
        style={{ backgroundColor: "#FFF" }}
        icon="meh"
        header="Error"
        content={"Unable to load profile statistics."}
      />
    );
  }

  const numTicks = data.ticks.filter(
    (t) => !t.fa && t.idTickRepeat === 0,
  ).length;
  const numTickRepeats = data.ticks.filter(
    (t) => !t.fa && t.idTickRepeat > 0,
  ).length;
  const numFas = data.ticks.filter((t) => t.fa).length;
  const chart = data.ticks.length > 0 ? <Chart ticks={data.ticks} /> : null;
  const panes: NonNullable<React.ComponentProps<typeof Tab>["panes"]> = [];
  panes.push({
    menuItem: { key: "stats", icon: "area graph" },
    render: () => (
      <Tab.Pane>
        {canDownload && (
          <Button
            floated="right"
            circular
            size="medium"
            icon="save"
            loading={isSaving}
            onClick={() => {
              setIsSaving(true);
              let filename = "ticks.xlsx";
              getUsersTicks(accessToken)
                .then((response) => {
                  filename = response.headers
                    .get("content-disposition")
                    .slice(22, -1);
                  return response.blob();
                })
                .then((blob) => {
                  setIsSaving(false);
                  saveAs(blob, filename);
                });
            }}
          />
        )}
        <Label.Group size="small">
          <Label color="orange" image>
            <Icon name="check" />
            {numberWithCommas(numFas)}
            <Label.Detail>FA</Label.Detail>
          </Label>
          <Label color="olive" image>
            <Icon name="check" />
            {numberWithCommas(numTicks)}
            <Label.Detail>Tick</Label.Detail>
          </Label>
          {numTickRepeats > 0 && (
            <Label color="olive" image>
              <Icon name="check" />
              {numberWithCommas(numTickRepeats)}
              <Label.Detail>Repeat</Label.Detail>
            </Label>
          )}
          <Label color="green" image>
            <Icon name="photo" />
            {numberWithCommas(data.numImageTags)}
            <Label.Detail>Tag</Label.Detail>
          </Label>
          <Label color="teal" image>
            <Icon name="photo" />
            {numberWithCommas(data.numImagesCreated)}
            <Label.Detail>Captured</Label.Detail>
          </Label>
          <Label color="blue" image>
            <Icon name="video" />
            {numberWithCommas(data.numVideoTags)}
            <Label.Detail>Tag</Label.Detail>
          </Label>
          <Label color="violet" image>
            <Icon name="video" />
            {numberWithCommas(data.numVideosCreated)}
            <Label.Detail>Captured</Label.Detail>
          </Label>
        </Label.Group>
        {chart && (
          <>
            <Divider />
            {chart}
          </>
        )}
      </Tab.Pane>
    ),
  });
  const markers: NonNullable<React.ComponentProps<typeof Leaflet>["markers"]> =
    [];
  data.ticks.forEach((t) => {
    if (t.lat && t.lng) {
      markers.push({
        lat: t.lat,
        lng: t.lng,
        label: t.name,
        url: "/problem/" + t.idProblem,
      });
    }
  });
  if (markers.length > 0) {
    panes.push({
      menuItem: { key: "map", icon: "map" },
      render: () => (
        <Tab.Pane>
          <Leaflet
            key={"ticked=" + userId}
            autoZoom={true}
            height="40vh"
            markers={markers}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            polylines={null}
            outlines={null}
            onMouseClick={null}
            onMouseMove={null}
            showSatelliteImage={false}
            clusterMarkers={true}
            rocks={null}
            flyToId={null}
          />
        </Tab.Pane>
      ),
    });
  }

  return (
    <>
      <Tab panes={panes} />
      <br />
      {data.ticks.length > 0 && (
        <ProblemList
          isSectorNotUser={false}
          preferOrderByGrade={false}
          rows={data.ticks.map((t) => {
            return {
              element: (
                <TickListItem
                  key={[t.areaName, t.sectorName, t.name, t.idTickRepeat].join("/")}
                  tick={t}
                />
              ),
              areaName: t.areaName,
              sectorName: t.sectorName,
              name: t.name,
              nr: null,
              gradeNumber: t.gradeNumber,
              stars: t.stars,
              numTicks: null,
              ticked: null,
              rock: null,
              subType: t.subType,
              num: t.num,
              fa: t.fa,
            };
          })}
        />
      )}
    </>
  );
};

export default ProfileStatistics;
