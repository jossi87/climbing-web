import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAccessToken, useProblem, postComment } from '../../../api';
import Media from '../../common/media/media';
import { ClickableAvatar } from '../../ui/Avatar/Avatar';
import { useMeta } from '../../common/meta/context';
import Linkify from 'linkify-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AlertTriangle, CheckCircle, Edit2, Trash2, Flag } from 'lucide-react';

export const ProblemComments = ({
  problemId,
  showHiddenMedia,
  onShowCommentModal,
  orderableMedia,
  carouselMedia,
}: {
  problemId: number;
  showHiddenMedia: boolean;
  orderableMedia: components['schemas']['Media'][];
  carouselMedia: components['schemas']['Media'][];
  onShowCommentModal: (comment: components['schemas']['ProblemComment']) => void;
}) => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { data } = useProblem(+problemId, showHiddenMedia);

  function flagAsDangerous({ id, message }: { id?: number; message?: string | null }) {
    if (!id || !message) return;
    const pid = data?.id;
    if (!pid) return;
    if (confirm('Are you sure you want to flag this comment?')) {
      postComment(accessToken, id, pid, message, true, false, false, []).catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    }
  }

  function deleteComment(id?: number) {
    if (!id) return;
    const pid = data?.id;
    if (!pid) return;

    if (confirm('Are you sure you want to delete this comment?')) {
      postComment(accessToken, id, pid, null, false, false, true, []).catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    }
  }

  const comments = data?.comments ?? [];
  const sections = data?.sections ?? [];

  if (comments.length === 0) return null;

  return (
    <div className='bg-surface-card border border-surface-border rounded-xl overflow-hidden text-left'>
      <div className='px-5 py-4 border-b border-surface-border flex items-center justify-between bg-surface-nav/30'>
        <h3 className='text-sm font-bold text-white uppercase tracking-widest'>Comments</h3>
        <span className='px-2 py-0.5 rounded-full bg-surface-nav border border-surface-border text-[10px] font-black text-slate-400'>
          {comments.length}
        </span>
      </div>

      <div className='divide-y divide-surface-border/50'>
        {comments.map((c) => {
          let statusBadge: JSX.Element | null = null;
          if (c.danger) {
            statusBadge = (
              <div className='inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase mt-3'>
                <AlertTriangle size={12} /> Flagged as dangerous
              </div>
            );
          } else if (c.resolved) {
            statusBadge = (
              <div className='inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500 uppercase mt-3'>
                <CheckCircle size={12} /> Flagged as safe
              </div>
            );
          } else if (meta.isAuthenticated && meta.isClimbing) {
            statusBadge = (
              <button
                type='button'
                onClick={() => flagAsDangerous(c)}
                className='inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-500 hover:text-red-500 hover:border-red-500/50 transition-all uppercase mt-3'
              >
                <Flag size={12} /> Flag as dangerous
              </button>
            );
          }

          return (
            <div key={c.id} className='p-5 flex gap-4 items-start group'>
              <div className='shrink-0 mt-1'>
                <ClickableAvatar
                  name={c.name}
                  mediaId={c.mediaId}
                  mediaVersionStamp={c.mediaVersionStamp}
                  size='tiny'
                />
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <Link
                      to={`/user/${c.idUser}`}
                      className='text-sm font-bold text-white hover:text-brand transition-colors'
                    >
                      {c.name}
                    </Link>
                    <div className='text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5'>
                      {c.date}
                    </div>
                  </div>

                  {c.editable && (
                    <div className='flex items-center bg-surface-nav border border-surface-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden'>
                      <button
                        type='button'
                        onClick={() => onShowCommentModal(c)}
                        className='p-1.5 text-slate-400 hover:text-white hover:bg-surface-hover transition-colors'
                      >
                        <Edit2 size={14} />
                      </button>
                      <div className='w-px h-4 bg-surface-border' />
                      <button
                        type='button'
                        onClick={() => deleteComment(c.id)}
                        className='p-1.5 text-slate-400 hover:text-red-500 hover:bg-surface-hover transition-colors'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className='mt-2 text-slate-300 text-[14px] leading-relaxed wrap-break-word'>
                  <Linkify>{c.message}</Linkify>
                </div>

                {(c.media ?? []).length > 0 && (
                  <div className='mt-4'>
                    <Media
                      pitches={sections}
                      media={c.media ?? []}
                      orderableMedia={orderableMedia}
                      carouselMedia={carouselMedia}
                      optProblemId={null}
                      showLocation={false}
                    />
                  </div>
                )}

                {statusBadge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
