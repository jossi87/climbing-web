import React from 'react';
import { CircleMarker, Polygon, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router';
import { components } from '../../../@types/buldreinfo/swagger';

type Props = {
  opacity: number;
  outlines: {
    outline: components['schemas']['Coordinates'][];
    background?: boolean;
    url?: string;
    label?: string;
  }[];
  addEventHandlers?: boolean;
  showElevation?: boolean;
};

export default function Polygons({ opacity, outlines, addEventHandlers, showElevation }: Props) {
  const navigate = useNavigate();
  if (!outlines || outlines.length === 0) {
    return null;
  }
  const polygons = outlines.map((o) => {
    const positions = o.outline.map((c) => [c.latitude ?? 0, c.longitude ?? 0] as [number, number]);
    const key = positions.map((p) => p[0] + ',' + p[1]).join(' -> ');
    return (
      <Polygon
        key={key}
        positions={positions}
        color={o.background ? 'red' : '#3388ff'}
        weight={o.background ? 1 : 3}
        eventHandlers={{
          click: () => {
            if (addEventHandlers) {
              if (o.url && o.url.startsWith('https')) {
                const win = window.open(o.url, '_blank');
                win?.focus();
              } else if (o.url) {
                navigate(o.url);
              }
            }
          },
        }}
      >
        {o.label && (
          <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
            {o.label}
          </Tooltip>
        )}
      </Polygon>
    );
  });
  const elevations =
    showElevation &&
    outlines
      .filter((o) => !o.background)
      .map((o) =>
        o.outline
          .filter((c) => (c.elevation ?? 0) > 0)
          .map((c) => (
            <CircleMarker key={c.id} radius={3} center={[c.latitude ?? 0, c.longitude ?? 0]}>
              <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
                {Math.round(c.elevation ?? 0) + 'm'}
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
