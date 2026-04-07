import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  convertFromDateToString,
  convertFromStringToDate,
  invalidateProblemQueries,
  postTicks,
  useAccessToken,
} from '../../../api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { components } from '../../../@types/buldreinfo/swagger';
import {
  X,
  Check,
  Trash2,
  Plus,
  Minus,
  Star,
  Calendar,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { useMeta } from '../Meta/context';

type Repeat = { date?: string; comment?: string };

/** Slightly brighter than default `type-label` (slate-400) so form rails stay readable on `surface-card`. */
const fieldLabelClass = cn(designContract.typography.label, 'text-slate-300');

type TickModalProps = {
  open: boolean;
  onClose: () => void;
  idTick: number;
  idProblem: number;
  grades: components['schemas']['Grade'][];
  comment: string;
  grade: string;
  gradeFa?: string | null;
  gradeConsensus?: string | null;
  stars?: number | null;
  repeats?: Repeat[] | undefined;
  date?: string | undefined;
  enableTickRepeats: boolean;
};

const TickModal = ({
  open,
  onClose,
  idTick,
  idProblem,
  grades,
  comment: initialComment,
  grade: initialGrade,
  gradeFa,
  gradeConsensus,
  stars: initialStars,
  repeats: initialRepeats,
  date: initialDate,
  enableTickRepeats,
}: TickModalProps) => {
  const { isClimbing } = useMeta();
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();
  const [comment, setComment] = useState(initialComment ?? '');
  const [grade, setGrade] = useState(initialGrade);
  const [stars, setStars] = useState<number | null>(initialStars ?? null);
  const [date, setDate] = useState<string | undefined>(
    idTick === -1 ? (convertFromDateToString(new Date()) ?? initialDate) : initialDate,
  );
  const [repeats, setRepeats] = useState<Repeat[]>(initialRepeats || []);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date();
  const validDate = !date || (convertFromStringToDate(date) ?? new Date()) <= today;

  const handleUpdateRepeat = useCallback(
    (index: number, field: 'date' | 'comment', value: string | Date | null | undefined) => {
      setRepeats((currentRepeats) => {
        const newRepeats = [...currentRepeats];
        const updatedRepeat = { ...newRepeats[index] };

        if (field === 'date') {
          updatedRepeat.date =
            value instanceof Date || value === null
              ? (convertFromDateToString(value as Date | null) ?? updatedRepeat.date)
              : (value as string | undefined);
        } else {
          updatedRepeat.comment = value as string;
        }
        newRepeats[index] = updatedRepeat;
        return newRepeats;
      });
    },
    [],
  );

  const handleDeleteRepeatAt = useCallback((index: number) => {
    if (!confirm('Remove this repeat ascent from the list?')) return;
    setRepeats((current) => current.filter((_, i) => i !== index));
  }, []);

  const handleAddRepeat = useCallback(() => {
    const newRepeat: Repeat = {
      date: convertFromDateToString(new Date()) ?? initialDate,
      comment: '',
    };
    setRepeats((currentRepeats) => [...currentRepeats, newRepeat]);
  }, [initialDate]);

  const saveTick = useCallback(
    (isDelete: boolean) => {
      if (isSaving) return;
      if (!isDelete && (stars === null || !validDate)) return;

      setApiError(null);
      setIsSaving(true);

      postTicks(accessToken, isDelete, idTick, idProblem, comment, date, stars ?? -1, grade, repeats)
        .then(() => {
          void invalidateProblemQueries(queryClient, idProblem);
          onClose();
        })
        .catch((error) => {
          console.warn('Tick save/delete failed:', error);
          setApiError(error.toString());
        })
        .finally(() => {
          setIsSaving(false);
        });
    },
    [accessToken, queryClient, idTick, idProblem, comment, date, stars, grade, repeats, onClose, validDate, isSaving],
  );

  if (!open) return null;

  /** Portaled to `document.body` so the overlay isn’t trapped under the sticky header (`main` uses `z-[46]`, header `z-50`). */
  /** Mobile: panel is flex-1 inside min-h-dvh overlay (no max-h cap — avoids a strip under the sheet). Desktop: capped card, body scrolls inside. */
  const modalPanelClass =
    'bg-surface-card border-surface-border flex min-h-0 w-full min-w-0 flex-col overflow-hidden shadow-2xl max-sm:flex-1 max-sm:rounded-none max-sm:border-0 sm:max-h-[min(94dvh,56rem)] sm:max-w-2xl sm:rounded-2xl sm:border';
  const modalBodyClass =
    'min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 py-3.5 text-left max-sm:flex-1 sm:max-h-[calc(min(94dvh,56rem)-10.5rem)] sm:flex-none sm:space-y-5 sm:px-6 sm:py-4';

  return createPortal(
    <div
      className='animate-in fade-in fixed inset-0 z-200 flex h-dvh min-h-dvh w-full bg-black/80 backdrop-blur-sm duration-200 max-sm:flex-col max-sm:p-0 sm:items-center sm:justify-center sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='tick-modal-title'
    >
      <div className={modalPanelClass}>
        <div className='border-surface-border bg-surface-raised flex shrink-0 items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 sm:pt-4'>
          <h3 id='tick-modal-title' className='type-label flex min-w-0 items-center gap-2 text-slate-200'>
            <Check size={18} className='shrink-0 text-emerald-400' />
            <span className='truncate'>{isClimbing ? 'Tick route' : 'Tick problem'}</span>
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='hover:bg-surface-raised-hover -mr-1 shrink-0 rounded-lg p-1.5 opacity-70 transition-colors hover:opacity-100'
            aria-label='Close'
          >
            <X size={20} />
          </button>
        </div>

        <div className={modalBodyClass}>
          {apiError && (
            <div className='bg-surface-raised flex items-start gap-3 rounded-xl border border-red-500/35 p-4'>
              <AlertCircle className='shrink-0 text-red-500' size={18} />
              <div className={cn(designContract.typography.label, 'text-red-500')}>
                <span className='opacity-70'>Error:</span> {apiError}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5'>
            <div className='space-y-1.5'>
              <label className={cn('ml-1', fieldLabelClass, !validDate && 'text-red-500')}>
                Date {!validDate && '(cannot be in the future)'}
              </label>
              <div className='relative'>
                <Calendar
                  className='pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-slate-400'
                  size={16}
                />
                <DatePicker
                  placeholderText='Date'
                  dateFormat='dd-MM-yyyy'
                  isClearable
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode='select'
                  selected={date ? convertFromStringToDate(date) : undefined}
                  onChange={(newDate: Date | null) => setDate(newDate ? convertFromDateToString(newDate) : undefined)}
                  className={cn(
                    'bg-surface-nav type-body w-full rounded-xl border py-2.5 pr-4 pl-10 transition-colors focus:border-white/20 focus:outline-none',
                    !validDate ? 'border-red-500/50' : 'border-surface-border',
                  )}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className={cn('ml-1', fieldLabelClass)}>Grade</label>
              <div className='relative'>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className='bg-surface-nav border-surface-border type-body w-full cursor-pointer appearance-none rounded-xl border px-3 py-2.5 pr-9 transition-colors focus:border-white/20 focus:outline-none'
                >
                  <option value='No personal grade'>I don't want to grade</option>
                  {grades.map((g, i) => (
                    <option key={i} value={g.grade}>
                      {g.grade}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400'
                />
                <div className={cn('mt-1.5 px-1 text-slate-400 italic', designContract.typography.micro)}>
                  FA: {gradeFa} | Consensus: {gradeConsensus}
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-1.5'>
            <label id='tick-rating-label' className={cn('ml-1', fieldLabelClass)}>
              Rating{' '}
              <span className='text-red-500' aria-hidden>
                *
              </span>
              <span className='sr-only'> (required)</span>
            </label>
            <div
              className='border-surface-border bg-surface-raised divide-surface-border/50 flex min-h-[3rem] w-full min-w-0 flex-nowrap divide-x overflow-hidden rounded-xl border shadow-sm'
              role='radiogroup'
              aria-labelledby='tick-rating-label'
            >
              <button
                type='button'
                role='radio'
                aria-checked={stars === -1}
                onClick={() => setStars(-1)}
                className={cn(
                  'flex min-w-0 flex-1 items-center justify-center px-1 py-2.5 text-center text-[10px] leading-tight font-semibold tracking-wide uppercase transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-0 focus-visible:outline-none sm:px-2 sm:text-xs',
                  stars === -1
                    ? 'bg-emerald-950 text-slate-50 shadow-none ring-1 ring-emerald-400/50'
                    : 'hover:bg-surface-raised-hover text-slate-400 hover:text-slate-200',
                )}
              >
                No rating
              </button>
              {[0, 1, 2, 3].map((s) => (
                <button
                  type='button'
                  key={s}
                  role='radio'
                  aria-checked={stars === s}
                  aria-label={s === 0 ? '0 stars' : `${s} star${s === 1 ? '' : 's'}`}
                  onClick={() => setStars(s)}
                  className={cn(
                    'flex min-w-0 flex-1 items-center justify-center px-1 py-2.5 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-amber-400/55 focus-visible:ring-offset-0 focus-visible:outline-none sm:px-2',
                    stars === s
                      ? 'bg-amber-950 text-amber-50 shadow-none ring-1 ring-amber-400/55'
                      : 'hover:bg-surface-raised-hover text-slate-500',
                  )}
                >
                  <span className='inline-flex items-center justify-center gap-px'>
                    {[1, 2, 3].map((i) => {
                      const filled = i <= s;
                      const activeCell = stars === s;
                      return (
                        <Star
                          key={i}
                          size={12}
                          strokeWidth={filled ? 2 : 2.45}
                          className={cn(
                            filled
                              ? activeCell
                                ? 'fill-amber-300 text-amber-100 drop-shadow-[0_0_8px_rgba(253,230,138,0.45)]'
                                : 'fill-amber-500/45 text-amber-400/85'
                              : activeCell
                                ? 'fill-none text-slate-200/95'
                                : 'fill-none text-slate-500/85',
                          )}
                        />
                      );
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-1.5'>
            <label className={cn('ml-1', fieldLabelClass)}>Comment</label>
            <div className='relative'>
              <MessageSquare className='pointer-events-none absolute top-3.5 left-3 text-slate-400' size={16} />
              <textarea
                placeholder='Optional comment'
                className='bg-surface-nav border-surface-border type-body min-h-24 w-full resize-y rounded-xl border py-3 pr-4 pl-10 transition-colors focus:border-white/20 focus:outline-none max-sm:min-h-[min(10rem,30dvh)] sm:min-h-28'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          {enableTickRepeats && (
            <div className='border-surface-border/50 space-y-2 border-t pt-3'>
              <label className={cn('ml-1 block', fieldLabelClass)}>Repeats</label>
              <div className='border-surface-border/60 bg-surface-card overflow-hidden rounded-xl border shadow-sm'>
                {repeats.length > 0 ? (
                  <ol className='divide-surface-border/40 m-0 list-none divide-y p-0'>
                    {repeats.map((r, index) => (
                      <li
                        key={index}
                        className='animate-in slide-in-from-left-2 flex gap-2 p-2.5 duration-150 sm:gap-3 sm:p-3'
                      >
                        <div
                          className='bg-surface-raised border-surface-border/80 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold text-slate-400 tabular-nums sm:h-8 sm:w-8 sm:text-[11px]'
                          aria-hidden
                        >
                          {index + 1}
                        </div>
                        <div className='min-w-0 flex-1 space-y-2'>
                          <div className='flex items-center gap-2'>
                            <DatePicker
                              placeholderText='dd-mm-yyyy'
                              dateFormat='dd-MM-yyyy'
                              selected={r.date ? convertFromStringToDate(r.date) : undefined}
                              onChange={(date: Date | null) => handleUpdateRepeat(index, 'date', date)}
                              className='bg-surface-raised border-surface-border type-small min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 focus:border-white/20 focus:outline-none sm:max-w-[10.5rem] sm:py-2'
                            />
                            <button
                              type='button'
                              onClick={() => handleDeleteRepeatAt(index)}
                              className='bg-surface-raised shrink-0 rounded-lg border border-red-500/50 p-2 text-red-300 shadow-sm transition-colors hover:border-red-400 hover:bg-red-950 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-red-400/45 focus-visible:ring-offset-0 focus-visible:outline-none active:scale-[0.98] sm:p-2'
                              aria-label={`Remove repeat ${index + 1}`}
                            >
                              <Minus size={15} strokeWidth={2.35} />
                            </button>
                          </div>
                          <textarea
                            placeholder='Optional — conditions, partners, how it felt…'
                            rows={3}
                            className='bg-surface-raised border-surface-border type-small max-h-40 min-h-[4.25rem] w-full resize-y rounded-lg border px-2.5 py-2 leading-snug focus:border-white/20 focus:outline-none sm:min-h-[4.5rem]'
                            value={r.comment ?? ''}
                            onChange={(e) => handleUpdateRepeat(index, 'comment', e.target.value)}
                          />
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : null}
                <div className={cn('bg-surface-raised', repeats.length > 0 ? 'border-surface-border/50 border-t' : '')}>
                  <button
                    type='button'
                    onClick={handleAddRepeat}
                    className='type-label hover:bg-surface-raised-hover flex w-full items-center justify-center gap-2 px-3 py-2.5 text-slate-200 transition-colors sm:px-4 sm:py-2.5'
                  >
                    <Plus size={14} className='text-emerald-400/90' /> Add repeat ascent
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            'bg-surface-raised border-surface-border flex shrink-0 flex-nowrap items-center gap-2 border-t px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-4 sm:py-4 sm:pb-4',
            idTick > 1 ? 'justify-between' : 'justify-end',
          )}
        >
          {idTick > 1 ? (
            <button
              type='button'
              disabled={isSaving}
              onClick={() => {
                if (!confirm('Delete this tick permanently? You can add a new tick later if this was a mistake.'))
                  return;
                saveTick(true);
              }}
              className={cn(
                designContract.typography.uiCompact,
                'hover:bg-surface-hover inline-flex min-w-0 shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-red-500 uppercase transition-all hover:ring-1 hover:ring-red-500/35 disabled:opacity-50 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2',
              )}
            >
              <Trash2 size={14} className='shrink-0 sm:h-4 sm:w-4' />
              <span className='min-w-0 truncate sm:whitespace-normal'>
                <span className='sm:hidden'>Delete</span>
                <span className='hidden sm:inline'>Delete Tick</span>
              </span>
            </button>
          ) : null}
          <div className='flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3'>
            <button type='button' onClick={onClose} className='modal-action-cancel'>
              Cancel
            </button>
            <button
              type='button'
              onClick={() => saveTick(false)}
              disabled={stars === null || !validDate || isSaving}
              className={cn(
                designContract.controls.savePrimaryModal,
                'disabled:bg-surface-hover shadow-sm disabled:opacity-50 max-sm:px-3 max-sm:py-2 max-sm:text-[9px] max-sm:tracking-wide',
              )}
            >
              {isSaving ? <RefreshCw size={14} className='animate-spin' /> : <Check size={14} />}
              Save Tick
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TickModal;
