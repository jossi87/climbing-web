import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateProblemQueries, postComment, useAccessToken } from '../../../api';
import MediaUpload, { type UploadedMedia } from '../MediaUpload/MediaUpload';
import type { components } from '../../../@types/buldreinfo/swagger';
import { X, Check, AlertTriangle, ShieldCheck, ShieldAlert, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

/** Match tick modal — field rails readable on `surface-card`. */
const fieldLabelClass = cn(designContract.typography.label, 'text-slate-300');

const CommentModal = ({
  comment,
  onClose,
  showHse,
  id,
  idProblem,
}: {
  onClose: () => void;
  showHse: boolean;
  id?: number;
  idProblem?: number;
  comment?: components['schemas']['ProblemComment'];
}) => {
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();
  const [message, setMessage] = useState(comment?.message ?? '');
  const [danger, setDanger] = useState(comment?.danger);
  const [resolved, setResolved] = useState(comment?.resolved);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (id == null || idProblem == null) return;
    setSaving(true);
    postComment(accessToken, id, idProblem, message, danger ?? false, resolved ?? false, false, media)
      .then(() => {
        void invalidateProblemQueries(queryClient, idProblem);
        onClose();
      })
      .catch((error) => {
        console.warn(error);
        alert(error.toString());
      })
      .finally(() => setSaving(false));
  };

  const modalPanelClass =
    'bg-surface-card border-surface-border flex min-h-0 w-full min-w-0 flex-col overflow-hidden shadow-2xl max-sm:flex-1 max-sm:rounded-none max-sm:border-0 sm:max-h-[min(94dvh,56rem)] sm:max-w-2xl sm:rounded-2xl sm:border';
  const modalBodyClass =
    'min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 py-3.5 text-left max-sm:flex-1 sm:max-h-[calc(min(94dvh,56rem)-9.5rem)] sm:flex-none sm:space-y-5 sm:px-6 sm:py-4';

  return (
    <div
      className='animate-in fade-in fixed inset-0 z-200 flex h-dvh min-h-dvh w-full bg-black/80 backdrop-blur-sm duration-200 max-sm:flex-col max-sm:p-0 sm:items-center sm:justify-center sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='comment-modal-title'
    >
      <div className={modalPanelClass}>
        <div className='border-surface-border bg-surface-raised flex shrink-0 items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 sm:pt-4'>
          <h3 id='comment-modal-title' className='type-label flex min-w-0 items-center gap-2 text-slate-200'>
            <MessageSquare size={18} className='shrink-0 text-slate-400' />
            <span className='truncate'>Add comment</span>
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
          <div className='space-y-1.5'>
            <label id='comment-body-label' className={cn('ml-1', fieldLabelClass)}>
              Comment{' '}
              <span className='text-red-500' aria-hidden>
                *
              </span>
              <span className='sr-only'> (required)</span>
            </label>
            <div className='relative'>
              <MessageSquare
                className='pointer-events-none absolute top-3 left-3 text-slate-400'
                size={16}
                aria-hidden
              />
              <textarea
                placeholder='Write your comment…'
                aria-labelledby='comment-body-label'
                className='bg-surface-nav border-surface-border type-body focus:border-brand-border/60 min-h-24 w-full resize-y rounded-xl border py-3 pr-4 pl-10 transition-colors focus:outline-none max-sm:min-h-[min(11rem,32dvh)] sm:min-h-28'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <label className={cn('ml-1', fieldLabelClass)}>Media</label>
            <MediaUpload onMediaChanged={(nm) => setMedia(nm)} isMultiPitch={false} />
          </div>

          {showHse && (
            <div className='space-y-1.5'>
              <label className={cn('ml-1', fieldLabelClass)}>Status</label>
              <div
                className='border-surface-border bg-surface-raised divide-surface-border/50 flex min-h-[2.75rem] w-full min-w-0 flex-nowrap divide-x overflow-hidden rounded-xl border shadow-sm sm:w-fit'
                role='radiogroup'
                aria-label='Comment safety status'
              >
                <button
                  type='button'
                  role='radio'
                  aria-checked={!danger && !resolved}
                  onClick={() => {
                    setDanger(false);
                    setResolved(false);
                  }}
                  className={cn(
                    designContract.typography.uiCompact,
                    'focus-visible:ring-brand-border/70 min-w-0 flex-1 px-2 py-2.5 uppercase transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none max-sm:text-[10px] sm:flex-none sm:px-4',
                    !danger && !resolved
                      ? 'bg-brand/20 text-brand ring-brand-border/55 shadow-none ring-1'
                      : 'hover:bg-surface-raised-hover hover:text-brand/90 text-slate-500',
                  )}
                >
                  Default
                </button>
                <button
                  type='button'
                  role='radio'
                  aria-checked={!!(danger && !resolved)}
                  onClick={() => {
                    setDanger(true);
                    setResolved(false);
                  }}
                  className={cn(
                    designContract.typography.uiCompact,
                    'flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-2.5 uppercase transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:outline-none max-sm:text-[10px] sm:flex-none sm:gap-2 sm:px-4',
                    danger && !resolved
                      ? 'bg-red-950 text-red-100 shadow-none ring-1 ring-red-400/50'
                      : 'hover:bg-surface-raised-hover text-slate-500 hover:text-red-300',
                  )}
                >
                  <ShieldAlert size={14} className='shrink-0' /> Dangerous
                </button>
                <button
                  type='button'
                  role='radio'
                  aria-checked={!!(!danger && resolved)}
                  onClick={() => {
                    setDanger(false);
                    setResolved(true);
                  }}
                  className={cn(
                    designContract.typography.uiCompact,
                    'flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-2.5 uppercase transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:outline-none max-sm:text-[10px] sm:flex-none sm:gap-2 sm:px-4',
                    !danger && resolved
                      ? 'bg-emerald-950 text-emerald-100 shadow-none ring-1 ring-emerald-400/50'
                      : 'hover:bg-surface-raised-hover text-slate-500 hover:text-emerald-300',
                  )}
                >
                  <ShieldCheck size={14} className='shrink-0' /> Safe
                </button>
              </div>
            </div>
          )}

          {danger && (
            <div
              className={cn(
                'bg-surface-raised flex items-start gap-2.5 rounded-xl border border-red-500/35 p-3 leading-relaxed text-red-400 sm:gap-3 sm:p-3.5',
                designContract.typography.micro,
              )}
            >
              <AlertTriangle className='mt-0.5 shrink-0' size={16} />
              <p className='text-red-300/95'>
                A loose hanger should not be flagged as dangerous. All climbers should carry a 17mm spanner (wrench),
                and if you don't have it just tight the nut by hand. Be specific, is the bolt spinning freely in the
                rock? Are there loose rocks/flakes that you were not able to safely remove by hand? What kind of tools
                are needed?
              </p>
            </div>
          )}
        </div>

        <div className='bg-surface-raised border-surface-border flex shrink-0 justify-end gap-1.5 border-t px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-4 sm:py-4 sm:pb-4'>
          <button
            type='button'
            onClick={onClose}
            className='type-label shrink-0 px-2 py-1.5 opacity-75 transition-colors hover:opacity-100 sm:px-4 sm:py-2'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={saving || !message.trim()}
            className={cn(
              designContract.controls.savePrimaryModal,
              'disabled:bg-surface-hover rounded-lg shadow-sm disabled:opacity-50 max-sm:px-3 max-sm:py-2 max-sm:text-[9px] max-sm:tracking-wide',
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
    </div>
  );
};

export default CommentModal;
