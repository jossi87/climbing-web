import React from "react";
import { Segment, Message, Icon, Popup, Label } from "semantic-ui-react";
import SunCalc from "suncalc";

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

export function InsufficientPrivileges() {
  return (
    <Segment>
      <h3>Insufficient privileges</h3>
      Contact <a href="mailto:jostein.oygarden@gmail.com">
        Jostein Øygarden
      </a>{" "}
      if you want permissions.
    </Segment>
  );
}

type WeatherLabelsProps = {
  lat: number;
  lng: number;
  label: string;
};

export function WeatherLabels({ lat, lng, label }: WeatherLabelsProps) {
  if (lat && lng) {
    const times = SunCalc.getTimes(new Date(), lat, lng);
    return (
      <>
        <Label
          href={`https://www.yr.no/en/forecast/daily-table/${lat},${lng}`}
          rel="noopener"
          target="_blank"
          image
          basic
        >
          <Icon name="rain" />
          Yr.no
        </Label>
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
        {times.sunrise != "Invalid Date" && (
          <Popup
            content="Sunrise and sunset"
            trigger={
              <Label basic>
                <Icon name="sun" />
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
      </>
    );
  }
  return null;
}
