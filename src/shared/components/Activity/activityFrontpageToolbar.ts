import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

/** Must stay in sync with the toolbar wrapper in `Activity.tsx` (frontpage / non-embedded). */
export const activityFrontpageToolbarClassName = cn(
  designContract.layout.activityToolbarFrontpage,
  'mb-6 max-md:mb-7 md:mb-6',
);
