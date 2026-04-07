import { designContract } from '../../../design/contract';
import { cn } from '../../../lib/utils';

/** Shared dense row for Profile ascents, todo, Area/Sector problem lines, ticks, etc. — see {@link designContract.typography.listBody}. */
export const profileRowRootClass = designContract.typography.listBody;

export const tickCragLink = 'font-normal text-slate-100 antialiased transition-colors hover:text-brand';
/** Light: sky ink for area (reads as “where”, distinct from sector green + body black). */
export const tickCragLinkArea = cn(tickCragLink, 'light:text-[color:var(--color-status-todo)]');
/** Light: emerald ink for sector — pairs with {@link tickCragLinkArea}. */
export const tickCragLinkSector = cn(tickCragLink, 'light:text-[color:var(--color-status-ticked)]');
export const tickCrag = 'font-normal text-slate-100 antialiased';
export const tickProblemLink = 'font-medium text-slate-50 antialiased transition-colors hover:text-brand';

/** Problem title in dense lists — light: match tick/todo ink so status reads across “#” + name (dark UI unchanged). */
export function tickProblemLinkWithStatus(opts: { ticked?: boolean; todo?: boolean; broken?: boolean }) {
  return cn(
    tickProblemLink,
    opts.broken && 'line-through opacity-60',
    opts.ticked && 'light:text-[color:var(--color-status-ticked)]',
    opts.todo && !opts.ticked && 'light:text-[color:var(--color-status-todo)]',
  );
}

/** “Your” tick/comment name — same ink as route tick markers (`text-status-ticked`), not bright `emerald-400`. */
export const tickOwnUserLink =
  'font-medium text-status-ticked antialiased transition-colors hover:text-status-ticked/85';
export const tickWhenGrade = 'font-normal text-slate-200 antialiased';
export const tickFlags = 'font-normal text-slate-400 antialiased';
/** Italic notes — `slate-400` on charcoal for readable secondary (avoid `slate-500` on `surface-card`). */
export const tickComment = 'font-normal italic text-slate-400 antialiased';
/** FA marker in dense rows — same green as “ticked” status. */
export const tickFa = 'font-medium text-status-ticked antialiased';

export const tickCommentSmall = `${tickComment} text-[12px] leading-snug sm:text-[13px]`;
