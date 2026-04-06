import { designContract } from '../../../design/contract';

/** Shared dense row for Profile ascents, todo, Area/Sector problem lines, ticks, etc. — see {@link designContract.typography.listBody}. */
export const profileRowRootClass = designContract.typography.listBody;

export const tickCragLink = 'font-normal text-slate-100 antialiased transition-colors hover:text-brand';
export const tickCrag = 'font-normal text-slate-100 antialiased';
export const tickProblemLink = 'font-medium text-slate-50 antialiased transition-colors hover:text-brand';
export const tickWhenGrade = 'font-normal text-slate-200 antialiased';
export const tickFlags = 'font-normal text-slate-400 antialiased';
/** Italic notes — `slate-400` on charcoal for readable secondary (avoid `slate-500` on `surface-card`). */
export const tickComment = 'font-normal italic text-slate-400 antialiased';
/** FA marker in dense rows — same green as “ticked” status. */
export const tickFa = 'font-medium text-status-ticked antialiased';

export const tickCommentSmall = `${tickComment} text-[12px] leading-snug sm:text-[13px]`;
