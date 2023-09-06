import React from "react";
import { components } from "../../../@types/buldreinfo/swagger";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { Label } from "semantic-ui-react";
import { calculateDistance } from "../../common/leaflet/distance-math";

type Props = {
  coordinates?: components["schemas"]["Coordinates"][];
};

export const ApproachProfile = ({ coordinates }: Props) => {
  const distance = calculateDistance(coordinates);
  let elevationGain = 0;
  let elevationLoss = 0;
  for (let i = 1; i < coordinates.length; i++) {
    let elevation = coordinates[i].elevation-coordinates[i-1].elevation;
    if (elevation > 0) {
      elevationGain += elevation;
    } else if (elevation < 0) {
      elevationLoss -= elevation;
    }
  }
  return (
    <Label basic>
      {`Dist.: ${distance}`}
      <Label.Detail>{`Elev. +${Math.round(elevationGain)}m, -${Math.round(elevationLoss)}m`}</Label.Detail>
      <br />
      <ResponsiveContainer aspect={6}>
        <AreaChart
          data={coordinates}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <Area
            type="monotone"
            dataKey="elevation"
            stroke="#8884d8"
            fill="#8884d8"
            strokeWidth={2}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Label>
  );
};
