import React from "react";
import { Polygon, Tooltip } from "react-leaflet";

export default function Polygons({ navigate, opacity, outlines, addEventHandlers }) {
  if (!outlines) {
    return null;
  }
  return (
    outlines.map((o, i) => (
      <Polygon
        key={o.polygon}
        positions={o.polygon}
        color={o.background===true? "gray" : "#3388ff"}
        weight={o.background===true? 1 : 3}
        eventHandlers={{
          click: () => {
            if (addEventHandlers) {
              if (o.url.startsWith("https")) {
                var win = window.open(o.url, '_blank');
                win.focus();
              } else {
                navigate(o.url)
              }
            }
          }
        }}
      >
        {o.label && (
          <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
            {o.label}
          </Tooltip>
        )}
      </Polygon>
    ))
  );
}