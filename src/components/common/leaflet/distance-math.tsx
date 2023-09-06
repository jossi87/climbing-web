import { components } from "../../../@types/buldreinfo/swagger";

export function getDistanceWithUnit(
  coordinates: components["schemas"]["Coordinates"][],
) {
  if (coordinates?.length == 0) {
    return null;
  }
  const m = coordinates[coordinates.length - 1].distance;
  if (m > 1000) {
    return Math.round(m / 100) / 10 + "km";
  }
  return Math.round(m) + "m";
}
