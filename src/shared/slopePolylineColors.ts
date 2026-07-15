/**
 * Trail polyline colors on Leaflet and elevation profile charts (Sector, Problem, Area).
 *
 * Ascent always uses green (`#84cc16`) as default.
 * Descent always uses orange (`#f97316`) as default.
 * When there are multiple ascents or descents, each gets the next color in the respective palette.
 */

export const TRAIL_ASCENT_COLOR = '#84cc16';
export const TRAIL_DESCENT_COLOR = '#f97316';

/**
 * Ascent color palette — distinct hues that work on both dark map tiles and light backgrounds.
 * First color is green (default), then cycles through additional colors when multiple ascents exist.
 */
const ASCENT_PALETTE = [
  '#84cc16', // green (default)
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#14b8a6', // teal
  '#8b5cf6', // indigo
  '#f43f5e', // rose
];

/**
 * Descent color palette — distinct hues that work on both dark map tiles and light backgrounds.
 * First color is orange (default), then cycles through additional colors when multiple descents exist.
 */
const DESCENT_PALETTE = [
  '#f97316', // orange (default)
  '#a855f7', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#14b8a6', // teal
  '#f43f5e', // rose
  '#8b5cf6', // indigo
];

/**
 * Returns the color for a trail based on whether it's a descent or ascent and its index.
 * @param isDescent Whether this trail is a descent
 * @param index Zero-based index of this trail among all trails of the same type (ascent or descent)
 */
export function getTrailColor(isDescent: boolean, index: number): string {
  if (isDescent) {
    return DESCENT_PALETTE[index % DESCENT_PALETTE.length];
  }
  return ASCENT_PALETTE[index % ASCENT_PALETTE.length];
}
