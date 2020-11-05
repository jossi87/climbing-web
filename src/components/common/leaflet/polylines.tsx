import React from "react";
import { Circle, Polyline } from "react-leaflet";

export default function Polylines({ polylines }) {
  if (!polylines) {
    return null;
  }
  return (
    polylines.map((p, i) => {
      if (p.length === 1) {
        return <Circle key={i} center={p[0]} radius={0.5} />
      }
      else {
        return <Polyline key={i} color="lime" positions={p} />
      }
    }
  ));
}