import { useState, useCallback } from 'react';
import { convertFromDateToString, convertFromStringToDate, postTicks, useAccessToken } from '../../../api';
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

  const handleDeleteRepeat = useCallback((repeatToDelete: Repeat) => {
    setRepeats((currentRepeats) => currentRepeats.filter((r) => r !== repeatToDelete));
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
      if (stars === null || !validDate || isSaving) return;

      setApiError(null);
      setIsSaving(true);

      postTicks(accessToken, isDelete, idTick, idProblem, comment, date, stars, grade, repeats)
        .then(() => {
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
    [accessToken, idTick, idProblem, comment, date, stars, grade, repeats, onClose, validDate, isSaving],
  );

  if (!open) return null;

  return (
    <div className='animate-in fade-in fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200'>
      <div className='bg-surface-card border-surface-border flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl'>
        <div className='border-surface-border bg-surface-nav/30 flex items-center justify-between border-b px-6 py-4'>
          <h3 className='type-label flex items-center gap-2 text-slate-200'>
            <Check size={18} className='text-emerald-400' />
            {isClimbing ? 'Tick route' : 'Tick problem'}
          </h3>
          <button type='button' onClick={onClose} className='opacity-70 transition-colors hover:opacity-100'>
            <X size={20} />
          </button>
        </div>

        <div className='space-y-6 overflow-y-auto p-6 text-left'>
          {apiError && (
            <div className='flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4'>
              <AlertCircle className='shrink-0 text-red-500' size={18} />
              <div className='text-xs font-bold tracking-tight text-red-500 uppercase'>
                <span className='opacity-70'>Error:</span> {apiError}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <label
                className={cn(
                  'ml-1 text-[10px] font-black tracking-widest uppercase',
                  !validDate ? 'text-red-500' : 'text-slate-500',
                )}
              >
                Date {!validDate && '(cannot be in the future)'}
              </label>
              <div className='relative'>
                <Calendar
                  className='pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-slate-500'
                  size={16}
                />
                <DatePicker
                  placeholderText='Click to select a date'
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

            <div className='space-y-2'>
              <label className={cn('ml-1', designContract.typography.label)}>Grade</label>
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
                  className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
                />
                <div className='mt-1.5 px-1 text-[10px] text-slate-500 italic'>
                  FA: {gradeFa} | Consensus: {gradeConsensus}
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <label className={cn('ml-1 text-[10px] font-black tracking-widest text-slate-500 uppercase')}>
              Rating{' '}
              <span className='text-red-500' aria-hidden>
                *
              </span>
              <span className='sr-only'> (required)</span>
            </label>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-5'>
              <button
                type='button'
                onClick={() => setStars(-1)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-[10px] font-bold uppercase transition-all',
                  stars === -1
                    ? 'border-emerald-500/45 bg-emerald-600/25 text-slate-100 ring-1 ring-emerald-500/25'
                    : 'border-surface-border bg-surface-nav text-slate-500 hover:border-white/15 hover:text-slate-300',
                )}
              >
                No rating
              </button>
              {[0, 1, 2, 3].map((s) => (
                <button
                  type='button'
                  key={s}
                  onClick={() => setStars(s)}
                  className={cn(
                    'flex items-center justify-center gap-1 rounded-xl border px-3 py-2 transition-all',
                    stars === s
                      ? 'border-emerald-500/45 bg-emerald-600/20 text-amber-300 ring-1 ring-emerald-500/25'
                      : 'border-surface-border bg-surface-nav text-slate-500 hover:border-white/15',
                  )}
                >
                  <div className='flex'>
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className={cn(i <= s ? 'fill-amber-400 text-amber-400' : 'text-slate-600 opacity-40')}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <label className={cn('ml-1', designContract.typography.label)}>Comment</label>
            <div className='relative'>
              <MessageSquare className='pointer-events-none absolute top-4 left-3 text-slate-500' size={16} />
              <textarea
                placeholder='Optional comment'
                className='bg-surface-nav border-surface-border type-body min-h-25 w-full resize-none rounded-xl border py-3 pr-4 pl-10 transition-colors focus:border-white/20 focus:outline-none'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          {enableTickRepeats && (
            <div className='border-surface-border/50 space-y-4 border-t pt-4'>
              <label className={cn('ml-1 block', designContract.typography.label)}>Repeats (Additional Ascents)</label>
              <div className='space-y-3'>
                {repeats.map((r, index) => (
                  <div key={index} className='animate-in slide-in-from-left-2 flex items-start gap-2 duration-200'>
                    <div className='w-40 shrink-0'>
                      <DatePicker
                        dateFormat='dd-MM-yyyy'
                        selected={r.date ? convertFromStringToDate(r.date) : undefined}
                        onChange={(date: Date | null) => handleUpdateRepeat(index, 'date', date)}
                        className='bg-surface-nav border-surface-border type-small w-full rounded-lg border px-3 py-2 focus:border-white/20 focus:outline-none'
                      />
                    </div>
                    <input
                      placeholder='Repeat comment'
                      className='bg-surface-nav border-surface-border type-small flex-1 rounded-lg border px-3 py-2 focus:border-white/20 focus:outline-none'
                      value={r.comment ?? ''}
                      onChange={(e) => handleUpdateRepeat(index, 'comment', e.target.value)}
                    />
                    <button
                      type='button'
                      onClick={() => handleDeleteRepeat(r)}
                      className='bg-surface-nav border-surface-border rounded-lg border p-2 text-slate-500 transition-colors hover:text-red-500'
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={handleAddRepeat}
                  className='bg-surface-nav border-surface-border type-label inline-flex items-center gap-2 rounded-xl border px-4 py-2 opacity-80 transition-all hover:border-white/15 hover:opacity-100'
                >
                  <Plus size={14} /> Add Repeat Ascent
                </button>
              </div>
            </div>
          )}
        </div>

        <div className='bg-surface-nav/30 border-surface-border flex items-center justify-between border-t p-4'>
          <div>
            {idTick > 1 && (
              <button
                type='button'
                disabled={isSaving}
                onClick={() => saveTick(true)}
                className='flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-500/10 disabled:opacity-50'
              >
                <Trash2 size={16} /> Delete Tick
              </button>
            )}
          </div>
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='type-label px-4 py-2 opacity-75 transition-colors hover:opacity-100'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={() => saveTick(false)}
              disabled={stars === null || !validDate || isSaving}
              className={cn(
                designContract.controls.savePrimaryModal,
                'shadow-sm disabled:bg-slate-700/80 disabled:opacity-50',
              )}
            >
              {isSaving ? <RefreshCw size={14} className='animate-spin' /> : <Check size={14} />}
              Save Tick
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TickModal;
