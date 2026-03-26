import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isPending?: boolean;
};

export const SearchInput = ({ isPending, className, ...props }: SearchInputProps) => (
  <div className='group relative w-full'>
    <div className='group-focus-within:text-brand pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-500 transition-colors'>
      {isPending ? <Loader2 size={15} className='text-brand animate-spin' /> : <SearchIcon size={15} />}
    </div>
    <input {...props} className={cn('search-input type-small w-full pl-9', className)} />
  </div>
);
