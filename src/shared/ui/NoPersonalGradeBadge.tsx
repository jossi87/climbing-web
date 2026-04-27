import { cn } from '../../lib/utils';
import { twInk } from '../../design/twInk';

/**
 * Sentinel value sent to (and echoed back from) the API as a tick's `grade`
 * when a user opts out of grading. Centralised here so frontend renderers can
 * detect it without duplicating string literals across modules.
 */
export const NO_PERSONAL_GRADE_LABEL = 'No personal grade';

type Variant = 'inline' | 'feed' | 'dense';

type Props = {
  className?: string;
  /**
   * `inline` (default): tick rows on `/problem` — sits between the user link and the date stamp.
   *
   * `feed`: activity row — replaces the prominent grade slot beside the route name; allows wrapping
   * on narrow viewports (the regular grade slot uses `whitespace-nowrap`, which made the long phrase
   * overflow on phones).
   *
   * `dense`: profile/ascents rows — slightly smaller to match neighbouring `tickFlags` chips.
   */
  variant?: Variant;
};

/**
 * Shared visual treatment for `noPersonalGrade=true` ticks. Renders the explicit phrase
 * (kept readable, not abbreviated) in italic + muted ink so it reads as an annotation rather
 * than a grade. Replaces the previous per-call-site `X`-icon chip, which suggested
 * rejection/error rather than "user chose not to grade".
 */
export const NoPersonalGradeBadge = ({ className, variant = 'inline' }: Props) => (
  <span
    className={cn(
      'align-baseline text-slate-400 italic antialiased',
      twInk.lightTextSlate700,
      variant === 'dense' && 'text-[12px] sm:text-[13px]',
      className,
    )}
    title={NO_PERSONAL_GRADE_LABEL}
    aria-label={NO_PERSONAL_GRADE_LABEL}
  >
    no personal grade
  </span>
);
