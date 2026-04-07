import { useEffect, useState, useCallback, useRef, type ComponentProps } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film, X, Hash, MessageSquare, Camera, User as UserIcon, Users, Clock, Loader2 } from 'lucide-react';
import VideoEmbedder from './VideoEmbedder';
import { UserSelector } from '../../ui/UserSelector';
import { UsersSelector } from '../../ui/UserSelector';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useMeta } from '../Meta/context';
import { cn } from '../../../lib/utils';
import { FormSwitch } from '../../ui';
import { captureVideoPosterFrame } from '../../../utils/captureVideoPosterFrame';

export type UploadedMedia = {
  file?: File;
  preview?: string;
} & components['schemas']['NewMedia'];

type Props = {
  onMediaChanged: (newMedia: UploadedMedia[]) => void;
  isMultiPitch: boolean;
  /**
   * `modal`: parent is narrow (e.g. comment modal). Avoid viewport-based `lg:grid-cols-4` — it squeezes cards
   * when the modal is `max-w-2xl` but the viewport is wide. Use full-width rows + roomier selects.
   */
  variant?: 'default' | 'modal';
};

const different = (a: UploadedMedia, b: UploadedMedia) => {
  return a.preview !== b.preview || a.embedThumbnailUrl !== b.embedThumbnailUrl;
};

/** Icon-led fields: one visual rhythm for native inputs + react-select (compact). */
const fieldIcon = 'pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-slate-500';
/** Single focus cue (border only) + placeholder fades while focused so it doesn’t stack with the caret. */
const inputLeadClass =
  'bg-surface-nav placeholder:text-slate-500/85 h-9 w-full rounded-lg border border-surface-border/80 py-0 pr-2 pl-8 text-[13px] leading-none outline-none transition-[color,background-color,border-color,opacity] duration-100 focus:border-brand focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:transition-opacity focus:placeholder:opacity-0 sm:pl-9 sm:text-sm';
const timestampInputClass =
  'placeholder:text-slate-500/85 min-w-0 flex-1 bg-transparent px-1.5 py-1.5 text-[13px] outline-none transition-[border-color,opacity] duration-100 focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:transition-opacity focus:placeholder:opacity-0 sm:px-2';

const MediaUpload = ({ onMediaChanged, isMultiPitch, variant = 'default' }: Props) => {
  const isModal = variant === 'modal';
  const mediaGridClass = isModal
    ? 'grid grid-cols-1 gap-3 pt-2 sm:gap-4 sm:pt-4'
    : 'grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 sm:gap-4 sm:pt-4 lg:grid-cols-4';
  /** In modals, `compact` react-select is too tight for typing names; full control height matches caption field. */
  const userSelectCompact = !isModal;
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

        const newItems = await Promise.all(
          processedFiles.map(async (file) => {
            let preview: string | undefined;
            if (file.type.startsWith('image/')) {
              preview = URL.createObjectURL(file);
            } else if (file.type.startsWith('video/')) {
              preview = (await captureVideoPosterFrame(file)) ?? undefined;
            }
            return {
              file,
              name: file.name,
              preview,
              photographer: meta?.authenticatedName,
            };
          }),
        );

        setMedia((existing) => [...existing, ...newItems]);
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
      setMedia((old) => [
        ...old,
        {
          embedVideoUrl,
          embedThumbnailUrl,
          embedMilliseconds,
          photographer: meta?.authenticatedName,
        },
      ]);
    },
    [meta],
  );

  return (
    <div className='space-y-4 text-left sm:space-y-6'>
      <div
        {...getRootProps()}
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all duration-300 sm:rounded-2xl sm:p-8',
          isDragActive
            ? 'border-brand-border bg-surface-raised'
            : 'border-surface-border bg-surface-raised hover:border-brand-border hover:bg-surface-raised-hover',
          isConverting && 'pointer-events-none cursor-wait opacity-50',
        )}
      >
        <input {...getInputProps()} />

        {isConverting ? (
          <div className='flex flex-col items-center gap-2 sm:gap-3'>
            <Loader2 className='animate-spin text-slate-400' size={28} />
            <p className='type-label'>Preparing media…</p>
          </div>
        ) : (
          <>
            <div className='bg-surface-card border-surface-border mb-2 rounded-full border p-2.5 transition-transform group-hover:scale-105 sm:mb-4 sm:p-4 sm:group-hover:scale-110'>
              <Upload className='text-brand' size={20} />
            </div>
            <div className='space-y-0.5 sm:space-y-1'>
              <p className='text-[13px] leading-snug font-semibold text-slate-200 sm:text-base sm:leading-relaxed'>
                {isDragActive ? 'Drop here' : 'Tap or drop to upload'}
              </p>
              <p className='text-[11px] leading-tight text-slate-500 sm:text-xs'>JPG, PNG, HEIC, MP4…</p>
            </div>
          </>
        )}
      </div>

      <VideoEmbedder addMedia={addMedia} />

      {media.length > 0 && (
        <div className={mediaGridClass}>
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
                className='bg-surface-card border-surface-border animate-in fade-in zoom-in-95 flex flex-col overflow-hidden rounded-xl border shadow-md duration-300 sm:rounded-2xl sm:shadow-xl'
              >
                <div className='group relative aspect-video w-full overflow-hidden bg-black'>
                  {m.preview || m.embedThumbnailUrl ? (
                    <img src={m.preview ?? m.embedThumbnailUrl} className='h-full w-full object-cover' alt='' />
                  ) : m.file?.type?.startsWith('video/') ? (
                    <div className='flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-slate-800 to-slate-950 px-3 text-center'>
                      <Film className='text-slate-500' size={36} aria-hidden />
                      <p className='text-[12px] font-medium text-slate-300'>Preview shortly</p>
                      <p className='text-[11px] leading-snug text-slate-500'>
                        Can’t preview this file — it will still upload, and a thumbnail will appear after processing.
                      </p>
                    </div>
                  ) : (
                    <div className='flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-b from-slate-800 to-slate-950 px-3 text-center'>
                      <Film className='text-slate-500 opacity-50' size={40} aria-hidden />
                      <p className='text-[11px] text-slate-500'>No preview</p>
                    </div>
                  )}
                  <button
                    type='button'
                    onClick={() => setMedia((old) => old.filter((item) => different(m, item)))}
                    className='type-on-accent absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 shadow-md ring-1 ring-white/25 transition hover:bg-red-500 active:scale-95'
                    aria-label='Remove this item'
                  >
                    <X size={16} strokeWidth={2.5} className='shrink-0' aria-hidden />
                  </button>
                </div>

                <div className='flex-1 space-y-1.5 p-2.5 sm:space-y-2.5 sm:p-3'>
                  {isMultiPitch && (
                    <div className='relative min-w-0'>
                      <Hash className={fieldIcon} size={13} aria-hidden />
                      <input
                        type='number'
                        placeholder='Pitch #'
                        className={inputLeadClass}
                        value={m.pitch ?? ''}
                        onChange={(e) => updateItem({ pitch: +e.target.value })}
                      />
                    </div>
                  )}

                  <div className='relative min-w-0'>
                    <MessageSquare className={fieldIcon} size={13} aria-hidden />
                    <input
                      type='text'
                      placeholder='Caption (optional)'
                      className={inputLeadClass}
                      value={m.description ?? ''}
                      onChange={(e) => updateItem({ description: e.target.value })}
                    />
                  </div>

                  <div className='flex items-center justify-between gap-3 py-0.5'>
                    <div className='flex min-w-0 flex-1 items-center gap-2'>
                      <Camera size={14} className='mt-[1px] shrink-0 text-slate-500' aria-hidden />
                      <p className='text-[13px] leading-tight font-medium text-slate-200'>Trivia</p>
                    </div>
                    <FormSwitch
                      checked={!!m.trivia}
                      onChange={() => updateItem({ trivia: !m.trivia })}
                      variant='brand'
                      aria-label={m.trivia ? 'Trivia on' : 'Trivia off'}
                    />
                  </div>

                  <div className='flex min-w-0 items-center gap-1.5'>
                    <Users size={14} className='mt-[3px] shrink-0 self-start text-slate-500' aria-hidden />
                    <UsersSelector
                      compact={userSelectCompact}
                      matchInputLeadStyle
                      placeholder='People in shot'
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

                  <div className='flex min-w-0 items-center gap-1.5'>
                    <UserIcon size={14} className='mt-[3px] shrink-0 self-start text-slate-500' aria-hidden />
                    <UserSelector
                      compact={userSelectCompact}
                      matchInputLeadStyle
                      placeholder='Photographer'
                      value={m.photographer}
                      onUserUpdated={(u) => updateItem({ photographer: u?.label })}
                    />
                  </div>

                  {m.embedThumbnailUrl && (
                    <div className='border-surface-border/30 flex items-center gap-1.5 border-t border-dashed pt-1.5'>
                      <Clock size={14} className='mt-[3px] shrink-0 self-start text-slate-500' aria-hidden />
                      <div className='grid min-w-0 flex-1 grid-cols-2 gap-2'>
                        <label className='bg-surface-nav border-surface-border/80 focus-within:border-brand flex min-h-0 min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border px-1.5 py-0.5 transition-colors'>
                          <span className='w-8 shrink-0 text-center text-[10px] font-semibold text-slate-500'>min</span>
                          <input
                            type='number'
                            className={timestampInputClass}
                            placeholder='0'
                            aria-label='Minutes'
                            value={min}
                            onChange={(e) => updateItem({ embedMilliseconds: (+e.target.value * 60 + sec) * 1000 })}
                          />
                        </label>
                        <label className='bg-surface-nav border-surface-border/80 focus-within:border-brand flex min-h-0 min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border px-1.5 py-0.5 transition-colors'>
                          <span className='w-8 shrink-0 text-center text-[10px] font-semibold text-slate-500'>sec</span>
                          <input
                            type='number'
                            className={timestampInputClass}
                            placeholder='0'
                            aria-label='Seconds'
                            value={sec}
                            onChange={(e) => updateItem({ embedMilliseconds: (min * 60 + +e.target.value) * 1000 })}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
