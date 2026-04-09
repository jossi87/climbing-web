import { cn } from '../lib/utils';
import { designContract } from './contract';
import { twInk } from './twInk';

/**
 * Shared pill chips for **Activity** feed filters and **ProblemList** toolbar (Group / Sort / Filters / Details).
 * Same shape, border, and on/off states so both surfaces read as one system.
 */
export const activityFilterChipBase = cn(
  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 leading-none transition-[background-color,color,transform,border-color] duration-200 active:scale-95 sm:h-8 sm:gap-2 sm:px-4',
  designContract.typography.uiCompact,
);

/** Selected / primary chip (Activity grade filter, ProblemList dropdowns when using “on” affordance). */
export const activityFilterChipOn = cn(
  'border-surface-border bg-surface-card text-slate-100 shadow-sm transition-[background-color,border-color,color] hover:border-white/25 light:border-slate-400/75 light:bg-surface-card light:text-slate-950 light:hover:border-slate-500/80',
);

/** Idle / off chip (Activity type toggles, ProblemList Filters closed, compact list mode). */
export const activityFilterChipOff = cn(
  'border border-surface-border/70 bg-surface-raised/55 text-slate-500 hover:border-surface-border hover:bg-surface-raised hover:text-slate-300 light:border-slate-300/90 light:bg-slate-100/70 light:text-slate-600 light:hover:border-slate-400 light:hover:bg-slate-200',
  twInk.lightHoverSlate800,
);
