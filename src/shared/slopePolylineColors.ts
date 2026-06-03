/**
 * Trail polyline colors on Leaflet and elevation profile charts (Sector, Problem, Area).
 *
 * Ascent always uses green (`#84cc16`).
 * Descents use a rotating palette so multiple descent trails get visually distinct colors.
 */

export const TRAIL_ASCENT_COLOR = '#84cc16';

/**
 * Descent color palette — distinct hues that work on both dark map tiles and light backgrounds.
 * When there are multiple descents, each gets the next color in the sequence.
 */
const DESCENT_PALETTE = [
  '#a855f7', // violet (original)
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#eab308', // yellow
  '#14b8a6', // teal
  '#f43f5e', // rose
  '#8b5cf6', // indigo
];

/**
 * Returns the color for a trail based on whether it's a descent and its index among descents.
 * Ascent trails always get green.
 * @param isDescent Whether this trail is a descent
 * @param descentIndex Zero-based index of this descent among all descent trails (ignored for ascents)
 */
export function getTrailColor(isDescent: boolean, descentIndex: number): string {
  if (!isDescent) return TRAIL_ASCENT_COLOR;
  return DESCENT_PALETTE[descentIndex % DESCENT_PALETTE.length];
}
