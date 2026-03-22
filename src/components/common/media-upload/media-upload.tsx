import { useEffect, useState, useCallback, type ComponentProps } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Film,
  X,
  Hash,
  MessageSquare,
  Camera,
  User as UserIcon,
  Users,
  Clock,
  Loader2,
} from 'lucide-react';
import VideoEmbedder from './video-embedder';
import { UserSelector } from '../user-selector/user-selector';
import { UsersSelector } from '../user-selector/user-selector';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useMeta } from '../meta/context';
import { cn } from '../../../lib/utils';

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

  useEffect(() => {
    onMediaChanged(media as UploadedMedia[]);
  }, [media, onMediaChanged]);

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
          'relative group cursor-pointer p-8 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center text-center',
          isDragActive
            ? 'border-brand bg-brand/5'
            : 'border-surface-border bg-surface-nav/30 hover:border-brand/50 hover:bg-surface-nav/50',
          isConverting && 'opacity-50 cursor-wait pointer-events-none',
        )}
      >
        <input {...getInputProps()} />

        {isConverting ? (
          <div className='flex flex-col items-center gap-3'>
            <Loader2 className='text-brand animate-spin' size={32} />
            <p className='text-sm font-bold text-white uppercase tracking-widest'>
              Converting HEIC files...
            </p>
          </div>
        ) : (
          <>
            <div className='p-4 rounded-full bg-surface-card border border-surface-border mb-4 group-hover:scale-110 transition-transform'>
              <Upload className='text-brand' size={24} />
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-bold text-white'>
                {isDragActive ? 'Drop files here...' : 'Click or drag files to upload'}
              </p>
              <p className='text-xs text-slate-500'>Supports JPG, PNG, HEIC and Videos</p>
            </div>
          </>
        )}
      </div>

      <VideoEmbedder addMedia={addMedia} />

      {media.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {media.map((m) => {
            const key = m.preview ?? m.embedThumbnailUrl ?? m.name;

            const updateItem = (patch: Partial<typeof m>) =>
              setMedia((oldValue) =>
                oldValue.map((item) => (different(item, m) ? item : { ...item, ...patch })),
              );

            let min = 0;
            let sec = 0;
            if (m.embedThumbnailUrl && m.embedMilliseconds && m.embedMilliseconds > 0) {
              min = Math.floor(m.embedMilliseconds / 1000 / 60);
              sec = Math.floor((m.embedMilliseconds / 1000) % 60);
            }

            return (
              <div
                key={key}
                className='bg-surface-card border border-surface-border rounded-2xl overflow-hidden flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-300'
              >
                <div className='aspect-video relative bg-black flex items-center justify-center group'>
                  {m.preview || m.embedThumbnailUrl ? (
                    <img
                      src={m.preview ?? m.embedThumbnailUrl}
                      className='w-full h-full object-cover'
                      alt=''
                    />
                  ) : (
                    <Film className='text-slate-700' size={48} />
                  )}
                  <button
                    onClick={() => setMedia((old) => old.filter((item) => different(m, item)))}
                    className='absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white/70 hover:text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100'
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className='p-4 space-y-4 flex-1'>
                  {isMultiPitch && (
                    <div className='relative'>
                      <Hash
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
                        size={14}
                      />
                      <input
                        type='number'
                        placeholder='Pitch'
                        className='w-full bg-surface-nav border border-surface-border rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-brand transition-colors'
                        value={m.pitch ?? ''}
                        onChange={(e) => updateItem({ pitch: +e.target.value })}
                      />
                    </div>
                  )}

                  <div className='relative'>
                    <MessageSquare
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
                      size={14}
                    />
                    <input
                      type='text'
                      placeholder='Description'
                      className='w-full bg-surface-nav border border-surface-border rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-brand transition-colors'
                      value={m.description ?? ''}
                      onChange={(e) => updateItem({ description: e.target.value })}
                    />
                  </div>

                  <div className='flex items-center justify-between p-2.5 bg-surface-nav/30 rounded-lg border border-surface-border/50'>
                    <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2'>
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
                    <div className='flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
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
                    <div className='flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                      <UserIcon size={12} /> Photographer
                    </div>
                    <UserSelector
                      placeholder='Photographer'
                      defaultValue={m.photographer ?? ''}
                      onUserUpdated={(u) => updateItem({ photographer: u?.label })}
                    />
                  </div>

                  {m.embedThumbnailUrl && (
                    <div className='space-y-3 pt-2 border-t border-surface-border/50'>
                      <div className='flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                        <Clock size={12} /> Timestamp
                      </div>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='flex items-center bg-surface-nav border border-surface-border rounded-lg overflow-hidden'>
                          <span className='bg-surface-card px-2 py-2 text-[9px] font-black text-slate-500 border-r border-surface-border uppercase tracking-widest'>
                            Min
                          </span>
                          <input
                            type='number'
                            className='w-full bg-transparent py-2 px-2 text-xs text-white focus:outline-none'
                            value={min}
                            onChange={(e) =>
                              updateItem({ embedMilliseconds: (+e.target.value * 60 + sec) * 1000 })
                            }
                          />
                        </div>
                        <div className='flex items-center bg-surface-nav border border-surface-border rounded-lg overflow-hidden'>
                          <span className='bg-surface-card px-2 py-2 text-[9px] font-black text-slate-500 border-r border-surface-border uppercase tracking-widest'>
                            Sec
                          </span>
                          <input
                            type='number'
                            className='w-full bg-transparent py-2 px-2 text-xs text-white focus:outline-none'
                            value={sec}
                            onChange={(e) =>
                              updateItem({ embedMilliseconds: (min * 60 + +e.target.value) * 1000 })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setMedia((old) => old.filter((item) => different(m, item)))}
                  className='w-full py-3 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all border-t border-red-500/10'
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
