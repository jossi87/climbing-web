import React from "react";
import { CircleMarker, Polygon, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router";
import { components } from "../../../@types/buldreinfo/swagger";

type Props = {
  opacity: number;
  outlines: {
    outline: components["schemas"]["Coordinates"][];
    background?: boolean;
    url?: string;
    label?: string;
  }[];
  addEventHandlers?: boolean;
  showElevation?: boolean;
};

export default function Polygons({
  opacity,
  outlines,
  addEventHandlers,
  showElevation,
}: Props) {
  const navigate = useNavigate();
  if (!outlines || outlines.length === 0) {
    return null;
  }
  const polygons = outlines.map((o) => (
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
  const elevations =
    showElevation &&
    outlines
      .filter((o) => !o.background)
      .map((o) =>
        o.outline.map((c) => (
          <CircleMarker
            key={c.id}
            radius={3}
            center={[c.latitude, c.longitude]}
          >
            <Tooltip
              opacity={opacity}
              permanent
              className="buldreinfo-tooltip-compact"
            >
              {c.elevation}
            </Tooltip>
          </CircleMarker>
        )),
      );
  return (
    <>
      {polygons}
      {elevations}
    </>
  );
}
