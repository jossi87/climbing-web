import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ChevronRight, ImagePlus, Loader2, Save } from 'lucide-react';
import MediaUpload, { type UploadedMedia } from '../../shared/components/MediaUpload/MediaUpload';
import { postProblemMedia, useProblem } from '../../api';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Card, PageCardBreadcrumbRow } from '../../shared/ui';
import { LockSymbol } from '../../shared/ui/Indicators';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

const ProblemEditMedia = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [media, setMedia] = useState<UploadedMedia[] | null>(null);
  const [saving, setSaving] = useState(false);
  const { problemId } = useParams();
  const navigate = useNavigate();

  const { data: problem, isLoading } = useProblem(+(problemId || '-1'), false);

  function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    getAccessTokenSilently()
      .then((accessToken) => {
        postProblemMedia(accessToken, +(problemId || '-1'), media ?? [])
          .then(async (res) => {
            navigate(`/problem/${res.id}`);
          })
          .catch((error) => {
            console.warn(error);
            setSaving(false);
          });
      })
      .catch(() => setSaving(false));
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='w-full min-w-0 space-y-4'>
      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='p-4 sm:p-5'>
          <PageCardBreadcrumbRow
            breadcrumb={
              <nav
                className={cn(
                  'block min-w-0 text-[11px] leading-relaxed text-pretty break-words text-slate-400 sm:text-[12px] [&>*+*]:ml-1.5',
                )}
              >
                <Link to='/areas' className='inline align-middle transition-colors hover:text-slate-200'>
                  Areas
                </Link>
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                <Link
                  to={problem?.areaId != null ? `/area/${problem.areaId}` : '/areas'}
                  className='inline min-w-0 align-middle transition-colors hover:text-slate-200'
                >
                  {problem?.areaName ?? 'Area'}
                </Link>
                <LockSymbol
                  lockedAdmin={!!problem?.areaLockedAdmin}
                  lockedSuperadmin={!!problem?.areaLockedSuperadmin}
                />
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                <Link
                  to={problem?.sectorId != null ? `/sector/${problem.sectorId}` : '/areas'}
                  className='inline min-w-0 align-middle transition-colors hover:text-slate-200'
                >
                  {problem?.sectorName ?? 'Sector'}
                </Link>
                <LockSymbol
                  lockedAdmin={!!problem?.sectorLockedAdmin}
                  lockedSuperadmin={!!problem?.sectorLockedSuperadmin}
                />
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                <Link
                  to={problemId ? `/problem/${problemId}` : '/areas'}
                  className='inline min-w-0 align-middle transition-colors hover:text-slate-200'
                >
                  {problem?.nr != null && problem?.name ? (
                    <span className='font-medium text-slate-400'>
                      <span className={cn(designContract.typography.meta, 'font-mono text-slate-500 tabular-nums')}>
                        #{problem.nr}
                      </span>{' '}
                      {problem.name}
                    </span>
                  ) : (
                    'Problem'
                  )}
                </Link>
                <LockSymbol lockedAdmin={!!problem?.lockedAdmin} lockedSuperadmin={!!problem?.lockedSuperadmin} />
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                <span className='inline-flex items-center gap-1.5 align-middle font-medium text-slate-400'>
                  <ImagePlus size={12} className='shrink-0 text-slate-500' strokeWidth={2.25} />
                  Add media
                </span>
              </nav>
            }
          />
          <div className='mt-4 border-t border-white/8 pt-4'>
            <h1 className={cn(designContract.typography.subtitle, 'text-slate-100')}>Upload photos or video</h1>
            {problem?.name ? (
              <p className={cn(designContract.typography.meta, 'mt-1 text-slate-500')}>{problem.name}</p>
            ) : null}
          </div>
          <form id='media-form' className='mt-4' onSubmit={save}>
            <MediaUpload onMediaChanged={setMedia} isMultiPitch={(problem?.sections ?? []).length > 0} />
          </form>
        </div>
      </Card>

      <div className='flex flex-wrap items-center justify-end gap-3'>
        <button
          type='button'
          onClick={() => navigate(problemId ? `/problem/${problemId}` : '/areas')}
          className={cn(
            designContract.surfaces.inlineChipInteractive,
            'px-4 py-2 text-[12px] font-semibold sm:text-[13px]',
          )}
        >
          Cancel
        </button>
        <button
          form='media-form'
          type='submit'
          disabled={saving}
          className={cn(designContract.controls.savePrimary, 'px-6 py-2.5 text-[12px] font-semibold sm:text-[13px]')}
        >
          {saving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} strokeWidth={2.25} />}
          Save
        </button>
      </div>
    </div>
  );
};

export default ProblemEditMedia;
