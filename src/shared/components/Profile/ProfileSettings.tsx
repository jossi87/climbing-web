import { useState, type FC } from 'react';
import { useProfile } from '../../../api';
import { type DropzoneOptions, useDropzone } from 'react-dropzone';
import { Save, X, Upload, Loader2, Globe } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { Card, SectionHeader } from '../../ui';

const ProfileSettings = () => {
  const { setProfile, setRegion, data } = useProfile();

  if (!data) {
    return (
      <Card flush className='border-0 sm:border'>
        <div className='animate-pulse space-y-5 p-8 sm:p-10' aria-busy aria-label='Loading profile settings'>
          <div className='skeleton-bar h-8 w-[min(100%,14rem)] rounded-md' />
          <div className='space-y-2.5'>
            <div className='skeleton-bar-muted h-3 w-full max-w-md rounded' />
            <div className='skeleton-bar-muted h-3 w-[88%] max-w-lg rounded' />
            <div className='skeleton-bar-muted h-3 w-[72%] max-w-sm rounded' />
          </div>
          <div className='skeleton-bar-muted mx-auto h-10 w-full max-w-xs rounded-lg' />
        </div>
      </Card>
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
        <Card flush className='border-0 sm:border'>
          <section className='p-4 sm:p-6'>
            <div className='mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <label className={cn('ml-1', designContract.typography.label)}>First Name</label>
                <input
                  type='text'
                  className='bg-surface-nav border-surface-border type-body focus:border-brand w-full rounded-lg border px-4 py-2.5 transition-colors focus:outline-none'
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <label className={cn('ml-1', designContract.typography.label)}>Last Name</label>
                <input
                  type='text'
                  className='bg-surface-nav border-surface-border type-body focus:border-brand w-full rounded-lg border px-4 py-2.5 transition-colors focus:outline-none'
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>
            </div>

            <div className='bg-surface-raised border-surface-border/50 mb-8 flex items-center gap-3 rounded-lg border p-3'>
              <input
                id='email-visibility'
                type='checkbox'
                className='border-surface-border bg-surface-nav text-brand focus:ring-brand-border/60 h-4 w-4 rounded'
                checked={emailVisibleToAll}
                onChange={(e) => setEmailVisibleToAll(e.target.checked)}
              />
              <label htmlFor='email-visibility' className='cursor-pointer text-sm text-slate-300'>
                Allow others to contact me by email
              </label>
            </div>

            <div className='mb-8 space-y-3'>
              <label className={cn('ml-1', designContract.typography.label)}>Avatar</label>
              {avatar ? (
                <div className='group relative h-32 w-32'>
                  <img
                    src={avatar.preview}
                    className='border-brand-border h-full w-full rounded-xl border-2 object-cover'
                    alt='Preview'
                  />
                  <button
                    onClick={() => setAvatar(null)}
                    className='absolute -top-2 -right-2 rounded-full bg-red-500 p-1 shadow-lg transition-colors hover:bg-red-600'
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={cn(
                    'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all',
                    isDragActive
                      ? 'border-brand-border bg-surface-raised'
                      : 'border-surface-border bg-surface-card hover:border-slate-500',
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
              className={cn(
                designContract.controls.savePrimaryModal,
                'disabled:bg-surface-nav flex w-full shadow-lg transition-all disabled:shadow-none sm:w-auto',
              )}
            >
              {isSaving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
              Save Profile
            </button>
          </section>
        </Card>

        <Card flush className='border-0 sm:border'>
          <section className='p-4 sm:p-6'>
            <SectionHeader title='Display Regions' icon={Globe} subheader='Choose visible regions' />
            <div className='border-surface-border divide-surface-border/60 bg-surface-card divide-y rounded-xl border'>
              {(d.userRegions ?? []).map((region) => {
                const label = region.role ? `${region.name} (${region.role})` : region.name;
                const id = `region-${region.id}`;
                return (
                  <div key={region.id} className='flex items-center gap-3 px-3 py-2.5 sm:px-4'>
                    <input
                      id={id}
                      type='checkbox'
                      disabled={region.readOnly}
                      className='border-surface-border bg-surface-nav text-brand focus:ring-brand-border/60 h-4 w-4 rounded disabled:opacity-30'
                      checked={region.enabled}
                      onChange={(e) => setRegion({ region, del: !e.target.checked })}
                    />
                    <label
                      htmlFor={id}
                      className={cn(
                        'cursor-pointer text-sm font-medium transition-colors',
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
        </Card>
      </div>
    );
  };

  return <ProfileForm data={data} />;
};

export default ProfileSettings;
