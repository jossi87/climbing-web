import { useState, type FormEvent } from 'react';
import MediaUpload, { type UploadedMedia } from './common/media-upload/media-upload';
import { useAuth0 } from '@auth0/auth0-react';
import { postProblemMedia, useProblem } from '../api';
import { Loading } from './common/widgets/widgets';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Loader2, ImagePlus } from 'lucide-react';
import { cn } from '../lib/utils';

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
    <div className='max-w-2xl mx-auto space-y-6'>
      <div className='bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm space-y-4'>
        <div className='flex items-center gap-3 border-b border-surface-border pb-4 mb-4'>
          <div className='p-2 bg-brand/10 rounded-lg text-brand'>
            <ImagePlus size={20} />
          </div>
          <h3 className='text-lg font-black text-white uppercase tracking-tight'>Add Media</h3>
        </div>

        <form id='media-form' onSubmit={save}>
          <MediaUpload
            onMediaChanged={setMedia}
            isMultiPitch={(problem?.sections ?? []).length > 0}
          />
        </form>
      </div>

      <div className='flex items-center justify-end gap-3'>
        <button
          type='button'
          onClick={() => navigate(`/problem/${problemId}`)}
          className='px-6 py-2.5 bg-surface-nav border border-surface-border hover:bg-surface-hover text-slate-300 rounded-lg text-xs font-black uppercase tracking-widest transition-all'
        >
          Cancel
        </button>
        <button
          form='media-form'
          type='submit'
          disabled={saving}
          className={cn(
            'flex items-center gap-2 px-8 py-2.5 bg-brand hover:bg-brand/90 disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand/20',
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
