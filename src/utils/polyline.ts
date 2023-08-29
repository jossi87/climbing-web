import { captureMessage } from "@sentry/core";
import { LatLngTuple } from "leaflet";
import { hashHexColor } from "./colors";

export const parsePolyline = (
  polyline: string,
  onError?: (msg: string, extra?: Record<string, string>) => void,
): LatLngTuple[] => {
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

/**
 * The goal here is to turn a lat,lng pair into a semi-unique number so that it
 * will have a representative hash code. It's not intended to be perfect, but we
 * just need "good enough".
 */
const hashLatLng = ([lat, lng]: LatLngTuple): number => {
  const componentSize = Math.floor(String(Number.MAX_SAFE_INTEGER).length / 2);
  const msbLat = String(lat)
    .replace(/[^\d]/g, "")
    .split("")
    .reverse()
    .join("")
    .substring(0, componentSize - 1);
  const msbLng = String(lng)
    .replace(/[^\d]/g, "")
    .split("")
    .reverse()
    .join("")
    .substring(0, componentSize);
  return Number(`${msbLat}${msbLng}`) % Number.MAX_SAFE_INTEGER;
};

export const colorLatLng = (
  latlng: LatLngTuple,
): ReturnType<typeof hashHexColor> => {
  return hashHexColor(hashLatLng(latlng));
};
