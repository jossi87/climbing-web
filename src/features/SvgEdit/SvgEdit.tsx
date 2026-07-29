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
import { Video, RotateCcw, Save, RefreshCw, Loader2, Settings2, X, ZoomIn } from 'lucide-react';
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
const pageActionIconBtnGreen =
  'border-green-600/50 bg-green-600/15 text-green-300 hover:bg-green-600/25 light:border-green-600 light:bg-green-600 light:text-white light:hover:bg-green-700';
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

      // Text, anchor, and trad belay station coordinates are captured relative to the
      // cropped media region (when editing a pitch). Convert them back to full-image
      // coordinates by adding the media region offset, matching how parsePath converts
      // path coordinates.
      const deltaX = data?.mediaRegion?.x ?? 0;
      const deltaY = data?.mediaRegion?.y ?? 0;
      const correctedTexts = updated.texts.map((t) => ({
        ...t,
        x: t.x + deltaX,
        y: t.y + deltaY,
      }));
      const correctedAnchors = updated.anchors.map((a) => ({
        x: a.x + deltaX,
        y: a.y + deltaY,
      }));
      const correctedTradBelayStations = updated.tradBelayStations.map((t) => ({
        x: t.x + deltaX,
        y: t.y + deltaY,
      }));

      return postProblemSvg(
        accessToken,
        problemId,
        pitch,
        mediaId,
        correctPoints.length < 2,
        data?.svgId ?? 0,
        correctPathTxt,
        updated.hasAnchor,
        JSON.stringify(correctedAnchors),
        JSON.stringify(correctedTradBelayStations),
        JSON.stringify(correctedTexts),
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

  const mediaForTopo = problem.media?.find((x) => (x.identity?.id ?? 0) === mediaId);
  const svgsForThisProblem = mediaForTopo?.svgs?.filter((s) => s.problemId === problemId) ?? [];
  const maxPitchInSvgs = Math.max(0, ...svgsForThisProblem.map((s) => s.pitch ?? 0));
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
        isBouldering={meta.isBouldering}
      />
    </div>
  );
};

type Props = EditableSvg & {
  /** Number of pitch strips (not counting "entire route"). Used for Segment-tab pitch scope dropdown when > 1. */
  pitchStripCount: number;
  onSave: (
    updated: Required<Pick<EditableSvg, 'path' | 'hasAnchor' | 'anchors' | 'tradBelayStations' | 'texts'>>,
  ) => void;
  saving: boolean;
  onCancel: () => void;
  onUpdateMediaRegion: (customMediaRegion: MediaRegion | null) => void;
  isBouldering: boolean;
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
  isBouldering,
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
  const [hasAnchor, setHasAnchor] = useState(() => {
    if (isBouldering) return true;
    return !!initialHasAnchor;
  });
  const [activeTab, setActiveTab] = useState<EditorTab>('segment');
  const [selectedOverlay, setSelectedOverlay] = useState<OverlaySelection | null>(null);
  const [draggingOverlay, setDraggingOverlay] = useState<OverlaySelection | null>(null);
  const [zoomMode, setZoomMode] = useState(false);
  // On touch devices with no existing points, default to Draw mode so mobile
  // users can start drawing immediately. On desktop, or when points exist,
  // default to Drag mode (Shift key toggles Draw temporarily).
  const isTouchDeviceRef = useRef(
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
  );
  const [drawMode, setDrawMode] = useState(() => {
    const pnts = parsePath(initialPath);
    return isTouchDeviceRef.current && pnts.length === 0;
  });
  const suppressNextSvgClickRef = useRef(false);
  const isDraggingPointRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      shift.current = e.shiftKey;
      // When holding Shift on desktop, auto-enable draw mode.
      // When releasing Shift, go back to the default mode.
      if (e.shiftKey) {
        setDrawMode(true);
      } else {
        setDrawMode(false);
      }
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

  /** Shared handler for both mouse and touch events to add a point or place an overlay. */
  const handleImageInteraction = useCallback(
    (clientX: number, clientY: number) => {
      if (activeTab === 'segment') {
        if (drawMode || shift.current) {
          const coords = getMouseCoordsFromClient(clientX, clientY, true);
          dispatch({ action: 'add-point', ...coords });
        }
        dispatch({ action: 'mouse-up' });
      } else {
        const coords = getMouseCoordsFromClient(clientX, clientY, activeTab !== 'text');
        if (activeTab === 'text') {
          setTexts((prev) => {
            const next = [...prev, { txt: 'Text', ...coords }];
            setSelectedOverlay({ kind: 'text', index: next.length - 1 });
            return next;
          });
        } else if (activeTab === 'anchors') {
          setAnchors((prev) => {
            const next = [...prev, coords];
            setSelectedOverlay({ kind: 'anchor', index: next.length - 1 });
            return next;
          });
        } else if (activeTab === 'trad') {
          setTradBelayStations((prev) => {
            const next = [...prev, coords];
            setSelectedOverlay({ kind: 'trad', index: next.length - 1 });
            return next;
          });
        } else {
          neverGuard(activeTab as never, null);
        }
      }
    },
    [activeTab, drawMode, getMouseCoordsFromClient],
  );

  // Pointer events for drag support — works on both desktop (mouse) and mobile (touch/pen).
  // Chrome desktop mobile emulation does NOT fire touch events, but it does fire pointer events.
  // On mobile, the browser handles pinch-to-zoom natively (touchAction is not 'none').
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onPointerDown = (e: PointerEvent) => {
      // Only handle primary button (left click / touch)
      if (e.button !== 0) return;
      if (isDraggingPointRef.current) return;
      // Let overlay handles handle their own events
      if ((e.target as Element)?.closest?.('[data-overlay-handle]')) return;
      // Walk up the DOM tree to find an element with data-point-index
      let el = e.target as Element | null;
      while (el && el !== svg) {
        const pointIndex = el.getAttribute('data-point-index');
        if (pointIndex !== null) {
          const i = parseInt(pointIndex, 10);
          const cubic = el.getAttribute('data-cubic');
          if (cubic !== null) {
            dispatchRef.current({ action: 'drag-cubic', index: i, c: parseInt(cubic, 10) as 0 | 1 });
          } else {
            dispatchRef.current({ action: 'drag-point', index: i });
          }
          isDraggingPointRef.current = true;
          return;
        }
        el = el.parentElement;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingPointRef.current) return;
      // Prevent browser from panning/scrolling while dragging a point
      e.preventDefault();
      const coords = getMouseCoordsFromClient(e.clientX, e.clientY, true);
      dispatchRef.current({ action: 'mouse-move', ...coords });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (isDraggingPointRef.current) {
        isDraggingPointRef.current = false;
        suppressNextSvgClickRef.current = false;
        dispatchRef.current({ action: 'idle' });
        return;
      }
      // Tap — add point or place overlay
      if (suppressNextSvgClickRef.current) {
        suppressNextSvgClickRef.current = false;
        return;
      }
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target?.closest?.('[data-overlay-handle]')) return;
      handleImageInteraction(e.clientX, e.clientY);
      suppressNextSvgClickRef.current = true;
    };

    svg.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('pointermove', onPointerMove);
    svg.addEventListener('pointerup', onPointerUp);
    return () => {
      svg.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      svg.removeEventListener('pointerup', onPointerUp);
    };
  }, [getMouseCoordsFromClient, handleImageInteraction]);

  useEffect(() => {
    if (!draggingOverlay) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const snap = draggingOverlay.kind !== 'text';
      const c = getMouseCoordsFromClient(clientX, clientY, snap);
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
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
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

  const startOverlayDrag = useCallback((kind: OverlayKind, index: number, e: React.MouseEvent | React.TouchEvent) => {
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
    handleImageInteraction(e.clientX, e.clientY);
  };

  const toolBtn = cn(
    'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors disabled:pointer-events-none disabled:opacity-35',
    designContract.typography.uiCompact,
  );
  const toolBtnOff = 'text-slate-500 hover:bg-surface-raised-hover hover:text-slate-200';

  const fieldClass = cn(
    'rounded-md border border-surface-border bg-surface-nav px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-border/60',
    designContract.typography.meta,
    'text-slate-200',
  );

  const editorTabClass = (tab: EditorTab) =>
    cn(
      'inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md border px-3 py-2 font-medium transition-colors',
      designContract.typography.uiCompact,
      activeTab === tab
        ? 'border-brand bg-brand/20 text-slate-100 shadow-sm'
        : 'border-white/12 bg-surface-raised text-slate-500 hover:border-white/18 hover:bg-surface-raised-hover hover:text-slate-200',
    );

  /** Path handles sit below anchors/text/trad in DOM — disable overlay picking on Segment tab. */
  const overlayPointerEvents = activeTab === 'segment' ? 'none' : ('auto' as const);

  return (
    <div className='w-full min-w-0' onMouseUp={() => dispatch({ action: 'idle' })}>
      <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
        <div className='divide-y divide-white/6'>
          <div className='p-2 sm:p-3'>
            <div className='flex min-w-0 flex-col gap-2'>
              <span className='sr-only'>Topo editor</span>
              <div className='flex min-w-0 flex-row items-start justify-between gap-3'>
                <div
                  className='flex min-w-0 flex-1 flex-wrap items-center gap-1'
                  role='tablist'
                  aria-label='Topo editor sections'
                >
                  {/* Segment pill — visually grouped as one compound control */}
                  <div
                    role='tab'
                    aria-selected={activeTab === 'segment'}
                    className={cn(
                      'inline-flex min-h-9 shrink-0 items-center overflow-hidden rounded-md border transition-colors',
                      activeTab === 'segment'
                        ? 'border-brand bg-brand/20 shadow-sm'
                        : 'bg-surface-raised border-white/12',
                    )}
                  >
                    <button
                      type='button'
                      id='svg-edit-tab-segment'
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 font-medium transition-colors',
                        designContract.typography.uiCompact,
                        activeTab === 'segment' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-200',
                      )}
                      onClick={() => setActiveTab('segment')}
                    >
                      Path
                    </button>
                    <div className='h-5 w-px bg-white/12' />
                    <button
                      type='button'
                      title='Draw mode — tap the photo to add points'
                      aria-label='Draw mode — tap the photo to add points'
                      aria-pressed={activeTab === 'segment' && drawMode}
                      className={cn(
                        'inline-flex items-center px-2.5 py-1.5 transition-colors',
                        designContract.typography.uiCompact,
                        activeTab === 'segment' && drawMode
                          ? 'bg-surface-raised font-bold text-slate-100'
                          : 'text-slate-500 hover:text-slate-200',
                      )}
                      onClick={() => {
                        setActiveTab('segment');
                        setDrawMode(true);
                      }}
                    >
                      Draw{isTouchDeviceRef.current ? '' : ' (hold ⇧)'}
                    </button>
                    <div className='h-5 w-px bg-white/12' />
                    <button
                      type='button'
                      title='Drag mode — select and move existing points'
                      aria-label='Drag mode — select and move existing points'
                      aria-pressed={activeTab === 'segment' && !drawMode}
                      className={cn(
                        'inline-flex items-center px-2.5 py-1.5 transition-colors',
                        designContract.typography.uiCompact,
                        activeTab === 'segment' && !drawMode
                          ? 'bg-surface-raised font-bold text-slate-100'
                          : 'text-slate-500 hover:text-slate-200',
                      )}
                      onClick={() => {
                        setActiveTab('segment');
                        setDrawMode(false);
                      }}
                    >
                      Drag
                    </button>
                    {points.length > 0 && (
                      <>
                        <div className='h-5 w-px bg-white/12' />
                        <button
                          type='button'
                          title='Reset segment path'
                          aria-label='Reset segment path'
                          className='inline-flex items-center px-2 py-1.5 text-red-400 hover:text-red-300'
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dispatch({ action: 'reset' });
                            if (isTouchDeviceRef.current) setDrawMode(true);
                          }}
                        >
                          <RotateCcw size={12} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={activeTab === 'text'}
                    id='svg-edit-tab-text'
                    className={editorTabClass('text')}
                    onClick={() => setActiveTab('text')}
                  >
                    Text
                    {texts.length > 0 && (
                      <span
                        role='button'
                        tabIndex={0}
                        title='Reset all text labels'
                        aria-label='Reset all text labels'
                        className='ml-0.5 inline-flex text-red-400 hover:text-red-300'
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setTexts([]);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            setTexts([]);
                          }
                        }}
                      >
                        <RotateCcw size={12} strokeWidth={2} />
                      </span>
                    )}
                  </button>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={activeTab === 'anchors'}
                    id='svg-edit-tab-anchors'
                    className={editorTabClass('anchors')}
                    onClick={() => setActiveTab('anchors')}
                  >
                    Bolts
                    {anchors.length > 0 && (
                      <span
                        role='button'
                        tabIndex={0}
                        title='Reset all anchors'
                        aria-label='Reset all anchors'
                        className='ml-0.5 inline-flex text-red-400 hover:text-red-300'
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setAnchors([]);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            setAnchors([]);
                          }
                        }}
                      >
                        <RotateCcw size={12} strokeWidth={2} />
                      </span>
                    )}
                  </button>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={activeTab === 'trad'}
                    id='svg-edit-tab-trad'
                    className={editorTabClass('trad')}
                    onClick={() => setActiveTab('trad')}
                  >
                    Trad
                    {tradBelayStations.length > 0 && (
                      <span
                        role='button'
                        tabIndex={0}
                        title='Reset all trad belays'
                        aria-label='Reset all trad belays'
                        className='ml-0.5 inline-flex text-red-400 hover:text-red-300'
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setTradBelayStations([]);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            setTradBelayStations([]);
                          }
                        }}
                      >
                        <RotateCcw size={12} strokeWidth={2} />
                      </span>
                    )}
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
                    title={zoomMode ? 'Fit to screen' : 'Zoom and pan'}
                    aria-label={zoomMode ? 'Fit to screen' : 'Zoom and pan'}
                    className={cn(pageActionIconBtn, zoomMode ? pageActionIconBtnBrand : pageActionIconBtnGlass)}
                    onClick={() => setZoomMode(!zoomMode)}
                  >
                    <ZoomIn size={14} strokeWidth={2.25} />
                  </button>
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
                  <div className='flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2'>
                    {showPitchScopeDropdown && (
                      <>
                        <span className={cn(designContract.typography.label, 'shrink-0 text-slate-500')}>Pitch</span>
                        <select
                          className={cn(fieldClass, 'max-w-[min(100%,24rem)] min-w-0')}
                          aria-label='Which pitch strip to edit'
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
                              {p}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    {showMultiPitchCropUi && (
                      <>
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
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={cn(
              'border-surface-border relative w-full min-w-0 cursor-crosshair bg-black select-none',
              zoomMode ? 'overflow-auto' : 'overflow-hidden',
            )}
            style={zoomMode ? { maxHeight: '100dvh' } : undefined}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${w} ${h}`}
              onClick={handleOnClick}
              onMouseMove={(e) => dispatch({ action: 'mouse-move', ...getMouseCoords(e, true) })}
              className={cn(
                'block select-none',
                zoomMode ? 'h-auto' : 'h-auto w-full',
                draggingOverlay && 'cursor-grabbing',
              )}
              style={{
                // Allow native pinch-zoom on mobile, but prevent single-finger scroll/pan
                // so pointer events can handle draw/drag without interference.
                touchAction: 'pinch-zoom',
                ...(zoomMode ? { width: 'min(1920px, 150vw)', maxWidth: 'none' } : undefined),
              }}
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

              {/* Floating point toolbar — rendered AFTER points so toolbar buttons are clickable */}
              {activeTab === 'segment' &&
                points.length > 0 &&
                (() => {
                  const ap = points[activePoint];
                  const isFirst = activePoint === 0;
                  const isLast = activePoint === points.length - 1;
                  const isCurve = !isFirst && isCubicPoint(ap);
                  const btnH = 0.028 * w;
                  const btnW = 0.055 * w;
                  const gap = 0.006 * w;
                  const btnCount = isFirst ? 1 : isLast && points.length > 1 ? (isBouldering ? 2 : 3) : 2;
                  const totalW = btnW * btnCount + gap * (btnCount - 1);
                  const toolbarX = ap.x - totalW / 2;
                  const toolbarY = ap.y + 0.035 * w;
                  const labelY = toolbarY + btnH * 0.65;
                  const labelFs = 0.013 * w;
                  return (
                    <g>
                      {/* Background pill */}
                      <rect
                        x={toolbarX}
                        y={toolbarY}
                        width={totalW}
                        height={btnH}
                        rx={btnH / 2}
                        fill='rgba(0,0,0,0.7)'
                        stroke='rgba(255,255,255,0.15)'
                        strokeWidth={0.001 * w}
                        pointerEvents='none'
                      />
                      {!isFirst && (
                        <>
                          <g
                            style={{ cursor: 'pointer' }}
                            data-overlay-handle
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ action: 'set-type', type: isCurve ? 'line' : 'curve' });
                            }}
                          >
                            <rect x={toolbarX} y={toolbarY} width={btnW} height={btnH} fill='transparent' />
                            <text
                              x={toolbarX + btnW / 2}
                              y={labelY}
                              textAnchor='middle'
                              fontSize={labelFs}
                              fill={isCurve ? '#60A5FA' : '#E2E8F0'}
                              fontWeight='bold'
                              pointerEvents='none'
                            >
                              {isCurve ? 'Curve' : 'Line'}
                            </text>
                          </g>
                          <line
                            x1={toolbarX + btnW}
                            y1={toolbarY + btnH * 0.2}
                            x2={toolbarX + btnW}
                            y2={toolbarY + btnH * 0.8}
                            stroke='rgba(255,255,255,0.15)'
                            strokeWidth={0.0008 * w}
                            pointerEvents='none'
                          />
                        </>
                      )}
                      {!isBouldering && isLast && points.length > 1 && (
                        <>
                          <g
                            style={{ cursor: 'pointer' }}
                            data-overlay-handle
                            onClick={(e) => {
                              e.stopPropagation();
                              setHasAnchor(!hasAnchor);
                            }}
                          >
                            <rect
                              x={toolbarX + btnW + gap}
                              y={toolbarY}
                              width={btnW}
                              height={btnH}
                              fill='transparent'
                            />
                            <text
                              x={toolbarX + btnW + gap + btnW / 2}
                              y={labelY}
                              textAnchor='middle'
                              fontSize={labelFs}
                              fill={hasAnchor ? '#FBBF24' : '#94A3B8'}
                              fontWeight='bold'
                              pointerEvents='none'
                            >
                              Anchor
                            </text>
                          </g>
                          <line
                            x1={toolbarX + btnW * 2 + gap}
                            y1={toolbarY + btnH * 0.2}
                            x2={toolbarX + btnW * 2 + gap}
                            y2={toolbarY + btnH * 0.8}
                            stroke='rgba(255,255,255,0.15)'
                            strokeWidth={0.0008 * w}
                            pointerEvents='none'
                          />
                        </>
                      )}
                      <g
                        style={{ cursor: 'pointer' }}
                        data-overlay-handle
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ action: 'remove-point' });
                        }}
                      >
                        <rect
                          x={toolbarX + (isFirst ? 0 : isLast ? btnW * 2 + gap * 2 : btnW + gap)}
                          y={toolbarY}
                          width={btnW}
                          height={btnH}
                          fill='transparent'
                        />
                        <text
                          x={toolbarX + (isFirst ? 0 : isLast ? btnW * 2 + gap * 2 : btnW + gap) + btnW / 2}
                          y={labelY}
                          textAnchor='middle'
                          fontSize={labelFs}
                          fill='#F87171'
                          fontWeight='bold'
                          pointerEvents='none'
                        >
                          Delete
                        </text>
                      </g>
                    </g>
                  );
                })()}

              {(() => {
                /** Large enough to grab easily; hollow + stroke keeps the photo visible inside. */
                const cubicHandleR = 0.004 * w;
                const cubicHandleStrokeW = 0.00185 * w;
                const cubicGuideStrokeW = 0.0014 * w;
                const cubicDash = Math.max(4, 0.004 * w);

                /** Wider invisible targets so handles aren't blocked by guide lines or thin strokes. */
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
                        data-point-index={i}
                        data-cubic='0'
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
                        data-point-index={i}
                        data-cubic='1'
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
                      {(!drawMode || points.length <= 1) && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={i === points.length - 1 && hasAnchor ? 0.008 * w : 0.005 * w}
                          fill={activePoint === i ? '#00FF00' : '#FF0000'}
                          stroke={black}
                          pointerEvents='none'
                          data-point-index={i}
                        />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={vertexHitR}
                        fill='transparent'
                        className='cursor-grab'
                        data-point-index={i}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          dispatch({ action: 'drag-point', index: i });
                        }}
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
                const btnH = 0.022 * w;
                const btnW = 0.045 * w;
                const delX = a.x - btnW / 2;
                const delY = a.y + rVis + 0.006 * w;
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
                      onTouchStart={(e) => startOverlayDrag('anchor', i, e)}
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
                    {/* Inline delete button below the circle */}
                    {sel && (
                      <g
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAnchorAt(i);
                        }}
                      >
                        <rect
                          x={delX}
                          y={delY}
                          width={btnW}
                          height={btnH}
                          rx={btnH / 2}
                          fill='rgba(0,0,0,0.7)'
                          stroke='rgba(255,255,255,0.15)'
                          strokeWidth={0.0008 * w}
                        />
                        <text
                          x={a.x}
                          y={delY + btnH * 0.65}
                          textAnchor='middle'
                          fontSize={0.012 * w}
                          fill='#F87171'
                          fontWeight='bold'
                          pointerEvents='none'
                        >
                          Delete
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              {tradBelayStations.map((a, i) => {
                const sel = selectedOverlay?.kind === 'trad' && selectedOverlay.index === i;
                const tri = 0.006 * w;
                const pad = 0.012 * w;
                const bx = a.x - pad;
                const by = a.y - pad - tri;
                const btnH = 0.022 * w;
                const btnW = 0.045 * w;
                const delX = a.x - btnW / 2;
                const delY = a.y + tri + 0.006 * w;
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
                      onTouchStart={(e) => startOverlayDrag('trad', i, e)}
                    />
                    <polygon
                      fill='#E2011A'
                      stroke={sel ? '#FFFFFF' : '#000000'}
                      strokeWidth={sel ? 0.002 * w : 0.0012 * w}
                      strokeLinejoin='round'
                      pointerEvents='none'
                      points={`${a.x},${a.y - tri} ${a.x - tri},${a.y + tri} ${a.x + tri},${a.y + tri}`}
                    />
                    {/* Inline delete button below the triangle */}
                    {sel && (
                      <g
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTradAt(i);
                        }}
                      >
                        <rect
                          x={delX}
                          y={delY}
                          width={btnW}
                          height={btnH}
                          rx={btnH / 2}
                          fill='rgba(0,0,0,0.7)'
                          stroke='rgba(255,255,255,0.15)'
                          strokeWidth={0.0008 * w}
                        />
                        <text
                          x={a.x}
                          y={delY + btnH * 0.65}
                          textAnchor='middle'
                          fontSize={0.012 * w}
                          fill='#F87171'
                          fontWeight='bold'
                          pointerEvents='none'
                        >
                          Delete
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              {texts.map((t, i) => {
                const sel = selectedOverlay?.kind === 'text' && selectedOverlay.index === i;
                const fs = 0.03 * w;
                const pad = fs * 0.45;
                const tw = Math.max(fs * (t.txt.length || 1) * 0.55, fs * 2);
                const th = fs * 1.35;
                const btnH = 0.022 * w;
                const btnW = 0.045 * w;
                const delX = t.x - btnW / 2;
                const delY = t.y + 0.008 * w;
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
                      onTouchStart={(e) => startOverlayDrag('text', i, e)}
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
                    {/* Inline edit + delete when selected */}
                    {sel && (
                      <g>
                        {/* Background pill for controls */}
                        <rect
                          x={delX - btnW * 1.5 - 0.004 * w}
                          y={delY}
                          width={btnW * 2.5 + 0.008 * w}
                          height={btnH}
                          rx={btnH / 2}
                          fill='rgba(0,0,0,0.7)'
                          stroke='rgba(255,255,255,0.15)'
                          strokeWidth={0.0008 * w}
                          pointerEvents='none'
                        />
                        {/* Edit text button */}
                        <g
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newText = prompt('Edit label text:', t.txt);
                            if (newText !== null && newText.trim()) {
                              setTexts((prev) =>
                                prev.map((row, j) => (j === i ? { ...row, txt: newText.trim() } : row)),
                              );
                            }
                          }}
                        >
                          <rect
                            x={delX - btnW * 1.5 - 0.004 * w}
                            y={delY}
                            width={btnW * 1.5}
                            height={btnH}
                            fill='transparent'
                          />
                          <text
                            x={delX - btnW * 1.5 - 0.004 * w + btnW * 0.75}
                            y={delY + btnH * 0.65}
                            textAnchor='middle'
                            fontSize={0.012 * w}
                            fill='#E2E8F0'
                            fontWeight='bold'
                            pointerEvents='none'
                          >
                            Edit
                          </text>
                        </g>
                        {/* Delete button */}
                        <g
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTextAt(i);
                          }}
                        >
                          <rect x={delX} y={delY} width={btnW} height={btnH} fill='transparent' />
                          <text
                            x={delX + btnW / 2}
                            y={delY + btnH * 0.65}
                            textAnchor='middle'
                            fontSize={0.012 * w}
                            fill='#F87171'
                            fontWeight='bold'
                            pointerEvents='none'
                          >
                            Delete
                          </text>
                        </g>
                      </g>
                    )}
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
