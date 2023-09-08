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

export function convertGpxToCoordinates(gpx: string) {
  const allCoords = gpx
    .replace(/(\r\n|\n|\r)/gm, "\n")
    .split("\n")
    .reduce(
      (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
      [],
    )
    .map((l) => {
      const parts = /^(.+lat="(.+?)".*lon="(.+?)".)$/.exec(l);
      if (parts?.length != 4) {
        return null;
      }
      const lat = parseFloat(parts[2]);
      const lon = parseFloat(parts[3]);
      return { latitude: lat, longitude: lon };
    })
    .filter((c) => !!c);
  if (allCoords?.length < 2) {
    return null;
  }
  // Make a new array with fewer elements, we don't need all the coordinates
  const res = [];
  for (let i = 0; i < allCoords.length; i++) {
    const c = allCoords[i];
    if (i === 0 || (i === allCoords.length - 1 && res.length == 1)) {
      res.push(c);
    } else {
      const prevC = res[res.length - 1];
      const dm = calculateDistanceBetweenCoordinates(
        prevC.latitude,
        prevC.longitude,
        c.latitude,
        c.longitude,
      );
      if (dm > 10) {
        res.push(c);
      }
    }
  }
  return res;
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
  const d = R * c * 1000; // Distance in meter
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
