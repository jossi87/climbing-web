import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isPending?: boolean;
};

export const SearchInput = ({ isPending, className, ...props }: SearchInputProps) => (
  <div className='group relative w-full rounded-lg text-slate-400 transition-colors group-focus-within:text-slate-200 focus-within:ring-1 focus-within:ring-amber-500/50'>
    <div className='group-focus-within:text-brand pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-500 transition-colors'>
      {isPending ? <Loader2 size={15} className='text-brand animate-spin' /> : <SearchIcon size={15} />}
    </div>
    {!String(props.value ?? '').length && props.placeholder ? (
      <span className='header-meta-text pointer-events-none absolute inset-y-0 left-9 z-10 flex items-center tracking-[0.04em] text-current'>
        {props.placeholder}
      </span>
    ) : null}
    <input {...props} placeholder='' className={cn('search-input w-full pl-9', className)} />
  </div>
);
