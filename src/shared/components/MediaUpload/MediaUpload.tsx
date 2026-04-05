import { useEffect, useState, useCallback, useRef, type ComponentProps } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film, X, Hash, MessageSquare, Camera, User as UserIcon, Users, Clock, Loader2 } from 'lucide-react';
import VideoEmbedder from './VideoEmbedder';
import { UserSelector } from '../../ui/UserSelector';
import { UsersSelector } from '../../ui/UserSelector';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useMeta } from '../Meta/context';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

export type UploadedMedia = {
  file?: File;
  preview?: string;
} & components['schemas']['NewMedia'];

type Props = {
  onMediaChanged: (newMedia: UploadedMedia[]) => void;
  isMultiPitch: boolean;
};

const different = (a: UploadedMedia, b: UploadedMedia) => {
  return a.preview !== b.preview || a.embedThumbnailUrl !== b.embedThumbnailUrl;
};

const MediaUpload = ({ onMediaChanged, isMultiPitch }: Props) => {
  const meta = useMeta();
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const onMediaChangedRef = useRef(onMediaChanged);
  onMediaChangedRef.current = onMediaChanged;

  useEffect(() => {
    onMediaChangedRef.current(media as UploadedMedia[]);
  }, [media]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsConverting(true);
      try {
        const processedFiles = await Promise.all(
          acceptedFiles.map(async (file) => {
            if (file.type === 'image/heic' || file.type === 'image/heif') {
              const { default: heic2any } = await import('heic2any');
              const result = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8,
              });
              const jpegBlobs = Array.isArray(result) ? result : [result];
              return new File(jpegBlobs, file.name.replace(/\.heic|\.heif/i, '.jpeg'), {
                type: 'image/jpeg',
              });
            }
            return file;
          }),
        );

        setMedia((existing) => [
          ...existing,
          ...processedFiles.map((file) => ({
            file,
            name: file.name,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            photographer: meta?.authenticatedName,
          })),
        ]);
      } finally {
        setIsConverting(false);
      }
    },
    [meta],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/heic': [],
      'image/heif': [],
      'video/mp4': [],
      'video/webm': [],
      'video/quicktime': [],
    },
    noClick: isConverting,
    noKeyboard: isConverting,
  });

  const addMedia = useCallback<ComponentProps<typeof VideoEmbedder>['addMedia']>(
    ({ embedVideoUrl, embedThumbnailUrl, embedMilliseconds }) => {
      setMedia((old) => [...old, { embedVideoUrl, embedThumbnailUrl, embedMilliseconds }]);
    },
    [],
  );

  return (
    <div className='space-y-6 text-left'>
      <div
        {...getRootProps()}
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300',
          isDragActive
            ? 'border-brand-border bg-surface-raised'
            : 'border-surface-border bg-surface-raised hover:border-brand-border hover:bg-surface-raised-hover',
          isConverting && 'pointer-events-none cursor-wait opacity-50',
        )}
      >
        <input {...getInputProps()} />

        {isConverting ? (
          <div className='flex flex-col items-center gap-3'>
            <Loader2 className='animate-spin text-slate-400' size={32} />
            <p className='type-label'>Converting HEIC files...</p>
          </div>
        ) : (
          <>
            <div className='bg-surface-card border-surface-border mb-4 rounded-full border p-4 transition-transform group-hover:scale-110'>
              <Upload className='text-brand' size={24} />
            </div>
            <div className='space-y-1'>
              <p className='type-body font-semibold'>
                {isDragActive ? 'Drop files here...' : 'Click or drag files to upload'}
              </p>
              <p className='text-xs text-slate-500'>Supports JPG, PNG, HEIC and Videos</p>
            </div>
          </>
        )}
      </div>

      <VideoEmbedder addMedia={addMedia} />

      {media.length > 0 && (
        <div className='grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4'>
          {media.map((m) => {
            const key = m.preview ?? m.embedThumbnailUrl ?? m.name;

            const updateItem = (patch: Partial<typeof m>) =>
              setMedia((oldValue) => oldValue.map((item) => (different(item, m) ? item : { ...item, ...patch })));

            let min = 0;
            let sec = 0;
            if (m.embedThumbnailUrl && m.embedMilliseconds && m.embedMilliseconds > 0) {
              min = Math.floor(m.embedMilliseconds / 1000 / 60);
              sec = Math.floor((m.embedMilliseconds / 1000) % 60);
            }

            return (
              <div
                key={key}
                className='bg-surface-card border-surface-border animate-in fade-in zoom-in-95 flex flex-col overflow-hidden rounded-2xl border shadow-xl duration-300'
              >
                <div className='group relative flex aspect-video items-center justify-center bg-black'>
                  {m.preview || m.embedThumbnailUrl ? (
                    <img src={m.preview ?? m.embedThumbnailUrl} className='h-full w-full object-cover' alt='' />
                  ) : (
                    <Film className='opacity-40' size={48} />
                  )}
                  <button
                    onClick={() => setMedia((old) => old.filter((item) => different(m, item)))}
                    className='absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-red-500'
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className='flex-1 space-y-4 p-4'>
                  {isMultiPitch && (
                    <div className='relative'>
                      <Hash className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                      <input
                        type='number'
                        placeholder='Pitch'
                        className='bg-surface-nav border-surface-border type-small focus:border-brand w-full rounded-lg border py-2 pr-3 pl-9 transition-colors focus:outline-none'
                        value={m.pitch ?? ''}
                        onChange={(e) => updateItem({ pitch: +e.target.value })}
                      />
                    </div>
                  )}

                  <div className='relative'>
                    <MessageSquare className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-500' size={14} />
                    <input
                      type='text'
                      placeholder='Description'
                      className='bg-surface-nav border-surface-border type-small focus:border-brand w-full rounded-lg border py-2 pr-3 pl-9 transition-colors focus:outline-none'
                      value={m.description ?? ''}
                      onChange={(e) => updateItem({ description: e.target.value })}
                    />
                  </div>

                  <div className='bg-surface-raised border-surface-border/50 flex items-center justify-between rounded-lg border p-2.5'>
                    <span className={cn('flex items-center gap-2', designContract.typography.label)}>
                      <Camera size={12} /> Trivia
                    </span>
                    <button
                      onClick={() => updateItem({ trivia: !m.trivia })}
                      className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                        m.trivia ? 'bg-brand' : 'bg-slate-700',
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
                          m.trivia ? 'translate-x-4' : 'translate-x-0',
                        )}
                      />
                    </button>
                  </div>

                  <div className='space-y-2'>
                    <div className={cn('flex items-center gap-2', designContract.typography.label)}>
                      <Users size={12} /> People
                    </div>
                    <UsersSelector
                      placeholder='In photo/video'
                      users={m.inPhoto ?? []}
                      onUsersUpdated={(newUsers) => {
                        const inPhoto = newUsers.map((u) => ({
                          id: typeof u.value === 'string' ? -1 : u.value,
                          name: u.label,
                        }));
                        updateItem({ inPhoto });
                      }}
                    />
                  </div>

                  <div className='space-y-2'>
                    <div className={cn('flex items-center gap-2', designContract.typography.label)}>
                      <UserIcon size={12} /> Photographer
                    </div>
                    <UserSelector
                      placeholder='Photographer'
                      defaultValue={m.photographer ?? ''}
                      onUserUpdated={(u) => updateItem({ photographer: u?.label })}
                    />
                  </div>

                  {m.embedThumbnailUrl && (
                    <div className='border-surface-border/50 space-y-3 border-t pt-2'>
                      <div className={cn('flex items-center gap-2', designContract.typography.label)}>
                        <Clock size={12} /> Timestamp
                      </div>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='bg-surface-nav border-surface-border flex items-center overflow-hidden rounded-lg border'>
                          <span className='bg-surface-card border-surface-border border-r px-2 py-2 text-[9px] font-black tracking-widest text-slate-500 uppercase'>
                            Min
                          </span>
                          <input
                            type='number'
                            className='type-small w-full bg-transparent px-2 py-2 focus:outline-none'
                            value={min}
                            onChange={(e) => updateItem({ embedMilliseconds: (+e.target.value * 60 + sec) * 1000 })}
                          />
                        </div>
                        <div className='bg-surface-nav border-surface-border flex items-center overflow-hidden rounded-lg border'>
                          <span className='bg-surface-card border-surface-border border-r px-2 py-2 text-[9px] font-black tracking-widest text-slate-500 uppercase'>
                            Sec
                          </span>
                          <input
                            type='number'
                            className='type-small w-full bg-transparent px-2 py-2 focus:outline-none'
                            value={sec}
                            onChange={(e) => updateItem({ embedMilliseconds: (min * 60 + +e.target.value) * 1000 })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setMedia((old) => old.filter((item) => different(m, item)))}
                  className='type-label w-full border-t border-red-500/10 bg-red-500/5 py-3 text-red-500 transition-all hover:bg-red-500'
                >
                  Remove Item
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
