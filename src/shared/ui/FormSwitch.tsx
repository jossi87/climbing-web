import type { CSSProperties } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../providers/useTheme';

export type FormSwitchVariant = 'brand' | 'danger' | 'neutral' | 'ios';
export type FormSwitchSize = 'default' | 'compact';

type Props = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  variant?: FormSwitchVariant;
  /** `compact` — dense toolbars / inline filters (Problem list); `default` — forms. */
  size?: FormSwitchSize;
  'aria-label'?: string;
  className?: string;
};

/**
 * Switch: knob is **in-flow** (flex), not absolute — avoids “solid pill” bugs where the thumb never paints white.
 * Off track: `--color-switch-track-off`. `ios` = grayscale on-state only (no brand/green fills).
 */
export function FormSwitch({
  checked,
  onChange,
  disabled,
  variant = 'brand',
  size = 'default',
  'aria-label': ariaLabel,
  className,
}: Props) {
  const { resolved } = useTheme();
  const isLight = resolved === 'light';
  const isCompact = size === 'compact';

  const trackUncheckedStyle: CSSProperties | undefined = !checked
    ? { backgroundColor: 'var(--color-switch-track-off)' }
    : undefined;

  const trackClass = cn(
    'flex h-full min-h-0 w-full items-center rounded-full px-0.5 transition-[background-color,justify-content] duration-200 ease-out',
    checked ? 'justify-end' : 'justify-start',
    !checked &&
      'light:shadow-[inset_0_1px_2px_rgba(15,23,42,0.14)] light:ring-1 light:ring-inset light:ring-slate-600/22',
    checked && variant === 'brand' && 'bg-brand',
    checked && variant === 'danger' && 'bg-red-500',
    checked &&
      variant === 'ios' &&
      cn(
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
        isLight ? 'border border-slate-500/40 bg-slate-600' : 'border border-white/12 bg-slate-500',
      ),
    checked &&
      variant === 'neutral' &&
      cn(
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]',
        isLight ? 'border border-slate-600/40 bg-slate-700' : 'bg-slate-600',
      ),
  );

  return (
    <button
      type='button'
      role='switch'
      data-form-switch
      data-size={size}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'inline-flex shrink-0 rounded-full border-0 p-0.5 transition-none',
        isCompact ? 'h-5 w-9' : 'h-8 w-[3.25rem] p-1',
        'focus-visible:ring-brand-border/70 focus-visible:ring-offset-surface-card focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        disabled && 'cursor-not-allowed opacity-40',
        !disabled && 'cursor-pointer',
        className,
      )}
    >
      <span className={cn(trackClass)} style={trackUncheckedStyle}>
        <span
          className={cn(
            'pointer-events-none shrink-0 rounded-full border border-slate-900/18 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.22)]',
            isCompact ? 'h-3.5 w-3.5' : 'h-6 w-6',
          )}
          style={{ backgroundColor: '#ffffff' }}
        />
      </span>
    </button>
  );
}
