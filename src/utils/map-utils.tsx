/**
 * Get a center latitude,longitude from an array of like geopoints
 *
 * @param array data 2 dimensional array of latitudes and longitudes
 * For Example:
 * $data = array
 * (
 *   0 = > array(45.849382, 76.322333),
 *   1 = > array(45.843543, 75.324143),
 *   2 = > array(45.765744, 76.543223),
 *   3 = > array(45.784234, 74.542335)
 * );
 */
function GetCenterFromDegrees(data: number[][]) {
  if (!(data.length > 0)) {
    return false;
  }

  const num_coords = data.length;

  let X = 0.0;
  let Y = 0.0;
  let Z = 0.0;

  for (let i = 0; i < data.length; i++) {
    const lat = (data[i][0] * Math.PI) / 180;
    const lon = (data[i][1] * Math.PI) / 180;

    const a = Math.cos(lat) * Math.cos(lon);
    const b = Math.cos(lat) * Math.sin(lon);
    const c = Math.sin(lat);

    X += a;
    Y += b;
    Z += c;
  }

  X /= num_coords;
  Y /= num_coords;
  Z /= num_coords;

  const lon = Math.atan2(Y, X);
  const hyp = Math.sqrt(X * X + Y * Y);
  const lat = Math.atan2(Z, hyp);

  const newX = (lat * 180) / Math.PI;
  const newY = (lon * 180) / Math.PI;

  return [newX, newY];
}

export default GetCenterFromDegrees;
