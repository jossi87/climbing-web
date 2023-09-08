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
import { Label, Segment } from "semantic-ui-react";
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
          <defs>
            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2451B7" stopOpacity={0.4} />
              <stop offset="75%" stopColor="#2451B7" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            dataKey="elevation"
            stroke="#2451B7"
            strokeWidth={2}
            fill="url(#color)"
            isAnimationActive={false}
            dot={false}
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
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active) {
                return null;
              }
              return (
                <Segment size="mini" compact style={{ opacity: 0.7 }}>
                  {`Dist.: ${parseInt(label)}m, elev.: ${parseInt(
                    payload[0].payload.elevation,
                  )}m`}
                </Segment>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <Label.Detail>{`Estimated time: ${approach.calculatedDurationInMinutes} min`}</Label.Detail>
    </Label>
  );
};
