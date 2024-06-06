import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { components } from "../../../@types/buldreinfo/swagger";
import React from "react";
import {
  Segment,
  Header,
  Message,
  Icon,
  Image,
  Popup,
  Label,
  Button,
  LabelDetail,
} from "semantic-ui-react";
import SunCalc from "suncalc";
import { TWeatherSymbolKey, weatherSymbolKeys } from "../../../yr";

type LockSymbolProps = {
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
};

export function LockSymbol({ lockedAdmin, lockedSuperadmin }: LockSymbolProps) {
  if (lockedSuperadmin) {
    return <Icon color="black" name="user secret" />;
  } else if (lockedAdmin) {
    return <Icon color="black" name="lock" />;
  }
  return null;
}

type StarsProps = {
  numStars: number;
  includeStarOutlines: boolean;
};

export function Stars({ numStars, includeStarOutlines }: StarsProps) {
  if (numStars === -1) {
    return null;
  } else if (numStars === 0.0) {
    if (includeStarOutlines) {
      return (
        <div
          style={{ whiteSpace: "nowrap", display: "inline-flex", opacity: 0.5 }}
        >
          <Icon color="black" name="star outline" />
          <Icon color="black" name="star outline" />
          <Icon color="black" name="star outline" />
        </div>
      );
    }
    return null;
  } else if (numStars === 0.5) {
    if (includeStarOutlines) {
      return (
        <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
          <Icon color="black" name="star half" />
          <Icon color="black" name="star outline" style={{ opacity: 0.5 }} />
          <Icon color="black" name="star outline" style={{ opacity: 0.5 }} />
        </div>
      );
    }
    return <Icon color="black" name="star half" />;
  } else if (numStars === 1.0) {
    if (includeStarOutlines) {
      return (
        <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
          <Icon color="black" name="star" />
          <Icon color="black" name="star outline" style={{ opacity: 0.5 }} />
          <Icon color="black" name="star outline" style={{ opacity: 0.5 }} />
        </div>
      );
    }
    return <Icon color="black" name="star" />;
  } else if (numStars === 1.5) {
    return (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
        <Icon color="black" name="star half" />
        {includeStarOutlines && (
          <Icon color="black" name="star outline" style={{ opacity: 0.5 }} />
        )}
      </div>
    );
  } else if (numStars === 2.0) {
    return (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
        <Icon color="black" name="star" />
        {includeStarOutlines && (
          <Icon color="black" name="star outline" style={{ opacity: 0.5 }} />
        )}
      </div>
    );
  } else if (numStars === 2.5) {
    return (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
        <Icon color="black" name="star" />
        <Icon color="black" name="star half" />
      </div>
    );
  } else if (numStars === 3.0) {
    return (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
        <Icon color="black" name="star" />
        <Icon color="black" name="star" />
      </div>
    );
  }
  return null;
}

export function Loading() {
  return (
    <Message icon style={{ backgroundColor: "white" }}>
      <Icon name="circle notched" loading />
      <Message.Content>
        <Message.Header>Just one second</Message.Header>
        We are fetching that content for you.
      </Message.Content>
    </Message>
  );
}

export function NotLoggedIn() {
  const { loginWithRedirect } = useAuth0();

  return (
    <Segment>
      <Header as="h3">
        <Icon name="lock" />
        <Header.Content>
          Authentication required
          <Header.Subheader>
            You must be logged in to access this page
          </Header.Subheader>
        </Header.Content>
      </Header>
      <Button
        primary
        icon
        labelPosition="left"
        onClick={() => {
          loginWithRedirect({ appState: { returnTo: location.pathname } });
        }}
      >
        <Icon name="sign in" />
        Sign in
      </Button>
    </Segment>
  );
}

export function InsufficientPrivileges() {
  return (
    <Segment>
      <Header as="h3">
        <Icon name="warning sign" />
        <Header.Content>
          Insufficient privileges
          <Header.Subheader>
            You don&apos;t have access to this page
          </Header.Subheader>
        </Header.Content>
      </Header>
      Contact <a href="mailto:jostein.oygarden@gmail.com">Jostein Øygarden</a>{" "}
      if you want access.
    </Segment>
  );
}

type ConditionLabelsProps = {
  lat: number;
  lng: number;
  label: string;
  wallDirectionCalculated: components["schemas"]["CompassDirection"];
  wallDirectionManual: components["schemas"]["CompassDirection"];
  sunFromHour: number;
  sunToHour: number;
};

export const WallDirection = ({
  wallDirectionCalculated,
  wallDirectionManual,
}: Pick<
  ConditionLabelsProps,
  "wallDirectionCalculated" | "wallDirectionManual"
>) => {
  if (wallDirectionCalculated || wallDirectionManual) {
    return (
      <Popup
        content={
          wallDirectionManual
            ? "Wall direction (manually set)"
            : "Wall direction (calculated from outline)"
        }
        trigger={
          <Label basic size="small">
            <Icon name="compass outline" />
            {wallDirectionManual
              ? wallDirectionManual.direction
              : wallDirectionCalculated.direction}
          </Label>
        }
      />
    );
  }
  return null;
};

export const SunOnWall = ({
  sunFromHour,
  sunToHour,
}: Pick<ConditionLabelsProps, "sunFromHour" | "sunToHour">) => {
  if (sunFromHour > 0 && sunToHour > 0) {
    return (
      <Popup
        content="Sun on wall"
        trigger={
          <Label image basic size="small">
            <Image src="/svg/sun-on-wall.svg" alt="Sun on wall" size="mini" />
            {String(sunFromHour).padStart(2, "0") +
              ":00" +
              " - " +
              String(sunToHour).padStart(2, "0") +
              ":00"}
          </Label>
        }
      />
    );
  }
  return null;
};

type YrData = {
  properties: {
    timeseries: {
      time: string;
      data: {
        next_1_hours: {
          summary: {
            symbol_code: TWeatherSymbolKey;
          };
        };
        next_6_hours: {
          summary: {
            symbol_code: TWeatherSymbolKey;
          };
        };
        next_12_hours: {
          summary: {
            symbol_code: TWeatherSymbolKey;
          };
        };
      };
    }[];
  };
};

export const WeatherIcon = ({
  symbol,
}: {
  symbol: undefined | "loading" | TWeatherSymbolKey;
}) => {
  if (symbol === "loading") {
    return <Icon name="spinner" loading />;
  }

  if (symbol && weatherSymbolKeys[symbol]) {
    return <img src={`/svg/yr/${weatherSymbolKeys[symbol]}.svg`} />;
  }

  return <Icon name="rain" />;
};

const YrLink = ({ lat, lng }: Pick<ConditionLabelsProps, "lat" | "lng">) => {
  const { data: weatherData, isLoading } = useQuery({
    queryKey: [`yr/weather`, { lat, lng }],
    enabled: !!lat && !!lng,
    queryFn: () =>
      fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`,
      ).then((res) => res.json() as Promise<YrData>),
    select: (data) => data.properties?.timeseries?.[0]?.data,
  });

  const next1Hours = weatherData?.next_1_hours?.summary?.symbol_code;
  const next6Hours = weatherData?.next_6_hours?.summary?.symbol_code;
  const next12Hours = weatherData?.next_12_hours?.summary?.symbol_code;

  const label = (
    <Label
      href={`https://www.yr.no/en/forecast/daily-table/${lat},${lng}`}
      rel="noopener noreferrer"
      target="_blank"
      image
      basic
      size="small"
      onClick={(e) => {
        if (matchMedia && !matchMedia("(hover:hover)")?.matches) {
          // If the device doesn't have the ability to hover, don't take them
          // to yr.no immediately.
          e.preventDefault();
        }
      }}
    >
      <WeatherIcon symbol={isLoading ? "loading" : next1Hours} />
      Yr.no
    </Label>
  );

  if (isLoading || !weatherData) {
    return label;
  }

  return (
    <Popup trigger={label}>
      <table>
        <tbody>
          <tr>
            <td>
              <img
                width={50}
                src={`/svg/yr/${weatherSymbolKeys[next1Hours]}.svg`}
              />
            </td>
            <td>
              <img
                width={50}
                src={`/svg/yr/${weatherSymbolKeys[next6Hours]}.svg`}
              />
            </td>
            <td>
              <img
                width={50}
                src={`/svg/yr/${weatherSymbolKeys[next12Hours]}.svg`}
              />
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>1 hr</td>
            <td style={{ textAlign: "center" }}>6 hrs</td>
            <td style={{ textAlign: "center" }}>12 hrs</td>
          </tr>
          <tr>
            <td colSpan={3}>
              Provided by{" "}
              <a
                href={`https://www.yr.no/en/forecast/daily-table/${lat},${lng}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                yr.no
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </Popup>
  );
};

export function ConditionLabels({
  lat,
  lng,
  label,
  wallDirectionCalculated,
  wallDirectionManual,
  sunFromHour,
  sunToHour,
}: ConditionLabelsProps) {
  if (!lat || !lng) {
    return;
  }

  const d = new Date();
  const date = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getDate()}`;
  const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  const times = SunCalc.getTimes(new Date(), lat, lng);
  return (
    <>
      <WallDirection
        wallDirectionCalculated={wallDirectionCalculated}
        wallDirectionManual={wallDirectionManual}
      />
      <SunOnWall sunFromHour={sunFromHour} sunToHour={sunToHour} />
      {times.sunrise != "Invalid Date" && (
        <Popup
          content="Sunrise and sunset"
          trigger={
            <Label image basic size="small">
              <Image
                src="/svg/sunrise-sunset.svg"
                alt="Sunrise and Sunset"
                size="mini"
              />
              {String(times.sunrise.getHours()).padStart(2, "0") +
                ":" +
                String(times.sunrise.getMinutes()).padStart(2, "0") +
                " - " +
                String(times.sunset.getHours()).padStart(2, "0") +
                ":" +
                String(times.sunset.getMinutes()).padStart(2, "0")}
            </Label>
          }
        />
      )}
      <YrLink lat={lat} lng={lng} />
      <Label
        href={`/webcams/` + JSON.stringify({ lat, lng, label })}
        rel="noopener"
        target="_blank"
        basic
        size="small"
      >
        <Icon name="camera" />
        Webcams
      </Label>
      <Label
        href={`https://www.suncalc.org/#/${lat},${lng},17/${date}/${time}/1/0`}
        rel="noopener"
        target="_blank"
        basic
        size="small"
      >
        <Icon name="external alternate" />
        SunCalc
        <LabelDetail>
          {date}-{time}
        </LabelDetail>
      </Label>
    </>
  );
}
