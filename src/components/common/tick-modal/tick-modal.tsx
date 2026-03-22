import { useState, useCallback } from 'react';
import {
  convertFromDateToString,
  convertFromStringToDate,
  postTicks,
  useAccessToken,
} from './../../../api';
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
  Award,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

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
    [
      accessToken,
      idTick,
      idProblem,
      comment,
      date,
      stars,
      grade,
      repeats,
      onClose,
      validDate,
      isSaving,
    ],
  );

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'>
        <div className='px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-nav/30'>
          <h3 className='text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2'>
            <Check size={18} className='text-green-500' /> Tick Problem
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='text-slate-500 hover:text-white transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6 space-y-6 overflow-y-auto text-left'>
          {apiError && (
            <div className='bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3'>
              <AlertCircle className='text-red-500 shrink-0' size={18} />
              <div className='text-xs text-red-500 font-bold uppercase tracking-tight'>
                <span className='opacity-70'>Error:</span> {apiError}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest ml-1',
                  !validDate ? 'text-red-500' : 'text-slate-500',
                )}
              >
                Date {!validDate && '(cannot be in the future)'}
              </label>
              <div className='relative'>
                <Calendar
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10 pointer-events-none'
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
                  onChange={(newDate: Date | null) =>
                    setDate(newDate ? convertFromDateToString(newDate) : undefined)
                  }
                  className={cn(
                    'w-full bg-surface-nav border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand transition-colors',
                    !validDate ? 'border-red-500/50' : 'border-surface-border',
                  )}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
                Grade
              </label>
              <div className='relative'>
                <Award
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
                  size={16}
                />
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className='w-full bg-surface-nav border border-surface-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:border-brand transition-colors cursor-pointer'
                >
                  <option value='No personal grade'>I don't want to grade</option>
                  {grades.map((g, i) => (
                    <option key={i} value={g.grade}>
                      {g.grade}
                    </option>
                  ))}
                </select>
                <div className='mt-1.5 px-1 text-[10px] text-slate-500 italic'>
                  FA: {gradeFa} | Consensus: {gradeConsensus}
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <label
              className={cn(
                'text-[10px] font-black uppercase tracking-widest ml-1',
                stars === null ? 'text-red-500' : 'text-slate-500',
              )}
            >
              Rating {stars === null && '(required)'}
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-5 gap-2'>
              <button
                type='button'
                onClick={() => setStars(-1)}
                className={cn(
                  'px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all',
                  stars === -1
                    ? 'bg-brand border-brand text-white'
                    : 'bg-surface-nav border-surface-border text-slate-500 hover:border-slate-400',
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
                    'px-3 py-2 rounded-xl border flex items-center justify-center gap-1 transition-all',
                    stars === s
                      ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20'
                      : 'bg-surface-nav border-surface-border text-slate-500',
                  )}
                >
                  <div className='flex'>
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className={cn(i <= s ? 'fill-current' : 'opacity-30')}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
              Comment
            </label>
            <div className='relative'>
              <MessageSquare
                className='absolute left-3 top-4 text-slate-500 pointer-events-none'
                size={16}
              />
              <textarea
                placeholder='How did it feel?'
                className='w-full bg-surface-nav border border-surface-border rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand transition-colors min-h-25 resize-none'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          {enableTickRepeats && (
            <div className='space-y-4 pt-4 border-t border-surface-border/50'>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block'>
                Repeats (Additional Ascents)
              </label>
              <div className='space-y-3'>
                {repeats.map((r, index) => (
                  <div
                    key={index}
                    className='flex gap-2 items-start animate-in slide-in-from-left-2 duration-200'
                  >
                    <div className='w-40 shrink-0'>
                      <DatePicker
                        dateFormat='dd-MM-yyyy'
                        selected={r.date ? convertFromStringToDate(r.date) : undefined}
                        onChange={(date: Date | null) => handleUpdateRepeat(index, 'date', date)}
                        className='w-full bg-surface-nav border border-surface-border rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-brand'
                      />
                    </div>
                    <input
                      placeholder='Repeat comment'
                      className='flex-1 bg-surface-nav border border-surface-border rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-brand'
                      value={r.comment ?? ''}
                      onChange={(e) => handleUpdateRepeat(index, 'comment', e.target.value)}
                    />
                    <button
                      type='button'
                      onClick={() => handleDeleteRepeat(r)}
                      className='p-2 text-slate-500 hover:text-red-500 bg-surface-nav border border-surface-border rounded-lg transition-colors'
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={handleAddRepeat}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-surface-nav border border-surface-border rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:border-brand/50 transition-all'
                >
                  <Plus size={14} /> Add Repeat Ascent
                </button>
              </div>
            </div>
          )}
        </div>

        <div className='p-4 bg-surface-nav/30 border-t border-surface-border flex justify-between items-center'>
          <div>
            {idTick > 1 && (
              <button
                type='button'
                disabled={isSaving}
                onClick={() => saveTick(true)}
                className='flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all disabled:opacity-50'
              >
                <Trash2 size={16} /> Delete Tick
              </button>
            )}
          </div>
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={() => saveTick(false)}
              disabled={stars === null || !validDate || isSaving}
              className='flex items-center gap-2 px-6 py-2 bg-brand hover:bg-brand/90 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand/20'
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
