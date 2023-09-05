import { captureMessage } from "@sentry/core";
import { hashHexColor } from "./colors";
import { components } from "../@types/buldreinfo/swagger";

export const parsePolyline = (
  polyline: string,
  onError?: (msg: string, extra?: Record<string, string>) => void,
): components["schemas"]["Coordinates"][] => {
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

      const last = acc[acc.length - 1];
      if (lat === last?.[0] && lng === last?.[1]) {
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
const hashLatLng = ({
  latitude,
  longitude,
}: components["schemas"]["Coordinates"]): number => {
  const componentSize = Math.floor(String(Number.MAX_SAFE_INTEGER).length / 2);
  const msbLat = String(latitude)
    .replace(/[^\d]/g, "")
    .split("")
    .reverse()
    .join("")
    .substring(0, componentSize - 1);
  const msbLng = String(longitude)
    .replace(/[^\d]/g, "")
    .split("")
    .reverse()
    .join("")
    .substring(0, componentSize);
  return Number(`${msbLat}${msbLng}`) % Number.MAX_SAFE_INTEGER;
};

export const colorLatLng = (
  c: components["schemas"]["Coordinates"],
): ReturnType<typeof hashHexColor> => {
  return hashHexColor(hashLatLng(c));
};
