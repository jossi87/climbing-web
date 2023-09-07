import { components } from "../../../@types/buldreinfo/swagger";

export function getDistanceWithUnit(
  approach: components["schemas"]["Approach"],
) {
  if (!approach) {
    return null;
  }
  const m = approach.distance;
  if (m > 1000) {
    return Math.round(m / 100) / 10 + "km";
  }
  return Math.round(m) + "m";
}
