import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useAccessToken, useProblem, postComment } from '../../../api';
import Media from '../../../shared/components/Media/Media';
import { ClickableAvatar } from '../../../shared/ui/Avatar/Avatar';
import { useMeta } from '../../../shared/components/Meta/context';
import Linkify from 'linkify-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AlertTriangle, CheckCircle, Edit2, Trash2, Flag } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

const rowShell = 'group px-4 py-3 transition-colors hover:bg-white/[0.015] sm:px-5';

const actionIconBtn = 'rounded-md p-1.5 text-slate-600 transition-colors hover:bg-white/[0.06] hover:text-slate-300';

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
    <div className='flex flex-col gap-2 text-left'>
      {comments.map((c) => {
        const isOwn = !!c.editable;
        let statusBadge: JSX.Element | null = null;
        if (c.danger) {
          statusBadge = (
            <div className='mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-red-400/90 uppercase'>
              <AlertTriangle size={11} strokeWidth={2.25} /> Flagged as dangerous
            </div>
          );
        } else if (c.resolved) {
          statusBadge = (
            <div className='mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-emerald-400/90 uppercase'>
              <CheckCircle size={11} strokeWidth={2.25} /> Flagged as safe
            </div>
          );
        } else if (meta.isAuthenticated && meta.isClimbing) {
          statusBadge = (
            <button
              type='button'
              onClick={() => flagAsDangerous(c)}
              className='mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase transition-colors hover:text-red-400/90'
            >
              <Flag size={11} strokeWidth={2.25} /> Flag as dangerous
            </button>
          );
        }

        return (
          <div key={c.id} className={rowShell}>
            <div className='flex items-start gap-3 sm:gap-4'>
              <div className='shrink-0 pt-0.5'>
                <ClickableAvatar
                  name={c.name}
                  mediaId={c.mediaId}
                  mediaVersionStamp={c.mediaVersionStamp}
                  size='tiny'
                  className={cn(isOwn && 'border-emerald-400/30 ring-1 ring-emerald-400/20')}
                />
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1'>
                  <div
                    className={cn(
                      designContract.typography.body,
                      'min-w-0 flex-1 leading-relaxed text-pretty text-slate-300',
                    )}
                  >
                    <Link
                      to={`/user/${c.idUser}`}
                      className={cn(
                        designContract.typography.listLink,
                        isOwn
                          ? 'font-semibold text-emerald-400 hover:text-emerald-300'
                          : designContract.typography.listEmphasis,
                      )}
                    >
                      {c.name}
                    </Link>
                    <span
                      className={cn(
                        designContract.typography.meta,
                        'ml-1.5 inline text-slate-500 tabular-nums transition-colors group-hover:text-slate-400',
                      )}
                    >
                      {c.date}
                    </span>
                  </div>

                  {c.editable && (
                    <div className='flex shrink-0 items-center gap-0.5'>
                      <button
                        type='button'
                        title='Edit comment'
                        aria-label='Edit comment'
                        onClick={() => onShowCommentModal(c)}
                        className={actionIconBtn}
                      >
                        <Edit2 size={14} strokeWidth={2} />
                      </button>
                      <button
                        type='button'
                        title='Delete comment'
                        aria-label='Delete comment'
                        onClick={() => deleteComment(c.id)}
                        className={cn(actionIconBtn, 'hover:text-red-400/90')}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    designContract.typography.body,
                    'mt-1.5 leading-relaxed text-pretty break-words text-slate-300',
                  )}
                >
                  <Linkify>{c.message}</Linkify>
                </div>

                {(c.media ?? []).length > 0 && (
                  <div className='mt-2.5'>
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
          </div>
        );
      })}
    </div>
  );
};
