import React from "react";
import { components } from "../../../@types/buldreinfo/swagger";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Label } from "semantic-ui-react";

type Props = {
  coordinates?: components["schemas"]["Coordinates"][];
};

export const ApproachProfile = ({ coordinates }: Props) => {
  let elevationGain = 0;
  let elevationLoss = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const elevationDiff =
      coordinates[i].elevation - coordinates[i - 1].elevation;
    if (elevationDiff > 0) {
      elevationGain += elevationDiff;
    } else if (elevationDiff < 0) {
      elevationLoss -= elevationDiff;
    }
  }
  return (
    <Label basic>
      {`Dist.: ${Math.round(coordinates[coordinates.length - 1].distance)}m`}
      <Label.Detail>{`Elev. +${Math.round(elevationGain)}m, -${Math.round(
        elevationLoss,
      )}m`}</Label.Detail>
      <br />
      <ResponsiveContainer aspect={3}>
        <AreaChart
          data={coordinates}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <Tooltip
            labelFormatter={(m) => `Distance: ${Math.round(m)}m`}
            formatter={(value) => Math.round(value as number) + "m"}
          />
          <XAxis
            dataKey="distance"
            hide={true}
            type="number"
            scale="linear"
            unit="m"
            allowDecimals={false}
          />
          <YAxis
            dataKey="elevation"
            hide={true}
            type="number"
            scale="linear"
            unit="m"
            allowDecimals={false}
            domain={["dataMin", "dataMax"]}
          />
          <Area
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
