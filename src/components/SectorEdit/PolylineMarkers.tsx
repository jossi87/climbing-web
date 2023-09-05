import { CircleMarker } from "react-leaflet";
import { colorLatLng } from "../../utils/polyline";
import { components } from "../../@types/buldreinfo/swagger";

type Props = {
  coordinates: components["schemas"]["Coordinates"][];
};

export const PolylineMarkers = ({ coordinates }: Props) => {
  if (!coordinates) {
    return null;
  }

  return coordinates.map((c) => (
    <CircleMarker
      key={c.latitude + "," + c.longitude}
      radius={5}
      center={[c.latitude, c.longitude]}
      color={colorLatLng(c)[0]}
    />
  ));
};
