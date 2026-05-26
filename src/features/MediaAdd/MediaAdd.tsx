import { useState, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Save,
  Loader2,
  MessageSquare,
  User as UserIcon,
  Users,
  ListVideo,
  Plus,
  ChevronRight,
  ImagePlus,
  Upload,
  Film,
  X,
  AlertCircle,
} from 'lucide-react';
import type { components } from '../../@types/buldreinfo/swagger';
import { putMedia } from '../../api';
import { Card, PageCardBreadcrumbRow } from '../../shared/ui';
import { UserSelector, UsersSelector } from '../../shared/ui/UserSelector';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { useMeta } from '../../shared/components/Meta/context';
import { useDropzone, ErrorCode, type FileRejection } from 'react-dropzone';
import VideoEmbedder from '../../shared/components/MediaEdit/VideoEmbedder';
import { LockSymbol } from '../../shared/ui/Indicators';
import ProblemRow from '../../shared/components/MediaEdit/ProblemRow';
import type { ProblemState } from '../../shared/components/MediaEdit/ProblemRow';

type User = components['schemas']['User'];
type ProblemSearchResult = components['schemas']['ProblemSearchResult'];

type ConnectionType = 'area' | 'sector' | 'problem';

const fieldLabelClass = cn(designContract.typography.label, 'text-slate-300');

const MAX_FILE_SIZE_MB = 600;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formatFileSizeMb = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${mb.toFixed(0)} MB` : `${mb.toFixed(1)} MB`;
};

const describeRejection = (rejection: FileRejection): string => {
  const tooLarge = rejection.errors.find((e) => e.code === ErrorCode.FileTooLarge);
  if (tooLarge) {
    return `Too large (${formatFileSizeMb(rejection.file.size)}, limit ${MAX_FILE_SIZE_MB} MB)`;
  }
  if (rejection.errors.some((e) => e.code === ErrorCode.FileInvalidType)) {
    return 'Unsupported file type';
  }
  return rejection.errors[0]?.message ?? 'Rejected';
};

type UploadItem = {
  file?: File;
  preview?: string;
  photographer?: string;
  inPhoto?: User[];
  description?: string;
  trivia?: boolean;
  pitch?: number;
  embedVideoUrl?: string;
  embedThumbnailUrl?: string;
  embedMilliseconds?: number;
  thumbnailSeconds?: number;
};

const MediaAdd = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const meta = useMeta();
  const [searchParams] = useSearchParams();

  const { connectionType: rawConnectionType } = useParams();
  const connectionType = (rawConnectionType as ConnectionType) ?? 'problem';

  const entityId = Number(searchParams.get('id') ?? 0);
  const entityName = searchParams.get('name') ?? '';
  const sectorId = Number(searchParams.get('sectorId') ?? 0);
  const areaId = Number(searchParams.get('areaId') ?? 0);
  const areaName = searchParams.get('areaName') ?? '';
  const sectorName = searchParams.get('sectorName') ?? '';

  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [rejections, setRejections] = useState<FileRejection[]>([]);

  const [description, setDescription] = useState('');
  const [photographer, setPhotographer] = useState<User | undefined>(undefined);
  const [tagged, setTagged] = useState<User[]>([]);
  const [problems, setProblems] = useState<ProblemState[]>([]);
  const [saving, setSaving] = useState(false);
  const [problemSearchInputs, setProblemSearchInputs] = useState<Record<number, string>>({});
  const [focusedProblemIndex, setFocusedProblemIndex] = useState<number | null>(null);

  const addProblem = () => {
    setProblems((prev) => {
      const newIndex = prev.length;
      setTimeout(() => setFocusedProblemIndex(newIndex), 0);
      return [...prev, { problemId: 0, problemName: '', problemGrade: '', milliseconds: 0 }];
    });
  };

  const selectProblem = (index: number, problem: ProblemSearchResult) => {
    setProblems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        problemId: problem.id ?? 0,
        problemName: problem.problemName ?? '',
        problemGrade: problem.grade ?? '',
        problemNumPitches: problem.numPitches ?? 0,
        problemPitch: undefined,
      };
      return next;
    });
    const name = [problem.problemName, problem.grade].filter(Boolean).join(' · ');
    const location = [problem.areaName, problem.sectorName].filter(Boolean).join(' · ');
    setProblemSearchInputs((prev) => ({ ...prev, [index]: location ? `${name} (${location})` : name }));
  };

  const updateProblemPitch = (index: number, pitch: number | undefined) => {
    setProblems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], problemPitch: pitch };
      return next;
    });
  };

  const removeProblem = (index: number) => {
    setProblems((prev) => prev.filter((_, i) => i !== index));
    setProblemSearchInputs((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

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
            return { file, name: file.name, preview, photographer: meta?.authenticatedName };
          }),
        );
        setUploadItems((existing) => [...existing, ...newItems]);
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
    maxSize: MAX_FILE_SIZE_BYTES,
    noClick: isConverting,
    noKeyboard: isConverting,
  });

  const addEmbed = useCallback(
    (info: { embedVideoUrl: string | undefined; embedThumbnailUrl: string | undefined; embedMilliseconds: number }) => {
      setUploadItems((old) => [
        ...old,
        {
          embedVideoUrl: info.embedVideoUrl,
          embedThumbnailUrl: info.embedThumbnailUrl,
          embedMilliseconds: info.embedMilliseconds,
          photographer: meta?.authenticatedName,
        },
      ]);
    },
    [meta],
  );

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const body: components['schemas']['Media'] = {
        description,
        photographer: photographer ? { id: photographer.id ?? 0, name: photographer.name ?? '' } : undefined,
        tagged: tagged.map((u) => ({ id: u.id ?? 0, name: u.name ?? '' })),
      };
      if (connectionType === 'problem') {
        body.problems = problems.map((p) => ({
          problemId: p.problemId ?? 0,
          problemName: p.problemName ?? '',
          problemGrade: p.problemGrade ?? '',
          problemPitch: p.problemPitch ?? 0,
          problemNumPitches: p.problemNumPitches ?? 0,
          milliseconds: p.milliseconds ?? 0,
          areaName: p.areaName ?? '',
          sectorName: p.sectorName ?? '',
          trivia: p.trivia ?? false,
        }));
      } else if (connectionType === 'area') {
        body.areas = [{ areaId: entityId, areaName: entityName, trivia: false }];
      } else if (connectionType === 'sector') {
        body.sectors = [{ sectorId: entityId, sectorName: entityName, trivia: false }];
      }
      await putMedia(token, body);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/media'] }),
        queryClient.invalidateQueries({ queryKey: ['/problem'] }),
        queryClient.invalidateQueries({ queryKey: ['/areas'] }),
        queryClient.invalidateQueries({ queryKey: ['/sectors'] }),
      ]);
      if (connectionType === 'problem' && entityId) {
        navigate(`/problem/${entityId}`);
      } else if (connectionType === 'sector' && entityId) {
        navigate(`/sector/${entityId}`);
      } else if (connectionType === 'area' && entityId) {
        navigate(`/area/${entityId}`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.warn(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const hasEmptyProblem = problems.some((p) => !p.problemId || !p.problemName);
  const hasDuplicateTime = problems.some(
    (p, i) =>
      (p.milliseconds ?? 0) > 0 && problems.findIndex((c) => (c.milliseconds ?? 0) === (p.milliseconds ?? 0)) !== i,
  );
  const hasNoProblems = connectionType === 'problem' && problems.length === 0;
  const canSave = !!photographer && !hasEmptyProblem && !hasDuplicateTime && !hasNoProblems;

  const title = `Add ${connectionType === 'problem' ? 'media to problem' : connectionType === 'sector' ? 'media to sector' : 'media to area'}${meta?.title ? ` | ${meta.title}` : ''}`;

  return (
    <>
      <title>{title}</title>
      <div className='w-full min-w-0 space-y-4'>
        <Card flush className='min-w-0 border-0'>
          <div className='p-4 sm:p-5'>
            <PageCardBreadcrumbRow
              breadcrumb={
                <nav
                  className={cn(
                    'block min-w-0 text-[12px] leading-relaxed text-pretty break-words text-slate-400 sm:text-[13px] [&>*+*]:ml-1.5',
                  )}
                >
                  <Link to='/areas' className='inline align-middle transition-colors hover:text-slate-200'>
                    Areas
                  </Link>
                  <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                  {connectionType === 'problem' && areaId > 0 && (
                    <>
                      <Link
                        to={`/area/${areaId}`}
                        className='inline min-w-0 align-middle transition-colors hover:text-slate-200'
                      >
                        {areaName || 'Area'}
                      </Link>
                      <LockSymbol lockedAdmin={false} lockedSuperadmin={false} />
                      <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                    </>
                  )}
                  {connectionType !== 'area' && sectorId > 0 && (
                    <>
                      <Link
                        to={`/sector/${sectorId}`}
                        className='inline min-w-0 align-middle transition-colors hover:text-slate-200'
                      >
                        {sectorName || 'Sector'}
                      </Link>
                      <LockSymbol lockedAdmin={false} lockedSuperadmin={false} />
                      <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                    </>
                  )}
                  {connectionType === 'problem' && entityId > 0 && (
                    <>
                      <Link
                        to={`/problem/${entityId}`}
                        className='inline min-w-0 align-middle transition-colors hover:text-slate-200'
                      >
                        {entityName || 'Problem'}
                      </Link>
                      <LockSymbol lockedAdmin={false} lockedSuperadmin={false} />
                      <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                    </>
                  )}
                  <span className='inline-flex items-center gap-1.5 align-middle font-medium text-slate-400'>
                    <ImagePlus size={12} className='shrink-0 text-slate-500' strokeWidth={2.25} />
                    Add media
                  </span>
                </nav>
              }
            />
            <div className='mt-3 border-t border-white/8 pt-3 sm:mt-4 sm:pt-4'>
              <h1 className={cn(designContract.typography.subtitle, 'text-slate-100')}>
                Add{' '}
                {connectionType === 'problem'
                  ? 'media to problem'
                  : connectionType === 'sector'
                    ? 'media to sector'
                    : 'media to area'}
              </h1>
              {entityName ? (
                <p className={cn(designContract.typography.meta, 'mt-0.5 text-slate-500 sm:mt-1')}>{entityName}</p>
              ) : null}
            </div>

            <div className='mt-4 space-y-4'>
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
                      <p className='text-[12px] leading-tight text-slate-500 sm:text-sm'>
                        JPG, PNG, HEIC, MP4… · up to {MAX_FILE_SIZE_MB} MB per file
                      </p>
                    </div>
                  </>
                )}
              </div>

              {rejections.length > 0 && (
                <div
                  role='alert'
                  className='bg-surface-raised flex items-start gap-3 rounded-xl border border-red-500/35 p-3 sm:p-4'
                >
                  <AlertCircle className='mt-0.5 shrink-0 text-red-500' size={18} />
                  <div className='min-w-0 flex-1 space-y-1'>
                    <p className='text-[13px] font-semibold text-red-500 sm:text-sm'>
                      {rejections.length === 1
                        ? 'File could not be added'
                        : `${rejections.length} files could not be added`}
                    </p>
                    <ul className='space-y-0.5 text-[12px] leading-snug text-slate-300 sm:text-[13px]'>
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

              <VideoEmbedder addMedia={addEmbed} />

              {uploadItems.length > 0 && (
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4'>
                  {uploadItems.map((item, i) => {
                    const key = item.preview ?? item.embedThumbnailUrl ?? `item-${i}`;
                    const updateItem = (patch: Partial<UploadItem>) =>
                      setUploadItems((old) => old.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
                    return (
                      <div
                        key={key}
                        className='bg-surface-card border-surface-border animate-in fade-in zoom-in-95 flex flex-col overflow-hidden rounded-xl border shadow-md duration-300 sm:rounded-2xl sm:shadow-xl'
                      >
                        <div className='group relative aspect-video w-full overflow-hidden bg-black'>
                          {item.file?.type?.startsWith('video/') && item.preview ? (
                            <video
                              src={item.preview}
                              className='h-full w-full object-contain'
                              controls
                              preload='metadata'
                            />
                          ) : item.preview || item.embedThumbnailUrl ? (
                            <img
                              src={item.preview ?? item.embedThumbnailUrl}
                              className='h-full w-full object-cover'
                              alt=''
                            />
                          ) : (
                            <div className='flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-b from-slate-800 to-slate-950 px-3 text-center'>
                              <Film className='text-slate-500 opacity-50' size={40} aria-hidden />
                              <p className='text-[12px] text-slate-500'>No preview</p>
                            </div>
                          )}
                          <button
                            type='button'
                            onClick={() => setUploadItems((old) => old.filter((_, idx) => idx !== i))}
                            className='type-on-accent absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 shadow-md ring-1 ring-white/25 transition hover:bg-red-500 active:scale-95'
                            aria-label='Remove this item'
                          >
                            <X size={16} strokeWidth={2.5} className='shrink-0' aria-hidden />
                          </button>
                        </div>
                        <div className='flex-1 space-y-1.5 p-2.5 sm:space-y-2.5 sm:p-3'>
                          <div className='relative min-w-0'>
                            <MessageSquare
                              className='pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-slate-500'
                              size={13}
                              aria-hidden
                            />
                            <input
                              type='text'
                              placeholder='Caption (optional)'
                              className='bg-surface-nav border-surface-border/80 focus:border-brand h-9 w-full rounded-lg border py-0 pr-2 pl-8 text-[13px] leading-none transition-[color,background-color,border-color,opacity] duration-100 outline-none placeholder:text-slate-500/85 placeholder:transition-opacity focus:ring-0 focus:outline-none focus:placeholder:opacity-0 focus-visible:ring-0 sm:pl-9 sm:text-sm'
                              value={item.description ?? ''}
                              onChange={(e) => updateItem({ description: e.target.value })}
                            />
                          </div>
                          <div className='flex min-w-0 items-center gap-1.5'>
                            <Users size={14} className='mt-[3px] shrink-0 self-start text-slate-500' aria-hidden />
                            <UsersSelector
                              compact
                              matchInputLeadStyle
                              placeholder='People in shot'
                              users={item.inPhoto ?? []}
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
                              compact
                              matchInputLeadStyle
                              placeholder='Photographer'
                              value={item.photographer}
                              onUserUpdated={(u) => updateItem({ photographer: u?.label })}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className='mt-6 space-y-6'>
              <div className='space-y-1.5'>
                <label htmlFor='media-add-description' className={cn('ml-1', fieldLabelClass)}>
                  Description
                </label>
                <div className='relative'>
                  <MessageSquare
                    className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
                    size={16}
                    aria-hidden
                  />
                  <input
                    id='media-add-description'
                    type='text'
                    placeholder='Description'
                    className='bg-surface-nav border-surface-border type-body focus:border-brand-border/60 w-full rounded-xl border py-3 pr-4 pl-10 transition-colors placeholder:opacity-50 focus:outline-none'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className={cn('ml-1', fieldLabelClass)}>
                  <span className='inline-flex items-center gap-1.5'>
                    <UserIcon size={14} className='text-slate-400' />
                    Photographer
                    <span className='text-[11px] font-medium text-rose-400'>*</span>
                  </span>
                </label>
                <UserSelector
                  placeholder='Search or type name...'
                  value={photographer?.name ?? ''}
                  onUserUpdated={(user) =>
                    setPhotographer(
                      user
                        ? {
                            id: typeof user.value === 'number' ? user.value : -1,
                            name: user.label ?? user.name ?? '',
                          }
                        : undefined,
                    )
                  }
                  matchInputLeadStyle
                />
                {!photographer && <p className='ml-1 text-[12px] text-rose-400'>Photographer is required</p>}
              </div>

              <div className='space-y-1.5'>
                <label className={cn('ml-1', fieldLabelClass)}>
                  <span className='inline-flex items-center gap-1.5'>
                    <Users size={14} className='text-slate-400' />
                    Tagged
                  </span>
                </label>
                <UsersSelector
                  placeholder='Search or type names...'
                  users={tagged.map((u) => ({ ...u, value: u.id ?? 0, label: u.name ?? '' }))}
                  onUsersUpdated={(users) =>
                    setTagged(
                      users.map((u) => ({
                        id: typeof u.value === 'number' ? u.value : 0,
                        name: u.label ?? u.name ?? '',
                      })),
                    )
                  }
                  matchInputLeadStyle
                />
              </div>

              {connectionType === 'problem' && (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <label className={cn('ml-1', fieldLabelClass)}>
                      <span className='inline-flex items-center gap-1.5'>
                        <ListVideo size={14} className='text-slate-400' />
                        Problems
                        <span className='text-[11px] font-medium text-rose-400'>*</span>
                      </span>
                    </label>
                    <button
                      type='button'
                      onClick={addProblem}
                      className='bg-surface-raised hover:bg-surface-raised-hover inline-flex items-center gap-1 rounded-lg border border-white/12 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-white/22'
                    >
                      <Plus size={12} />
                      Add problem
                    </button>
                  </div>
                  {problems.length === 0 && (
                    <p className='type-small ml-1 text-slate-500'>At least one problem is required.</p>
                  )}
                  <div className='space-y-2'>
                    {problems.map((p, i) => (
                      <ProblemRow
                        key={i}
                        problem={p}
                        maxSeconds={0}
                        showTimeInput={false}
                        searchInput={problemSearchInputs[i] ?? p.problemName ?? ''}
                        onSearchInputChange={(val) => setProblemSearchInputs((prev) => ({ ...prev, [i]: val }))}
                        onSelectProblem={(problem) => selectProblem(i, problem)}
                        onTimeChange={() => {}}
                        onPitchChange={(pitch) => updateProblemPitch(i, pitch)}
                        onTriviaChange={(trivia) =>
                          setProblems((prev) => {
                            const next = [...prev];
                            next[i] = { ...next[i], trivia };
                            return next;
                          })
                        }
                        onRemove={() => removeProblem(i)}
                        autoFocus={focusedProblemIndex === i}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className='flex flex-wrap items-center justify-end gap-3'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className={cn(
              designContract.surfaces.inlineChipInteractive,
              'px-4 py-2 text-[13px] font-semibold sm:text-[14px]',
            )}
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => void handleSave()}
            disabled={saving || !canSave}
            className={cn(
              designContract.controls.savePrimary,
              'px-6 py-2.5 text-[13px] font-semibold sm:text-[14px]',
              !canSave && 'cursor-not-allowed opacity-50',
            )}
          >
            {saving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} strokeWidth={2.25} />}
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default MediaAdd;
