import { captureMessage } from "@sentry/core";
import { LatLngExpression } from "leaflet";

export const parsePolyline = (
  polyline: string,
  onError?: (msg: string, extra?: Record<string, string>) => void,
): LatLngExpression[] => {
  const reportError =
    onError ??
    ((message) => {
      captureMessage("Failed to parse polyline", {
        extra: { message, polyline },
      });
    });

  if (!polyline) {
    return [];
  }

  return polyline
    .split(";")
    .filter(Boolean)
    .reduce((acc, value) => {
      const latlng = value.split(",");
      if (latlng.length !== 2) {
        reportError("Wrong number of entries", { value });
        return acc;
      }
      const [lat, lng] = latlng.map((v) => +v);
      if (Number.isNaN(lat)) {
        reportError("Invalid latitude", { lat: String(lat), value });
        return acc;
      }

      if (Number.isNaN(lng)) {
        reportError("Invalid longitude", { lng: String(lng), value });
        return acc;
      }

      return [...acc, [lat, lng]];
    }, []);
};
