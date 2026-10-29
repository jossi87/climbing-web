import type { components } from '../../@types/buldreinfo/swagger';

type TocProblem = components['schemas']['TocProblem'];

/**
 * Where a problem starts, in metres — the single definition shared by the list, the altitude filter and the workbook,
 * so the number a row is filtered on is the number the row shows is the number the spreadsheet holds.
 *
 * A problem can carry a registered `startingAltitude`. When it does not, the site falls back to the elevation of the
 * problem's own map coordinates, which is why a list can show an altitude for a problem that has none of its own:
 * `approximate` marks that fallback, and the list renders it as a leading `~` (`~640 m`).
 *
 * Rounded to whole metres, because that is how every caller displays it and because the map elevation is a `double`:
 * `640.3999938964844` is neither readable on the page nor useful in a cell. `null` means the problem has no altitude
 * at all — no registered value and no coordinates to read one from.
 */
export const startingAltitudeOf = (problem: TocProblem): { meters: number; approximate: boolean } | null => {
  // `0` is the API's "not set" for a registered altitude (the same sentinel the filter and the list use).
  const registered = problem.startingAltitude ?? 0;
  if (registered > 0) {
    return { meters: registered, approximate: false };
  }

  const elevation = problem.coordinates?.elevation;
  if (typeof elevation === 'number' && Number.isFinite(elevation)) {
    return { meters: Math.round(elevation), approximate: true };
  }

  return null;
};
