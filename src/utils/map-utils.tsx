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
function GetCenterFromDegrees(data)
{       
    if (!(data.length > 0)){
        return false;
    } 

    var num_coords = data.length;

    var X = 0.0;
    var Y = 0.0;
    var Z = 0.0;

    for(let i = 0; i < data.length; i++){
        var lat = data[i][0] * Math.PI / 180;
        var lon = data[i][1] * Math.PI / 180;

        var a = Math.cos(lat) * Math.cos(lon);
        var b = Math.cos(lat) * Math.sin(lon);
        var c = Math.sin(lat);

        X += a;
        Y += b;
        Z += c;
    }

    X /= num_coords;
    Y /= num_coords;
    Z /= num_coords;

    var lon = Math.atan2(Y, X);
    var hyp = Math.sqrt(X * X + Y * Y);
    var lat = Math.atan2(Z, hyp);

    var newX = (lat * 180 / Math.PI);
    var newY = (lon * 180 / Math.PI);

    return new Array(newX, newY);
}

export default GetCenterFromDegrees