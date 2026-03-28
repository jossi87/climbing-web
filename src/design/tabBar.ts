import { cn } from '../lib/utils';
import { designContract } from './contract';

/** Primary tab strip (equal-width tabs): Profile, Area main tabs */
export const tabBarButtonClassName = (isActive: boolean) =>
  cn(
    designContract.controls.tabBarButton,
    isActive ? designContract.controls.tabBarButtonActive : designContract.controls.tabBarButtonInactive,
  );

/** Secondary tab strip (e.g. Area sector/list toggle): same underline rules, tabs size to content */
export const tabBarButtonClassNameInline = (isActive: boolean) =>
  cn(tabBarButtonClassName(isActive), 'flex-none px-2 sm:px-3');

export const tabBarIconClassName = (isActive: boolean) => cn('opacity-90', isActive && 'text-slate-100 opacity-100');
