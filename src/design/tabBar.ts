import { cn } from '../lib/utils';
import { designContract } from './contract';

/** Lucide `size` for card tab strips — keep in sync across Area, Sector, Problem, Profile. */
export const TAB_BAR_ICON_SIZE = 14;

/**
 * Wraps a tab row with strip chrome (bottom border). `equal` is flush to the card edges; `inline` keeps horizontal inset.
 * @param variant `equal` — equal columns (grid/flex); `inline` — content-sized tabs with gap
 */
export const tabBarStripContainerClassName = (variant: 'equal' | 'inline') =>
  cn(
    designContract.controls.tabBarRow,
    designContract.controls.tabBarStripBase,
    variant === 'equal' ? designContract.controls.tabBarStripEqual : designContract.controls.tabBarStripInline,
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
  cn(
    isActive
      ? 'text-slate-50 light:text-slate-950'
      : 'text-slate-300 group-hover:text-slate-100 light:text-slate-500 light:group-hover:text-slate-900',
  );
