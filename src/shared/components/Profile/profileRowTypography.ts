import { designContract } from '../../../design/contract';
import { twInk } from '../../../design/twInk';
import { cn } from '../../../lib/utils';

/** Shared dense row for Profile ascents, todo, Area/Sector problem lines, ticks, etc. — see {@link designContract.typography.listBody}. */
export const profileRowRootClass = designContract.typography.listBody;

/**
 * Sector/Area problem rows — same type rhythm as {@link profileRowRootClass} but **without** `text-pretty` or
 * `[overflow-wrap:anywhere]` so wrapping follows normal browser rules (not balanced/pretty breaks).
 */
export const problemListRowRootClass =
  'm-0 text-[12px] font-normal leading-snug tracking-normal md:text-[13px] md:leading-snug';

export const tickCragLink = 'font-normal text-slate-100 antialiased transition-colors hover:text-brand';
/** Light: sky ink for area (reads as “where”, distinct from sector green + body black). */
export const tickCragLinkArea = cn(tickCragLink, 'light:text-[color:var(--color-status-todo)]');
/** Light: emerald ink for sector — pairs with {@link tickCragLinkArea}. */
export const tickCragLinkSector = cn(tickCragLink, 'light:text-[color:var(--color-status-ticked)]');
export const tickCrag = 'font-normal text-slate-100 antialiased';
/** Default route name — near-white on dark; near-black on light so it stays primary vs meta. */
export const tickProblemLink = cn(
  'align-baseline font-medium text-slate-50 antialiased transition-colors hover:text-brand',
  twInk.lightTextSlate900,
);

/** Problem title in dense lists — green/blue on the **name** only; `#` stays neutral ({@link tickWhenGrade}). */
export function tickProblemLinkWithStatus(opts: { ticked?: boolean; todo?: boolean; broken?: boolean }) {
  return cn(
    tickProblemLink,
    opts.broken && 'line-through opacity-60',
    opts.ticked && designContract.ascentStatus.ticked,
    opts.todo && !opts.ticked && designContract.ascentStatus.todo,
  );
}

/** “Your” tick/comment name — same ink as route tick markers (`text-status-ticked`), not bright `emerald-400`. */
export const tickOwnUserLink =
  'font-medium text-status-ticked antialiased transition-colors hover:text-status-ticked/85';
/** Grade / inline meta — soft on dark; clearly secondary on light vs {@link tickProblemLink}. */
export const tickWhenGrade = cn('font-normal text-slate-200 antialiased', twInk.lightTextSlate800);
export const tickFlags = 'font-normal text-slate-400 antialiased';
/**
 * Italic tail (comments) — muted on dark; on light, stepped down from {@link tickWhenGrade} so descriptions stay
 * legible on white cards without matching body meta.
 */
export const tickComment = cn('font-normal italic text-slate-400 antialiased', twInk.lightTextSlate700);

/**
 * Ticks count, FA/rock line, topo/media icons, pitches — quieter than {@link tickWhenGrade} so route #, grade, and
 * name stay the visual focus (Sector/Area rows + profile ascent FA badge).
 */
export const tickListRowQuietMeta = cn('font-normal text-slate-400 antialiased', twInk.lightTextSlate700);
/** FA marker (green) — use where FA should read as a highlight; ascent list uses {@link tickListRowQuietMeta} instead. */
export const tickFa = 'font-medium text-status-ticked antialiased';

export const tickCommentSmall = `${tickComment} text-[12px] leading-snug sm:text-[13px]`;
