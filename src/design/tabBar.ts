import { cn } from '../lib/utils';
import { designContract } from './contract';

/** Lucide `size` for card tab strips — keep in sync across Area, Sector, Problem, Profile. */
export const TAB_BAR_ICON_SIZE = 14;

/**
 * Wraps a tab row with global strip chrome (border + inset). Use for both grid tabs and inline pairs.
 * @param variant `equal` — many equal columns (grid); `inline` — a few content-sized tabs with gap
 */
export const tabBarStripContainerClassName = (variant: 'equal' | 'inline') =>
  cn(
    designContract.controls.tabBarRow,
    designContract.controls.tabBarStrip,
    variant === 'inline' && designContract.controls.tabBarStripGapInline,
  );

/** Primary tab strip (equal-width tabs): Profile, Area main tabs */
export const tabBarButtonClassName = (isActive: boolean) =>
  cn(
    designContract.controls.tabBarButton,
    isActive ? designContract.controls.tabBarButtonActive : designContract.controls.tabBarButtonInactive,
  );

/** Secondary tab strip (e.g. Area sector/list toggle): same underline rules, tabs size to content */
export const tabBarButtonClassNameInline = (isActive: boolean) =>
  cn(tabBarButtonClassName(isActive), 'flex-none px-2 sm:px-3');

export const tabBarIconClassName = (isActive: boolean) =>
  cn('opacity-90', isActive ? 'text-slate-100 opacity-100' : 'text-slate-400');
