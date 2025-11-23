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
  return slopes.map((a) => {
    if (a.slope.coordinates.length === 1) {
      return (
        <Circle
          color={a.backgroundColor}
          key={a.slope.coordinates[0].id}
          center={[a.slope.coordinates[0].latitude, a.slope.coordinates[0].longitude]}
          radius={0.5}
        />
      );
    } else {
      let color = a.backgroundColor;
      let weight = 3;
      if (a.background === true) {
        color = 'red';
        weight = 1;
      }
      return (
        <Polyline
          key={a.slope.coordinates.map((c) => c.latitude + ',' + c.longitude).join(' -> ')}
          color={color}
          weight={weight}
          positions={a.slope.coordinates.map((c) => [c.latitude, c.longitude])}
        >
          {a.label && (
            <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
              {a.label}
            </Tooltip>
          )}
        </Polyline>
      );
    }
  });
}
