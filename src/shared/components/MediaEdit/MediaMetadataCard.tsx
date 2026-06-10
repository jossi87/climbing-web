import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, User as UserIcon, Users, ChevronDown, Trash2 } from 'lucide-react';

import type { components } from '../../../@types/buldreinfo/swagger';
import { UserSelector, UsersSelector } from '../../ui/UserSelector';
import { cn } from '../../../lib/utils';

import ProblemRow from './ProblemRow';
import { formatProblemOption } from './problemUtils';
import type { ProblemState } from './ProblemRow';

type ProblemSearchResult = components['schemas']['ProblemSearchResult'];
type User = components['schemas']['User'];

export type MediaConnectionType = 'area' | 'sector' | 'problem' | 'guestbook' | 'trail' | 'user';

export type MediaMetadata = {
  description: string;
  photographer: User | undefined;
  tagged: User[];
  problems: ProblemState[];
  /** Read-only areas (shown with trivia checkbox) */
  areas?: { areaId: number; areaName: string; trivia: boolean }[];
  /** Read-only sectors (shown with trivia checkbox) */
  sectors?: { sectorId: number; sectorName: string; areaName?: string; trivia: boolean }[];
  /** Read-only guestbook info */
  guestbook?: { guestbookId: number; guestbookName?: string };
  /** Read-only trail info */
  trails?: { trailId: number; trailName?: string; trailTitle?: string }[];
};

export type MediaMetadataCallbacks = {
  onDescriptionChange: (val: string) => void;
  onPhotographerChange: (u: User | undefined) => void;
  onTaggedChange: (users: User[]) => void;
  onProblemsChange: (problems: ProblemState[]) => void;
  onAreaTriviaChange: (areaId: number, trivia: boolean) => void;
  onSectorTriviaChange: (sectorId: number, trivia: boolean) => void;
  onTrailsChange?: (trails: { trailId: number; trailTitle?: string }[]) => void;
};

type SectorOption = { id: number; name: string; label: string };
type TrailOption = { id: number; title: string; label: string; sectorName?: string };

type Props = {
  metadata: MediaMetadata;
  callbacks: MediaMetadataCallbacks;
  connectionType: MediaConnectionType;
  /** Max duration in seconds for time input (only shown for videos) */
  maxSeconds?: number;
  /** Show time input per problem (only for videos) */
  showTimeInput?: boolean;
  /** Validation errors */
  hasEmptyProblem?: boolean;
  hasDuplicateTime?: boolean;
  hasNoProblems?: boolean;
  hasNoTrails?: boolean;
  /** Which sections to render: 'basic' (description/photographer/tagged) or 'connected' (problems/areas/sectors/guestbook). Defaults to 'all'. */
  variant?: 'basic' | 'connected' | 'all';
  /** Sector options for the dropdown (sectors in context) */
  sectorOptions?: SectorOption[];
  /** Called when user selects a different sector from the dropdown */
  onSectorChange?: (sectorId: number, sectorName: string) => void;
  /** Trail options for the dropdown (trails in context) */
  trailOptions?: TrailOption[];
};

/** A portal-based dropdown menu that renders at the document root to avoid z-index/overflow clipping. */
const DropdownMenu = ({
  open,
  onClose,
  triggerRef,
  children,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) => {
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPosition(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 224) });
  }, [open, triggerRef]);

  if (!open || !position) return null;

  return createPortal(
    <>
      <div className='fixed inset-0 z-[100]' onClick={onClose} />
      <div
        className='fixed z-[101] overflow-hidden rounded-lg border border-white/12 bg-slate-800 shadow-lg'
        style={{ top: position.top, left: position.left, width: position.width }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
};

/** A single trail row with a simple dropdown (like sectors). */
const TrailRow = ({
  trail,
  trailOptions,
  onSelectTrail,
  onRemove,
  /** Trail IDs already selected in other rows (to prevent duplicates) */
  selectedTrailIds,
}: {
  trail: { trailId: number; trailName?: string; trailTitle?: string };
  trailOptions: TrailOption[];
  onSelectTrail: (trailId: number, trailTitle: string, label?: string) => void;
  onRemove: () => void;
  selectedTrailIds?: Set<number>;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleRemove = () => {
    if (window.confirm('Remove this trail from the list?')) {
      onRemove();
    }
  };

  // Find the selected trail option to get sector name
  const selectedOption = trailOptions.find((opt) => opt.id === trail.trailId);

  // Filter out trails already selected in other rows (unique index constraint)
  const filteredOptions = trailOptions.filter((opt) => opt.id === trail.trailId || !selectedTrailIds?.has(opt.id));

  return (
    <div className='bg-surface-raised border-surface-border flex items-center gap-2 rounded-xl border p-2.5'>
      {/* Trail dropdown */}
      <div className='relative min-w-0 flex-1'>
        <button
          ref={buttonRef}
          type='button'
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            'inline-flex w-full items-center justify-between gap-1 rounded-lg border px-3 py-1.5 text-left text-sm text-slate-300 hover:text-slate-100',
            trail.trailId && trail.trailId > 0 ? 'border-white/12' : 'border-rose-500/50',
          )}
        >
          <span className='truncate'>
            {selectedOption ? selectedOption.label : trail.trailName || trail.trailTitle || 'Select trail...'}
          </span>
          <ChevronDown size={12} className='shrink-0 text-slate-500' />
        </button>

        <DropdownMenu open={showDropdown} onClose={() => setShowDropdown(false)} triggerRef={buttonRef}>
          {filteredOptions.map((opt) => (
            <button
              key={opt.id}
              type='button'
              className={cn(
                'flex w-full items-center px-3 py-2 text-left text-xs transition-colors',
                opt.id === trail.trailId ? 'bg-brand/20 text-brand' : 'text-slate-300 hover:bg-slate-700',
              )}
              onClick={() => {
                onSelectTrail(opt.id, opt.title, opt.label);
                setShowDropdown(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </DropdownMenu>
      </div>

      <button
        type='button'
        onClick={handleRemove}
        className='shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400'
        aria-label='Remove trail'
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export const MediaMetadataCard = ({
  metadata,
  callbacks,
  connectionType,
  maxSeconds = 0,
  showTimeInput = false,
  hasEmptyProblem,
  hasDuplicateTime,
  hasNoProblems,
  hasNoTrails,
  variant = 'all',
  sectorOptions,
  onSectorChange,
  trailOptions,
}: Props) => {
  const [problemSearchInputs, setProblemSearchInputs] = useState<Record<number, string>>({});

  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const sectorButtonRef = useRef<HTMLButtonElement>(null);

  const selectProblem = (index: number, problem: ProblemSearchResult) => {
    const next = [...metadata.problems];
    next[index] = {
      ...next[index],
      problemId: problem.id ?? 0,
      problemName: problem.problemName ?? '',
      problemGrade: problem.grade ?? '',
      problemNumPitches: problem.numPitches ?? 0,
      problemPitch: undefined,
    };
    callbacks.onProblemsChange(next);
    setProblemSearchInputs((prev) => ({ ...prev, [index]: formatProblemOption(problem) }));
  };

  const updateProblemTime = (index: number, timeStr: string) => {
    const ms = (() => {
      const parts = timeStr.split(':');
      if (parts.length === 2) {
        return (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
      }
      if (parts.length === 3) {
        return (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])) * 1000;
      }
      return parseInt(timeStr) * 1000 || 0;
    })();
    const next = [...metadata.problems];
    next[index] = { ...next[index], milliseconds: ms };
    callbacks.onProblemsChange(next);
  };

  const updateProblemPitch = (index: number, pitch: number | undefined) => {
    const next = [...metadata.problems];
    next[index] = { ...next[index], problemPitch: pitch };
    callbacks.onProblemsChange(next);
  };

  const updateProblemTrivia = (index: number, trivia: boolean) => {
    const next = [...metadata.problems];
    next[index] = { ...next[index], trivia };
    callbacks.onProblemsChange(next);
  };

  const removeProblem = (index: number) => {
    callbacks.onProblemsChange(metadata.problems.filter((_, i) => i !== index));
    setProblemSearchInputs((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const showBasic = variant === 'basic' || variant === 'all';
  const showConnected = variant === 'connected' || variant === 'all';

  return (
    <div className='space-y-3'>
      {showBasic && (
        <>
          {/* Description */}
          <div className='relative'>
            <MessageSquare
              className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500'
              size={15}
              aria-hidden
            />
            <input
              type='text'
              placeholder='Description (optional)'
              className='bg-surface-nav border-surface-border/80 focus:border-brand h-10 w-full rounded-xl border py-0 pr-3 pl-10 text-sm leading-none transition-[color,background-color,border-color,opacity] duration-100 outline-none placeholder:text-slate-500/85 placeholder:transition-opacity focus:ring-0 focus:outline-none focus:placeholder:opacity-0 focus-visible:ring-0'
              value={metadata.description}
              onChange={(e) => callbacks.onDescriptionChange(e.target.value)}
            />
          </div>

          {/* Photographer */}
          <div className='flex min-w-0 items-center gap-2'>
            <UserIcon size={15} className='mt-[3px] shrink-0 self-start text-slate-500' aria-hidden />
            <UserSelector
              compact
              matchInputLeadStyle
              required
              placeholder='Photographer (required)'
              value={metadata.photographer?.name}
              onUserUpdated={(u) =>
                callbacks.onPhotographerChange(
                  u ? { id: typeof u.value === 'number' ? u.value : -1, name: u.label ?? u.name ?? '' } : undefined,
                )
              }
            />
          </div>

          {/* Tagged people */}
          <div className='flex min-w-0 items-center gap-2'>
            <Users size={15} className='mt-[3px] shrink-0 self-start text-slate-500' aria-hidden />
            <UsersSelector
              compact
              matchInputLeadStyle
              placeholder='People in shot'
              users={metadata.tagged}
              onUsersUpdated={(newUsers) => {
                callbacks.onTaggedChange(
                  newUsers.map((u) => ({
                    id: typeof u.value === 'string' ? -1 : u.value,
                    name: u.label,
                  })),
                );
              }}
            />
          </div>
        </>
      )}

      {showConnected && (
        <>
          {/* Connected problems (editable) */}
          {connectionType === 'problem' && (
            <div className='mt-4 space-y-3'>
              <div className='space-y-2'>
                {metadata.problems.map((p, i) => (
                  <ProblemRow
                    key={i}
                    problem={p}
                    maxSeconds={maxSeconds}
                    showTimeInput={showTimeInput}
                    searchInput={
                      problemSearchInputs[i] ??
                      (p.problemId ? formatProblemOption(p as unknown as ProblemSearchResult) : (p.problemName ?? ''))
                    }
                    onSearchInputChange={(val) => setProblemSearchInputs((prev) => ({ ...prev, [i]: val }))}
                    onSelectProblem={(problem) => selectProblem(i, problem)}
                    onTimeChange={(val) => updateProblemTime(i, val)}
                    onPitchChange={(pitch) => updateProblemPitch(i, pitch)}
                    onTriviaChange={(trivia) => updateProblemTrivia(i, trivia)}
                    onRemove={() => removeProblem(i)}
                    autoFocus={i === metadata.problems.length - 1 && !p.problemId}
                  />
                ))}
              </div>
              {hasEmptyProblem && (
                <p className='text-xs text-red-400'>All problems must be selected from the search.</p>
              )}
              {hasDuplicateTime && <p className='text-xs text-amber-400'>Duplicate timestamps are not allowed.</p>}
              {hasNoProblems && <p className='text-xs text-red-400'>At least one problem is required.</p>}
            </div>
          )}

          {/* Connected areas (with trivia checkbox on the right) */}
          {connectionType === 'area' && metadata.areas && metadata.areas.length > 0 && (
            <div className='mt-4 space-y-2'>
              {metadata.areas.map((a) => (
                <div
                  key={a.areaId}
                  className='bg-surface-raised border-surface-border flex items-center justify-between rounded-xl border p-3 text-sm'
                >
                  <span className='text-slate-300'>{a.areaName}</span>
                  <label className='flex shrink-0 items-center gap-1.5 text-xs text-slate-400'>
                    <input
                      type='checkbox'
                      checked={a.trivia}
                      onChange={(e) => callbacks.onAreaTriviaChange(a.areaId, e.target.checked)}
                      className='text-brand focus:ring-brand/50 h-4 w-4 rounded border-white/20 bg-slate-700 focus:ring-2'
                    />
                    Trivia
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Connected sectors (with trivia checkbox on the right) */}
          {connectionType === 'sector' && (
            <div className='mt-4 space-y-2'>
              {/* If we have sectors in metadata, show them with trivia checkboxes */}
              {metadata.sectors && metadata.sectors.length > 0 ? (
                metadata.sectors.map((s) => (
                  <div
                    key={s.sectorId}
                    className='bg-surface-raised border-surface-border flex items-center justify-between rounded-xl border p-3 text-sm'
                  >
                    {/* Sector name: dropdown if sectorOptions provided, otherwise plain text */}
                    {sectorOptions && sectorOptions.length > 0 && onSectorChange ? (
                      <div className='relative'>
                        <button
                          ref={sectorButtonRef}
                          type='button'
                          onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                          className='inline-flex items-center gap-1 text-slate-300 hover:text-slate-100'
                        >
                          {s.sectorName}
                          {s.areaName ? <span className='text-slate-500'> ({s.areaName})</span> : null}
                          <ChevronDown size={12} className='text-slate-500' />
                        </button>

                        <DropdownMenu
                          open={sectorDropdownOpen}
                          onClose={() => setSectorDropdownOpen(false)}
                          triggerRef={sectorButtonRef}
                        >
                          {sectorOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type='button'
                              className={cn(
                                'flex w-full items-center px-3 py-2 text-left text-xs transition-colors',
                                opt.id === s.sectorId ? 'bg-brand/20 text-brand' : 'text-slate-300 hover:bg-slate-700',
                              )}
                              onClick={() => {
                                onSectorChange(opt.id, opt.name);
                                setSectorDropdownOpen(false);
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </DropdownMenu>
                      </div>
                    ) : (
                      <span className='text-slate-300'>
                        {s.sectorName}
                        {s.areaName && <span className='text-slate-500'> ({s.areaName})</span>}
                      </span>
                    )}
                    <label className='flex shrink-0 items-center gap-1.5 text-xs text-slate-400'>
                      <input
                        type='checkbox'
                        checked={s.trivia}
                        onChange={(e) => callbacks.onSectorTriviaChange(s.sectorId, e.target.checked)}
                        className='text-brand focus:ring-brand/50 h-4 w-4 rounded border-white/20 bg-slate-700 focus:ring-2'
                      />
                      Trivia
                    </label>
                  </div>
                ))
              ) : /* No sectors selected yet — show a dropdown to pick one */
              sectorOptions && sectorOptions.length > 0 && onSectorChange ? (
                <div className='bg-surface-raised border-surface-border rounded-xl border p-3 text-sm'>
                  <div className='relative'>
                    <button
                      ref={sectorButtonRef}
                      type='button'
                      onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                      className='inline-flex items-center gap-1 text-slate-400 hover:text-slate-100'
                    >
                      <span>Select sector...</span>
                      <ChevronDown size={12} className='text-slate-500' />
                    </button>

                    <DropdownMenu
                      open={sectorDropdownOpen}
                      onClose={() => setSectorDropdownOpen(false)}
                      triggerRef={sectorButtonRef}
                    >
                      {sectorOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type='button'
                          className='flex w-full items-center px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:bg-slate-700'
                          onClick={() => {
                            onSectorChange(opt.id, opt.name);
                            setSectorDropdownOpen(false);
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </DropdownMenu>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Guestbook (read-only) */}
          {connectionType === 'guestbook' && metadata.guestbook && (
            <div className='mt-4 space-y-2'>
              <div className='bg-surface-raised border-surface-border rounded-xl border p-3 text-sm text-slate-400'>
                {metadata.guestbook.guestbookName ?? `Comment #${metadata.guestbook.guestbookId}`}
              </div>
            </div>
          )}

          {/* Connected trails — editable when trailOptions provided, otherwise read-only (add mode) */}
          {connectionType === 'trail' && (
            <div className='mt-4 space-y-3'>
              <div className='space-y-2'>
                {(metadata.trails ?? []).map((t, i) => {
                  // Build set of trail IDs already selected in other rows (unique index constraint)
                  const selectedTrailIds = new Set(
                    (metadata.trails ?? []).map((other, j) => (j !== i ? other.trailId : 0)).filter((id) => id > 0),
                  );
                  return trailOptions && trailOptions.length > 0 ? (
                    <TrailRow
                      key={i}
                      trail={t}
                      trailOptions={trailOptions}
                      selectedTrailIds={selectedTrailIds}
                      onSelectTrail={(trailId: number, trailTitle: string, label?: string) => {
                        const next = [...(metadata.trails ?? [])];
                        next[i] = { trailId, trailName: label ?? trailTitle };
                        callbacks.onTrailsChange?.(next);
                      }}
                      onRemove={() => {
                        const next = (metadata.trails ?? []).filter((_, idx) => idx !== i);
                        callbacks.onTrailsChange?.(next);
                      }}
                    />
                  ) : (
                    <div
                      key={i}
                      className='bg-surface-raised border-surface-border rounded-xl border p-3 text-sm text-slate-400'
                    >
                      {t.trailName || t.trailTitle || `Trail #${t.trailId}`}
                    </div>
                  );
                })}
              </div>
              {hasNoTrails && <p className='text-xs text-red-400'>At least one trail is required.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};
