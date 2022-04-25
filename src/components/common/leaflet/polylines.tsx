import React from "react";
import { Circle, Polyline, Tooltip } from "react-leaflet";

export default function Polylines({ polylines, opacity }) {
  if (!polylines) {
    return null;
  }
  return (
    polylines.map((p, i) => {
      if (p.polyline.length === 1) {
        return <Circle color="lime" key={i} center={p.polyline[0]} radius={0.5} />
      }
      else {
        return (
          <Polyline key={i} color="lime" positions={p.polyline}>
            {p.label &&
              <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
                {p.label}
              </Tooltip>
            }
          </Polyline>
        )
      }
    }
  ));
}