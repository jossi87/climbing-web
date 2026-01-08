import { CircleMarker } from 'react-leaflet';
import { colorLatLng } from '../../utils/polyline';
import type { components } from '../../@types/buldreinfo/swagger';
import { useMeta } from '../common/meta';

type Props = {
  coordinates: components['schemas']['Coordinates'][];
};

export const PolylineMarkers = ({ coordinates }: Props) => {
  const { defaultCenter } = useMeta();

  if (!coordinates) {
    return null;
  }

  return coordinates.map((c) => (
    <CircleMarker
      key={c.latitude + ',' + c.longitude}
      radius={5}
      center={[c.latitude ?? defaultCenter.lat, c.longitude ?? defaultCenter.lng]}
      color={colorLatLng(c)[0]}
    />
  ));
};
