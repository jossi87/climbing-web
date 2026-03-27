import { useState, type FormEvent } from 'react';
import MediaUpload, { type UploadedMedia } from '../../shared/components/MediaUpload/MediaUpload';
import { useAuth0 } from '@auth0/auth0-react';
import { postProblemMedia, useProblem } from '../../api';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Loader2, ImagePlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, SectionHeader } from '../../shared/ui';

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
          <SectionHeader title='Add Media' icon={ImagePlus} subheader={problem?.name ?? undefined} />
          <form id='media-form' onSubmit={save}>
            <MediaUpload onMediaChanged={setMedia} isMultiPitch={(problem?.sections ?? []).length > 0} />
          </form>
        </div>
      </Card>

      <div className='flex items-center justify-end gap-3'>
        <button
          type='button'
          onClick={() => navigate(`/problem/${problemId}`)}
          className='bg-surface-nav border-surface-border hover:bg-surface-hover type-label rounded-lg border px-6 py-2.5 opacity-85 transition-all hover:opacity-100'
        >
          Cancel
        </button>
        <button
          form='media-form'
          type='submit'
          disabled={saving}
          className={cn(
            'bg-brand hover:bg-brand/90 shadow-brand/20 type-label flex items-center gap-2 rounded-lg px-8 py-2.5 shadow-lg transition-all disabled:opacity-50',
            saving && 'cursor-not-allowed',
          )}
        >
          {saving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
          Save
        </button>
      </div>
    </div>
  );
};

export default ProblemEditMedia;
