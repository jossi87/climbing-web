import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAccessToken, useProblem, postComment, invalidateProblemQueries } from '../../../api';
import Media from '../../../shared/components/Media/Media';
import { ClickableAvatar } from '../../../shared/ui/Avatar/Avatar';
import { useMeta } from '../../../shared/components/Meta/context';
import Linkify from 'linkify-react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AlertTriangle, ShieldCheck, Edit2, Trash2, Flag } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickFlags,
  tickProblemLink,
} from '../../../shared/components/Profile/profileRowTypography';

const rowShell = 'px-3 py-1.5 sm:px-4 sm:py-2';

const actionIconBtn =
  'rounded-md p-1.5 text-slate-500 transition-colors hover:bg-surface-raised-hover hover:text-slate-300';

const hseIconBtn =
  'ml-1 inline-flex shrink-0 items-center rounded p-0.5 text-slate-500 transition-colors hover:bg-surface-raised-hover hover:text-status-danger';

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
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { data } = useProblem(+problemId, showHiddenMedia);

  function flagAsDangerous({ id, message }: { id?: number; message?: string | null }) {
    if (!id || !message) return;
    const pid = data?.id;
    if (!pid) return;
    if (confirm('Are you sure you want to flag this comment?')) {
      postComment(accessToken, id, pid, message, true, false, false, [])
        .then(() => {
          void invalidateProblemQueries(queryClient, pid);
        })
        .catch((error) => {
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
      postComment(accessToken, id, pid, null, false, false, true, [])
        .then(() => {
          void invalidateProblemQueries(queryClient, pid);
        })
        .catch((error) => {
          console.warn(error);
          alert(error.toString());
        });
    }
  }

  const comments = data?.comments ?? [];
  const sections = data?.sections ?? [];

  if (comments.length === 0) return null;

  return (
    <div className='flex flex-col gap-3 text-left sm:gap-3.5'>
      {comments.map((c) => {
        const isOwn = !!c.editable;
        const showFlagAction = !c.danger && !c.resolved && meta.isAuthenticated && meta.isClimbing;

        return (
          <div key={c.id} className={rowShell}>
            <div className='flex items-start gap-2 sm:gap-2.5'>
              <div className='shrink-0'>
                <ClickableAvatar
                  name={c.name}
                  mediaId={c.mediaId}
                  mediaVersionStamp={c.mediaVersionStamp}
                  size='tiny'
                  className={cn(isOwn && 'border-emerald-400/30 ring-1 ring-emerald-400/20')}
                />
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex min-w-0 flex-wrap items-start gap-x-2 gap-y-0.5'>
                  <div
                    className={cn(
                      profileRowRootClass,
                      'min-w-0 flex-1 leading-snug text-pretty [overflow-wrap:anywhere]',
                    )}
                  >
                    <Link
                      to={`/user/${c.idUser}`}
                      className={cn(tickProblemLink, isOwn && 'text-emerald-400 hover:text-emerald-300')}
                    >
                      {c.name}
                    </Link>
                    <span className={cn(tickFlags, 'ml-1.5 inline text-slate-500 tabular-nums')}>{c.date}</span>
                    {c.danger ? (
                      <span
                        className={cn(
                          'ml-1.5 inline-flex shrink-0 translate-y-px items-center opacity-90',
                          designContract.ascentStatus.dangerous,
                        )}
                        title='Flagged as dangerous'
                        aria-label='Comment flagged as dangerous'
                      >
                        <AlertTriangle size={12} strokeWidth={2.25} aria-hidden />
                      </span>
                    ) : c.resolved ? (
                      <span
                        className='ml-1.5 inline-flex shrink-0 translate-y-px items-center text-emerald-400/90'
                        title='Flagged as safe'
                        aria-label='Comment flagged as safe'
                      >
                        <ShieldCheck size={12} strokeWidth={2.25} aria-hidden />
                      </span>
                    ) : showFlagAction ? (
                      <button
                        type='button'
                        title='Flag as dangerous'
                        aria-label='Flag this comment as dangerous'
                        onClick={() => flagAsDangerous(c)}
                        className={hseIconBtn}
                      >
                        <Flag size={12} strokeWidth={2.25} />
                      </button>
                    ) : null}
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
                    tickCommentSmall,
                    'mt-0.5 leading-snug text-pretty break-words text-slate-50 not-italic sm:leading-relaxed',
                  )}
                >
                  <Linkify>{c.message}</Linkify>
                </div>

                {(c.media ?? []).length > 0 && (
                  <div className='mt-2'>
                    <Media
                      pitches={sections}
                      media={c.media ?? []}
                      orderableMedia={orderableMedia}
                      carouselMedia={carouselMedia}
                      optProblemId={null}
                      showLocation={false}
                      compactTiles
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
