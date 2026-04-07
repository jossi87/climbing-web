import { useState } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { FormSwitch } from '../../ui';
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
        <div className='border-surface-border bg-surface-raised flex items-center justify-between border-b px-6 py-4'>
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
                className='bg-surface-nav border-surface-border type-body focus:border-brand w-full rounded-lg border py-2.5 pr-4 pl-10 transition-colors placeholder:opacity-50 focus:outline-none'
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
                  className='bg-surface-nav border-surface-border type-body focus:border-brand w-full cursor-pointer appearance-none rounded-lg border px-3 py-2.5 transition-colors focus:outline-none'
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

          <div className='bg-surface-card border-surface-border/50 flex items-center justify-between rounded-xl border p-4'>
            <div className='space-y-0.5'>
              <label className='type-body font-semibold'>Trivia-image?</label>
              <p className='type-small opacity-70'>Enable to mark as general trivia</p>
            </div>
            <FormSwitch
              checked={trivia}
              onChange={() => {
                const newTrivia = !trivia;
                setTrivia(newTrivia);
                if (newTrivia) setPitch(0);
              }}
              variant='brand'
              aria-label='Trivia image'
            />
          </div>
        </div>

        <div className='bg-surface-raised border-surface-border flex justify-end gap-3 border-t p-4'>
          <button type='button' onClick={onCloseWithoutReload} className='modal-action-cancel px-4 py-2'>
            Cancel
          </button>
          <button
            type='button'
            onClick={() => {
              setSaving(true);
              save(m.id ?? 0, description, pitch, trivia);
            }}
            disabled={saving}
            className={cn(designContract.controls.savePrimaryModal, 'disabled:bg-surface-hover rounded-lg')}
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
