import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Save,
  Loader2,
  MessageSquare,
  Image,
  Video,
  User as UserIcon,
  Users,
  ListVideo,
  Clock,
  Plus,
  Trash2,
  Search,
  ChevronDown,
} from 'lucide-react';
import type { components } from '../../@types/buldreinfo/swagger';
import { useMediaSvg, putMedia, useProblemSearch, invalidateAllProblemQueries } from '../../api';
import { getMediaFileUrl, mediaIdentityId, mediaIdentityVersionStamp } from '../../api/utils';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Card } from '../../shared/ui';
import { UserSelector, UsersSelector } from '../../shared/ui/UserSelector';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { useMeta } from '../../shared/components/Meta/context';

type Media = components['schemas']['Media'];
type User = components['schemas']['User'];
type MediaProblem = components['schemas']['MediaProblem'];
type ProblemSearchResult = components['schemas']['ProblemSearchResult'];

type ProblemState = MediaProblem;

type MediaConnectionType = 'area' | 'sector' | 'problem' | 'guestbook';

const fieldLabelClass = cn(designContract.typography.label, 'text-slate-300');

/** Convert seconds → "M:SS" string. */
function secondsToTimeStr(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Parse "M:SS" or "MM:SS" string → total seconds. Returns 0 on invalid input. */
function timeStrToSeconds(str: string): number {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (!isNaN(m) && !isNaN(s) && m >= 0 && s >= 0 && s < 60) {
      return m * 60 + s;
    }
  }
  return 0;
}

/** Format a problem search result for display. */
function formatProblemOption(p: ProblemSearchResult): string {
  const name = [p.problemName, p.grade].filter(Boolean).join(' · ');
  const location = [p.areaName, p.sectorName].filter(Boolean).join(' · ');
  return location ? `${name} (${location})` : name;
}

const MediaEdit = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mediaId } = useParams();
  const mediaIdNum = Number(mediaId ?? 0);

  const { media: data, isLoading } = useMediaSvg(mediaIdNum) as ReturnType<typeof useMediaSvg>;
  const m: Media | undefined = data;

  const [description, setDescription] = useState('');
  const [photographer, setPhotographer] = useState<User | undefined>(undefined);
  const [tagged, setTagged] = useState<User[]>([]);
  const [problems, setProblems] = useState<ProblemState[]>([]);
  const [areaTrivia, setAreaTrivia] = useState<Record<number, boolean>>({});
  const [sectorTrivia, setSectorTrivia] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Thumbnail picker state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailSeconds, setThumbnailSeconds] = useState<number>(0);
  const [thumbnailDuration, setThumbnailDuration] = useState(0);
  const [showThumbnailPicker, setShowThumbnailPicker] = useState(false);

  // Problem search
  const [problemSearchInputs, setProblemSearchInputs] = useState<Record<number, string>>({});
  const durationVideoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleDurationLoaded = useCallback(() => {
    const video = durationVideoRef.current;
    if (video && video.duration && video.duration !== Infinity) {
      setVideoDuration(video.duration);
    }
  }, []);

  // Sync state when data loads (only once on initial load)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!m || initializedRef.current) return;
    initializedRef.current = true;
    setDescription(m.description ?? '');
    setPhotographer(m.photographer ? { id: m.photographer.id, name: m.photographer.name } : undefined);
    setTagged(m.tagged ?? []);
    setProblems(m.problems ?? []);
    setAreaTrivia(Object.fromEntries((m.areas ?? []).map((a) => [a.areaId ?? 0, a.trivia ?? false])));
    setSectorTrivia(Object.fromEntries((m.sectors ?? []).map((s) => [s.sectorId ?? 0, s.trivia ?? false])));
    setThumbnailSeconds(m.thumbnailSeconds ?? 0);
    // Initialize problem search inputs with formatted names (including location)
    const initialInputs: Record<number, string> = {};
    (m.problems ?? []).forEach((p, i) => {
      if (p.problemName) {
        const name = [p.problemName, p.problemGrade].filter(Boolean).join(' · ');
        const location = [p.areaName, p.sectorName].filter(Boolean).join(' · ');
        initialInputs[i] = location ? `${name} (${location})` : name;
      }
    });
    setProblemSearchInputs(initialInputs);
  }, [m]);

  const meta = useMeta();
  const isVideo = !!m?.isMovie;
  const hasEmbed = !!m?.embedUrl;

  const embedSrc = useMemo(() => {
    const raw = m?.embedUrl?.trim();
    if (!raw) return '';
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();
      const isVimeoHost = host === 'vimeo.com' || host.endsWith('.vimeo.com');
      if (isVimeoHost) {
        url.searchParams.set('color', '000000');
        url.searchParams.set('title', '0');
        url.searchParams.set('byline', '0');
        url.searchParams.set('portrait', '0');
        url.searchParams.set('transparent', '0');
      }
      return url.toString();
    } catch {
      return raw;
    }
  }, [m?.embedUrl]);

  const connectionType: MediaConnectionType = (() => {
    if (m?.guestbookId) return 'guestbook';
    if ((m?.areas ?? []).length > 0) return 'area';
    if ((m?.sectors ?? []).length > 0) return 'sector';
    return 'problem';
  })();

  const handleSave = async () => {
    if (saving || !m) return;
    setSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const id = mediaIdentityId(m.identity);
      const body: components['schemas']['Media'] = {
        ...m,
        identity: { ...m.identity, id },
        description,
        photographer: photographer ? { id: photographer.id ?? 0, name: photographer.name ?? '' } : undefined,
        tagged: tagged.map((u) => ({ id: u.id ?? 0, name: u.name ?? '' })),
        thumbnailSeconds: Math.floor(thumbnailSeconds),
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
        body.areas = (m.areas ?? []).map((a) => ({
          ...a,
          trivia: areaTrivia[a.areaId ?? 0] ?? false,
        }));
      } else if (connectionType === 'sector') {
        body.sectors = (m.sectors ?? []).map((s) => ({
          ...s,
          trivia: sectorTrivia[s.sectorId ?? 0] ?? false,
        }));
      }
      await putMedia(token, body);
      // Refetch (not just invalidate) so the updated versionStamp is in cache before navigating back.
      // This ensures the previous page renders the new thumbnail instead of a stale cached one.
      await queryClient.refetchQueries({
        predicate: (q) => {
          const key = q.queryKey;
          if (!Array.isArray(key) || key[0] !== '/media') return false;
          const meta = key[1];
          if (meta == null || typeof meta !== 'object') return false;
          return 'idMedia' in meta && (meta as { idMedia: number }).idMedia === mediaIdNum;
        },
      });
      await invalidateAllProblemQueries(queryClient);
      navigate(-1);
    } catch (error) {
      console.warn(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setThumbnailSeconds(videoRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 0;
    setThumbnailDuration(dur);
    const raw = m?.thumbnailSeconds;
    let targetTime: number;
    if (raw != null && raw >= 0) {
      targetTime = Math.min(raw, dur);
    } else {
      targetTime = Math.max(0, dur - 10);
    }
    video.currentTime = targetTime;
    setThumbnailSeconds(targetTime);
  }, [m?.thumbnailSeconds]);

  const hasEmptyProblem = problems.some((p) => !p.problemId || !p.problemName);
  const hasDuplicateTime = problems.some(
    (p, i) =>
      (p.milliseconds ?? 0) > 0 && problems.findIndex((c) => (c.milliseconds ?? 0) === (p.milliseconds ?? 0)) !== i,
  );
  const hasNoProblems = connectionType === 'problem' && problems.length === 0;
  const canSave = !!photographer && !hasEmptyProblem && !hasDuplicateTime && !hasNoProblems;

  const [focusedProblemIndex, setFocusedProblemIndex] = useState<number | null>(null);

  const addProblem = () => {
    setProblems((prev) => {
      const newIndex = prev.length;
      // Focus the new row after render
      setTimeout(() => setFocusedProblemIndex(newIndex), 0);
      return [...prev, { problemId: 0, problemName: '', problemGrade: '', milliseconds: 0 }];
    });
  };

  const updateProblemTime = (index: number, timeStr: string) => {
    const ms = timeStrToSeconds(timeStr) * 1000;
    setProblems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], milliseconds: ms };
      return next;
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
        // Reset pitch when changing problem
        problemPitch: undefined,
      };
      return next;
    });
    setProblemSearchInputs((prev) => ({ ...prev, [index]: formatProblemOption(problem) }));
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

  if (isLoading) {
    return <Loading />;
  }

  if (!m) {
    return (
      <div className='w-full min-w-0 space-y-4 p-4'>
        <p className='text-slate-400'>Media not found.</p>
      </div>
    );
  }

  const mediaIdVal = mediaIdentityId(m.identity);

  const title = meta?.title
    ? `Edit ${isVideo ? 'video' : 'image'} #${mediaIdVal} | ${meta.title}`
    : `Edit ${isVideo ? 'video' : 'image'} #${mediaIdVal}`;

  return (
    <>
      <title>{title}</title>
      <div className='w-full min-w-0 space-y-4'>
        <Card flush className='min-w-0 border-0'>
          <div className='p-4 sm:p-5'>
            <div className='border-b border-white/8 pb-3 sm:pb-4'>
              <h1 className={cn(designContract.typography.subtitle, 'text-slate-100')}>
                Edit {isVideo ? 'video' : 'image'}
              </h1>
              <p className={cn(designContract.typography.meta, 'mt-0.5 text-slate-500 sm:mt-1')}>Media #{mediaIdVal}</p>
            </div>

            {/* Media preview */}
            <div className='mt-4 overflow-hidden rounded-xl bg-black/60'>
              {isVideo && !hasEmbed ? (
                <video
                  src={getMediaFileUrl(mediaIdVal, mediaIdentityVersionStamp(m.identity), true)}
                  className='block max-h-[40vh] w-full'
                  controls
                  preload='metadata'
                />
              ) : isVideo && hasEmbed && embedSrc ? (
                <div className='aspect-video w-full'>
                  <iframe src={embedSrc} className='h-full w-full border-0' allowFullScreen title='Video Content' />
                </div>
              ) : (
                <img
                  src={getMediaFileUrl(mediaIdVal, mediaIdentityVersionStamp(m.identity), false, {
                    targetWidth: 800,
                  })}
                  alt=''
                  className='block max-h-[40vh] w-full object-contain'
                />
              )}
            </div>

            {/* Hidden video element to detect duration for problem time validation */}
            {isVideo && !hasEmbed && (
              <video
                ref={durationVideoRef}
                src={getMediaFileUrl(mediaIdVal, mediaIdentityVersionStamp(m.identity), true)}
                preload='metadata'
                onLoadedMetadata={handleDurationLoaded}
                className='hidden'
                aria-hidden
              />
            )}

            {/* Thumbnail (video only) — shown right after preview */}
            {isVideo && !hasEmbed && (
              <div className='mt-6 space-y-3'>
                <div className='flex items-center justify-between'>
                  <label className={cn('ml-1', fieldLabelClass)}>
                    <span className='inline-flex items-center gap-1.5'>
                      <Image size={14} className='text-slate-400' />
                      Thumbnail
                    </span>
                  </label>
                  <div className='flex items-center gap-2'>
                    {!showThumbnailPicker && (
                      <span className='light:bg-slate-200 light:text-slate-600 flex h-7 items-center gap-1 rounded-lg bg-slate-800 px-2 font-mono text-[12px] font-semibold text-slate-300 tabular-nums shadow-inner'>
                        <Image size={11} className='text-slate-400' />
                        {secondsToTimeStr(thumbnailSeconds)}
                      </span>
                    )}
                    <button
                      type='button'
                      onClick={() => setShowThumbnailPicker(!showThumbnailPicker)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                        showThumbnailPicker
                          ? 'border-brand-border bg-surface-raised-hover text-slate-200'
                          : 'bg-surface-raised hover:bg-surface-raised-hover border-white/12 text-slate-300 hover:border-white/22',
                      )}
                    >
                      <Image size={12} />
                      {showThumbnailPicker ? 'Close picker' : 'Change thumbnail'}
                    </button>
                  </div>
                </div>

                {showThumbnailPicker && (
                  <div className='bg-surface-nav border-surface-border space-y-3 rounded-xl border p-3'>
                    <div className='flex items-start gap-2.5 rounded-lg border border-sky-500/25 bg-sky-500/8 px-3.5 py-2.5'>
                      <Video size={16} className='mt-0.5 shrink-0 text-sky-400' />
                      <p className='text-[13px] leading-snug text-slate-300'>
                        <strong className='text-slate-100'>Seek</strong> in the video below to find the frame you want
                        as the thumbnail, then click <strong className='text-slate-100'>Save</strong> below to apply.
                      </p>
                    </div>
                    <video
                      ref={videoRef}
                      src={getMediaFileUrl(mediaIdVal, mediaIdentityVersionStamp(m.identity), true)}
                      className='block max-h-[40vh] w-full rounded-lg'
                      controls
                      preload='metadata'
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                    />
                    {thumbnailDuration > 0 && (
                      <div className='bg-surface-raised flex items-center justify-between gap-3 rounded-lg border border-white/8 px-4 py-3'>
                        <span className={cn(fieldLabelClass)}>Selected frame</span>
                        <div className='flex items-center gap-2'>
                          <div className='light:bg-slate-200 light:text-slate-600 flex h-7 items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 font-mono text-[13px] font-semibold text-slate-300 tabular-nums shadow-inner'>
                            <Image size={13} className='text-slate-400' />
                            {secondsToTimeStr(thumbnailSeconds)}
                          </div>
                          <span className='text-[12px] text-slate-500'>/ {secondsToTimeStr(thumbnailDuration)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Edit fields */}
            <div className='mt-6 space-y-6'>
              {/* Description */}
              <div className='space-y-1.5'>
                <label htmlFor='media-edit-description' className={cn('ml-1', fieldLabelClass)}>
                  Description
                </label>
                <div className='relative'>
                  <MessageSquare
                    className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
                    size={16}
                    aria-hidden
                  />
                  <input
                    id='media-edit-description'
                    type='text'
                    placeholder='Description'
                    className='bg-surface-nav border-surface-border type-body focus:border-brand-border/60 w-full rounded-xl border py-3 pr-4 pl-10 transition-colors placeholder:opacity-50 focus:outline-none'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Photographer (required) */}
              <div className='space-y-1.5'>
                <label className={cn('ml-1', fieldLabelClass)}>
                  <span className='inline-flex items-center gap-1.5'>
                    <UserIcon size={14} className='text-slate-400' />
                    {isVideo ? 'Video by' : 'Photographer'}
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
                            id: typeof user.value === 'number' ? user.value : user.id,
                            name: user.label ?? user.name ?? '',
                          }
                        : undefined,
                    )
                  }
                  matchInputLeadStyle
                />
                {!photographer && (
                  <p className='ml-1 text-[12px] text-rose-400'>{isVideo ? 'Video by' : 'Photographer'} is required</p>
                )}
              </div>

              {/* Tagged users */}
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

              {/* Connection info — read-only for area / sector / guestbook, editable for problems */}
              {connectionType === 'guestbook' && (
                <div className='space-y-1.5'>
                  <label className={cn('ml-1', fieldLabelClass)}>
                    <span className='inline-flex items-center gap-1.5'>
                      <MessageSquare size={14} className='text-slate-400' />
                      Connected to
                    </span>
                  </label>
                  <div className='bg-surface-raised border-surface-border flex items-center gap-2 rounded-xl border p-3'>
                    <span className='text-sm text-slate-300'>Guestbook</span>
                  </div>
                </div>
              )}

              {connectionType === 'area' && (
                <div className='space-y-3'>
                  <label className={cn('ml-1', fieldLabelClass)}>
                    <span className='inline-flex items-center gap-1.5'>
                      <ListVideo size={14} className='text-slate-400' />
                      Connected to areas
                    </span>
                  </label>
                  <div className='space-y-2'>
                    {(m.areas ?? []).map((a, i) => (
                      <div
                        key={a.areaId ?? i}
                        className='bg-surface-raised border-surface-border flex items-center gap-2 rounded-xl border p-3'
                      >
                        <span className='min-w-0 flex-1 text-sm text-slate-300'>
                          {a.areaName ?? `Area #${a.areaId}`}
                        </span>
                        <label className='flex shrink-0 items-center gap-1.5 text-xs text-slate-400'>
                          <input
                            type='checkbox'
                            checked={areaTrivia[a.areaId ?? 0] ?? false}
                            onChange={(e) => setAreaTrivia((prev) => ({ ...prev, [a.areaId ?? 0]: e.target.checked }))}
                            className='text-brand focus:ring-brand/50 h-4 w-4 rounded border-white/20 bg-slate-700 focus:ring-2'
                          />
                          Trivia
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {connectionType === 'sector' && (
                <div className='space-y-3'>
                  <label className={cn('ml-1', fieldLabelClass)}>
                    <span className='inline-flex items-center gap-1.5'>
                      <ListVideo size={14} className='text-slate-400' />
                      Connected to sectors
                    </span>
                  </label>
                  <div className='space-y-2'>
                    {(m.sectors ?? []).map((s, i) => (
                      <div
                        key={s.sectorId ?? i}
                        className='bg-surface-raised border-surface-border flex items-center gap-2 rounded-xl border p-3'
                      >
                        <span className='min-w-0 flex-1 text-sm text-slate-300'>
                          {s.sectorName ?? `Sector #${s.sectorId}`}
                          {s.areaName ? <span className='ml-1.5 text-slate-500'>({s.areaName})</span> : null}
                        </span>
                        <label className='flex shrink-0 items-center gap-1.5 text-xs text-slate-400'>
                          <input
                            type='checkbox'
                            checked={sectorTrivia[s.sectorId ?? 0] ?? false}
                            onChange={(e) =>
                              setSectorTrivia((prev) => ({ ...prev, [s.sectorId ?? 0]: e.target.checked }))
                            }
                            className='text-brand focus:ring-brand/50 h-4 w-4 rounded border-white/20 bg-slate-700 focus:ring-2'
                          />
                          Trivia
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                        maxSeconds={isVideo ? videoDuration : 0}
                        showTimeInput={isVideo}
                        searchInput={problemSearchInputs[i] ?? p.problemName ?? ''}
                        onSearchInputChange={(val) => setProblemSearchInputs((prev) => ({ ...prev, [i]: val }))}
                        onSelectProblem={(problem) => selectProblem(i, problem)}
                        onTimeChange={(val) => updateProblemTime(i, val)}
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

        {/* Action buttons */}
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

/** A single problem row with problem search + optional time input + optional pitch selector + trivia toggle. */
const ProblemRow = ({
  problem,
  maxSeconds,
  showTimeInput,
  searchInput,
  onSearchInputChange,
  onSelectProblem,
  onTimeChange,
  onPitchChange,
  onTriviaChange,
  onRemove,
  autoFocus,
}: {
  problem: ProblemState;
  maxSeconds: number;
  showTimeInput: boolean;
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onSelectProblem: (p: ProblemSearchResult) => void;
  onTimeChange: (val: string) => void;
  onPitchChange: (pitch: number | undefined) => void;
  onTriviaChange: (trivia: boolean) => void;
  onRemove: () => void;
  autoFocus?: boolean;
}) => {
  const isReadOnly = !!problem.problemId && !!problem.problemName;
  const { data: searchResults = [], isFetching } = useProblemSearch(isReadOnly ? '' : searchInput);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Close dropdown on outside click (including portal)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideContainer = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideContainer && !insideDropdown) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Recalculate position when dropdown opens and on scroll/resize
  useEffect(() => {
    if (!showDropdown || !containerRef.current) return;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        maxHeight: '12rem',
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showDropdown]);

  // Auto-focus when this row is newly added
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const filtered = searchResults.filter((p) => p.id && p.problemName);

  const handleRemove = () => {
    if (window.confirm('Remove this problem from the list?')) {
      onRemove();
    }
  };

  return (
    <div className='bg-surface-raised border-surface-border flex items-center gap-2 rounded-xl border p-2.5'>
      {/* Problem search */}
      <div ref={containerRef} className='relative min-w-0 flex-1'>
        <div className='relative'>
          <Search
            className='pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-500'
            size={14}
            aria-hidden
          />
          <input
            ref={inputRef}
            type='text'
            placeholder='Search problem...'
            readOnly={!!problem.problemId && !!problem.problemName}
            className={cn(
              'bg-surface-nav type-body w-full min-w-0 rounded-lg border py-1.5 pr-2 pl-7 text-sm transition-colors placeholder:opacity-50 focus:outline-none',
              !!problem.problemId && !!problem.problemName
                ? 'border-surface-border focus:border-brand-border/60 cursor-default'
                : 'border-rose-500/50 focus:border-rose-400/70',
            )}
            value={searchInput}
            onChange={(e) => {
              onSearchInputChange(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
        </div>
        {showDropdown &&
          searchInput.length > 0 &&
          createPortal(
            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className='border-surface-border bg-surface-card overflow-y-auto rounded-lg border shadow-2xl'
            >
              {isFetching && (
                <div className='flex items-center gap-2 px-3 py-2.5 text-[13px] text-slate-500'>
                  <Loader2 size={13} className='animate-spin' />
                  Searching...
                </div>
              )}
              {!isFetching && filtered.length === 0 && (
                <div className='px-3 py-2.5 text-[13px] text-slate-500'>No problems found.</div>
              )}
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type='button'
                  className='hover:bg-surface-raised-hover light:text-slate-600 flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-slate-300 transition-colors'
                  onClick={() => {
                    onSelectProblem(p);
                    setShowDropdown(false);
                    inputRef.current?.blur();
                  }}
                >
                  <span className='min-w-0 flex-1 truncate'>{formatProblemOption(p)}</span>
                </button>
              ))}
            </div>,
            document.body,
          )}
      </div>

      {/* Pitch selector (only for multi-pitch problems) */}
      {(problem.problemNumPitches ?? 0) > 1 && (
        <div className='relative shrink-0'>
          <select
            value={problem.problemPitch ?? 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              onPitchChange(val === 0 ? undefined : val);
            }}
            className={cn(
              'bg-surface-nav border-surface-border type-body appearance-none rounded-lg border py-1.5 pr-6 pl-2.5 text-sm transition-colors focus:outline-none',
              problem.problemPitch != null
                ? 'border-surface-border focus:border-brand-border/60'
                : 'border-rose-500/50 focus:border-rose-400/70',
            )}
          >
            <option value={0}>No pitch</option>
            {Array.from({ length: problem.problemNumPitches ?? 0 }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                Pitch {p}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className='pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-500'
          />
        </div>
      )}

      {/* Time input (video only) */}
      {showTimeInput && (
        <div className='flex shrink-0 items-center gap-1.5'>
          <Clock size={14} className='shrink-0 text-slate-500' />
          <ProblemTimeInput milliseconds={problem.milliseconds ?? 0} maxSeconds={maxSeconds} onChange={onTimeChange} />
        </div>
      )}

      {/* Trivia toggle */}
      <label className='flex shrink-0 items-center gap-1.5 text-xs text-slate-400'>
        <input
          type='checkbox'
          checked={problem.trivia ?? false}
          onChange={(e) => onTriviaChange(e.target.checked)}
          className='text-brand focus:ring-brand/50 h-4 w-4 rounded border-white/20 bg-slate-700 focus:ring-2'
        />
        Trivia
      </label>

      <button
        type='button'
        onClick={handleRemove}
        className='shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400'
        aria-label='Remove problem'
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

/** A controlled M:SS time input that doesn't fight the user's typing. */
const ProblemTimeInput = ({
  milliseconds,
  maxSeconds,
  onChange,
}: {
  milliseconds: number;
  maxSeconds: number;
  onChange: (val: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const seconds = milliseconds / 1000;
  const exceedsMax = maxSeconds > 0 && seconds > maxSeconds;

  // When not focused, derive display from milliseconds
  const displayValue = focused ? draft : secondsToTimeStr(seconds);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits and colon
    const cleaned = raw.replace(/[^0-9:]/g, '');
    // Prevent more than one colon
    if ((cleaned.match(/:/g) || []).length > 1) return;
    // Prevent more than 5 characters (MM:SS)
    if (cleaned.length > 5) return;
    setDraft(cleaned);
  };

  const handleBlur = () => {
    setFocused(false);
    // Validate: clamp to max duration
    const parsed = timeStrToSeconds(draft);
    if (maxSeconds > 0 && parsed > maxSeconds) {
      onChange(secondsToTimeStr(maxSeconds));
    } else {
      onChange(draft);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setDraft(secondsToTimeStr(seconds));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className='relative'>
      <input
        type='text'
        inputMode='numeric'
        placeholder='M:SS'
        className={cn(
          'bg-surface-nav border-surface-border type-body focus:border-brand-border/60 w-28 rounded-lg border px-3 py-2 font-mono text-sm transition-colors placeholder:opacity-50 focus:outline-none',
          exceedsMax && 'border-amber-500/60 text-amber-300',
        )}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {exceedsMax && (
        <span className='absolute -bottom-4 left-0 text-[11px] whitespace-nowrap text-amber-400'>
          Max {secondsToTimeStr(maxSeconds)}
        </span>
      )}
    </div>
  );
};

export default MediaEdit;
