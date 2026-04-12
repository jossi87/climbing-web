import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export type DropdownPrimitive = string | number;

export type DropdownProps<T> = {
  data: T[];
  onClick: (item: T) => void;
  isSearchable: boolean;
  getLabel: (item: T) => string;
  getGroupLabel?: (item: T) => string;
  getKey?: (item: T, index: number) => string | number;
  renderOption?: (item: T) => ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
};

export function Dropdown<T>({
  data,
  onClick,
  isSearchable,
  getLabel,
  getGroupLabel,
  getKey,
  renderOption,
  placeholder = 'Select an option',
  searchPlaceholder = 'Type to search ...',
  emptyMessage = 'No results',
  className,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => getLabel(a).localeCompare(getLabel(b), 'nb', { sensitivity: 'base' }));
  }, [data, getLabel]);

  const filteredData = useMemo(() => {
    if (!isSearchable || query.trim().length === 0) return sortedData;
    const normalizedQuery = query.toLocaleLowerCase('nb').trim();
    return sortedData.filter((item) => getLabel(item).toLocaleLowerCase('nb').includes(normalizedQuery));
  }, [getLabel, isSearchable, query, sortedData]);

  const groupedFilteredData = useMemo(() => {
    if (!getGroupLabel) return null;

    return filteredData.reduce((acc, item, index) => {
      const groupLabel = getGroupLabel(item).trim() || 'Unknown';
      const existing = acc.get(groupLabel) ?? [];
      existing.push({ item, index });
      acc.set(groupLabel, existing);
      return acc;
    }, new Map<string, Array<{ item: T; index: number }>>());
  }, [filteredData, getGroupLabel]);

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        className={cn(
          'border-surface-border bg-surface-nav w-full rounded-lg border px-3 py-2 text-left text-sm text-slate-200 transition-colors',
          'hover:border-brand-border/60 focus-visible:ring-brand-border/60 cursor-pointer focus-visible:ring-2 focus-visible:outline-none',
          isOpen ? 'border-brand-border/70' : null,
        )}
      >
        <div className='flex items-center justify-between gap-2'>
          <span className={cn('truncate', selectedLabel ? 'text-slate-100' : 'text-slate-400')}>
            {selectedLabel || placeholder}
          </span>
          <span className='text-slate-400' aria-hidden>
            {isOpen ? '\u25B2' : '\u25BC'}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div className='border-surface-border bg-surface-card absolute z-30 mt-2 w-full overflow-hidden rounded-lg border shadow-lg'>
          {isSearchable ? (
            <div className='border-surface-border/80 border-b p-2'>
              <input
                type='text'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className='border-surface-border bg-surface-nav focus-visible:ring-brand-border/60 w-full rounded-md border px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:outline-none'
              />
            </div>
          ) : null}

          <ul role='listbox' className='m-0 max-h-64 list-none overflow-y-auto p-0'>
            {filteredData.length === 0 ? (
              <li className='px-3 py-2 text-sm text-slate-400'>{emptyMessage}</li>
            ) : groupedFilteredData ? (
              [...groupedFilteredData.entries()].map(([groupLabel, items]) => (
                <li key={`group-${groupLabel}`}>
                  <div className='bg-surface-nav border-surface-border/60 sticky top-0 border-b px-3 py-1.5 text-xs font-semibold text-slate-300 uppercase'>
                    {groupLabel}
                  </div>
                  <ul className='m-0 list-none p-0'>
                    {items.map(({ item, index }) => {
                      const label = getLabel(item);
                      return (
                        <li key={getKey ? getKey(item, index) : `${label}-${index}`}>
                          <button
                            type='button'
                            role='option'
                            onClick={() => {
                              setSelectedLabel(label);
                              onClick(item);
                              setIsOpen(false);
                            }}
                            className='hover:bg-surface-hover focus-visible:ring-brand-border/60 w-full cursor-pointer border-0 bg-transparent px-3 py-2 text-left text-sm text-slate-200 transition-colors focus-visible:ring-1 focus-visible:outline-none'
                          >
                            {renderOption ? renderOption(item) : label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))
            ) : (
              filteredData.map((item, index) => {
                const label = getLabel(item);
                return (
                  <li key={getKey ? getKey(item, index) : `${label}-${index}`}>
                    <button
                      type='button'
                      role='option'
                      onClick={() => {
                        setSelectedLabel(label);
                        onClick(item);
                        setIsOpen(false);
                      }}
                      className='hover:bg-surface-hover focus-visible:ring-brand-border/60 w-full cursor-pointer border-0 bg-transparent px-3 py-2 text-left text-sm text-slate-200 transition-colors focus-visible:ring-1 focus-visible:outline-none'
                    >
                      {renderOption ? renderOption(item) : label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default Dropdown;
