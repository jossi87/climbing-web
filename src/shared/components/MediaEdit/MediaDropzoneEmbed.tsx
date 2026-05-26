import { useState, useCallback, type ReactNode } from 'react';
import { useDropzone, ErrorCode, type FileRejection } from 'react-dropzone';
import { Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import VideoEmbedder from './VideoEmbedder';

const MAX_IMAGE_SIZE_MB = 100;
const MAX_VIDEO_SIZE_MB = 800;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const formatFileSizeMb = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${mb.toFixed(0)} MB` : `${mb.toFixed(1)} MB`;
};

const maxSizeLabelForFile = (file: File): string => {
  return file.type.startsWith('video/') ? `${MAX_VIDEO_SIZE_MB} MB` : `${MAX_IMAGE_SIZE_MB} MB`;
};

const describeRejection = (rejection: FileRejection): string => {
  const tooLarge = rejection.errors.find((e) => e.code === ErrorCode.FileTooLarge);
  if (tooLarge) {
    return `Too large (${formatFileSizeMb(rejection.file.size)}, limit ${maxSizeLabelForFile(rejection.file)})`;
  }
  if (rejection.errors.some((e) => e.code === ErrorCode.FileInvalidType)) {
    return 'Unsupported file type';
  }
  return rejection.errors[0]?.message ?? 'Rejected';
};

export type DropzoneFile = {
  file?: File;
  preview?: string;
};

type Props = {
  /** Called when files are dropped/selected */
  onFilesAdded: (files: DropzoneFile[]) => void;
  /** Called when an embed video URL is added */
  onEmbedAdded: (info: { embedVideoUrl: string | undefined; embedThumbnailUrl: string | undefined }) => void;
  /** Optional extra content rendered below the dropzone/embed area */
  children?: ReactNode;
};

export const MediaDropzoneEmbed = ({ onFilesAdded, onEmbedAdded, children }: Props) => {
  const [isConverting, setIsConverting] = useState(false);
  const [rejections, setRejections] = useState<FileRejection[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setRejections(fileRejections);
      if (acceptedFiles.length === 0) return;
      setIsConverting(true);
      try {
        const processedFiles = await Promise.all(
          acceptedFiles.map(async (file) => {
            if (file.type === 'image/heic' || file.type === 'image/heif') {
              const { default: heic2any } = await import('heic2any');
              const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
              const jpegBlobs = Array.isArray(result) ? result : [result];
              return new File(jpegBlobs, file.name.replace(/\.heic|\.heif/i, '.jpeg'), { type: 'image/jpeg' });
            }
            return file;
          }),
        );
        const newItems = await Promise.all(
          processedFiles.map(async (file) => {
            let preview: string | undefined;
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
              preview = URL.createObjectURL(file);
            }
            return { file, preview };
          }),
        );
        onFilesAdded(newItems);
      } finally {
        setIsConverting(false);
      }
    },
    [onFilesAdded],
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
    maxSize: MAX_VIDEO_SIZE_BYTES,
    noClick: isConverting,
    noKeyboard: isConverting,
  });

  return (
    <div className='space-y-4'>
      {/* Two columns on desktop: left=dropzone, right=embed */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition-all duration-300 sm:min-h-[5.25rem] sm:rounded-xl sm:px-4 sm:py-0',
            isDragActive
              ? 'border-brand-border bg-surface-raised'
              : 'border-surface-border bg-surface-raised hover:border-brand-border hover:bg-surface-raised-hover',
            isConverting && 'pointer-events-none cursor-wait opacity-50',
          )}
        >
          <input {...getInputProps()} />
          {isConverting ? (
            <div className='flex flex-col items-center gap-1.5'>
              <Loader2 className='animate-spin text-slate-400' size={18} />
              <p className='text-xs font-medium text-slate-400'>Preparing media…</p>
            </div>
          ) : (
            <>
              <div className='bg-surface-card border-surface-border mb-1.5 rounded-full border p-1.5 transition-transform group-hover:scale-105'>
                <Upload className='text-brand' size={14} />
              </div>
              <div className='space-y-0.5'>
                <p className='text-xs leading-snug font-semibold text-slate-200'>
                  {isDragActive ? 'Drop here' : 'Tap or drop to upload'}
                </p>
                <p className='text-[10px] leading-tight text-slate-500'>
                  JPG, PNG, HEIC, MP4… · up to {MAX_VIDEO_SIZE_MB} MB
                </p>
              </div>
            </>
          )}
        </div>

        {/* Embed — input on top, Add button below */}
        <VideoEmbedder addMedia={onEmbedAdded} stack />
      </div>

      {/* Rejection alerts */}
      {rejections.length > 0 && (
        <div role='alert' className='bg-surface-raised flex items-start gap-3 rounded-xl border border-red-500/35 p-3'>
          <AlertCircle className='mt-0.5 shrink-0 text-red-500' size={18} />
          <div className='min-w-0 flex-1 space-y-1'>
            <p className='text-[13px] font-semibold text-red-500'>
              {rejections.length === 1 ? 'File could not be added' : `${rejections.length} files could not be added`}
            </p>
            <ul className='space-y-0.5 text-[12px] leading-snug text-slate-300'>
              {rejections.map((r) => (
                <li key={`${r.file.name}-${r.file.size}-${r.file.lastModified}`} className='break-words'>
                  <span className='font-medium text-slate-200'>{r.file.name}</span>
                  <span className='text-slate-400'> — {describeRejection(r)}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type='button'
            onClick={() => setRejections([])}
            className='hover:bg-surface-raised-hover -mr-1 shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-200'
            aria-label='Dismiss'
          >
            <X size={16} />
          </button>
        </div>
      )}

      {children}
    </div>
  );
};
