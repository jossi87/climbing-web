import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
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
  includeNoRating: boolean;
};

export function Stars({ numStars, includeNoRating }: StarsProps) {
  let stars: React.ReactNode;
  if (includeNoRating && numStars === -1) {
    stars = (
      <Label basic size="mini">
        <Icon name="x" />
        No rating
      </Label>
    );
  } else if (numStars === 0.5) {
    stars = <Icon color="black" name="star half" />;
  } else if (numStars === 1.0) {
    stars = (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
      </div>
    );
  } else if (numStars === 1.5) {
    stars = (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
        <Icon color="black" name="star half" />
      </div>
    );
  } else if (numStars === 2.0) {
    stars = (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
        <Icon color="black" name="star" />
      </div>
    );
  } else if (numStars === 2.5) {
    stars = (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
        <Icon color="black" name="star" />
        <Icon color="black" name="star half" />
      </div>
    );
  } else if (numStars === 3.0) {
    stars = (
      <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
        <Icon color="black" name="star" />
        <Icon color="black" name="star" />
        <Icon color="black" name="star" />
      </div>
    );
  }
  if (stars) {
    return (
      <Popup
        trigger={stars}
        header="Rating:"
        content={
          <div>
            <Icon name="star" /> Nice
            <br />
            <Icon name="star" />
            <Icon name="star" /> Very nice
            <br />
            <Icon name="star" />
            <Icon name="star" />
            <Icon name="star" /> Fantastic!
            <br />
            {includeNoRating && (
              <>
                <Label basic size="mini">
                  <Icon name="x" />
                  No rating
                </Label>{" "}
                User has not rated
              </>
            )}
          </div>
        }
      />
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

type WeatherLabelsProps = {
  lat: number;
  lng: number;
  label: string;
  sunFromHour: number;
  sunToHour: number;
};

export const SunOnWall = ({
  sunFromHour,
  sunToHour,
}: Pick<WeatherLabelsProps, "sunFromHour" | "sunToHour">) => {
  if (sunFromHour > 0 && sunToHour > 0) {
    return (
      <Popup
        content="Sun on wall"
        trigger={
          <Label image basic>
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

const YrLink = ({ lat, lng }: Pick<WeatherLabelsProps, "lat" | "lng">) => {
  const { data: weatherData, isLoading } = useQuery(
    [`yr/weather`, { lat, lng }],
    {
      enabled: !!lat && !!lng,
      queryFn: () =>
        fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`,
        ).then((res) => res.json() as Promise<YrData>),
      select: (data) => data.properties?.timeseries?.[0]?.data,
    },
  );

  const next1Hours = weatherData?.next_1_hours?.summary?.symbol_code;
  const next6Hours = weatherData?.next_6_hours?.summary?.symbol_code;
  const next12Hours = weatherData?.next_12_hours?.summary?.symbol_code;

  const label = (
    <Label
      href={`https://www.yr.no/en/forecast/daily-table/${lat},${lng}`}
      rel="noopener"
      target="_blank"
      image
      basic
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
        </tbody>
      </table>
    </Popup>
  );
};

export function WeatherLabels({
  lat,
  lng,
  label,
  sunFromHour,
  sunToHour,
}: WeatherLabelsProps) {
  if (!lat || !lng) {
    return;
  }

  const times = SunCalc.getTimes(new Date(), lat, lng);
  return (
    <>
      <SunOnWall sunFromHour={sunFromHour} sunToHour={sunToHour} />
      {times.sunrise != "Invalid Date" && (
        <Popup
          content="Sunrise and sunset"
          trigger={
            <Label image basic>
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
        image
        basic
      >
        <Icon name="camera" />
        Webcams
      </Label>
    </>
  );
}
