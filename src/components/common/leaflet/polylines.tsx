import React from "react";
import { Circle, Polyline, Tooltip } from "react-leaflet";
import { components } from "../../../@types/buldreinfo/swagger";

type Props = {
  opacity: number;
  approaches: {
    background?: boolean;
    approach: components["schemas"]["Approach"];
    label?: string;
  }[];
};

export default function Polylines({ opacity, approaches }: Props) {
  if (!approaches) {
    return null;
  }
  return approaches.map((a) => {
    if (a.approach.coordinates.length === 1) {
      return (
        <Circle
          color="lime"
          key={a.approach.coordinates[0].id}
          center={[
            a.approach.coordinates[0].latitude,
            a.approach.coordinates[0].longitude,
          ]}
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
          key={a.approach.coordinates
            .map((c) => c.latitude + "," + c.longitude)
            .join(" -> ")}
          color={color}
          weight={weight}
          positions={a.approach.coordinates.map((c) => [
            c.latitude,
            c.longitude,
          ])}
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
