import React from 'react';
import { Circle, Polyline, Tooltip } from 'react-leaflet';
import { components } from '../../../@types/buldreinfo/swagger';

type Props = {
  opacity: number;
  slopes: {
    backgroundColor: string;
    background?: boolean;
    slope: components['schemas']['Slope'];
    label?: string;
  }[];
};

export default function Polylines({ opacity, slopes }: Props) {
  if (!slopes) {
    return null;
  }
  return (
    <>
      {slopes.map((a) => {
        const coords = (a.slope?.coordinates ?? []).map((c) => ({
          lat: c.latitude ?? 0,
          lng: c.longitude ?? 0,
          id: c.id,
          elevation: c.elevation ?? 0,
        }));
        if (coords.length === 1) {
          return (
            <Circle
              color={a.backgroundColor}
              key={coords[0].id}
              center={[coords[0].lat, coords[0].lng]}
              radius={0.5}
            />
          );
        }
        let color = a.backgroundColor;
        let weight = 3;
        if (a.background) {
          color = 'red';
          weight = 1;
        }
        const positions = coords.map((c) => [c.lat, c.lng] as [number, number]);
        return (
          <Polyline
            key={positions.map((p) => p[0] + ',' + p[1]).join(' -> ')}
            color={color}
            weight={weight}
            positions={positions}
          >
            {a.label && (
              <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
                {a.label}
              </Tooltip>
            )}
          </Polyline>
        );
      })}
    </>
  );
}
