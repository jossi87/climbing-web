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
    <div className='animate-in fade-in fixed inset-0 z-200 flex h-[100dvh] min-h-[100dvh] w-full max-w-[100vw] items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200'>
      <div className='bg-surface-card border-surface-border flex w-full max-w-md flex-col overflow-hidden rounded-2xl border shadow-2xl'>
        <div className='border-surface-border bg-surface-nav/30 flex items-center justify-between border-b px-6 py-4'>
          <h3 className='type-label'>Edit media</h3>
          <button
            type='button'
            onClick={onCloseWithoutReload}
            className='opacity-70 transition-colors hover:opacity-100'
          >
            <X size={20} />
          </button>
        </div>

        <div className='space-y-6 overflow-y-auto p-6'>
          <div className='space-y-2'>
            <label className='type-label ml-1'>Description:</label>
            <div className='relative'>
              <MessageSquare className='absolute top-1/2 left-3 -translate-y-1/2 opacity-60' size={16} />
              <input
                type='text'
                placeholder='Description'
                className='bg-surface-nav border-surface-border focus:border-brand type-body w-full rounded-lg border py-2.5 pr-4 pl-10 transition-colors placeholder:opacity-50 focus:outline-none'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {numPitches > 0 && (
            <div className={cn('space-y-2', trivia && 'pointer-events-none opacity-50')}>
              <label className='type-label ml-1'>Pitch (route has {numPitches} pitches):</label>
              <div className='relative'>
                <select
                  className='bg-surface-nav border-surface-border focus:border-brand type-body w-full cursor-pointer appearance-none rounded-lg border px-3 py-2.5 transition-colors focus:outline-none'
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

          <div className='bg-surface-nav/20 border-surface-border/50 flex items-center justify-between rounded-xl border p-4'>
            <div className='space-y-0.5'>
              <label className='type-body font-semibold'>Trivia-image?</label>
              <p className='type-small opacity-70'>Enable to mark as general trivia</p>
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

        <div className='bg-surface-nav/30 border-surface-border flex justify-end gap-3 border-t p-4'>
          <button
            type='button'
            onClick={onCloseWithoutReload}
            className='type-label px-4 py-2 opacity-80 transition-colors hover:opacity-100'
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
            className='bg-brand hover:bg-brand/90 disabled:bg-brand/50 shadow-brand/20 type-label flex items-center gap-2 rounded-lg px-6 py-2 shadow-lg transition-all'
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
