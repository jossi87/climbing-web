import { useState, type FC } from 'react';
import { useProfile } from '../../../api';
import { type DropzoneOptions, useDropzone } from 'react-dropzone';
import { Save, X, Upload, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const ProfileSettings = () => {
  const { setProfile, setRegion, data } = useProfile();

  if (!data) {
    return (
      <div className='p-8 text-center text-slate-500 animate-pulse bg-surface-nav/20 rounded-xl border border-surface-border'>
        Loading...
      </div>
    );
  }

  const ProfileForm: FC<{ data: typeof data }> = ({ data: d }) => {
    const [firstname, setFirstname] = useState(d.firstname ?? '');
    const [lastname, setLastname] = useState(d.lastname ?? '');
    const [emailVisibleToAll, setEmailVisibleToAll] = useState(!!d.emailVisibleToAll);
    const [avatar, setAvatar] = useState<{ file: File; preview: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onDrop: DropzoneOptions['onDrop'] = (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setAvatar({
          file: acceptedFiles[0],
          preview: URL.createObjectURL(acceptedFiles[0]),
        });
      }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      maxFiles: 1,
      accept: { 'image/jpeg': [], 'image/png': [] },
    });

    const hasChanges =
      firstname !== (d.firstname ?? '') ||
      lastname !== (d.lastname ?? '') ||
      emailVisibleToAll !== !!d.emailVisibleToAll ||
      avatar !== null;

    const isFormValid = firstname.trim() !== '' && lastname.trim() !== '';

    return (
      <div className='space-y-6'>
        {/* Main Profile Info */}
        <section className='bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
                First Name
              </label>
              <input
                type='text'
                className='w-full bg-surface-nav border border-surface-border rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors'
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
                Last Name
              </label>
              <input
                type='text'
                className='w-full bg-surface-nav border border-surface-border rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand transition-colors'
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
          </div>

          <div className='flex items-center gap-3 mb-8 p-3 bg-surface-nav/30 rounded-lg border border-surface-border/50'>
            <input
              id='email-visibility'
              type='checkbox'
              className='w-4 h-4 rounded border-surface-border text-brand focus:ring-brand bg-surface-nav'
              checked={emailVisibleToAll}
              onChange={(e) => setEmailVisibleToAll(e.target.checked)}
            />
            <label htmlFor='email-visibility' className='text-sm text-slate-300 cursor-pointer'>
              Allow others to contact me by email
            </label>
          </div>

          <div className='space-y-3 mb-8'>
            <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
              Avatar
            </label>
            {avatar ? (
              <div className='relative w-32 h-32 group'>
                <img
                  src={avatar.preview}
                  className='w-full h-full object-cover rounded-xl border-2 border-brand/50'
                  alt='Preview'
                />
                <button
                  onClick={() => setAvatar(null)}
                  className='absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors'
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                  isDragActive
                    ? 'border-brand bg-brand/5'
                    : 'border-surface-border bg-surface-nav/20 hover:border-slate-500',
                )}
              >
                <input {...getInputProps()} />
                <Upload className='mx-auto mb-2 text-slate-500' size={24} />
                <p className='text-xs text-slate-400'>
                  {isDragActive ? 'Drop image here' : 'Drop avatar here, or click to select'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setIsSaving(true);
              setProfile({
                firstname,
                lastname,
                emailVisibleToAll,
                avatarFile: avatar?.file,
              });
            }}
            disabled={!hasChanges || !isFormValid || isSaving}
            className='flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-2.5 bg-brand hover:bg-brand/90 disabled:bg-surface-nav disabled:text-slate-600 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-brand/20 disabled:shadow-none'
          >
            {isSaving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
            Save Profile
          </button>
        </section>

        {/* Regions Settings */}
        <section className='bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm'>
          <h4 className='text-sm font-bold text-white mb-4'>Display Regions</h4>
          <div className='space-y-4'>
            {(d.userRegions ?? []).map((region) => {
              const label = region.role ? `${region.name} (${region.role})` : region.name;
              const id = `region-${region.id}`;
              return (
                <div key={region.id} className='flex items-center gap-3'>
                  <input
                    id={id}
                    type='checkbox'
                    disabled={region.readOnly}
                    className='w-4 h-4 rounded border-surface-border text-brand focus:ring-brand bg-surface-nav disabled:opacity-30'
                    checked={region.enabled}
                    onChange={(e) => setRegion({ region, del: !e.target.checked })}
                  />
                  <label
                    htmlFor={id}
                    className={cn(
                      'text-sm cursor-pointer transition-colors',
                      region.enabled ? 'text-slate-200' : 'text-slate-500',
                      region.readOnly && 'cursor-not-allowed italic',
                    )}
                  >
                    {label}
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  return <ProfileForm data={data} />;
};

export default ProfileSettings;
