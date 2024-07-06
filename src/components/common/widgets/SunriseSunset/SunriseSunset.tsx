import React from "react";
import { Image, Label, Popup } from "semantic-ui-react";
import SunCalc from "suncalc";

type Props = {
  lat: number;
  lng: number;
  date?: Date;
};

export const SunriseSunset = ({ lat, lng, date }: Props) => {
  const { sunrise, sunset } = SunCalc.getTimes(date ?? new Date(), lat, lng);
  if (Number.isNaN(sunrise.getTime()) || Number.isNaN(sunset.getTime())) {
    return null;
  }

  return (
    <Popup
      content="Sunrise and sunset"
      trigger={
        <Label image basic size="small">
          <Image
            src="/svg/sunrise-sunset.svg"
            alt="Sunrise and Sunset"
            size="mini"
          />
          {String(sunrise.getHours()).padStart(2, "0") +
            ":" +
            String(sunrise.getMinutes()).padStart(2, "0") +
            " - " +
            String(sunset.getHours()).padStart(2, "0") +
            ":" +
            String(sunset.getMinutes()).padStart(2, "0")}
        </Label>
      }
    />
  );
};
