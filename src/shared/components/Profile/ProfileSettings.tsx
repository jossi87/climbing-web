import { useState, type FC } from 'react';
import { useMeta } from '../Meta/context';
import { useProfile, postMedia } from '../../../api';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useAuth0 } from '@auth0/auth0-react';
import { type DropzoneOptions, useDropzone } from 'react-dropzone';
import { Save, X, Upload, Loader2, Globe, Settings as SettingsIcon, Lock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { Card, SectionHeader } from '../../ui';

const ProfileSettings = () => {
  const meta = useMeta();
  const userId = meta.userId ?? -1;
  const { setProfile, setRegion, data } = useProfile(userId);

  if (!data) {
    return (
      <div className='animate-pulse space-y-6' aria-busy aria-label='Loading profile settings'>
        <Card flush className='border-0'>
          <div className='space-y-6 p-4 sm:p-6'>
            <div className='skeleton-bar h-8 w-[min(100%,14rem)] rounded-md' />
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <div className='skeleton-bar-muted h-3 w-20 rounded' />
                <div className='skeleton-bar h-10 w-full rounded-lg' />
              </div>
              <div className='space-y-2'>
                <div className='skeleton-bar-muted h-3 w-20 rounded' />
                <div className='skeleton-bar h-10 w-full rounded-lg' />
              </div>
            </div>
            <div className='skeleton-bar-muted h-12 w-full rounded-lg' />
            <div className='space-y-3'>
              <div className='skeleton-bar-muted h-3 w-12 rounded' />
              <div className='skeleton-bar-muted h-32 w-full rounded-xl border-2 border-dashed' />
            </div>
            <div className='skeleton-bar h-10 w-full rounded-lg sm:w-auto' />
          </div>
        </Card>
        <Card flush className='border-0'>
          <div className='space-y-3 p-4 sm:p-6'>
            <div className='skeleton-bar h-8 w-[min(100%,14rem)] rounded-md' />
            <div className='space-y-2'>
              <div className='skeleton-bar-muted h-5 w-full max-w-xs rounded' />
              <div className='skeleton-bar-muted h-5 w-full max-w-sm rounded' />
              <div className='skeleton-bar-muted h-5 w-full max-w-md rounded' />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const identity = data.identity;

  const ProfileForm: FC<{ identity: typeof identity }> = ({ identity: d }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [firstname, setFirstname] = useState(d?.firstname ?? '');
    const [lastname, setLastname] = useState(d?.lastname ?? '');
    const [emailVisibleToAll, setEmailVisibleToAll] = useState(!!d?.emailVisibleToAll);
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
      firstname !== (d?.firstname ?? '') ||
      lastname !== (d?.lastname ?? '') ||
      emailVisibleToAll !== !!d?.emailVisibleToAll ||
      avatar !== null;

    const isFormValid = firstname.trim() !== '' && lastname.trim() !== '';

    return (
      <div className='space-y-6'>
        <Card flush className='border-0'>
          <section className='p-4 sm:p-6'>
            <SectionHeader title='Settings' icon={SettingsIcon} subheader='Manage your account preferences' />
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
              onClick={async () => {
                setIsSaving(true);
                try {
                  await setProfile({
                    firstname,
                    lastname,
                    emailVisibleToAll,
                  });
                  if (avatar?.file) {
                    const token = await getAccessTokenSilently();
                    await postMedia(
                      token,
                      {
                        userAvatarId: userId,
                        photographer: { id: 0, name: 'Unknown' },
                      } as components['schemas']['Media'],
                      avatar.file,
                    );
                  }
                } finally {
                  setIsSaving(false);
                }
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

        <Card flush className='border-0'>
          <section className='p-4 sm:p-6'>
            <SectionHeader title='Display Regions' icon={Globe} />
            <div className='space-y-1'>
              {(d?.userRegions ?? []).map((region) => {
                const label = region.role ? `${region.name} (${region.role})` : region.name;
                const id = `region-${region.id}`;
                return (
                  <div key={region.id} className='flex items-center gap-3 px-1 py-1.5 sm:px-2'>
                    <input
                      id={id}
                      type='checkbox'
                      disabled={region.readOnly}
                      className='border-surface-border/80 bg-surface-nav text-brand focus:ring-brand-border/60 h-4 w-4 rounded-sm border shadow-[inset_0_0_0_1px_rgba(15,23,42,0.22)] disabled:cursor-default'
                      checked={region.enabled}
                      onChange={(e) => setRegion({ region, del: !e.target.checked })}
                    />
                    <label
                      htmlFor={id}
                      className={cn(
                        'cursor-pointer text-sm font-medium transition-colors',
                        region.enabled ? 'text-slate-200' : 'text-slate-500',
                        region.readOnly && 'cursor-default text-slate-400',
                      )}
                    >
                      {label}
                    </label>
                    {region.readOnly && <Lock size={12} className='shrink-0 text-slate-500' />}
                  </div>
                );
              })}
            </div>
          </section>
        </Card>
      </div>
    );
  };

  return <ProfileForm identity={identity} />;
};

export default ProfileSettings;
