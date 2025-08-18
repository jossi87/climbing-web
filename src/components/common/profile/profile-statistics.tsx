import React, { useState } from "react";
import { Link } from "react-router-dom";
import Chart from "../chart/chart";
import ProblemList from "../problem-list";
import Leaflet from "../../common/leaflet/leaflet";
import { Loading, LockSymbol, Stars } from "../widgets/widgets";
import {
  Icon,
  List,
  Label,
  Divider,
  Button,
  Tab,
  TabPane,
  Message,
} from "semantic-ui-react";
import {
  numberWithCommas,
  downloadUsersTicks,
  useAccessToken,
  useProfileStatistics,
} from "../../../api";
import { useMeta } from "../meta";
import * as Sentry from "@sentry/react";
import { components } from "../../../@types/buldreinfo/swagger";

type TickListItemProps = {
  tick: NonNullable<
    components["schemas"]["ProfileStatistics"]["ticks"]
  >[number];
};

const TickListItem = ({ tick }: TickListItemProps) => (
  <List.Item key={tick.idProblem}>
    <List.Header>
      <small>{tick.dateHr}</small>{" "}
      <small style={{ color: "gray" }}>
        {tick.areaName}{" "}
        <LockSymbol
          lockedAdmin={!!tick.areaLockedAdmin}
          lockedSuperadmin={!!tick.areaLockedSuperadmin}
        />{" "}
        / {tick.sectorName}
        <LockSymbol
          lockedAdmin={!!tick.sectorLockedAdmin}
          lockedSuperadmin={!!tick.sectorLockedSuperadmin}
        />{" "}
        /
      </small>{" "}
      <Link to={`/problem/${tick.idProblem}`}>{tick.name}</Link> {tick.grade}
      {tick.noPersonalGrade && (
        <Label basic size="mini">
          <Icon name="x" />
          No personal grade
        </Label>
      )}
      <LockSymbol
        lockedAdmin={!!tick.lockedAdmin}
        lockedSuperadmin={!!tick.lockedSuperadmin}
      />{" "}
      <Stars numStars={tick.stars ?? 0} includeStarOutlines={true} />{" "}
      {tick.fa && <Label color="red" size="mini" content="FA" />}
      {tick.idTickRepeat ? <Label size="mini" basic content="Repeat" /> : null}
      {tick.subType ? (
        <Label
          basic
          size="mini"
          content={tick.subType}
          detail={
            (tick.numPitches ?? 0) > 1 ? tick.numPitches + " pitches" : null
          }
        />
      ) : null}{" "}
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
  emails: string[];
  lastActivity: string;
  canDownload: boolean;
};

const ProfileStatistics = ({
  userId,
  emails,
  lastActivity,
  canDownload,
}: ProfileStatisticsProps) => {
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

  const regions = Array.from(
    new Set(
      data.ticks?.map(
        (t: components["schemas"]["ProfileStatisticsTick"]) => t.regionName,
      ),
    ),
  ).sort();
  const numTicks =
    data.ticks?.filter((t) => !t.fa && t.idTickRepeat === 0).length ?? 0;
  const numTickRepeats =
    data.ticks?.filter((t) => !t.fa && t.idTickRepeat).length ?? 0;
  const numFas = data.ticks?.filter((t) => t.fa).length ?? 0;
  const chart = data.ticks?.length ? <Chart ticks={data.ticks} /> : null;
  const panes: NonNullable<React.ComponentProps<typeof Tab>["panes"]> = [];
  panes.push({
    menuItem: { key: "stats", icon: "area graph" },
    render: () => (
      <TabPane>
        {canDownload && (
          <Button
            floated="right"
            circular
            size="medium"
            icon="save"
            loading={isSaving}
            onClick={() => {
              setIsSaving(true);
              downloadUsersTicks(accessToken).finally(() => {
                setIsSaving(false);
              });
            }}
          />
        )}
        {numTicks > 0 ||
        numFas > 0 ||
        numTickRepeats > 0 ||
        data.numImageTags > 0 ||
        data.numImagesCreated > 0 ||
        data.numVideoTags > 0 ||
        data.numVideosCreated > 0 ||
        regions?.length > 0 ||
        emails?.length > 0 ||
        lastActivity ? (
          <Label.Group size="small">
            {(numTicks > 0 || numFas > 0) && (
              <Label color="orange" image>
                <Icon name="check" />
                {numberWithCommas(numTicks + numFas)}
                {numFas > 0 && ` (${numberWithCommas(numFas)} FA's)`}
                <Label.Detail>Ascents</Label.Detail>
              </Label>
            )}
            {numTickRepeats > 0 && (
              <Label color="olive" image>
                <Icon name="check" />
                {numberWithCommas(numTickRepeats)}
                <Label.Detail>Repeat</Label.Detail>
              </Label>
            )}
            {data.numImageTags > 0 && (
              <Label color="green" image>
                <Icon name="photo" />
                {numberWithCommas(data.numImageTags)}
                <Label.Detail>Tag</Label.Detail>
              </Label>
            )}
            {data.numImagesCreated > 0 && (
              <Label color="teal" image>
                <Icon name="photo" />
                {numberWithCommas(data.numImagesCreated)}
                <Label.Detail>Captured</Label.Detail>
              </Label>
            )}
            {data.numVideoTags > 0 && (
              <Label color="blue" image>
                <Icon name="video" />
                {numberWithCommas(data.numVideoTags)}
                <Label.Detail>Tag</Label.Detail>
              </Label>
            )}
            {data.numVideosCreated > 0 && (
              <Label color="violet" image>
                <Icon name="video" />
                {numberWithCommas(data.numVideosCreated)}
                <Label.Detail>Captured</Label.Detail>
              </Label>
            )}
            {regions?.length > 0 && (
              <Label color="brown" image>
                <Icon name="world" />
                {regions.length === 1 ? "Region" : "Regions"}
                <Label.Detail>{regions.join(", ")}</Label.Detail>
              </Label>
            )}
            {emails?.map((email) => (
              <Label
                key={email}
                color="purple"
                image
                as="a"
                href={`mailto:${email}`}
              >
                <Icon name="mail outline" />
                {email}
              </Label>
            ))}
            {lastActivity && (
              <Label key={lastActivity} color="pink" image>
                <Icon name="time" />
                Active
                <Label.Detail>{lastActivity}</Label.Detail>
              </Label>
            )}
          </Label.Group>
        ) : (
          "No data"
        )}
        {chart && (
          <>
            <Divider />
            {chart}
          </>
        )}
      </TabPane>
    ),
  });
  const markers: NonNullable<React.ComponentProps<typeof Leaflet>["markers"]> =
    [];
  data.ticks?.forEach((t) => {
    if (t.coordinates) {
      markers.push({
        coordinates: t.coordinates,
        label: t.name,
        url: "/problem/" + t.idProblem,
      });
    }
  });
  if (markers.length > 0) {
    panes.push({
      menuItem: { key: "map", icon: "map" },
      render: () => (
        <TabPane>
          <Leaflet
            key={"ticked=" + userId}
            autoZoom={true}
            height="40vh"
            markers={markers}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            showSatelliteImage={false}
            clusterMarkers={true}
            flyToId={null}
          />
        </TabPane>
      ),
    });
  }

  return (
    <>
      <Tab panes={panes} />
      <br />
      {data.ticks?.length ? (
        <ProblemList
          storageKey={`user/${userId}`}
          mode="user"
          defaultOrder="date"
          rows={
            data.ticks.map((t) => {
              return {
                element: (
                  <TickListItem
                    key={[
                      t.areaName,
                      t.sectorName,
                      t.name,
                      t.idProblem,
                      t.idTickRepeat,
                    ].join("/")}
                    tick={t}
                  />
                ),
                areaName: t.areaName ?? "",
                sectorName: t.sectorName ?? "",
                name: t.name ?? "",
                nr: null,
                gradeNumber: t.gradeNumber ?? 0,
                stars: t.stars ?? 0,
                numTicks: 0,
                // This is true, but we want to ignore it in this view because
                // we know that they're all ticked.
                ticked: false,
                rock: "",
                subType: t.subType ?? "",
                num: t.num ?? 0,
                fa: t.fa ?? false,
                faDate: null,
              };
            }) ?? []
          }
        />
      ) : null}
    </>
  );
};

export default ProfileStatistics;
