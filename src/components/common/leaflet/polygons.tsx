import { LatLngExpression } from "leaflet";
import React from "react";
import { Polygon, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router";

type Props = {
  opacity: number;
  outlines: {
    polygon: LatLngExpression[];
    background?: boolean;
    url?: string;
    label?: string;
  }[];
  addEventHandlers?: boolean;
};

export default function Polygons({
  opacity,
  outlines,
  addEventHandlers,
}: Props) {
  const navigate = useNavigate();
  if (!outlines) {
    return null;
  }
  return outlines.map((o) => (
    <Polygon
      key={o.polygon.map((latlng) => latlng.toString()).join(" -> ")}
      positions={o.polygon}
      color={o.background ? "red" : "#3388ff"}
      weight={o.background ? 1 : 3}
      eventHandlers={{
        click: () => {
          if (addEventHandlers) {
            if (o.url?.startsWith("https")) {
              const win = window.open(o.url, "_blank");
              win?.focus();
            } else {
              navigate(o.url);
            }
          }
        },
      }}
    >
      {o.label && (
        <Tooltip
          opacity={opacity}
          permanent
          className="buldreinfo-tooltip-compact"
        >
          {o.label}
        </Tooltip>
      )}
    </Polygon>
  ));
}
