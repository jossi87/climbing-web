import { useState, useCallback, type ReactNode } from 'react';
import { useDropzone, ErrorCode, type Accept, type FileRejection } from 'react-dropzone';
import { Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { convertHeicToJpeg, heicConversionFailureReason, isHeicFile } from '../../../utils/heic';
import { captureSentryException } from '../../../utils/sentry';
import MediaEmbedder from './MediaEmbedder';

const MAX_IMAGE_SIZE_MB = 100;
const MAX_VIDEO_SIZE_MB = 800;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

/**
 * Every accepted MIME type declares its file extensions. Browsers on Windows report an empty
 * `File.type` for `.heic`/`.heif` (no MIME association for the extension), and react-dropzone
 * only falls back to matching by extension when that extension is listed here — without it the
 * files are rejected as "Unsupported file type" before the HEIC→JPEG conversion can run.
 */
const ACCEPT: Accept = {
  'image/jpeg': ['.jpg', '.jpeg', '.jfif'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
};

/** Fallback for files the browser reports without a usable MIME type (camera-roll uploads). */
const PREVIEWABLE_EXTENSION = /\.(jpe?g|jfif|png|webp|gif|heic|heif|mp4|m4v|mov|webm)$/i;

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

/** A file that could not be added: refused by the dropzone, or a HEIC that failed to convert. */
type DropProblem = {
  fileName: string;
  reason: string;
};

/** Alert row: a {@link DropProblem} plus a stable React key. */
type DropProblemRow = DropProblem & { key: string };

type Props = {
  /** Called when files are dropped/selected */
  onFilesAdded: (files: DropzoneFile[]) => void;
  /** Called when an embed video URL is added */
  onEmbedAdded: (info: {
    embedVideoUrl: string | undefined;
    embedThumbnailUrl: string | undefined;
    embedMilliseconds?: number;
    /** Instagram-specific: the selected CDN URL to pass as header on save */
    instagramSelectedCdnUrl?: string;
    /** Instagram-specific: whether the selected media is a video */
    instagramSelectedIsVideo?: boolean;
    /** Instagram-specific: the media index for carousel posts */
    instagramSelectedMediaIndex?: number;
  }) => void;
  /** Optional extra content rendered below the dropzone/embed area */
  children?: ReactNode;
  /** Access token for authenticated API calls (needed for Instagram scraping). `null` = no token. */
  getAccessToken?: () => Promise<string | null>;
};

export const MediaDropzoneEmbed = ({ onFilesAdded, onEmbedAdded, children, getAccessToken }: Props) => {
  const [isConverting, setIsConverting] = useState(false);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const [conversionErrors, setConversionErrors] = useState<DropProblem[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setRejections(fileRejections);
      setConversionErrors([]);
      if (acceptedFiles.length === 0) return;
      setIsConverting(true);
      try {
        // HEIC/HEIF is converted in the browser: the backend has no HEIF decoder. Matching by
        // name as well as MIME type is required because Windows reports an empty `File.type`.
        // Files are handled one at a time so a single failure cannot discard the other files
        // (an unhandled rejection here used to abort the whole drop) and so several large HEICs
        // are not decoded at once.
        const newItems: DropzoneFile[] = [];
        const failed: DropProblem[] = [];
        for (const file of acceptedFiles) {
          try {
            const prepared = isHeicFile(file) ? await convertHeicToJpeg(file) : file;
            let preview: string | undefined;
            if (
              prepared.type.startsWith('image/') ||
              prepared.type.startsWith('video/') ||
              PREVIEWABLE_EXTENSION.test(prepared.name)
            ) {
              preview = URL.createObjectURL(prepared);
            }
            newItems.push({ file: prepared, preview });
          } catch (error) {
            console.warn(error);
            captureSentryException(error, { fileName: file.name, fileSize: file.size, fileType: file.type });
            failed.push({ fileName: file.name, reason: heicConversionFailureReason(error) });
          }
        }
        if (newItems.length > 0) onFilesAdded(newItems);
        if (failed.length > 0) setConversionErrors(failed);
      } finally {
        setIsConverting(false);
      }
    },
    [onFilesAdded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_VIDEO_SIZE_BYTES,
    noClick: isConverting,
    noKeyboard: isConverting,
  });

  /** Dropzone rejections and failed HEIC conversions, rendered as one alert. */
  const problems: DropProblemRow[] = [
    ...rejections.map((rejection) => ({
      key: `${rejection.file.name}-${rejection.file.size}-${rejection.file.lastModified}`,
      fileName: rejection.file.name,
      reason: describeRejection(rejection),
    })),
    ...conversionErrors.map((failure, index) => ({ ...failure, key: `${failure.fileName}-${index}` })),
  ];

  return (
    <div className='space-y-4'>
      {/* Two columns on desktop: left=dropzone, right=embed */}
      <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-2'>
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
                  JPG (360° supported), PNG, HEIC, MP4… · up to {MAX_VIDEO_SIZE_MB} MB
                </p>
              </div>
            </>
          )}
        </div>

        {/* Embed — input on top, Add button below */}
        <MediaEmbedder addMedia={onEmbedAdded} stack getAccessToken={getAccessToken} />
      </div>

      {/* Rejected files and failed conversions */}
      {problems.length > 0 && (
        <div role='alert' className='bg-surface-raised flex items-start gap-3 rounded-xl border border-red-500/35 p-3'>
          <AlertCircle className='mt-0.5 shrink-0 text-red-500' size={18} />
          <div className='min-w-0 flex-1 space-y-1'>
            <p className='text-[13px] font-semibold text-red-500'>
              {problems.length === 1 ? 'File could not be added' : `${problems.length} files could not be added`}
            </p>
            <ul className='space-y-0.5 text-[12px] leading-snug text-slate-300'>
              {problems.map((problem) => (
                <li key={problem.key} className='break-words'>
                  <span className='font-medium text-slate-200'>{problem.fileName}</span>
                  <span className='text-slate-400'> — {problem.reason}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type='button'
            onClick={() => {
              setRejections([]);
              setConversionErrors([]);
            }}
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
