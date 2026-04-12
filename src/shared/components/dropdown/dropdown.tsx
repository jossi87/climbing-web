import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export type DropdownValue = string | number | boolean;

export type DropdownOption<V extends DropdownValue = string> = {
  value: V;
  label: string;
};

export type DropdownGroup<T extends DropdownOption<DropdownValue> = DropdownOption<DropdownValue>> = {
  label: string;
  options: T[];
};

export type DropdownProps<V extends DropdownValue = string, T extends DropdownOption<V> = DropdownOption<V>> = {
  options?: T[];
  groups?: DropdownGroup<T>[];
  isSearchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  renderOption?: (item: T) => ReactNode;
  onClick: (item: T) => void;
};

export function Dropdown<V extends DropdownValue = string, T extends DropdownOption<V> = DropdownOption<V>>({
  options,
  groups,
  onClick,
  isSearchable,
  renderOption,
  placeholder = 'Select an option',
  searchPlaceholder = 'Type to search ...',
  emptyMessage = 'No results',
  className,
}: DropdownProps<V, T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  const baseOptions = useMemo(() => {
    if (groups && groups.length > 0) {
      return groups.flatMap((group) => group.options);
    }

    return options ?? [];
  }, [groups, options]);

  const sortedData = useMemo(() => {
    return [...baseOptions].sort((a, b) => a.label.localeCompare(b.label, 'nb', { sensitivity: 'base' }));
  }, [baseOptions]);

  const filteredData = useMemo(() => {
    if (!isSearchable || query.trim().length === 0) return sortedData;
    const normalizedQuery = query.toLocaleLowerCase('nb').trim();
    return sortedData.filter((item) => item.label.toLocaleLowerCase('nb').includes(normalizedQuery));
  }, [isSearchable, query, sortedData]);

  const groupedFilteredData = useMemo(() => {
    if (!groups || groups.length === 0) return null;

    const filteredSet = new Set(filteredData);
    return groups
      .map((group) => {
        const groupItems = group.options
          .filter((item) => filteredSet.has(item))
          .sort((a, b) => a.label.localeCompare(b.label, 'nb', { sensitivity: 'base' }));
        return { label: group.label, options: groupItems };
      })
      .filter((group) => group.options.length > 0);
  }, [filteredData, groups]);

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
              groupedFilteredData.map((group) => (
                <li key={`group-${group.label}`}>
                  <div className='bg-surface-nav border-surface-border/60 sticky top-0 border-b px-3 py-1.5 text-xs font-semibold text-slate-300 uppercase'>
                    {group.label}
                  </div>
                  <ul className='m-0 list-none p-0'>
                    {group.options.map((item, index) => {
                      const label = item.label;
                      return (
                        <li key={`${String(item.value)}-${index}`}>
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
                const label = item.label;
                return (
                  <li key={`${String(item.value)}-${index}`}>
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
