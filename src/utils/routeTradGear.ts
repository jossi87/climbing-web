/**
 * Labels for the “type” line a list row / feed entry shows. The text always comes from the database
 * (`climbing.type.type` + `climbing.type.subtype`, surfaced as `Type.type` / `Type.subType`): this module only joins
 * the two columns for display and never interprets what they mean. There is no “no subtype” spelling to normalise —
 * both columns are `NOT NULL` in the schema.
 *
 * Whether a route uses passive gear (trad / mixed / aid) is also *not* read from the label: the API exposes the
 * `type.trad_gear` column as `tradGear` (`problemTradGear` on feed rows), and that flag is what decides whether the
 * passive-gear glyph is rendered.
 */

/**
 * Display label for one problem type: the DB `subtype`, falling back to the DB `type` when a row carries no subtype
 * text. Both columns are `NOT NULL`, but a subtype can still be blank, and this keeps a blank subtype from becoming a
 * blank list group header or filter option. The sector / area lists also group by this, so keys and headers always
 * describe the same DB row.
 */
export function routeTypeLabel(type?: string | null, subType?: string | null): string {
  return (subType ?? '').trim() || (type ?? '').trim();
}

/** Route “type” label: `type - subtype`, collapsing to the single present half (also when both columns spell the same). */
export function formatRouteTypeLabel(type?: string | null, subType?: string | null): string {
  const t = (type ?? '').trim();
  const s = routeTypeLabel(type, subType);
  if (!t || t === s) return s;
  return `${t} - ${s}`;
}

/** Tooltip / marker line: `typeLabel` plus pitch count when multipitch (lists + TOC). */
export function formatPassiveGearMarkerLine(typeLabel: string, numPitches?: number | null): string {
  const n = numPitches ?? 0;
  if (n <= 1) return typeLabel;
  return `${typeLabel} · ${n} pitches`;
}
