import { useState, type FormEvent } from 'react';
import MediaUpload, { type UploadedMedia } from '../../shared/components/MediaUpload/MediaUpload';
import { useAuth0 } from '@auth0/auth0-react';
import { postProblemMedia, useProblem } from '../../api';
import { Loading } from '../../shared/components/Widgets/Widgets';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Loader2, ImagePlus } from 'lucide-react';
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
    <div className='mx-auto max-w-2xl space-y-6'>
      <div className='bg-surface-card border-surface-border space-y-4 rounded-xl border p-6 shadow-sm'>
        <div className='border-surface-border mb-4 flex items-center gap-3 border-b pb-4'>
          <div className='bg-brand/10 text-brand rounded-lg p-2'>
            <ImagePlus size={20} />
          </div>
          <h3 className={designContract.typography.subtitle}>Add Media</h3>
        </div>

        <form id='media-form' onSubmit={save}>
          <MediaUpload onMediaChanged={setMedia} isMultiPitch={(problem?.sections ?? []).length > 0} />
        </form>
      </div>

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
