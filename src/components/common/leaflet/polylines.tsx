import React from "react";
import { Circle, Polyline, Tooltip } from "react-leaflet";
import { components } from "../../../@types/buldreinfo/swagger";

type Props = {
  opacity: number;
  approaches: {
    background?: boolean;
    approach: components["schemas"]["Coordinates"][];
    label?: string;
  }[];
};

export default function Polylines({ opacity, approaches }: Props) {
  if (!approaches) {
    return null;
  }
  return approaches.map((a) => {
    if (a.approach.length === 1) {
      return (
        <Circle
          color="lime"
          key={a.approach[0].id}
          center={[a.approach[0].latitude, a.approach[0].longitude]}
          radius={0.5}
        />
      );
    } else {
      let color = "lime";
      let weight = 3;
      if (a.background === true) {
        color = "red";
        weight = 1;
      }
      return (
        <Polyline
          key={a.approach.map((latlng) => latlng.toString()).join(" -> ")}
          color={color}
          weight={weight}
          positions={a.approach.map((c) => [c.latitude, c.longitude])}
        >
          {a.label && (
            <Tooltip
              opacity={opacity}
              permanent
              className="buldreinfo-tooltip-compact"
            >
              {a.label}
            </Tooltip>
          )}
        </Polyline>
      );
    }
  });
}
