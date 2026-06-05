import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { Save, Loader2, Image, X, ChevronDown, Plus } from 'lucide-react';

import type { components } from '../../@types/buldreinfo/swagger';
import {
  useMediaSvg,
  putMedia,
  postMediaImage,
  postMediaVideoInitiate,
  postMediaVideoComplete,
  postMediaVideoEmbed,
  uploadToPresignedUrl,
  useArea,
  useSector,
} from '../../api';
import { getMediaFileUrl, mediaIdentityId, mediaIdentityVersionStamp } from '../../api/utils';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Card } from '../../shared/ui';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { useMeta } from '../../shared/components/Meta/context';
import { secondsToTimeStr } from '../../shared/components/MediaEdit/problemUtils';
import type { ProblemState } from '../../shared/components/MediaEdit/ProblemRow';
import { MediaMetadataCard } from '../../shared/components/MediaEdit/MediaMetadataCard';
import type {
  MediaConnectionType,
  MediaMetadata,
  MediaMetadataCallbacks,
} from '../../shared/components/MediaEdit/MediaMetadataCard';
import { MediaDropzoneEmbed } from '../../shared/components/MediaEdit/MediaDropzoneEmbed';
import type { DropzoneFile } from '../../shared/components/MediaEdit/MediaDropzoneEmbed';
import { UploadProgressDialog } from '../../shared/components/MediaEdit/UploadProgressDialog';
import type { UploadTask } from '../../shared/components/MediaEdit/UploadProgressDialog';

type Media = components['schemas']['Media'];
type User = components['schemas']['User'];

/** A file being added — holds the file data and its own metadata. */
type UploadItem = {
  file?: File;
  preview?: string;
  embedVideoUrl?: string;
  embedThumbnailUrl?: string;
  description: string;
  photographer: User | undefined;
  tagged: User[];
  problems: ProblemState[];
  /** Trivia state for connected areas (add mode) */
  areaTrivia: boolean;
  /** Trivia state for connected sectors (add mode) */
  sectorTrivia: boolean;
  /** Thumbnail picker state (for videos) */
  thumbnailSeconds: number;
  thumbnailDuration: number;
};

const makeEmptyItem = (): UploadItem => ({
  description: '',
  photographer: undefined,
  tagged: [],
  problems: [],
  areaTrivia: false,
  sectorTrivia: false,
  thumbnailSeconds: 0,
  thumbnailDuration: 0,
});

/** Connection type options shown in the dropdown (excludes guestbook) */
const CONNECTION_TYPE_OPTIONS: { value: MediaConnectionType; label: string }[] = [
  { value: 'area', label: 'Connected to area' },
  { value: 'sector', label: 'Connected to sector' },
  { value: 'problem', label: 'Connected to problem(s)' },
  { value: 'trail', label: 'Connected to trail(s)' },
];

const MediaEdit = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mediaId } = useParams();
  const mediaIdNum = Number(mediaId ?? 0);
  const [searchParams] = useSearchParams();
  const meta = useMeta();

  // ── Add-mode query params ──────────────────────────────────────────
  const addType = (searchParams.get('type') ?? 'problem') as MediaConnectionType;
  const addEntityId = Number(searchParams.get('id') ?? 0);
  const addEntityName = searchParams.get('name') ?? '';
  const addAreaName = searchParams.get('areaName') ?? '';
  const addSectorName = searchParams.get('sectorName') ?? '';
  const addNumPitches = Number(searchParams.get('numPitches') ?? 0);
  const addTrailId = Number(searchParams.get('trailId') ?? 0);

  const isAddMode = !mediaId || mediaId === 'add';

  // ── Edit mode: load existing media ──────────────────────────────────
  const { media: data, isLoading } = useMediaSvg(mediaIdNum) as ReturnType<typeof useMediaSvg>;
  const m: Media | undefined = data;

  // ── Edit mode state ────────────────────────────────────────────────
  const [description, setDescription] = useState('');
  const [photographer, setPhotographer] = useState<User | undefined>(undefined);
  const [tagged, setTagged] = useState<User[]>([]);
  const [problems, setProblems] = useState<ProblemState[]>([]);
  const [trails, setTrails] = useState<{ trailId: number; trailTitle?: string }[]>([]);
  const [areaTrivia, setAreaTrivia] = useState<Record<number, boolean>>({});
  const [sectorTrivia, setSectorTrivia] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Add-mode state
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);

  // Edit-mode: thumbnail picker
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailSeconds, setThumbnailSeconds] = useState<number>(0);
  const [thumbnailDuration, setThumbnailDuration] = useState(0);

  // ── Connection type & move-to state (edit mode only) ───────────────
  const [editConnectionType, setEditConnectionType] = useState<MediaConnectionType | null>(null);
  const [moveTarget, setMoveTarget] = useState<{
    type: MediaConnectionType;
    id: number;
    name: string;
    areaName?: string;
    sectorName?: string;
  } | null>(null);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  // ── Context IDs for fetching area/sector data ──────────────────────
  // These are derived from the media's current connections, so we can
  // show the correct entity dropdowns (sectors in area, trails in sector).
  // For trails, areaId/sectorId are now in the sectors array (MediaTrailSector[])
  const trailAreaId = m?.trails?.[0]?.sectors?.[0]?.areaId ?? 0;
  const trailSectorId = m?.trails?.[0]?.sectors?.[0]?.sectorId ?? 0;
  const contextAreaId =
    m?.sectors?.[0]?.areaId ?? m?.areas?.[0]?.areaId ?? m?.problems?.[0]?.areaId ?? trailAreaId ?? 0;
  const contextSectorId = m?.sectors?.[0]?.sectorId ?? m?.problems?.[0]?.sectorId ?? trailSectorId ?? 0;

  const { data: areaData } = useArea(contextAreaId);
  // Fetch sector data for the current sector context (if any)
  const { data: sectorData } = useSector(contextSectorId);
  // Collect all sector IDs in the area so we can fetch trails from all of them
  const sectorIdsInArea = useMemo(
    () => (areaData?.sectors ?? []).map((s) => s.id).filter((id): id is number => !!id && id > 0),
    [areaData?.sectors],
  );
  // When media is connected to an area (no sector), fetch the first sector's data
  // to get trail options for the area
  const fallbackSectorId = !contextSectorId && sectorIdsInArea.length > 0 ? sectorIdsInArea[0] : 0;
  const { data: fallbackSectorData } = useSector(fallbackSectorId);

  // ── Initialize edit mode from loaded data ──────────────────────────
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!m || initializedRef.current) return;
    initializedRef.current = true;
    setDescription(m.description ?? '');
    setPhotographer(m.photographer ? { id: m.photographer.id, name: m.photographer.name } : undefined);
    setTagged(m.tagged ?? []);
    setProblems(m.problems ?? []);
    // Deduplicate by trailId (a trail can span multiple sectors, resulting in duplicate entries)
    setTrails(
      (m.trails ?? []).reduce<{ trailId: number; trailTitle?: string }[]>((acc, t) => {
        const id = t.trailId ?? 0;
        if (!acc.some((a) => a.trailId === id)) {
          acc.push({ trailId: id, trailTitle: t.trailTitle });
        }
        return acc;
      }, []),
    );

    setAreaTrivia(Object.fromEntries((m.areas ?? []).map((a) => [a.areaId ?? 0, a.trivia ?? false])));
    setSectorTrivia(Object.fromEntries((m.sectors ?? []).map((s) => [s.sectorId ?? 0, s.trivia ?? false])));
    setThumbnailSeconds(m.thumbnailSeconds ?? 0);

    // Derive initial connection type from loaded data
    const initialType: MediaConnectionType = (() => {
      if (m.guestbookId) return 'guestbook';
      if (m.userAvatarId) return 'user';
      if ((m.areas ?? []).length > 0) return 'area';
      if ((m.sectors ?? []).length > 0) return 'sector';
      if ((m.trails ?? []).length > 0) return 'trail';
      return 'problem';
    })();

    setEditConnectionType(initialType);
  }, [m]);

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

  const connectionType: MediaConnectionType = isAddMode ? addType : (editConnectionType ?? 'problem');

  /** Switch connection type — auto-selects first entity in context */
  const handleChangeConnectionType = (newType: MediaConnectionType) => {
    setEditConnectionType(newType);
    if (newType !== 'problem') {
      setProblems([]);
    }
    // For trails, areaId/sectorId are now in the sectors array (MediaTrailSector[])
    const trailAreaId = m?.trails?.[0]?.sectors?.[0]?.areaId ?? 0;
    const trailSectorId = m?.trails?.[0]?.sectors?.[0]?.sectorId ?? 0;
    // Auto-select the first entity in context
    if (newType === 'area') {
      const areaId = m?.areas?.[0]?.areaId ?? m?.sectors?.[0]?.areaId ?? m?.problems?.[0]?.areaId ?? trailAreaId ?? 0;
      const areaName = m?.areas?.[0]?.areaName ?? areaData?.name ?? m?.problems?.[0]?.areaName ?? '';
      if (areaId > 0) {
        setMoveTarget({ type: 'area', id: areaId, name: areaName });
      } else {
        setMoveTarget(null);
      }
    } else if (newType === 'sector') {
      const sectorId = m?.sectors?.[0]?.sectorId ?? m?.problems?.[0]?.sectorId ?? trailSectorId ?? 0;
      const sectorName = m?.sectors?.[0]?.sectorName ?? sectorData?.name ?? m?.problems?.[0]?.sectorName ?? '';
      const areaName = m?.sectors?.[0]?.areaName ?? sectorData?.areaName ?? m?.problems?.[0]?.areaName ?? '';
      if (sectorId > 0) {
        setMoveTarget({ type: 'sector', id: sectorId, name: sectorName, areaName });
      } else {
        setMoveTarget(null);
      }
    } else if (newType === 'trail') {
      const trails = sectorData?.trails ?? [];
      if (trails.length > 0) {
        const first = trails[0];
        setMoveTarget({ type: 'trail', id: first.id ?? 0, name: first.title ?? `#${first.id ?? 0}` });
      } else {
        setMoveTarget(null);
      }
    } else {
      setMoveTarget(null);
    }

    setTypeDropdownOpen(false);
  };

  /** Select a new entity to move the media to */
  const handleSelectEntity = (type: MediaConnectionType, id: number, name: string, areaName?: string) => {
    setMoveTarget({ type, id, name, areaName });
  };

  // ── Build entity dropdown options based on connection type ─────────
  // Only shows entities IN CONTEXT (the area/sector/trail the media is currently connected to,
  // or siblings in the same area/sector hierarchy)
  const entityOptions = useMemo(() => {
    if (connectionType === 'area') {
      // Only the area the media is currently in context of
      const trailAreaId = m?.trails?.[0]?.sectors?.[0]?.areaId ?? 0;
      const areaId = m?.areas?.[0]?.areaId ?? m?.sectors?.[0]?.areaId ?? m?.problems?.[0]?.areaId ?? trailAreaId ?? 0;
      const areaName = m?.areas?.[0]?.areaName ?? areaData?.name ?? m?.problems?.[0]?.areaName ?? '';
      if (areaId > 0) {
        return [{ id: areaId, name: areaName, label: areaName }];
      }
      return [];
    }

    if (connectionType === 'sector') {
      // All sectors in the same area (so user can move between sectors)
      return (areaData?.sectors ?? []).map((s) => ({
        id: s.id ?? 0,
        name: s.name ?? '',
        label: `${s.name ?? ''}${s.areaName ? ` (${s.areaName})` : ''}`,
      }));
    }

    if (connectionType === 'trail') {
      // Trails in the same sector (the sector the media is currently in)
      // NOTE: WS getSectorTrails doesn't populate t.sectors, so use sectorData.name
      const sn = sectorData?.name ?? '';
      const an = sectorData?.areaName ?? '';
      const suffix = an && sn ? `${an} · ${sn}` : an || sn || '';
      return (sectorData?.trails ?? []).map((t) => {
        const id = t.id ?? 0;
        const title = t.title ?? `#${id}`;
        return {
          id,
          name: title,
          label: suffix ? `${title} (${suffix})` : title,
        };
      });
    }
    return [];
  }, [connectionType, m, areaData, sectorData]);

  // ── Trail options for dropdown (all trails in context) ──────────────
  // Collects trails from the current sector context AND from the fallback
  // sector (first sector in the area, used when media is connected to area
  // with no sector).
  // NOTE: The WS getSectorTrails does NOT populate t.sectors, so we derive
  // the sector name from the sector data itself (sectorData.name/areaName).
  const trailOptions = useMemo(() => {
    const seen = new Set<number>();
    // Build a map of trailId -> sector name from the sector data context
    const sectorName = sectorData?.name ?? '';
    const areaName = sectorData?.areaName ?? '';
    const fallbackSectorName = fallbackSectorData?.name ?? '';
    const fallbackAreaName = fallbackSectorData?.areaName ?? '';
    const allTrails = [...(sectorData?.trails ?? []), ...(fallbackSectorData?.trails ?? [])];
    return allTrails
      .filter((t) => {
        const id = t.id ?? 0;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((t) => {
        const id = t.id ?? 0;
        const title = t.title ?? `#${id}`;
        // Determine which sector context this trail comes from
        const isFromSectorData = sectorData?.trails?.some((st) => st.id === id);
        const sn = isFromSectorData ? sectorName : fallbackSectorName;
        const an = isFromSectorData ? areaName : fallbackAreaName;
        const suffix = an && sn ? `${an} · ${sn}` : an || sn || '';
        return {
          id,
          title,
          label: suffix ? `${title} (${suffix})` : title,
          sectorName: suffix,
        };
      });
  }, [sectorData, fallbackSectorData]);

  // ── Build edit-mode metadata for the shared card ────────────────────
  // Derive trail display labels from trailOptions (includes sector context)
  // Keep trailTitle as undefined for unselected trails (trailId === 0) so TrailRow shows "Select trail..."
  const trailsWithLabels = useMemo(
    () =>
      trails.map((t) => {
        if (!t.trailId || t.trailId === 0) {
          return { trailId: 0, trailTitle: undefined };
        }
        const opt = trailOptions.find((o) => o.id === t.trailId);
        return { trailId: t.trailId, trailTitle: opt?.label ?? t.trailTitle ?? `#${t.trailId}` };
      }),
    [trails, trailOptions],
  );

  const editMetadata: MediaMetadata = {
    description,
    photographer,
    tagged,
    problems,
    areas:
      connectionType === 'area' && moveTarget
        ? [{ areaId: moveTarget.id, areaName: moveTarget.name, trivia: areaTrivia[moveTarget.id] ?? false }]
        : connectionType === 'area' && m
          ? (m.areas ?? []).map((a) => ({
              areaId: a.areaId ?? 0,
              areaName: a.areaName ?? '',
              trivia: areaTrivia[a.areaId ?? 0] ?? false,
            }))
          : undefined,
    sectors:
      connectionType === 'sector' && moveTarget
        ? [
            {
              sectorId: moveTarget.id,
              sectorName: moveTarget.name,
              areaName: moveTarget.areaName,
              trivia: sectorTrivia[moveTarget.id] ?? false,
            },
          ]
        : connectionType === 'sector' && m
          ? (m.sectors ?? []).map((s) => ({
              sectorId: s.sectorId ?? 0,
              sectorName: s.sectorName ?? '',
              areaName: s.areaName ?? '',
              trivia: sectorTrivia[s.sectorId ?? 0] ?? false,
            }))
          : undefined,
    guestbook: connectionType === 'guestbook' && m ? { guestbookId: m.guestbookId ?? 0 } : undefined,
    trails: connectionType === 'trail' ? trailsWithLabels : undefined,
  };

  const editCallbacks: MediaMetadataCallbacks = {
    onDescriptionChange: setDescription,
    onPhotographerChange: (u) => setPhotographer(u),
    onTaggedChange: setTagged,
    onProblemsChange: setProblems,
    onAreaTriviaChange: (areaId, trivia) => setAreaTrivia((prev) => ({ ...prev, [areaId]: trivia })),
    onSectorTriviaChange: (sectorId, trivia) => setSectorTrivia((prev) => ({ ...prev, [sectorId]: trivia })),
    onTrailsChange: setTrails,
  };

  // ── Upload progress state ──────────────────────────────────────────
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);

  // ── Save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    // Build task list for progress dialog (add mode only, when there are actual uploads)
    if (isAddMode) {
      const tasks: UploadTask[] = uploadItems.map((item, i) => {
        const label = item.file ? item.file.name : item.embedVideoUrl ? 'Embedded video' : `Media #${i + 1}`;
        return { label, state: 'pending' as const };
      });
      setUploadTasks(tasks);
    }

    const updateTask = (index: number, patch: Partial<UploadTask>) => {
      setUploadTasks((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    };

    try {
      const token = await getAccessTokenSilently();

      if (isAddMode) {
        for (let i = 0; i < uploadItems.length; i++) {
          const item = uploadItems[i];
          const body: components['schemas']['Media'] = {
            description: item.description,
            photographer: item.photographer
              ? { id: item.photographer.id ?? 0, name: item.photographer.name ?? '' }
              : undefined,
            tagged: item.tagged.map((u) => ({ id: u.id ?? 0, name: u.name ?? '' })),
            embedUrl: item.embedVideoUrl,
          };
          if (connectionType === 'problem') {
            body.problems = item.problems.map((p) => ({
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
            body.areas = [{ areaId: addEntityId, areaName: addEntityName, trivia: item.areaTrivia }];
          } else if (connectionType === 'sector') {
            body.sectors = [{ sectorId: addEntityId, sectorName: addEntityName, trivia: item.sectorTrivia }];
          } else if (connectionType === 'trail' && addTrailId > 0) {
            body.trails = [{ trailId: addTrailId }];
          }
          if (item.file) {
            const isVideo = item.file.type.startsWith('video/');
            if (isVideo) {
              // Include thumbnailSeconds for video uploads
              body.thumbnailSeconds = Math.floor(item.thumbnailSeconds);
              updateTask(i, { state: 'uploading', progress: 0 });
              // Video: initiate → upload to presigned URL → complete
              const { id, presignedUrl } = await postMediaVideoInitiate(token, body, item.file.size, item.file.type);
              if (!presignedUrl) {
                throw new Error('No presigned URL returned from server');
              }
              updateTask(i, { state: 'uploading', progress: 0 });
              await uploadToPresignedUrl(presignedUrl, item.file, (pct) => {
                updateTask(i, { progress: pct });
              });
              updateTask(i, { state: 'processing', progress: 100 });
              await postMediaVideoComplete(token, id!);
              updateTask(i, { state: 'done' });
            } else {
              // Image: direct multipart upload
              updateTask(i, { state: 'uploading' });
              await postMediaImage(token, body, item.file);
              updateTask(i, { state: 'done' });
            }
          } else {
            // Embed-only (no file) — use the dedicated /media/video/embed endpoint
            updateTask(i, { state: 'uploading' });
            await postMediaVideoEmbed(token, body);
            updateTask(i, { state: 'done' });
          }
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['/media'] }),
          queryClient.invalidateQueries({ queryKey: ['/problem'] }),
          queryClient.invalidateQueries({ queryKey: ['/areas'] }),
          queryClient.invalidateQueries({ queryKey: ['/sectors'] }),
        ]);
        if (connectionType === 'problem' && addEntityId) {
          navigate(`/problem/${addEntityId}`);
        } else if (connectionType === 'sector' && addEntityId) {
          navigate(`/sector/${addEntityId}`);
        } else if (connectionType === 'area' && addEntityId) {
          navigate(`/area/${addEntityId}`);
        } else if (connectionType === 'trail' && addTrailId) {
          navigate(-1);
        } else {
          navigate(-1);
        }
      } else {
        if (!m) return;
        const id = mediaIdentityId(m.identity);
        const body: components['schemas']['Media'] = {
          ...m,
          identity: { ...m.identity, id },
          description,
          photographer: photographer ? { id: photographer.id ?? 0, name: photographer.name ?? '' } : undefined,
          tagged: tagged.map((u) => ({ id: u.id ?? 0, name: u.name ?? '' })),
          thumbnailSeconds: Math.floor(thumbnailSeconds),
          // Clear all connection fields — only the active type will be set below
          areas: undefined,
          sectors: undefined,
          problems: undefined,
          trails: undefined,
          guestbookId: undefined,
          userAvatarId: undefined,
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
          body.areas = moveTarget
            ? [{ areaId: moveTarget.id, areaName: moveTarget.name, trivia: areaTrivia[moveTarget.id] ?? false }]
            : (m.areas ?? []).map((a) => ({
                ...a,
                trivia: areaTrivia[a.areaId ?? 0] ?? false,
              }));
        } else if (connectionType === 'sector') {
          body.sectors = moveTarget
            ? [{ sectorId: moveTarget.id, sectorName: moveTarget.name, trivia: sectorTrivia[moveTarget.id] ?? false }]
            : (m.sectors ?? []).map((s) => ({
                ...s,
                trivia: sectorTrivia[s.sectorId ?? 0] ?? false,
              }));
        } else if (connectionType === 'trail') {
          body.trails = trails.map((t) => ({ trailId: t.trailId ?? 0, trailTitle: t.trailTitle }));
        }

        await putMedia(token, body);
        await Promise.all([
          queryClient.refetchQueries({
            predicate: (q) => {
              const key = q.queryKey;
              if (!Array.isArray(key) || key[0] !== '/media') return false;
              const meta = key[1];
              if (meta == null || typeof meta !== 'object') return false;
              return 'idMedia' in meta && (meta as { idMedia: number }).idMedia === mediaIdNum;
            },
          }),
          queryClient.refetchQueries({ queryKey: ['/problem'] }),
        ]);
        navigate(-1);
      }
    } catch (error) {
      console.warn(error);
      const msg = error instanceof Error ? error.message : String(error);
      // Mark any pending/uploading tasks as errored
      setUploadTasks((prev) =>
        prev.map((t) =>
          t.state === 'pending' || t.state === 'uploading' || t.state === 'processing'
            ? { ...t, state: 'error' as const, error: msg }
            : t,
        ),
      );
      // Keep dialog visible for a moment so user can see the error
      await new Promise((r) => setTimeout(r, 3000));
      setUploadTasks([]);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit-mode: thumbnail picker handlers ────────────────────────────
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

  // ── Validation (edit mode) ──────────────────────────────────────────
  const hasEmptyProblem = problems.some((p) => !p.problemId || !p.problemName);
  const hasDuplicateTime = problems.some(
    (p, i) =>
      (p.milliseconds ?? 0) > 0 && problems.findIndex((c) => (c.milliseconds ?? 0) === (p.milliseconds ?? 0)) !== i,
  );
  const hasNoProblems = connectionType === 'problem' && problems.length === 0;
  const hasNoTrails =
    connectionType === 'trail' && (trails.length === 0 || trails.some((t) => !t.trailId || t.trailId === 0));

  // If media is connected to multiple problems, the type dropdown is read-only (can't move)
  const typeReadOnly = connectionType === 'problem' && (m?.problems ?? []).length > 1;
  // Validate that a connection target is selected for the current type
  const hasNoArea = connectionType === 'area' && !moveTarget && (!m?.areas || m.areas.length === 0);
  const hasNoSector = connectionType === 'sector' && !moveTarget && (!m?.sectors || m.sectors.length === 0);
  const canSave =
    !!photographer &&
    !hasEmptyProblem &&
    !hasDuplicateTime &&
    !hasNoProblems &&
    !hasNoTrails &&
    !hasNoArea &&
    !hasNoSector;

  // ── Validation (add mode) ────────────────────────────────────────────
  const canSaveAdd =
    uploadItems.length > 0 &&
    uploadItems.every((item) => {
      const hasPhotographer = !!item.photographer;
      if (connectionType === 'problem') {
        return hasPhotographer && item.problems.length > 0 && item.problems.every((p) => p.problemId && p.problemName);
      }
      return hasPhotographer;
    });

  // ── Add-mode: dropzone + embed ──────────────────────────────────────
  const handleFilesAdded = useCallback(
    (files: DropzoneFile[]) => {
      const newItems = files.map((f) => {
        const item = makeEmptyItem();
        item.file = f.file;
        item.preview = f.preview;
        // Pre-fill photographer
        if (meta?.authenticatedName) {
          item.photographer = { id: 0, name: meta.authenticatedName };
        }
        // Pre-fill problem if adding to a problem
        if (addType === 'problem' && addEntityId > 0 && addEntityName) {
          item.problems = [
            {
              problemId: addEntityId,
              problemName: addEntityName,
              problemGrade: searchParams.get('grade') ?? '',
              areaName: addAreaName,
              sectorName: addSectorName,
              milliseconds: 0,
              problemNumPitches: addNumPitches,
            },
          ];
        }
        return item;
      });
      setUploadItems((existing) => [...existing, ...newItems]);
    },
    [
      addType,
      addEntityId,
      addEntityName,
      addAreaName,
      addSectorName,
      addNumPitches,
      searchParams,
      meta?.authenticatedName,
    ],
  );

  const handleEmbedAdded = useCallback(
    (info: {
      embedVideoUrl: string | undefined;
      embedThumbnailUrl: string | undefined;
      embedMilliseconds?: number;
    }) => {
      const item = makeEmptyItem();
      item.embedVideoUrl = info.embedVideoUrl;
      item.embedThumbnailUrl = info.embedThumbnailUrl;
      // Pre-fill photographer
      if (meta?.authenticatedName) {
        item.photographer = { id: 0, name: meta.authenticatedName };
      }
      // Pre-fill problem if adding to a problem
      if (addType === 'problem' && addEntityId > 0 && addEntityName) {
        item.problems = [
          {
            problemId: addEntityId,
            problemName: addEntityName,
            problemGrade: searchParams.get('grade') ?? '',
            areaName: addAreaName,
            sectorName: addSectorName,
            milliseconds: 0,
            problemNumPitches: addNumPitches,
          },
        ];
      }
      setUploadItems((old) => [...old, item]);
    },
    [
      addType,
      addEntityId,
      addEntityName,
      addAreaName,
      addSectorName,
      addNumPitches,
      searchParams,
      meta?.authenticatedName,
    ],
  );

  // ── Helpers to update a single upload item ──────────────────────────
  const updateItem = (index: number, patch: Partial<UploadItem>) => {
    setUploadItems((old) => {
      const next = [...old];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setUploadItems((old) => {
      const item = old[index];
      if (item.preview) URL.revokeObjectURL(item.preview);
      return old.filter((_, i) => i !== index);
    });
  };

  // ── Build per-item metadata for the shared card ─────────────────────
  const buildItemMetadata = (item: UploadItem): MediaMetadata => ({
    description: item.description,
    photographer: item.photographer,
    tagged: item.tagged,
    problems: item.problems,
    areas:
      connectionType === 'area'
        ? [{ areaId: addEntityId, areaName: addEntityName, trivia: item.areaTrivia }]
        : undefined,
    sectors:
      connectionType === 'sector'
        ? [{ sectorId: addEntityId, sectorName: addEntityName, areaName: addAreaName, trivia: item.sectorTrivia }]
        : undefined,
    trails:
      connectionType === 'trail' && addTrailId > 0
        ? [{ trailId: addTrailId, trailName: addEntityName || `Trail #${addTrailId}` }]
        : undefined,
  });

  const buildItemCallbacks = (idx: number): MediaMetadataCallbacks => ({
    onDescriptionChange: (val) => updateItem(idx, { description: val }),
    onPhotographerChange: (u) => updateItem(idx, { photographer: u }),
    onTaggedChange: (users) => updateItem(idx, { tagged: users }),
    onProblemsChange: (problems) => updateItem(idx, { problems }),
    onAreaTriviaChange: (_areaId, trivia) => updateItem(idx, { areaTrivia: trivia }),
    onSectorTriviaChange: (_sectorId, trivia) => updateItem(idx, { sectorTrivia: trivia }),
  });

  // ── Loading / error states ──────────────────────────────────────────
  if (!isAddMode && isLoading) {
    return <Loading />;
  }

  if (!isAddMode && !m) {
    return (
      <div className='w-full min-w-0 space-y-4 p-4'>
        <p className='text-slate-400'>Media not found.</p>
      </div>
    );
  }

  const mediaIdVal = !isAddMode && m ? mediaIdentityId(m.identity) : 0;

  const title = isAddMode
    ? `Add media${meta?.title ? ` | ${meta.title}` : ''}`
    : `Edit ${isVideo ? 'video' : 'image'} #${mediaIdVal}${meta?.title ? ` | ${meta.title}` : ''}`;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <>
      <title>{title}</title>
      <div className='w-full min-w-0 space-y-4'>
        {/* Title */}
        <h1 className={cn(designContract.typography.subtitle, 'text-slate-100')}>
          {isAddMode ? 'Add media' : `Edit ${isVideo ? 'video' : 'image'}`}
        </h1>

        {/* ── Add mode: dropzone + embed card ──────────────────────────── */}
        {isAddMode && (
          <Card>
            <MediaDropzoneEmbed onFilesAdded={handleFilesAdded} onEmbedAdded={handleEmbedAdded} />
          </Card>
        )}

        {/* ── Add mode: one card per upload item ──────────────────────── */}
        {isAddMode &&
          uploadItems.map((item, idx) => {
            const isVideoItem = item.file?.type?.startsWith('video/') || !!item.embedVideoUrl;
            const showConnectedFullWidth = isVideoItem && connectionType === 'problem';
            return (
              <UploadItemCard
                key={idx}
                item={item}
                idx={idx}
                connectionType={connectionType}
                metadata={buildItemMetadata(item)}
                callbacks={buildItemCallbacks(idx)}
                onRemove={removeItem}
                onUpdate={updateItem}
                showConnectedFullWidth={showConnectedFullWidth}
              />
            );
          })}

        {/* ── Edit mode: media preview + metadata ──────────────────────── */}
        {!isAddMode && (
          <Card>
            {m && (
              <>
                {/* Header with media ID */}
                <div className='mb-3'>
                  <span className='text-[13px] font-medium text-slate-400'>Media #{mediaIdVal}</span>
                </div>

                {/* Grid: left = basic metadata + connected (if not video+problem), right = preview */}
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {/* Left: Description, Photographer, In shot, Thumbnail picker, Connected (if not video+problem) */}
                  <div>
                    <MediaMetadataCard
                      variant='basic'
                      metadata={editMetadata}
                      callbacks={editCallbacks}
                      connectionType={connectionType}
                    />

                    {/* Thumbnail picker for videos (hidden for embedded videos) */}
                    {isVideo && !hasEmbed && (
                      <div className='mt-3 space-y-1.5'>
                        <div className='flex items-center gap-2'>
                          <Image size={14} className='text-slate-500' />
                          <span className='text-xs font-medium text-slate-400'>Thumbnail frame</span>
                          <span className='ml-auto text-xs text-slate-500'>
                            {secondsToTimeStr(thumbnailSeconds)} / {secondsToTimeStr(thumbnailDuration)}
                          </span>
                        </div>
                        <input
                          type='range'
                          min={0}
                          max={Math.floor(thumbnailDuration) || 1}
                          step={1}
                          value={Math.floor(thumbnailSeconds)}
                          onChange={(e) => {
                            const t = Number(e.target.value);
                            setThumbnailSeconds(t);
                            if (videoRef.current) {
                              videoRef.current.currentTime = t;
                            }
                          }}
                          className='w-full'
                        />
                      </div>
                    )}

                    {/* Connected section (unless video + problem with timestamps) */}
                    {!(isVideo && connectionType === 'problem') && (
                      <ConnectedSection
                        connectionType={connectionType}
                        editMetadata={editMetadata}
                        editCallbacks={editCallbacks}
                        typeDropdownOpen={typeDropdownOpen}
                        setTypeDropdownOpen={setTypeDropdownOpen}
                        onConnectionTypeChange={handleChangeConnectionType}
                        sectorOptions={entityOptions}
                        onSectorChange={(sectorId, sectorName) => handleSelectEntity('sector', sectorId, sectorName)}
                        trailOptions={trailOptions}
                        thumbnailDuration={thumbnailDuration}
                        isVideo={isVideo}
                        hasEmptyProblem={hasEmptyProblem}
                        hasDuplicateTime={hasDuplicateTime}
                        hasNoProblems={hasNoProblems}
                        hasNoTrails={hasNoTrails}
                        typeReadOnly={typeReadOnly}
                      />
                    )}
                  </div>
                  {/* Right: Preview */}
                  <div>
                    {hasEmbed ? (
                      <div className='aspect-video w-full overflow-hidden rounded-xl bg-black'>
                        <iframe
                          src={embedSrc}
                          className='h-full w-full'
                          allow='autoplay; fullscreen; picture-in-picture'
                          allowFullScreen
                          title='Embedded video'
                        />
                      </div>
                    ) : isVideo ? (
                      <video
                        ref={videoRef}
                        src={getMediaFileUrl(
                          mediaIdentityId(m.identity),
                          mediaIdentityVersionStamp(m.identity),
                          !!m.isMovie,
                        )}
                        className='w-full rounded-xl'
                        controls
                        onLoadedMetadata={handleLoadedMetadata}
                      />
                    ) : (
                      <img
                        src={getMediaFileUrl(
                          mediaIdentityId(m.identity),
                          mediaIdentityVersionStamp(m.identity),
                          !!m.isMovie,
                        )}
                        alt={m.description ?? ''}
                        className='w-full rounded-xl'
                      />
                    )}
                  </div>
                </div>

                {/* Full-width row: connected problems with timestamps (only for video + problem) */}
                {isVideo && connectionType === 'problem' && (
                  <div className='mt-4'>
                    <ConnectedSection
                      connectionType={connectionType}
                      editMetadata={editMetadata}
                      editCallbacks={editCallbacks}
                      typeDropdownOpen={typeDropdownOpen}
                      setTypeDropdownOpen={setTypeDropdownOpen}
                      onConnectionTypeChange={handleChangeConnectionType}
                      sectorOptions={entityOptions}
                      onSectorChange={(sectorId, sectorName) => handleSelectEntity('sector', sectorId, sectorName)}
                      trailOptions={trailOptions}
                      thumbnailDuration={thumbnailDuration}
                      isVideo={true}
                      hasEmptyProblem={hasEmptyProblem}
                      hasDuplicateTime={hasDuplicateTime}
                      hasNoProblems={hasNoProblems}
                      hasNoTrails={hasNoTrails}
                      typeReadOnly={typeReadOnly}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* ── Cancel / Save buttons (outside all cards) ──────────────────── */}
        <div className='flex items-center justify-end gap-3'>
          <button type='button' onClick={() => navigate(-1)} className='form-footer-cancel'>
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={saving || (isAddMode && !canSaveAdd) || (!isAddMode && !canSave)}
            className='type-label flex items-center gap-2 rounded-lg bg-emerald-400 px-8 py-2.5 text-slate-950 shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-300 disabled:opacity-50'
          >
            {saving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Upload progress dialog */}
      {uploadTasks.length > 0 && <UploadProgressDialog tasks={uploadTasks} />}
    </>
  );
};

// ── ConnectedSection: type dropdown + entity content ──────────────────
type ConnectedSectionProps = {
  connectionType: MediaConnectionType;
  editMetadata: MediaMetadata;
  editCallbacks: MediaMetadataCallbacks;
  typeDropdownOpen: boolean;
  setTypeDropdownOpen: (v: boolean) => void;
  onConnectionTypeChange: (t: MediaConnectionType) => void;
  sectorOptions: { id: number; name: string; label: string }[];
  onSectorChange: (sectorId: number, sectorName: string) => void;
  trailOptions: { id: number; title: string; label: string }[];
  thumbnailDuration: number;
  isVideo: boolean;
  hasEmptyProblem: boolean;
  hasDuplicateTime: boolean;
  hasNoProblems: boolean;
  hasNoTrails: boolean;
  /** If true, the type dropdown is disabled (read-only label) */
  typeReadOnly?: boolean;
};

const ConnectedSection = ({
  connectionType,
  editMetadata,
  editCallbacks,
  typeDropdownOpen,
  setTypeDropdownOpen,
  onConnectionTypeChange,
  sectorOptions,
  onSectorChange,
  trailOptions,
  thumbnailDuration,
  isVideo,
  hasEmptyProblem,
  hasDuplicateTime,
  hasNoProblems,
  hasNoTrails,
  typeReadOnly = false,
}: ConnectedSectionProps) => {
  // Guestbook and User are read-only — show a static label, no dropdown
  const isReadOnly = connectionType === 'guestbook' || connectionType === 'user' || typeReadOnly;
  const typeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className='mt-4 space-y-3'>
      {/* Row 1: Type label or dropdown — this IS the title */}
      <div className='flex items-center gap-3'>
        {isReadOnly ? (
          <span className='text-sm font-medium whitespace-nowrap text-slate-400'>
            {connectionType === 'guestbook'
              ? 'Connected to guestbook'
              : connectionType === 'user'
                ? 'Connected to user'
                : 'Connected to problem(s)'}
          </span>
        ) : (
          <div className='relative'>
            <button
              ref={typeButtonRef}
              type='button'
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              className='inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-slate-200 hover:text-slate-100'
            >
              {CONNECTION_TYPE_OPTIONS.find((o) => o.value === connectionType)?.label ?? connectionType}
              <ChevronDown size={14} className='text-slate-500' />
            </button>
            {typeDropdownOpen &&
              typeButtonRef.current &&
              createPortal(
                <>
                  <div className='fixed inset-0 z-[100]' onClick={() => setTypeDropdownOpen(false)} />
                  <div
                    className='fixed z-[101] overflow-hidden rounded-lg border border-white/12 bg-slate-800 shadow-lg'
                    style={{
                      top: typeButtonRef.current.getBoundingClientRect().bottom + 4,
                      left: typeButtonRef.current.getBoundingClientRect().left,
                      width: Math.max(typeButtonRef.current.getBoundingClientRect().width, 192),
                    }}
                  >
                    {CONNECTION_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type='button'
                        className={cn(
                          'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                          opt.value === connectionType ? 'bg-brand/20 text-brand' : 'text-slate-300 hover:bg-slate-700',
                        )}
                        onClick={() => onConnectionTypeChange(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>,
                document.body,
              )}
          </div>
        )}

        {/* Add button for problems — on the same line as the dropdown */}
        {connectionType === 'problem' && (
          <button
            type='button'
            onClick={() => {
              const newProblems = [
                ...editMetadata.problems,
                { problemId: 0, problemName: '', problemGrade: '', milliseconds: 0 },
              ];
              editCallbacks.onProblemsChange(newProblems);
            }}
            className='bg-surface-raised hover:bg-surface-raised-hover inline-flex items-center gap-1 rounded-lg border border-white/12 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-white/22'
          >
            <Plus size={12} /> Add
          </button>
        )}

        {/* Add button for trails — on the same line as the dropdown */}
        {connectionType === 'trail' && (
          <button
            type='button'
            onClick={() => {
              const newTrails = [...(editMetadata.trails ?? []), { trailId: 0, trailName: '' }];
              editCallbacks.onTrailsChange?.(newTrails);
            }}
            className='bg-surface-raised hover:bg-surface-raised-hover inline-flex items-center gap-1 rounded-lg border border-white/12 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-white/22'
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {/* Row 2: Entity content — delegate to MediaMetadataCard */}
      <MediaMetadataCard
        variant='connected'
        metadata={editMetadata}
        callbacks={editCallbacks}
        connectionType={connectionType}
        maxSeconds={thumbnailDuration}
        showTimeInput={isVideo}
        hasEmptyProblem={hasEmptyProblem}
        hasDuplicateTime={hasDuplicateTime}
        hasNoProblems={hasNoProblems}
        hasNoTrails={hasNoTrails}
        sectorOptions={sectorOptions}
        onSectorChange={onSectorChange}
        trailOptions={trailOptions}
      />
    </div>
  );
};

// ── UploadItemCard: a single upload item with its own video ref and thumbnail state ──
type UploadItemCardProps = {
  item: UploadItem;
  idx: number;
  connectionType: MediaConnectionType;
  metadata: MediaMetadata;
  callbacks: MediaMetadataCallbacks;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, patch: Partial<UploadItem>) => void;
  showConnectedFullWidth?: boolean;
};

const UploadItemCard = ({
  item,
  idx,
  connectionType,
  metadata,
  callbacks,
  onRemove,
  onUpdate,
  showConnectedFullWidth,
}: UploadItemCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoaded = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const dur = v.duration || 0;
    onUpdate(idx, { thumbnailDuration: dur });
    const target = Math.max(0, dur - 10);
    v.currentTime = target;
    onUpdate(idx, { thumbnailSeconds: target });
  }, [idx, onUpdate]);

  const isVideoItem = item.file?.type?.startsWith('video/') || !!item.embedVideoUrl;

  return (
    <Card>
      {/* Header with filename and remove button */}
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-[13px] font-medium text-slate-400'>
          {item.file?.name ?? (item.embedVideoUrl ? 'Embedded video' : `Item #${idx + 1}`)}
        </span>
        <button
          type='button'
          onClick={() => onRemove(idx)}
          className='hover:bg-surface-raised-hover rounded-lg p-1 text-slate-500 transition-colors hover:text-red-400'
          aria-label='Remove'
        >
          <X size={16} />
        </button>
      </div>

      {/* Grid: left = basic metadata + connected (if not full-width), right = preview */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {/* Left: Description, Photographer, In shot, Thumbnail picker, Connected (if not full-width) */}
        <div>
          <MediaMetadataCard
            variant='basic'
            metadata={metadata}
            callbacks={callbacks}
            connectionType={connectionType}
          />

          {/* Thumbnail picker for videos (hidden for embedded videos) */}
          {isVideoItem && !item.embedVideoUrl && (
            <div className='mt-3 space-y-1.5'>
              <div className='flex items-center gap-2'>
                <Image size={14} className='text-slate-500' />
                <span className='text-xs font-medium text-slate-400'>Thumbnail frame</span>
                <span className='ml-auto text-xs text-slate-500'>
                  {secondsToTimeStr(item.thumbnailSeconds)} / {secondsToTimeStr(item.thumbnailDuration)}
                </span>
              </div>
              <input
                type='range'
                min={0}
                max={Math.floor(item.thumbnailDuration) || 1}
                step={1}
                value={Math.floor(item.thumbnailSeconds)}
                onChange={(e) => {
                  const t = Number(e.target.value);
                  onUpdate(idx, { thumbnailSeconds: t });
                  if (videoRef.current) {
                    videoRef.current.currentTime = t;
                  }
                }}
                className='w-full'
              />
            </div>
          )}

          {/* Connected stuff in left column (unless it needs full width for timestamps) */}
          {!showConnectedFullWidth && (
            <div className='mt-4'>
              <MediaMetadataCard
                variant='connected'
                metadata={metadata}
                callbacks={callbacks}
                connectionType={connectionType}
                maxSeconds={item.thumbnailDuration}
                showTimeInput={isVideoItem}
              />
            </div>
          )}
        </div>
        {/* Right: Preview */}
        <div>
          {item.file?.type?.startsWith('video/') && item.preview ? (
            <video
              ref={videoRef}
              src={item.preview}
              className='w-full rounded-xl'
              controls
              onLoadedMetadata={handleVideoLoaded}
            />
          ) : item.embedVideoUrl ? (
            <div className='aspect-video w-full overflow-hidden rounded-xl bg-black'>
              <iframe
                src={item.embedVideoUrl}
                className='h-full w-full'
                allow='autoplay; fullscreen; picture-in-picture'
                allowFullScreen
                title='Embedded video'
              />
            </div>
          ) : item.preview ? (
            <img src={item.preview} alt={item.description ?? ''} className='w-full rounded-xl' />
          ) : (
            <div className='flex aspect-video items-center justify-center rounded-xl bg-slate-800 text-slate-600'>
              <Image size={32} />
            </div>
          )}
        </div>
      </div>

      {/* Full-width connected problems with timestamps (only for video + problem) */}
      {showConnectedFullWidth && (
        <div className='mt-4'>
          <MediaMetadataCard
            variant='connected'
            metadata={metadata}
            callbacks={callbacks}
            connectionType={connectionType}
            maxSeconds={item.thumbnailDuration}
            showTimeInput={true}
          />
        </div>
      )}
    </Card>
  );
};

export default MediaEdit;
