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
    <div className='divide-surface-border/35 divide-y text-left'>
      {comments.map((c) => {
        let statusBadge: JSX.Element | null = null;
        if (c.danger) {
          statusBadge = (
            <div className='mt-3 inline-flex items-center gap-1.5 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-500 uppercase'>
              <AlertTriangle size={12} /> Flagged as dangerous
            </div>
          );
        } else if (c.resolved) {
          statusBadge = (
            <div className='mt-3 inline-flex items-center gap-1.5 rounded border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] font-bold text-green-500 uppercase'>
              <CheckCircle size={12} /> Flagged as safe
            </div>
          );
        } else if (meta.isAuthenticated && meta.isClimbing) {
          statusBadge = (
            <button
              type='button'
              onClick={() => flagAsDangerous(c)}
              className='bg-surface-nav border-surface-border mt-3 inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-bold text-slate-500 uppercase transition-all hover:border-red-500/50 hover:text-red-500'
            >
              <Flag size={12} /> Flag as dangerous
            </button>
          );
        }

        return (
          <div key={c.id} className='group flex items-start gap-3 py-3 first:pt-0 last:pb-0'>
            <div className='mt-0.5 shrink-0'>
              <ClickableAvatar name={c.name} mediaId={c.mediaId} mediaVersionStamp={c.mediaVersionStamp} size='tiny' />
            </div>

            <div className='min-w-0 flex-1'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <Link
                    to={`/user/${c.idUser}`}
                    className={cn(
                      designContract.typography.body,
                      'font-semibold text-slate-200 transition-colors hover:text-slate-100',
                    )}
                  >
                    {c.name}
                  </Link>
                  <div className={cn(designContract.typography.meta, 'mt-0.5 text-slate-500 tabular-nums')}>
                    {c.date}
                  </div>
                </div>

                {c.editable && (
                  <div className='bg-surface-nav border-surface-border flex items-center overflow-hidden rounded-md border opacity-0 transition-opacity group-hover:opacity-100'>
                    <button
                      type='button'
                      onClick={() => onShowCommentModal(c)}
                      className='hover:bg-surface-hover p-1.5 opacity-70 transition-colors hover:opacity-100'
                    >
                      <Edit2 size={14} />
                    </button>
                    <div className='bg-surface-border h-4 w-px' />
                    <button
                      type='button'
                      onClick={() => deleteComment(c.id)}
                      className='hover:bg-surface-hover p-1.5 opacity-70 transition-colors hover:text-red-500 hover:opacity-100'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className={cn('mt-1.5 leading-relaxed wrap-break-word', designContract.typography.body)}>
                <Linkify>{c.message}</Linkify>
              </div>

              {(c.media ?? []).length > 0 && (
                <div className='mt-3'>
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
  );
};
