import { useState } from 'react';
import { MessageSquare, User as UserIcon, Users, Plus } from 'lucide-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { UserSelector, UsersSelector } from '../../ui/UserSelector';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import ProblemRow from './ProblemRow';
import { formatProblemOption } from './problemUtils';
import type { ProblemState } from './ProblemRow';

type ProblemSearchResult = components['schemas']['ProblemSearchResult'];
type User = components['schemas']['User'];

const fieldLabelClass = cn(designContract.typography.label, 'text-slate-300');

export type MediaConnectionType = 'area' | 'sector' | 'problem' | 'guestbook';

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
};

export type MediaMetadataCallbacks = {
  onDescriptionChange: (val: string) => void;
  onPhotographerChange: (u: User | undefined) => void;
  onTaggedChange: (users: User[]) => void;
  onProblemsChange: (problems: ProblemState[]) => void;
  onAreaTriviaChange: (areaId: number, trivia: boolean) => void;
  onSectorTriviaChange: (sectorId: number, trivia: boolean) => void;
};

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
  /** Which sections to render: 'basic' (description/photographer/tagged) or 'connected' (problems/areas/sectors/guestbook). Defaults to 'all'. */
  variant?: 'basic' | 'connected' | 'all';
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
  variant = 'all',
}: Props) => {
  const [focusedProblemIndex, setFocusedProblemIndex] = useState<number | null>(null);
  const [problemSearchInputs, setProblemSearchInputs] = useState<Record<number, string>>({});

  const addProblem = () => {
    const newIndex = metadata.problems.length;
    setTimeout(() => setFocusedProblemIndex(newIndex), 0);
    callbacks.onProblemsChange([
      ...metadata.problems,
      { problemId: 0, problemName: '', problemGrade: '', milliseconds: 0 },
    ]);
  };

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
              placeholder='Photographer (required)'
              value={metadata.photographer?.name}
              onUserUpdated={(u) =>
                callbacks.onPhotographerChange(
                  u ? { id: Number(u.value ?? 0), name: u.label ?? u.name ?? '' } : undefined,
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
              <div className='flex items-center justify-between'>
                <span className={cn(fieldLabelClass, 'ml-1')}>Problems</span>
                <button
                  type='button'
                  onClick={addProblem}
                  className='bg-surface-raised hover:bg-surface-raised-hover inline-flex items-center gap-1 rounded-lg border border-white/12 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-white/22'
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              {metadata.problems.length === 0 && <p className='text-xs text-slate-500'>No problems connected.</p>}
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
                    autoFocus={focusedProblemIndex === i}
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
              <span className={cn(fieldLabelClass, 'ml-1')}>Areas</span>
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
          {connectionType === 'sector' && metadata.sectors && metadata.sectors.length > 0 && (
            <div className='mt-4 space-y-2'>
              <span className={cn(fieldLabelClass, 'ml-1')}>Sectors</span>
              {metadata.sectors.map((s) => (
                <div
                  key={s.sectorId}
                  className='bg-surface-raised border-surface-border flex items-center justify-between rounded-xl border p-3 text-sm'
                >
                  <span className='text-slate-300'>
                    {s.sectorName}
                    {s.areaName && <span className='text-slate-500'> ({s.areaName})</span>}
                  </span>
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
              ))}
            </div>
          )}

          {/* Guestbook (read-only) */}
          {connectionType === 'guestbook' && metadata.guestbook && (
            <div className='mt-4 space-y-2'>
              <span className={cn(fieldLabelClass, 'ml-1')}>Guestbook comment</span>
              <div className='bg-surface-raised border-surface-border rounded-xl border p-3 text-sm text-slate-400'>
                {metadata.guestbook.guestbookName ?? `Comment #${metadata.guestbook.guestbookId}`}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
