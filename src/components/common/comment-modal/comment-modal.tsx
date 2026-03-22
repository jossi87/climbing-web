import { useState } from 'react';
import { postComment, useAccessToken } from './../../../api';
import MediaUpload, { type UploadedMedia } from '../media-upload/media-upload';
import type { components } from '../../../@types/buldreinfo/swagger';
import { X, Check, AlertTriangle, ShieldCheck, ShieldAlert, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
    postComment(
      accessToken,
      id,
      idProblem,
      message,
      danger ?? false,
      resolved ?? false,
      false,
      media,
    )
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
    <div className='fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'>
        <div className='px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-nav/30'>
          <h3 className='text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2'>
            <MessageSquare size={18} className='text-brand' />
            Add comment
          </h3>
          <button onClick={onClose} className='text-slate-500 hover:text-white transition-colors'>
            <X size={20} />
          </button>
        </div>

        <div className='p-6 space-y-6 overflow-y-auto text-left'>
          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
              Comment
            </label>
            <textarea
              placeholder='Comment'
              className='w-full bg-surface-nav border border-surface-border rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors min-h-30 resize-none'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
              Add media
            </label>
            <MediaUpload onMediaChanged={(nm) => setMedia(nm)} isMultiPitch={false} />
          </div>

          {showHse && (
            <div className='space-y-3'>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
                Status
              </label>
              <div className='flex bg-surface-nav p-1 rounded-xl border border-surface-border w-fit'>
                <button
                  type='button'
                  onClick={() => {
                    setDanger(false);
                    setResolved(false);
                  }}
                  className={cn(
                    'px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all',
                    !danger && !resolved
                      ? 'bg-surface-card text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300',
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
                    'px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2',
                    danger && !resolved
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
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
                    'px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2',
                    !danger && resolved
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                      : 'text-slate-500 hover:text-green-400',
                  )}
                >
                  <ShieldCheck size={14} /> Safe
                </button>
              </div>
            </div>
          )}

          {danger && (
            <div className='flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs leading-relaxed'>
              <AlertTriangle className='shrink-0' size={18} />
              <p>
                A loose hanger should not be flagged as dangerous. All climbers should carry a 17mm
                spanner (wrench), and if you don't have it just tight the nut by hand. Be specific,
                is the bolt spinning freely in the rock? Are there loose rocks/flakes that you were
                not able to safely remove by hand? What kind of tools are needed?
              </p>
            </div>
          )}
        </div>

        <div className='p-4 bg-surface-nav/30 border-t border-surface-border flex justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={saving || !message.trim()}
            className='flex items-center gap-2 px-6 py-2 bg-brand hover:bg-brand/90 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-brand/20'
          >
            {saving ? (
              <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
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
