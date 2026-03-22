import { useState } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { MessageSquare, X, Check, RefreshCw } from 'lucide-react';

type Media = components['schemas']['Media'];

type Props = {
  save: (id: number, metadataDescription: string, pitch: number, trivia: boolean) => void;
  onCloseWithoutReload: () => void;
  m: Media;
  numPitches: number;
};

const MediaEditModal = ({ save, onCloseWithoutReload, m, numPitches }: Props) => {
  const [description, setDescription] = useState(m.mediaMetadata?.description ?? '');
  const [pitch, setPitch] = useState<number>(m.pitch ?? 0);
  const [trivia, setTrivia] = useState<boolean>(!!m.trivia);
  const [saving, setSaving] = useState(false);

  return (
    <div className='fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='bg-surface-card border border-surface-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col'>
        <div className='px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-nav/30'>
          <h3 className='text-sm font-bold text-white uppercase tracking-widest'>Edit media</h3>
          <button
            type='button'
            onClick={onCloseWithoutReload}
            className='text-slate-500 hover:text-white transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6 space-y-6 overflow-y-auto'>
          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
              Description:
            </label>
            <div className='relative'>
              <MessageSquare
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
                size={16}
              />
              <input
                type='text'
                placeholder='Description'
                className='w-full bg-surface-nav border border-surface-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {numPitches > 0 && (
            <div className={cn('space-y-2', trivia && 'opacity-50 pointer-events-none')}>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
                Pitch (route has {numPitches} pitches):
              </label>
              <div className='relative'>
                <select
                  className='w-full bg-surface-nav border border-surface-border rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-brand transition-colors appearance-none cursor-pointer'
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  disabled={trivia}
                >
                  <option value={0}>Not connected to a pitch</option>
                  {Array.from({ length: numPitches }, (_, i) => i + 1).map((x) => (
                    <option key={x} value={x}>
                      Pitch {x}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className='flex items-center justify-between p-4 bg-surface-nav/20 rounded-xl border border-surface-border/50'>
            <div className='space-y-0.5'>
              <label className='text-xs font-bold text-slate-200'>Trivia-image?</label>
              <p className='text-[10px] text-slate-500'>Enable to mark as general trivia</p>
            </div>
            <button
              type='button'
              onClick={() => {
                const newTrivia = !trivia;
                setTrivia(newTrivia);
                if (newTrivia) setPitch(0);
              }}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                trivia ? 'bg-brand' : 'bg-slate-700',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  trivia ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        </div>

        <div className='p-4 bg-surface-nav/30 border-t border-surface-border flex justify-end gap-3'>
          <button
            type='button'
            onClick={onCloseWithoutReload}
            className='px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => {
              setSaving(true);
              save(m.id ?? 0, description, pitch, trivia);
            }}
            disabled={saving}
            className='flex items-center gap-2 px-6 py-2 bg-brand hover:bg-brand/90 disabled:bg-brand/50 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-brand/20'
          >
            {saving ? <RefreshCw className='animate-spin' size={14} /> : <Check size={14} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaEditModal;
