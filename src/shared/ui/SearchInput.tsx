import { forwardRef } from 'react';
import { Search as SearchIcon, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { twInk } from '../../design/twInk';

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isPending?: boolean;
  /** When set, a clear control is shown while the field has text (one tap clears). */
  onClear?: () => void;
  /**
   * `shell`: dark app header in any global theme. Uses explicit RGB text colors so
   * `html[data-theme="light"]` body slate remaps don’t paint dark ink on the dark bar.
   */
  variant?: 'default' | 'shell';
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { isPending, className, onClear, variant = 'default', ...props },
  ref,
) {
  const hasValue = String(props.value ?? '').length > 0;
  const showClear = Boolean(onClear && hasValue && !props.disabled);
  const shell = variant === 'shell';

  return (
    <div
      className={cn(
        'search-input-wrap group focus-within:ring-brand-border/70 relative w-full rounded-lg transition-colors focus-within:ring-1',
        shell
          ? cn('shell-search-wrap', twInk.chromeNearWhite, twInk.groupFocusWithinChromeWhite)
          : 'text-slate-400 group-focus-within:text-slate-200',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 transition-colors',
          shell
            ? cn(twInk.chromeNearWhite92, twInk.groupFocusWithinChromeWhite)
            : 'text-slate-400 group-focus-within:text-slate-300',
        )}
      >
        {isPending ? (
          <Loader2 size={15} className={cn('animate-spin', shell ? twInk.chromeNearWhite : 'text-slate-400')} />
        ) : (
          <SearchIcon size={15} />
        )}
      </div>
      {!String(props.value ?? '').length && props.placeholder ? (
        <span className='header-meta-text pointer-events-none absolute inset-y-0 left-9 z-10 flex items-center tracking-[0.04em] text-current'>
          {props.placeholder}
        </span>
      ) : null}
      <input
        ref={ref}
        {...props}
        placeholder=''
        className={cn('search-input w-full pl-9', showClear ? 'pr-10' : null, className)}
      />
      {showClear ? (
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            onClear?.();
          }}
          className={cn(
            'absolute top-1/2 right-1 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none',
            shell
              ? cn('hover:bg-white/12', twInk.chromeNearWhite88, twInk.hoverChromeWhite, twInk.focusVisibleRingWhite38)
              : 'hover:bg-surface-raised-hover text-slate-400 hover:text-slate-200 focus-visible:ring-slate-300/55',
          )}
          aria-label='Clear search'
        >
          <X size={16} strokeWidth={2} className='shrink-0' aria-hidden />
        </button>
      ) : null}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
