import { useState } from 'react';
import { postComment, useAccessToken } from '../../../api';
import MediaUpload, { type UploadedMedia } from '../MediaUpload/MediaUpload';
import type { components } from '../../../@types/buldreinfo/swagger';
import { X, Check, AlertTriangle, ShieldCheck, ShieldAlert, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

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
        onClose();
      })
      .catch((error) => {
        console.warn(error);
        alert(error.toString());
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className='animate-in fade-in fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200'>
      <div className='bg-surface-card border-surface-border flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl'>
        <div className='border-surface-border bg-surface-nav/30 flex items-center justify-between border-b px-6 py-4'>
          <h3 className='type-label flex items-center gap-2'>
            <MessageSquare size={18} className='text-brand' />
            Add comment
          </h3>
          <button onClick={onClose} className='opacity-70 transition-colors hover:opacity-100'>
            <X size={20} />
          </button>
        </div>

        <div className='space-y-6 overflow-y-auto p-6 text-left'>
          <div className='space-y-2'>
            <label className={cn('ml-1', designContract.typography.label)}>Comment</label>
            <textarea
              placeholder='Comment'
              className='bg-surface-nav border-surface-border focus:border-brand type-body min-h-30 w-full resize-none rounded-xl border p-4 transition-colors placeholder:text-slate-600 focus:outline-none'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <label className={cn('ml-1', designContract.typography.label)}>Add media</label>
            <MediaUpload onMediaChanged={(nm) => setMedia(nm)} isMultiPitch={false} />
          </div>

          {showHse && (
            <div className='space-y-3'>
              <label className={cn('ml-1', designContract.typography.label)}>Status</label>
              <div className='bg-surface-nav border-surface-border flex w-fit rounded-xl border p-1'>
                <button
                  type='button'
                  onClick={() => {
                    setDanger(false);
                    setResolved(false);
                  }}
                  className={cn(
                    'rounded-lg px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all',
                    !danger && !resolved ? 'bg-surface-card shadow-sm' : 'text-slate-500 hover:text-slate-300',
                  )}
                >
                  Default
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setDanger(true);
                    setResolved(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all',
                    danger && !resolved
                      ? 'bg-red-500 shadow-lg shadow-red-500/20'
                      : 'text-slate-500 hover:text-red-400',
                  )}
                >
                  <ShieldAlert size={14} /> Dangerous
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setDanger(false);
                    setResolved(true);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all',
                    !danger && resolved
                      ? 'bg-green-600 shadow-lg shadow-green-600/20'
                      : 'text-slate-500 hover:text-green-400',
                  )}
                >
                  <ShieldCheck size={14} /> Safe
                </button>
              </div>
            </div>
          )}

          {danger && (
            <div className='flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs leading-relaxed text-red-500'>
              <AlertTriangle className='shrink-0' size={18} />
              <p>
                A loose hanger should not be flagged as dangerous. All climbers should carry a 17mm spanner (wrench),
                and if you don't have it just tight the nut by hand. Be specific, is the bolt spinning freely in the
                rock? Are there loose rocks/flakes that you were not able to safely remove by hand? What kind of tools
                are needed?
              </p>
            </div>
          )}
        </div>

        <div className='bg-surface-nav/30 border-surface-border flex justify-end gap-3 border-t p-4'>
          <button
            type='button'
            onClick={onClose}
            className='type-label px-4 py-2 opacity-75 transition-colors hover:opacity-100'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={saving || !message.trim()}
            className='bg-brand hover:bg-brand/90 shadow-brand/20 type-label flex items-center gap-2 rounded-lg px-6 py-2 shadow-lg transition-all disabled:bg-slate-700 disabled:opacity-60'
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
