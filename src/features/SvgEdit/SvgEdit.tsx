import { useState, useEffect, useRef, useCallback, useMemo, type MouseEventHandler, useReducer } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMeta } from '../../shared/components/Meta';
import {
  type EditableSvg,
  getMediaFileUrl,
  invalidateMediaQueries,
  invalidateProblemQueries,
  invalidateSectorQueries,
  postProblemSvg,
  useAccessToken,
  useProblem,
  useSvgEdit,
} from '../../api';
import { parseReadOnlySvgs, parsePath, isCubicPoint, type ParsedEntry } from '../../utils/svg-helpers';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Card } from '../../shared/ui';
import { captureSentryException } from '../../utils/sentry';
import { generatePath, reducer, type State } from './state';
import { neverGuard } from '../../utils/neverGuard';
import type { MediaRegion } from '../../utils/svg-scaler';
import {
  Video,
  RotateCcw,
  Save,
  Type,
  Anchor,
  Triangle,
  Square,
  CheckSquare,
  RefreshCw,
  Loader2,
  Settings2,
  X,
  Trash2,
  Spline,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Coords = { x: number; y: number };
type OverlayKind = 'anchor' | 'trad' | 'text';
type OverlaySelection = { kind: OverlayKind; index: number };
type EditorTab = 'segment' | 'text' | 'anchors' | 'trad';

/** Matches Problem / header action icon buttons (`h-8 w-8` roundels). */
const pageActionIconBtn =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-40';
const pageActionIconBtnGlass =
  'border-white/12 bg-surface-raised text-slate-300 hover:border-white/18 hover:bg-surface-raised-hover';
const pageActionIconBtnGreen = 'border-green-400/45 bg-green-500/20 text-green-300 hover:bg-green-500/28';
const pageActionIconBtnBrand = 'border-brand-border btn-brand-solid shadow-sm hover:border-brand-border';

function mediaRegionsDiffer(a: MediaRegion | undefined | null, b: MediaRegion | undefined | null): boolean {
  if (!a && !b) return false;
  if (!a || !b) return true;
  return a.x !== b.x || a.y !== b.y || a.width !== b.width || a.height !== b.height;
}

const useIds = (): { problemId: number; pitch: number; mediaId: number } => {
  const { problemId, pitch, mediaId } = useParams();
  if (!problemId || !pitch || !mediaId) throw new Error('Missing route parameters');
  return { problemId: +problemId, pitch: +pitch, mediaId: +mediaId };
};

export const SvgEditLoader = () => {
  const { problemId, pitch, mediaId } = useIds();
  const meta = useMeta();
  const queryClient = useQueryClient();
  const [customMediaRegion, setCustomMediaRegion] = useState<MediaRegion | null>(null);
  const { data: problem } = useProblem(problemId, true);
  const data = useSvgEdit(problemId, pitch, mediaId, customMediaRegion);
  const accessToken = useAccessToken();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const save = useCallback(
    (updated: Required<Pick<EditableSvg, 'path' | 'hasAnchor' | 'anchors' | 'tradBelayStations' | 'texts'>>) => {
      setSaving(true);
      const correctPoints = parsePath(updated.path ?? '', data?.mediaRegion ?? undefined);
      const correctPathTxt = generatePath(correctPoints);

      return postProblemSvg(
        accessToken,
        problemId,
        pitch,
        mediaId,
        correctPoints.length < 2,
        data?.svgId ?? 0,
        correctPathTxt,
        updated.hasAnchor,
        JSON.stringify(updated.anchors),
        JSON.stringify(updated.tradBelayStations),
        JSON.stringify(updated.texts),
      )
        .then(async () => {
          await invalidateProblemQueries(queryClient, problemId);
          await invalidateMediaQueries(queryClient, mediaId);
          const sid = problem?.sectorId;
          if (typeof sid === 'number' && sid > 0) {
            await invalidateSectorQueries(queryClient, sid);
          }
          if (pitch > 0) {
            navigate(0);
          } else {
            navigate(`/problem/${problemId}`);
          }
        })
        .catch((error) => {
          console.warn(error);
          captureSentryException(error);
        })
        .finally(() => setSaving(false));
    },
    [accessToken, problemId, pitch, mediaId, data?.svgId, data?.mediaRegion, navigate, queryClient, problem?.sectorId],
  );

  if (!problem || !data) return <Loading />;

  const mediaForTopo = problem.media?.find((x) => x.id === mediaId);
  const maxPitchInSvgs = Math.max(0, ...(mediaForTopo?.svgs?.map((s) => s.pitch ?? 0) ?? [0]));
  const pitchStripCount = Math.max(problem.sections?.length ?? 0, maxPitchInSvgs);

  return (
    <div className='w-full min-w-0'>
      <title>{`${pitch > 0 ? `Pitch ${pitch} · ` : ''}Topo editor | ${meta.title}`}</title>
      <SvgEdit
        key={JSON.stringify(data)}
        {...data}
        mediaRegion={data.mediaRegion ?? undefined}
        sections={data.sections ?? []}
        pitchStripCount={pitchStripCount}
        onSave={save}
        saving={saving}
        onCancel={() => navigate(`/problem/${problemId}`)}
        onUpdateMediaRegion={setCustomMediaRegion}
      />
    </div>
  );
};

type Props = EditableSvg & {
  /** Number of pitch strips (not counting “entire route”). Used for Segment-tab pitch scope dropdown when &gt; 1. */
  pitchStripCount: number;
  onSave: (
    updated: Required<Pick<EditableSvg, 'path' | 'hasAnchor' | 'anchors' | 'tradBelayStations' | 'texts'>>,
  ) => void;
  saving: boolean;
  onCancel: () => void;
  onUpdateMediaRegion: (customMediaRegion: MediaRegion | null) => void;
};

const black = '#000000';
const strokeColor = '#FFFFFF';
/** Dashed guide lines only — cubic handles use filled blue rings (no group opacity). */
const curveGuideOpacity = 0.92;
/** Curve control points — high-contrast on light/dark rock photos */
const curveHandleFill = 'rgba(59, 130, 246, 0.42)';
const curveHandleStroke = '#1E40AF';

export const SvgEdit = ({
  saving,
  onSave,
  onCancel,
  onUpdateMediaRegion,
  problemId,
  pitch,
  pitchStripCount,
  mediaId,
  versionStamp,
  mediaWidth,
  mediaHeight,
  mediaRegion,
  sections: _s,
  path: initialPath,
  readOnlySvgs,
  tradBelayStations: initialTradBelayStations,
  anchors: initialAnchors,
  texts: initialTexts,
  hasAnchor: initialHasAnchor,
}: Props) => {
  const navigate = useNavigate();
  const [customMediaRegion, setCustomMediaRegion] = useState<MediaRegion | undefined>(mediaRegion);
  const w = (mediaRegion ?? customMediaRegion)?.width || mediaWidth;
  const h = (mediaRegion ?? customMediaRegion)?.height || mediaHeight;
  /** Crop / region offsets are for multi-pitch strips on tall photos — not for normal single-pitch images */
  const showMultiPitchCropUi = pitch > 0;
  const showPitchScopeDropdown = pitchStripCount > 1;
  /** Edited region vs last applied (`mediaRegion` from props / server). */
  const cropApplyDirty = useMemo(
    () => mediaRegionsDiffer(customMediaRegion, mediaRegion),
    [customMediaRegion, mediaRegion],
  );
  const imageRef = useRef<SVGImageElement>(null);
  const shift = useRef(false);

  const readOnlyPointsRef = useRef(
    (readOnlySvgs ?? []).map((svg) => parsePath(svg.path ?? '').map((p, ix) => ({ ...p, ix }))).flat(),
  );

  const [state, dispatch] = useReducer(
    reducer,
    {
      mode: 'idle' as State['mode'],
      activePoint: 0,
      points: [] as ParsedEntry[],
      path: initialPath,
      otherPoints: readOnlyPointsRef.current.reduce(
        (acc: Record<string, ParsedEntry & { ix: number }>, p: ParsedEntry & { ix: number }) => ({
          ...acc,
          [`${p.x}x${p.y}`]: p,
        }),
        {},
      ),
    },
    (init): State => {
      const pnts = parsePath(init.path);
      return {
        ...init,
        points: pnts,
        activePoint: Math.max(0, pnts.length - 1),
        mode: 'idle' as const,
      };
    },
  );

  const { path, points, activePoint } = state;

  const [anchors, setAnchors] = useState<Coords[]>(initialAnchors ?? []);
  const [tradBelayStations, setTradBelayStations] = useState<Coords[]>(initialTradBelayStations ?? []);
  const [texts, setTexts] = useState<{ txt: string; x: number; y: number }[]>(initialTexts ?? []);
  const [hasAnchor, setHasAnchor] = useState(!!initialHasAnchor);
  const [activeTab, setActiveTab] = useState<EditorTab>('segment');
  const [selectedOverlay, setSelectedOverlay] = useState<OverlaySelection | null>(null);
  const [draggingOverlay, setDraggingOverlay] = useState<OverlaySelection | null>(null);
  const suppressNextSvgClickRef = useRef(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      shift.current = e.shiftKey;
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('keyup', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('keyup', handleKey);
    };
  }, []);

  const getMouseCoordsFromClient = useCallback(
    (clientX: number, clientY: number, snap: boolean): Coords => {
      const dim = imageRef.current?.getBoundingClientRect();
      if (!dim) return { x: 0, y: 0 };
      const x = Math.round((clientX - dim.left) * (w / dim.width));
      const y = Math.round((clientY - dim.top) * (h / dim.height));
      let p = { x, y };
      if (snap) {
        const found = readOnlyPointsRef.current.find((p2) => Math.hypot(p.x - p2.x, p.y - p2.y) < 20);
        if (found) p = { x: found.x, y: found.y };
      }
      return p;
    },
    [w, h],
  );

  const getMouseCoords = useCallback(
    (e: React.MouseEvent, snap: boolean) => getMouseCoordsFromClient(e.clientX, e.clientY, snap),
    [getMouseCoordsFromClient],
  );

  useEffect(() => {
    if (!draggingOverlay) return;
    const onMove = (e: MouseEvent) => {
      const snap = draggingOverlay.kind !== 'text';
      const c = getMouseCoordsFromClient(e.clientX, e.clientY, snap);
      if (draggingOverlay.kind === 'anchor') {
        setAnchors((prev) => prev.map((p, i) => (i === draggingOverlay.index ? c : p)));
      } else if (draggingOverlay.kind === 'trad') {
        setTradBelayStations((prev) => prev.map((p, i) => (i === draggingOverlay.index ? c : p)));
      } else {
        setTexts((prev) => prev.map((t, i) => (i === draggingOverlay.index ? { ...t, ...c } : t)));
      }
    };
    const onUp = () => {
      setDraggingOverlay(null);
      suppressNextSvgClickRef.current = true;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [draggingOverlay, getMouseCoordsFromClient]);

  const removeAnchorAt = useCallback((index: number) => {
    setAnchors((prev) => prev.filter((_, i) => i !== index));
    setSelectedOverlay((s) => {
      if (!s || s.kind !== 'anchor') return s;
      if (s.index === index) return null;
      if (s.index > index) return { kind: 'anchor', index: s.index - 1 };
      return s;
    });
  }, []);

  const removeTradAt = useCallback((index: number) => {
    setTradBelayStations((prev) => prev.filter((_, i) => i !== index));
    setSelectedOverlay((s) => {
      if (!s || s.kind !== 'trad') return s;
      if (s.index === index) return null;
      if (s.index > index) return { kind: 'trad', index: s.index - 1 };
      return s;
    });
  }, []);

  const removeTextAt = useCallback((index: number) => {
    setTexts((prev) => prev.filter((_, i) => i !== index));
    setSelectedOverlay((s) => {
      if (!s || s.kind !== 'text') return s;
      if (s.index === index) return null;
      if (s.index > index) return { kind: 'text', index: s.index - 1 };
      return s;
    });
  }, []);

  const startOverlayDrag = useCallback((kind: OverlayKind, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedOverlay({ kind, index });
    setDraggingOverlay({ kind, index });
  }, []);

  const handleOnClick: MouseEventHandler = (e) => {
    if (suppressNextSvgClickRef.current) {
      suppressNextSvgClickRef.current = false;
      return;
    }
    if ((e.target as Element).closest?.('[data-overlay-handle]')) return;

    if (activeTab === 'segment') {
      if (shift.current) {
        const coords = getMouseCoords(e, true);
        dispatch({ action: 'add-point', ...coords });
      }
      dispatch({ action: 'mouse-up' });
    } else {
      const coords = getMouseCoords(e, activeTab !== 'text');
      if (activeTab === 'text') {
        setTexts((prev) => [...prev, { txt: 'Text', ...coords }]);
      } else if (activeTab === 'anchors') {
        setAnchors((prev) => [...prev, coords]);
      } else if (activeTab === 'trad') {
        setTradBelayStations((prev) => [...prev, coords]);
      } else {
        neverGuard(activeTab as never, null);
      }
    }
  };

  const toolBtn = cn(
    'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors disabled:pointer-events-none disabled:opacity-35',
    designContract.typography.uiCompact,
  );
  /** Tab active — segment neutral; overlays keep brand / amber / orange. */
  const toolBtnOnText = 'bg-brand/15 text-brand ring-1 ring-inset ring-brand-border/40';
  const toolBtnOnAnchor = 'bg-amber-500/12 text-amber-100 ring-1 ring-inset ring-amber-400/25';
  const toolBtnOnTrad = 'bg-orange-500/12 text-orange-100 ring-1 ring-inset ring-orange-400/25';
  const toolBtnOnPathAnchor = 'bg-surface-raised-hover text-slate-100 ring-1 ring-inset ring-brand-border/45';
  const toolBtnOff = 'text-slate-500 hover:bg-surface-raised-hover hover:text-slate-200';
  const toolBtnReset = 'text-red-400/90 hover:bg-red-500/10 hover:text-red-200';

  const fieldClass = cn(
    'rounded-md border border-surface-border bg-surface-nav px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-border/60',
    designContract.typography.meta,
    'text-slate-200',
  );

  const editorTabClass = (tab: EditorTab) =>
    cn(
      'inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md px-3 py-2 font-medium transition-colors',
      designContract.typography.uiCompact,
      activeTab === tab
        ? tab === 'segment' || tab === 'text'
          ? toolBtnOnText
          : tab === 'anchors'
            ? toolBtnOnAnchor
            : toolBtnOnTrad
        : 'text-slate-500 hover:bg-surface-raised/80 hover:text-slate-200',
    );

  /** Path handles sit below anchors/text/trad in DOM — disable overlay picking on Segment tab. */
  const overlayPointerEvents = activeTab === 'segment' ? 'none' : ('auto' as const);

  return (
    <div className='w-full min-w-0' onMouseUp={() => dispatch({ action: 'idle' })}>
      <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
        <div className='divide-y divide-white/6'>
          <div className='p-3 sm:p-5'>
            <div className='mb-4 flex min-w-0 flex-col gap-3'>
              <span className='sr-only'>Topo editor</span>
              <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                <div className='flex min-w-0 flex-wrap gap-1 gap-y-1' role='tablist' aria-label='Topo editor sections'>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={activeTab === 'segment'}
                    id='svg-edit-tab-segment'
                    className={editorTabClass('segment')}
                    onClick={() => setActiveTab('segment')}
                  >
                    <Spline size={14} strokeWidth={2} className='shrink-0 opacity-90' aria-hidden />
                    Segment{points.length > 0 ? '*' : ''}
                  </button>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={activeTab === 'text'}
                    id='svg-edit-tab-text'
                    className={editorTabClass('text')}
                    onClick={() => setActiveTab('text')}
                  >
                    <Type size={14} strokeWidth={2} className='shrink-0 opacity-90' aria-hidden />
                    Text{texts.length > 0 ? '*' : ''}
                  </button>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={activeTab === 'anchors'}
                    id='svg-edit-tab-anchors'
                    className={editorTabClass('anchors')}
                    onClick={() => setActiveTab('anchors')}
                  >
                    <Anchor size={14} strokeWidth={2} className='shrink-0 opacity-90' aria-hidden />
                    Anchors{anchors.length > 0 ? '*' : ''}
                  </button>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={activeTab === 'trad'}
                    id='svg-edit-tab-trad'
                    className={editorTabClass('trad')}
                    onClick={() => setActiveTab('trad')}
                  >
                    <Triangle size={14} strokeWidth={2} className='shrink-0 opacity-90' aria-hidden />
                    Trad{tradBelayStations.length > 0 ? '*' : ''}
                  </button>
                </div>
                <div className='flex shrink-0 flex-nowrap items-center gap-1.5 self-start pt-0.5 sm:pt-0'>
                  <Link
                    to='/mp4/20230718_SvgEditExample.mp4'
                    target='_blank'
                    rel='noreferrer'
                    title='How-to video'
                    aria-label='How-to video'
                    className={cn(pageActionIconBtn, pageActionIconBtnGlass, 'no-underline')}
                  >
                    <Video size={14} strokeWidth={2.25} />
                  </Link>
                  <button
                    type='button'
                    title='Cancel'
                    aria-label='Cancel and go back to problem'
                    className={cn(pageActionIconBtn, pageActionIconBtnBrand)}
                    onClick={onCancel}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    type='button'
                    title='Save'
                    aria-label='Save'
                    className={cn(pageActionIconBtn, pageActionIconBtnGreen)}
                    disabled={saving}
                    onClick={() => onSave({ anchors, hasAnchor, path, tradBelayStations, texts })}
                  >
                    {saving ? (
                      <Loader2 size={14} className='animate-spin' strokeWidth={2.25} />
                    ) : (
                      <Save size={14} strokeWidth={2.25} />
                    )}
                  </button>
                </div>
              </div>

              <div
                role='tabpanel'
                id={`svg-edit-panel-${activeTab}`}
                aria-labelledby={`svg-edit-tab-${activeTab}`}
                className='min-w-0 space-y-3'
              >
                {activeTab === 'segment' && (
                  <>
                    <p className={cn(designContract.typography.meta, 'text-slate-500')}>
                      Shift+click the photo to add path points. Select a point to edit the segment type, or remove it.
                      Curve handles are the blue circles.
                    </p>
                    {showPitchScopeDropdown && (
                      <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/6 pb-3'>
                        <span className={cn(designContract.typography.label, 'shrink-0 text-slate-500')}>
                          Topo scope
                        </span>
                        <select
                          className={cn(fieldClass, 'max-w-[min(100%,24rem)] min-w-0')}
                          aria-label='Entire route or which pitch strip to edit'
                          value={pitch}
                          onChange={(e) => {
                            const next = +e.target.value;
                            if (next !== pitch) {
                              navigate(`/problem/svg-edit/${problemId}/${next}/${mediaId}`);
                            }
                          }}
                        >
                          <option value={0}>Entire route</option>
                          {Array.from({ length: pitchStripCount }, (_, i) => i + 1).map((p) => (
                            <option key={p} value={p}>
                              Pitch {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2'>
                      {activePoint !== 0 && (
                        <div className='flex min-w-0 items-center gap-2'>
                          <span className={cn(designContract.typography.label, 'shrink-0 text-slate-500')}>
                            Segment type
                          </span>
                          <select
                            className={cn(fieldClass, 'min-w-0')}
                            value={isCubicPoint(points[activePoint]) ? 'C' : 'L'}
                            onChange={(e) =>
                              dispatch({ action: 'set-type', type: e.target.value === 'C' ? 'curve' : 'line' })
                            }
                          >
                            <option value='L'>Line</option>
                            <option value='C'>Curve</option>
                          </select>
                        </div>
                      )}
                      <button
                        type='button'
                        title='Remove the selected path point'
                        aria-label='Remove selected path point'
                        className={cn(
                          toolBtn,
                          'bg-surface-nav border-white/10 text-slate-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200',
                          'w-auto shrink-0',
                        )}
                        disabled={points.length === 0}
                        onClick={() => dispatch({ action: 'remove-point' })}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                        <span className='whitespace-nowrap'>Remove point</span>
                      </button>
                      <button
                        type='button'
                        className={cn(
                          toolBtn,
                          points.length === 0 ? toolBtnOff : hasAnchor ? toolBtnOnPathAnchor : toolBtnOff,
                        )}
                        onClick={() => setHasAnchor(!hasAnchor)}
                        disabled={points.length === 0}
                      >
                        {hasAnchor ? (
                          <CheckSquare size={14} className='text-brand' strokeWidth={2} />
                        ) : (
                          <Square size={14} strokeWidth={2} />
                        )}{' '}
                        Anchor
                      </button>
                      <button
                        type='button'
                        className={cn(toolBtn, toolBtnReset)}
                        onClick={() => {
                          setTexts([]);
                          setAnchors([]);
                          setTradBelayStations([]);
                          setSelectedOverlay(null);
                          setDraggingOverlay(null);
                          dispatch({ action: 'reset' });
                        }}
                      >
                        <RotateCcw size={14} strokeWidth={2} /> Reset all
                      </button>

                      {showMultiPitchCropUi && (
                        <div className='flex w-full min-w-0 flex-wrap items-center gap-2 border-t border-white/6 pt-3 sm:ml-auto sm:w-auto sm:border-t-0 sm:pt-0'>
                          <div className='flex items-center gap-1.5 text-slate-500'>
                            <Settings2 size={14} strokeWidth={2} />
                            <span className={cn(designContract.typography.label, 'text-slate-500')}>Crop</span>
                          </div>
                          <input
                            type='number'
                            className={cn(fieldClass, 'w-14 shrink-0 sm:w-16')}
                            placeholder='X'
                            value={customMediaRegion?.x ?? 0}
                            onChange={(e) =>
                              setCustomMediaRegion((prev) => ({
                                ...(prev ?? { y: 0, width: w, height: h, x: 0 }),
                                x: +e.target.value,
                              }))
                            }
                          />
                          <input
                            type='number'
                            className={cn(fieldClass, 'w-14 shrink-0 sm:w-16')}
                            placeholder='Y'
                            value={customMediaRegion?.y ?? 0}
                            onChange={(e) =>
                              setCustomMediaRegion((prev) => ({
                                ...(prev ?? { x: 0, width: w, height: h, y: 0 }),
                                y: +e.target.value,
                              }))
                            }
                          />
                          <button
                            type='button'
                            title={
                              cropApplyDirty
                                ? 'Apply to update the crop preview and editor'
                                : 'Crop matches the current preview'
                            }
                            aria-label={cropApplyDirty ? 'Apply crop changes (you have unsaved edits)' : 'Apply crop'}
                            className={cn(
                              toolBtn,
                              cropApplyDirty
                                ? cn(
                                    pageActionIconBtnBrand,
                                    'rounded-md px-2.5 py-1.5 font-medium',
                                    '[&_svg]:text-[var(--color-brand-foreground)]',
                                  )
                                : cn(toolBtnOff, 'bg-surface-raised border-white/10'),
                            )}
                            onClick={() => onUpdateMediaRegion(customMediaRegion ?? null)}
                          >
                            <RefreshCw size={12} strokeWidth={2} className='shrink-0' aria-hidden /> Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'text' && (
                  <div className='space-y-2'>
                    <p className={cn(designContract.typography.meta, 'text-slate-500')}>
                      {texts.length === 0
                        ? 'Click the photo to place a label. Add as many as you need — edit the wording here and drag labels on the photo.'
                        : 'Edit labels below; drag the red text on the photo to position. Click the photo to add another.'}
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {texts.map((t, i) => (
                        <div
                          key={`text-card-${i}`}
                          className={cn(
                            'border-surface-border flex max-w-full min-w-[min(100%,14rem)] flex-1 items-center gap-1.5 rounded-lg border px-2 py-1.5 sm:max-w-xs sm:min-w-[12rem]',
                            selectedOverlay?.kind === 'text' && selectedOverlay.index === i
                              ? 'bg-brand/10 ring-brand-border/50 ring-1'
                              : 'bg-surface-nav',
                          )}
                        >
                          <input
                            type='text'
                            className={cn(fieldClass, 'min-w-0 flex-1')}
                            value={t.txt}
                            onChange={(e) =>
                              setTexts((prev) =>
                                prev.map((row, j) => (j === i ? { ...row, txt: e.target.value } : row)),
                              )
                            }
                            onClick={() => setSelectedOverlay({ kind: 'text', index: i })}
                            aria-label={`Text ${i + 1}`}
                          />
                          <button
                            type='button'
                            title='Remove label'
                            className='text-slate-500 hover:text-red-300'
                            onClick={() => removeTextAt(i)}
                          >
                            <X size={16} strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'anchors' && (
                  <div className='space-y-2'>
                    <p className={cn(designContract.typography.meta, 'text-slate-500')}>
                      {anchors.length === 0
                        ? 'Click the photo to place bolt anchors. Add several by clicking again. Drag red circles to move.'
                        : 'Drag a circle on the photo to move it. Click the photo to add another anchor.'}
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {anchors.map((_, i) => (
                        <div
                          key={`anchor-card-${i}`}
                          className={cn(
                            'border-surface-border flex items-center gap-2 rounded-lg border px-2 py-1.5',
                            selectedOverlay?.kind === 'anchor' && selectedOverlay.index === i
                              ? 'bg-amber-500/10 ring-1 ring-amber-400/45'
                              : 'bg-surface-nav',
                          )}
                        >
                          <button
                            type='button'
                            className={cn(
                              designContract.typography.meta,
                              'min-w-0 flex-1 truncate text-left text-slate-200',
                            )}
                            onClick={() => setSelectedOverlay({ kind: 'anchor', index: i })}
                          >
                            Anchor {i + 1}
                          </button>
                          <button
                            type='button'
                            title='Remove anchor'
                            className='text-slate-500 hover:text-red-300'
                            onClick={() => removeAnchorAt(i)}
                          >
                            <X size={16} strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'trad' && (
                  <div className='space-y-2'>
                    <p className={cn(designContract.typography.meta, 'text-slate-500')}>
                      {tradBelayStations.length === 0
                        ? 'Click the photo for each trad belay station. Drag triangles on the photo to move them.'
                        : 'One card per belay. Drag a triangle on the photo or select a card, then drag. Click the photo to add more.'}
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {tradBelayStations.map((_, i) => (
                        <div
                          key={`trad-card-${i}`}
                          className={cn(
                            'border-surface-border flex items-center gap-2 rounded-lg border px-2 py-1.5',
                            selectedOverlay?.kind === 'trad' && selectedOverlay.index === i
                              ? 'bg-orange-500/10 ring-1 ring-orange-400/45'
                              : 'bg-surface-nav',
                          )}
                        >
                          <button
                            type='button'
                            className={cn(
                              designContract.typography.meta,
                              'min-w-0 flex-1 truncate text-left text-slate-200',
                            )}
                            onClick={() => setSelectedOverlay({ kind: 'trad', index: i })}
                          >
                            Trad {i + 1}
                          </button>
                          <button
                            type='button'
                            title='Remove belay'
                            className='text-slate-500 hover:text-red-300'
                            onClick={() => removeTradAt(i)}
                          >
                            <X size={16} strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='border-surface-border relative w-full min-w-0 cursor-crosshair overflow-hidden bg-black select-none'>
            <svg
              viewBox={`0 0 ${w} ${h}`}
              onClick={handleOnClick}
              onMouseMove={(e) => dispatch({ action: 'mouse-move', ...getMouseCoords(e, true) })}
              className={cn('block h-auto w-full', draggingOverlay && 'cursor-grabbing')}
            >
              <image
                ref={imageRef}
                xlinkHref={getMediaFileUrl(mediaId, versionStamp, false, { mediaRegion })}
                width='100%'
                height='100%'
              />
              {parseReadOnlySvgs(readOnlySvgs, w, h, 1000)}
              <path d={path} fill='none' stroke={black} strokeWidth={0.003 * w} pointerEvents='none' />
              <path d={path} fill='none' stroke='#FF0000' strokeWidth={0.002 * w} pointerEvents='none' />

              {(() => {
                /** Large enough to grab easily; hollow + stroke keeps the photo visible inside. */
                const cubicHandleR = 0.004 * w;
                const cubicHandleStrokeW = 0.00185 * w;
                const cubicGuideStrokeW = 0.0014 * w;
                const cubicDash = Math.max(4, 0.004 * w);

                /** Wider invisible targets so handles aren’t blocked by guide lines or thin strokes. */
                const vertexHitR = 0.012 * w;
                const cubicHitR = 0.008 * w;

                return points.map((p, i) => {
                  const handles = isCubicPoint(p) && (
                    <g>
                      <line
                        x1={points[i - 1].x}
                        y1={points[i - 1].y}
                        x2={p.c[0].x}
                        y2={p.c[0].y}
                        stroke={strokeColor}
                        strokeOpacity={curveGuideOpacity}
                        strokeWidth={cubicGuideStrokeW}
                        strokeDasharray={`${cubicDash},${cubicDash}`}
                        strokeLinecap='round'
                        pointerEvents='none'
                      />
                      <line
                        x1={p.x}
                        y1={p.y}
                        x2={p.c[1].x}
                        y2={p.c[1].y}
                        stroke={strokeColor}
                        strokeOpacity={curveGuideOpacity}
                        strokeWidth={cubicGuideStrokeW}
                        strokeDasharray={`${cubicDash},${cubicDash}`}
                        strokeLinecap='round'
                        pointerEvents='none'
                      />
                      <circle
                        cx={p.c[0].x}
                        cy={p.c[0].y}
                        r={cubicHitR}
                        fill='transparent'
                        className='cursor-grab'
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          dispatch({ action: 'drag-cubic', index: i, c: 0 });
                        }}
                      />
                      <circle
                        cx={p.c[0].x}
                        cy={p.c[0].y}
                        r={cubicHandleR}
                        fill={curveHandleFill}
                        stroke={curveHandleStroke}
                        strokeWidth={cubicHandleStrokeW}
                        strokeLinejoin='round'
                        pointerEvents='none'
                      />
                      <circle
                        cx={p.c[1].x}
                        cy={p.c[1].y}
                        r={cubicHitR}
                        fill='transparent'
                        className='cursor-grab'
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          dispatch({ action: 'drag-cubic', index: i, c: 1 });
                        }}
                      />
                      <circle
                        cx={p.c[1].x}
                        cy={p.c[1].y}
                        r={cubicHandleR}
                        fill={curveHandleFill}
                        stroke={curveHandleStroke}
                        strokeWidth={cubicHandleStrokeW}
                        strokeLinejoin='round'
                        pointerEvents='none'
                      />
                    </g>
                  );
                  return (
                    <g key={`${p.x}-${p.y}-${i}`}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={vertexHitR}
                        fill='transparent'
                        className='cursor-grab'
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          dispatch({ action: 'drag-point', index: i });
                        }}
                      />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={0.005 * w}
                        fill={activePoint === i ? '#00FF00' : '#FF0000'}
                        stroke={black}
                        pointerEvents='none'
                      />
                      {handles}
                    </g>
                  );
                });
              })()}

              {anchors.map((a, i) => {
                const sel = selectedOverlay?.kind === 'anchor' && selectedOverlay.index === i;
                const rVis = 0.006 * w;
                const rHit = 0.014 * w;
                return (
                  <g key={`anchor-${i}`} data-overlay-handle>
                    <circle
                      cx={a.x}
                      cy={a.y}
                      r={rHit}
                      fill='transparent'
                      className='cursor-grab'
                      pointerEvents={overlayPointerEvents}
                      onMouseDown={(e) => startOverlayDrag('anchor', i, e)}
                    />
                    <circle
                      cx={a.x}
                      cy={a.y}
                      r={rVis}
                      fill='#E2011A'
                      stroke={sel ? '#FFFFFF' : '#000000'}
                      strokeWidth={sel ? 0.002 * w : 0.0012 * w}
                      pointerEvents='none'
                    />
                  </g>
                );
              })}
              {tradBelayStations.map((a, i) => {
                const sel = selectedOverlay?.kind === 'trad' && selectedOverlay.index === i;
                const tri = 0.006 * w;
                const pad = 0.012 * w;
                const bx = a.x - pad;
                const by = a.y - pad - tri;
                return (
                  <g key={`trad-${i}`} data-overlay-handle>
                    <rect
                      x={bx}
                      y={by}
                      width={pad * 2}
                      height={pad * 2 + tri * 2}
                      fill='transparent'
                      className='cursor-grab'
                      pointerEvents={overlayPointerEvents}
                      onMouseDown={(e) => startOverlayDrag('trad', i, e)}
                    />
                    <polygon
                      fill='#E2011A'
                      stroke={sel ? '#FFFFFF' : '#000000'}
                      strokeWidth={sel ? 0.002 * w : 0.0012 * w}
                      strokeLinejoin='round'
                      pointerEvents='none'
                      points={`${a.x},${a.y - tri} ${a.x - tri},${a.y + tri} ${a.x + tri},${a.y + tri}`}
                    />
                  </g>
                );
              })}
              {texts.map((t, i) => {
                const sel = selectedOverlay?.kind === 'text' && selectedOverlay.index === i;
                const fs = 0.03 * w;
                const pad = fs * 0.45;
                const tw = Math.max(fs * (t.txt.length || 1) * 0.55, fs * 2);
                const th = fs * 1.35;
                return (
                  <g key={`text-${i}`} data-overlay-handle>
                    <rect
                      x={t.x - pad}
                      y={t.y - th + pad * 0.2}
                      width={tw + pad * 2}
                      height={th}
                      fill='transparent'
                      className='cursor-grab'
                      pointerEvents={overlayPointerEvents}
                      onMouseDown={(e) => startOverlayDrag('text', i, e)}
                    />
                    <text
                      x={t.x}
                      y={t.y}
                      fontSize={fs}
                      fill='red'
                      fontWeight='bold'
                      stroke={sel ? '#FFFFFF' : 'none'}
                      strokeWidth={sel ? 0.0012 * w : 0}
                      paintOrder='stroke fill'
                      pointerEvents='none'
                    >
                      {t.txt}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className='p-3 sm:p-4'>
            <label
              htmlFor='svg-edit-path'
              className={cn(designContract.typography.label, 'mb-1.5 block text-slate-500')}
            >
              Path
            </label>
            <input
              id='svg-edit-path'
              className={cn(
                'border-surface-border bg-surface-nav focus-visible:ring-brand-border/60 w-full min-w-0 rounded-lg border px-3 py-2 font-mono text-sm text-slate-200 outline-none focus-visible:ring-2',
              )}
              value={path || ''}
              onChange={(e) => dispatch({ action: 'update-path', path: e.target.value })}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SvgEditLoader;
