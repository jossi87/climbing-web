import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Loader2, Clock, ChevronDown, Trash2 } from 'lucide-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useProblemSearch } from '../../../api';
import { cn } from '../../../lib/utils';
import { secondsToTimeStr, timeStrToSeconds, formatProblemOption } from './problemUtils';

type MediaProblem = components['schemas']['MediaProblem'];
type ProblemSearchResult = components['schemas']['ProblemSearchResult'];

export type ProblemState = MediaProblem;

/** A controlled M:SS time input that doesn't fight the user's typing. */
const ProblemTimeInput = ({
  milliseconds,
  maxSeconds,
  onChange,
}: {
  milliseconds: number;
  maxSeconds: number;
  onChange: (val: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const seconds = milliseconds / 1000;
  const exceedsMax = maxSeconds > 0 && seconds > maxSeconds;

  // When not focused, derive display from milliseconds
  const displayValue = focused ? draft : secondsToTimeStr(seconds);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits and colon
    const cleaned = raw.replace(/[^0-9:]/g, '');
    // Prevent more than one colon
    if ((cleaned.match(/:/g) || []).length > 1) return;
    // Prevent more than 5 characters (MM:SS)
    if (cleaned.length > 5) return;
    setDraft(cleaned);
  };

  const handleBlur = () => {
    setFocused(false);
    // Validate: clamp to max duration
    const parsed = timeStrToSeconds(draft);
    if (maxSeconds > 0 && parsed > maxSeconds) {
      onChange(secondsToTimeStr(maxSeconds));
    } else {
      onChange(draft);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setDraft(secondsToTimeStr(seconds));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className='relative'>
      <input
        type='text'
        inputMode='numeric'
        placeholder='M:SS'
        className={cn(
          'bg-surface-nav border-surface-border type-body focus:border-brand-border/60 w-28 rounded-lg border px-3 py-2 font-mono text-sm transition-colors placeholder:opacity-50 focus:outline-none',
          exceedsMax && 'border-amber-500/60 text-amber-300',
        )}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {exceedsMax && (
        <span className='absolute -bottom-4 left-0 text-[11px] whitespace-nowrap text-amber-400'>
          Max {secondsToTimeStr(maxSeconds)}
        </span>
      )}
    </div>
  );
};

/** A single problem row with problem search + optional time input + optional pitch selector + trivia toggle. */
const ProblemRow = ({
  problem,
  maxSeconds,
  showTimeInput,
  searchInput,
  onSearchInputChange,
  onSelectProblem,
  onTimeChange,
  onPitchChange,
  onTriviaChange,
  onRemove,
  autoFocus,
}: {
  problem: ProblemState;
  maxSeconds: number;
  showTimeInput: boolean;
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onSelectProblem: (p: ProblemSearchResult) => void;
  onTimeChange: (val: string) => void;
  onPitchChange: (pitch: number | undefined) => void;
  onTriviaChange: (trivia: boolean) => void;
  onRemove: () => void;
  autoFocus?: boolean;
}) => {
  const isReadOnly = !!problem.problemId && !!problem.problemName;
  const { data: searchResults = [], isFetching } = useProblemSearch(isReadOnly ? '' : searchInput);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Close dropdown on outside click (including portal)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideContainer = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideContainer && !insideDropdown) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Recalculate position when dropdown opens and on scroll/resize
  useEffect(() => {
    if (!showDropdown || !containerRef.current) return;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        maxHeight: '12rem',
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showDropdown]);

  // Auto-focus when this row is newly added
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const filtered = searchResults.filter((p) => p.id && p.problemName);

  const handleRemove = () => {
    if (window.confirm('Remove this problem from the list?')) {
      onRemove();
    }
  };

  return (
    <div className='bg-surface-raised border-surface-border flex items-center gap-2 rounded-xl border p-2.5'>
      {/* Problem search */}
      <div ref={containerRef} className='relative min-w-0 flex-1'>
        <div className='relative'>
          <Search
            className='pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-500'
            size={14}
            aria-hidden
          />
          <input
            ref={inputRef}
            type='text'
            placeholder='Search problem...'
            readOnly={!!problem.problemId && !!problem.problemName}
            className={cn(
              'bg-surface-nav type-body w-full min-w-0 rounded-lg border py-1.5 pr-2 pl-7 text-sm transition-colors placeholder:opacity-50 focus:outline-none',
              !!problem.problemId && !!problem.problemName
                ? 'border-surface-border focus:border-brand-border/60 cursor-default'
                : 'border-rose-500/50 focus:border-rose-400/70',
            )}
            value={searchInput}
            onChange={(e) => {
              onSearchInputChange(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
        </div>
        {showDropdown &&
          !isReadOnly &&
          searchInput.length > 0 &&
          createPortal(
            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className='border-surface-border bg-surface-card overflow-y-auto rounded-lg border shadow-2xl'
            >
              {isFetching && (
                <div className='flex items-center gap-2 px-3 py-2.5 text-[13px] text-slate-500'>
                  <Loader2 size={13} className='animate-spin' />
                  Searching...
                </div>
              )}
              {!isFetching && filtered.length === 0 && (
                <div className='px-3 py-2.5 text-[13px] text-slate-500'>No problems found.</div>
              )}
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type='button'
                  className='hover:bg-surface-raised-hover light:text-slate-600 flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-slate-300 transition-colors'
                  onClick={() => {
                    onSelectProblem(p);
                    setShowDropdown(false);
                    inputRef.current?.blur();
                  }}
                >
                  <span className='min-w-0 flex-1 truncate'>{formatProblemOption(p)}</span>
                </button>
              ))}
            </div>,
            document.body,
          )}
      </div>

      {/* Pitch selector (only for multi-pitch problems) */}
      {(problem.problemNumPitches ?? 0) > 1 && (
        <div className='relative shrink-0'>
          <select
            value={problem.problemPitch ?? 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              onPitchChange(val === 0 ? undefined : val);
            }}
            className={cn(
              'bg-surface-nav border-surface-border type-body appearance-none rounded-lg border py-1.5 pr-6 pl-2.5 text-sm transition-colors focus:outline-none',
              'border-surface-border focus:border-brand-border/60',
            )}
          >
            <option value={0}>No pitch</option>
            {Array.from({ length: problem.problemNumPitches ?? 0 }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                Pitch {p}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className='pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-500'
          />
        </div>
      )}

      {/* Time input (video only) */}
      {showTimeInput && (
        <div className='flex shrink-0 items-center gap-1.5'>
          <Clock size={14} className='shrink-0 text-slate-500' />
          <ProblemTimeInput milliseconds={problem.milliseconds ?? 0} maxSeconds={maxSeconds} onChange={onTimeChange} />
        </div>
      )}

      {/* Trivia toggle */}
      <label className='flex shrink-0 items-center gap-1.5 text-xs text-slate-400'>
        <input
          type='checkbox'
          checked={problem.trivia ?? false}
          onChange={(e) => onTriviaChange(e.target.checked)}
          className='text-brand focus:ring-brand/50 h-4 w-4 rounded border-white/20 bg-slate-700 focus:ring-2'
        />
        Trivia
      </label>

      <button
        type='button'
        onClick={handleRemove}
        className='shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400'
        aria-label='Remove problem'
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default ProblemRow;
