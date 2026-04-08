import { cn } from '../../../lib/utils';

import { tickListRowQuietMeta } from './profileRowTypography';

/** FA / pitches / ticks / rock — soft pill; spacing from flex `gap` only (no middle dots). */
export const problemListRowMetaChipClass = cn(
  'inline-flex max-w-full min-w-0 shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-normal leading-tight ring-1 ring-white/[0.08] sm:text-[13px]',
  'bg-slate-400/12 text-slate-300 light:bg-slate-900/[0.07] light:text-slate-600 light:ring-slate-900/10',
);

/** Outer wrap — `items-end` so the cluster shares one bottom edge with mixed SVGs. */
export const problemListRowRatingIconsClass = 'inline-flex shrink-0 items-end leading-none';

/**
 * Stars + topo / coords / images / video — `items-end` + per-glyph translate so Lucide matches muted star tips.
 */
export const problemListRowMediaClusterClass = 'inline-flex shrink-0 items-end gap-1 leading-none';

/** Muted star row: slight down-shift for text baseline; paired with {@link problemListRowMediaGlyphClass}. */
export const problemListRowStarsWrapClass = 'inline-flex shrink-0 translate-y-[0.11em] leading-none';

/** Lucide 12px icons sit optically high vs star points — nudge down to align with star bottoms. */
export const problemListRowMediaGlyphClass = cn(
  'font-normal text-slate-200 antialiased light:text-slate-700',
  'shrink-0 translate-y-[0.085em] opacity-95 light:opacity-100',
);

/** Plain meta in the list tail (pitches, rock, FA names). */
export const problemListRowFaPlainClass = cn(tickListRowQuietMeta, 'min-w-0 text-[12px] leading-snug sm:text-[13px]');

/** Pitches + rock + FA + comment — inline with the rest of column 2 (wraps with normal text flow). */
export const problemListRowMetaTailClass = cn(tickListRowQuietMeta, 'text-[12px] leading-snug sm:text-[13px]');

/** Community tick count (“1 tick”, “2 ticks”, …). */
export const problemListRowTicksMetaClass = cn(
  tickListRowQuietMeta,
  'inline shrink-0 whitespace-nowrap align-baseline text-[12px] font-normal leading-snug sm:text-[13px] antialiased',
);

/** Muted pipe — visible but quieter so long rows don’t feel like a fence (both themes). */
export const problemListRowPipeSepClass = 'inline-block select-none px-1.5 text-slate-500/55 light:text-slate-400/72';

/**
 * Trad passive-gear marker in dense lists — `trad-gear-marker-wrap--list-emphasis` in `index.css`
 * overrides the default neutral chip so it reads above the dimmed stars/media icons.
 */
export const problemListTradGearWrapClass = cn(
  'trad-gear-marker-wrap--list-emphasis ml-0 inline-flex items-baseline leading-none',
);

export const problemListTradGearIconClass = 'origin-center';
