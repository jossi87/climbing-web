import { CircleMarker } from "react-leaflet";
import { parsePolyline, colorLatLng } from "../../utils/polyline";

type Props = {
  polyline: string | undefined;
};

export const PolylineMarkers = ({ polyline }: Props) => {
  if (!polyline) {
    return null;
  }

  const parsed = parsePolyline(polyline);
  return parsed.map((latlng) => (
    <CircleMarker
      key={latlng.join(",")}
      radius={5}
      center={latlng}
      color={colorLatLng(latlng)[0]}
    />
  ));
};
