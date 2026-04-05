import { Search as SearchIcon, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isPending?: boolean;
  /** When set, a clear control is shown while the field has text (one tap clears). */
  onClear?: () => void;
};

export const SearchInput = ({ isPending, className, onClear, ...props }: SearchInputProps) => {
  const hasValue = String(props.value ?? '').length > 0;
  const showClear = Boolean(onClear && hasValue && !props.disabled);

  return (
    <div className='group relative w-full rounded-lg text-slate-400 transition-colors group-focus-within:text-slate-200 focus-within:ring-1 focus-within:ring-amber-500/50'>
      <div className='group-focus-within:text-brand pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-500 transition-colors'>
        {isPending ? <Loader2 size={15} className='text-brand animate-spin' /> : <SearchIcon size={15} />}
      </div>
      {!String(props.value ?? '').length && props.placeholder ? (
        <span className='header-meta-text pointer-events-none absolute inset-y-0 left-9 z-10 flex items-center tracking-[0.04em] text-current'>
          {props.placeholder}
        </span>
      ) : null}
      <input
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
          className='absolute top-1/2 right-1 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.08] hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:outline-none'
          aria-label='Clear search'
        >
          <X size={16} strokeWidth={2} className='shrink-0' aria-hidden />
        </button>
      ) : null}
    </div>
  );
};
