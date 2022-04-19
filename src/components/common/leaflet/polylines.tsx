import React from "react";
import { Circle, Polyline, Tooltip } from "react-leaflet";

export default function Polylines({ polylines, opacity }) {
  if (!polylines) {
    return null;
  }
  return (
    polylines.map((p, i) => {
      if (p.length === 1) {
        return <Circle key={i} center={p[0]} radius={0.5} />
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