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
  const firstElevation = Math.round(coordinates[0].elevation);
  const lastElevation = Math.round(
    coordinates[coordinates.length - 1].elevation,
  );
  return (
    <Label basic>
      {`Distance: ${distance}`}
      <Label.Detail>{`Elevation: ${firstElevation}-${lastElevation} m`}</Label.Detail>
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
