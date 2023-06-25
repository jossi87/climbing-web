import React from "react";
import { Polygon, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router";

export default function Polygons({ opacity, outlines, addEventHandlers }) {
  const navigate = useNavigate();
  if (!outlines) {
    return null;
  }
  return outlines.map((o) => (
    <Polygon
      key={o.polygon}
      positions={o.polygon}
      color={o.background === true ? "red" : "#3388ff"}
      weight={o.background === true ? 1 : 3}
      eventHandlers={{
        click: () => {
          if (addEventHandlers) {
            if (o.url.startsWith("https")) {
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
