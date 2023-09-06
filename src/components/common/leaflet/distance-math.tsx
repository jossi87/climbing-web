import { components } from "../../../@types/buldreinfo/swagger";

export function calculateDistance(
  coordinates: components["schemas"]["Coordinates"][],
) {
  let km = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const lat1 = coordinates[i - 1].latitude;
    const lng1 = coordinates[i - 1].longitude;
    const lat2 = coordinates[i].latitude;
    const lng2 = coordinates[i].longitude;
    km += calculateDistanceBetweenCoordinates(lat1, lng1, lat2, lng2);
  }
  if (km > 1) {
    return Math.round(km * 100) / 100 + "km";
  }
  return Math.round(km * 1000) + "m";
}

function calculateDistanceBetweenCoordinates(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
