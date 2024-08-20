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
import { Segment, Label, Icon } from "semantic-ui-react";
import { getDistanceWithUnit } from "../leaflet/geo-utils";

type Props = {
  approach?: components["schemas"]["Approach"];
};

const createXmlString = (
  coordinates: components["schemas"]["Coordinates"][],
): string => {
  let result = '<?xml version="1.0" encoding="UTF-8"?>\r\n';
  result +=
    '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="BratteLinjer/Buldreinfo">\r\n';
  result += "<trk>\r\n";
  result += "\t<type>Running</type>\r\n";
  result += "\t<trkseg>\r\n";
  result += coordinates.reduce((accum, curr) => {
    const segmentTag = `\t\t<trkpt lat="${curr.latitude}" lon="${curr.longitude}"><ele>${curr.elevation}</ele></trkpt>\r\n`;
    return (accum += segmentTag);
  }, "");
  result += "\t</trkseg>\r\n";
  result += "</trk>\r\n";
  result += "</gpx>";
  return result;
};

const downloadGpxFile = (
  coordinates: components["schemas"]["Coordinates"][],
) => {
  const xml = createXmlString(coordinates);
  const url = "data:text/json;charset=utf-8," + xml;
  const link = document.createElement("a");
  link.download = `approach.gpx`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
};

export const ApproachProfile = ({ approach }: Props) => {
  return (
    <>
      <ResponsiveContainer aspect={3} width={200}>
        <AreaChart
          data={approach.coordinates}
          margin={{ top: 4, right: 0, left: 0, bottom: 4 }}
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
      <Label basic size="small">
        Distance:
        <Label.Detail>{getDistanceWithUnit(approach)}</Label.Detail>
      </Label>
      <Label basic size="small">
        Elevation:
        <Label.Detail>{`+${approach.elevationGain}m, -${approach.elevationLoss}m`}</Label.Detail>
      </Label>
      <Label basic size="small">
        Estimated time:
        <Label.Detail>{`${approach.calculatedDurationInMinutes} min`}</Label.Detail>
      </Label>
      <Label basic size="small">
        Elevation source:
        <Label.Detail>
          {Array.from(
            new Set(approach.coordinates.map((a) => a.elevationSource)),
          ).join(", ")}
        </Label.Detail>
      </Label>
      <Label
        basic
        size="small"
        image
        as="a"
        onClick={() => downloadGpxFile(approach.coordinates)}
      >
        <Icon name="download" />
        GPX
      </Label>
    </>
  );
};
