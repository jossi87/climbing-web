import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { FormSwitch } from '../../ui';
import { MessageSquare, X, Check, Pencil } from 'lucide-react';

type Media = components['schemas']['Media'];

type Props = {
  save: (id: number, metadataDescription: string, pitch: number, trivia: boolean) => void | Promise<void>;
  onCloseWithoutReload: () => void;
  m: Media;
  numPitches: number;
};

/** Match {@link CommentModal} / {@link TickModal}: fluid sheet on small screens, centered card on `sm+`. */
const fieldLabelClass = cn(designContract.typography.label, 'text-slate-300');

const modalPanelClass =
  'bg-surface-card border-surface-border flex min-h-0 w-full min-w-0 flex-col overflow-hidden shadow-2xl max-sm:flex-1 max-sm:rounded-none max-sm:border-0 sm:max-h-[min(94dvh,56rem)] sm:max-w-2xl sm:rounded-2xl sm:border';
const modalBodyClass =
  'min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 py-3.5 text-left max-sm:flex-1 sm:max-h-[calc(min(94dvh,56rem)-9.5rem)] sm:flex-none sm:space-y-5 sm:px-6 sm:py-4';

const MediaEditModal = ({ save, onCloseWithoutReload, m, numPitches }: Props) => {
  const [description, setDescription] = useState(m.mediaMetadata?.description ?? '');
  const [pitch, setPitch] = useState<number>(m.pitch ?? 0);
  const [trivia, setTrivia] = useState<boolean>(!!m.trivia);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || saving) return;
      onCloseWithoutReload();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCloseWithoutReload, saving]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await Promise.resolve(save(m.id ?? 0, description, pitch, trivia));
    } catch (error) {
      console.warn(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className='animate-in fade-in fixed inset-0 z-200 flex h-dvh min-h-dvh w-full bg-black/80 backdrop-blur-sm duration-200 max-sm:flex-col max-sm:p-0 sm:items-center sm:justify-center sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='media-edit-modal-title'
    >
      <div className={modalPanelClass}>
        <div className='border-surface-border bg-surface-raised flex shrink-0 items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 sm:pt-4'>
          <h3 id='media-edit-modal-title' className='type-label flex min-w-0 items-center gap-2 text-slate-200'>
            <Pencil size={18} className='shrink-0 text-slate-400' />
            <span className='truncate'>Edit media</span>
          </h3>
          <button
            type='button'
            onClick={onCloseWithoutReload}
            className='hover:bg-surface-raised-hover -mr-1 shrink-0 rounded-lg p-1.5 opacity-70 transition-colors hover:opacity-100'
            aria-label='Close'
          >
            <X size={20} />
          </button>
        </div>

        <div className={modalBodyClass}>
          <div className='space-y-1.5'>
            <label htmlFor='media-edit-description' className={cn('ml-1', fieldLabelClass)}>
              Description
            </label>
            <div className='relative'>
              <MessageSquare
                className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
                size={16}
                aria-hidden
              />
              <input
                id='media-edit-description'
                type='text'
                placeholder='Description'
                className='bg-surface-nav border-surface-border type-body focus:border-brand-border/60 w-full rounded-xl border py-3 pr-4 pl-10 transition-colors placeholder:opacity-50 focus:outline-none'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {numPitches > 0 && (
            <div className={cn('space-y-1.5', trivia && 'pointer-events-none opacity-50')}>
              <label htmlFor='media-edit-pitch' className={cn('ml-1', fieldLabelClass)}>
                Pitch (route has {numPitches} pitches)
              </label>
              <select
                id='media-edit-pitch'
                className='bg-surface-nav border-surface-border type-body focus:border-brand-border/60 w-full cursor-pointer appearance-none rounded-xl border px-3 py-3 transition-colors focus:outline-none'
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
          )}

          <div className='bg-surface-raised border-surface-border flex items-center justify-between gap-3 rounded-xl border p-4'>
            <div className='min-w-0 space-y-0.5'>
              <label className={cn(fieldLabelClass, 'ml-0 font-semibold text-slate-200')}>Trivia image</label>
              <p className='type-small text-slate-400'>Mark as general trivia for the page</p>
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

        <div className='bg-surface-raised border-surface-border flex shrink-0 justify-end gap-1.5 border-t px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-4 sm:py-4 sm:pb-4'>
          <button type='button' onClick={onCloseWithoutReload} className='modal-action-cancel'>
            Cancel
          </button>
          <button
            type='button'
            onClick={() => void handleSave()}
            disabled={saving}
            className={cn(
              designContract.controls.savePrimaryModal,
              'disabled:bg-surface-hover rounded-lg shadow-sm disabled:opacity-50 max-sm:px-3 max-sm:py-2 max-sm:text-[10px] max-sm:tracking-wide',
            )}
          >
            {saving ? (
              <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
            ) : (
              <Check size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default MediaEditModal;
