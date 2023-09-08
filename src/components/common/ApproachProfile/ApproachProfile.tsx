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
import { getDistanceWithUnit } from "../leaflet/geo-utils";

type Props = {
  approach?: components["schemas"]["Approach"];
};

export const ApproachProfile = ({ approach }: Props) => {
  return (
    <Label basic>
      {`Dist.: ${getDistanceWithUnit(approach)}`}
      <Label.Detail>{`Elev. +${approach.elevationGain}m, -${approach.elevationLoss}m`}</Label.Detail>
      <br />
      <ResponsiveContainer aspect={3}>
        <AreaChart
          data={approach.coordinates}
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
            domain={([dataMin, dataMax]) => {
              const max = Math.max(dataMax, dataMin + 100);
              return [dataMin, max];
            }}
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
      <Label.Detail>{`Estimated time: ${approach.calculatedDurationInMinutes} min`}</Label.Detail>
    </Label>
  );
};
