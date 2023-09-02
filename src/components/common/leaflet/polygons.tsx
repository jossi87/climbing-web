import React from "react";
import { Polygon, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router";
import { components } from "../../../@types/buldreinfo/swagger";

type Props = {
  opacity: number;
  outlines: {
    outline: components["schemas"]["Coordinate"][];
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
  if (!outlines || outlines.length === 0) {
    return null;
  }
  return outlines.map((o) => (
    <Polygon
      key={o.outline.map((c) => c.latitude + "," + c.longitude).join(" -> ")}
      positions={o.outline.map((c) => [c.latitude, c.longitude])}
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
