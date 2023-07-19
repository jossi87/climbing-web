import React from "react";
import { Circle, Polyline, Tooltip } from "react-leaflet";

export default function Polylines({ opacity, polylines }) {
  if (!polylines) {
    return null;
  }
  return polylines.map((p) => {
    if (p.polyline.length === 1) {
      return (
        <Circle
          color="lime"
          // It's not great to use JSON.stringify(..) for this, but I don't
          // know what type we're actually working with here. This is easier
          // for now and shouldn't cause any major performance issues.
          key={JSON.stringify(p.polyline[0])}
          center={p.polyline[0]}
          radius={0.5}
        />
      );
    } else {
      let color = "lime";
      let weight = 3;
      if (p.background === true) {
        color = "red";
        weight = 1;
      }
      return (
        <Polyline
          key={p.polyline}
          color={color}
          weight={weight}
          positions={p.polyline}
        >
          {p.label && (
            <Tooltip
              opacity={opacity}
              permanent
              className="buldreinfo-tooltip-compact"
            >
              {p.label}
            </Tooltip>
          )}
        </Polyline>
      );
    }
  });
}
