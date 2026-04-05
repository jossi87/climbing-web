import { useState, useEffect, useRef, useCallback, type MouseEventHandler, useReducer } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMeta } from '../../shared/components/Meta';
import { type EditableSvg, getMediaFileUrl, postProblemSvg, useAccessToken, useProblem, useSvgEdit } from '../../api';
import { parseReadOnlySvgs, parsePath, isCubicPoint, type ParsedEntry } from '../../utils/svg-helpers';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Card } from '../../shared/ui';
import { captureException } from '@sentry/react';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Coords = { x: number; y: number };

/** Matches Problem / header action icon buttons (`h-8 w-8` roundels). */
const pageActionIconBtn =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-40';
const pageActionIconBtnGlass =
  'border-white/12 bg-surface-raised text-slate-300 hover:border-white/18 hover:bg-surface-raised-hover';
const pageActionIconBtnGreen = 'border-green-400/45 bg-green-500/20 text-green-300 hover:bg-green-500/28';
const pageActionIconBtnBrand =
  'border-brand-border bg-brand text-white shadow-sm hover:border-brand-border hover:brightness-110';

const useIds = (): { problemId: number; pitch: number; mediaId: number } => {
  const { problemId, pitch, mediaId } = useParams();
  if (!problemId || !pitch || !mediaId) throw new Error('Missing route parameters');
  return { problemId: +problemId, pitch: +pitch, mediaId: +mediaId };
};

export const SvgEditLoader = () => {
  const { problemId, pitch, mediaId } = useIds();
  const meta = useMeta();
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
        .then(() => {
          if (pitch > 0) {
            navigate(0);
          } else {
            navigate(`/problem/${problemId}`);
          }
        })
        .catch((error) => {
          console.warn(error);
          captureException(error);
        })
        .finally(() => setSaving(false));
    },
    [accessToken, problemId, pitch, mediaId, data?.svgId, data?.mediaRegion, navigate],
  );

  if (!problem || !data) return <Loading />;

  return (
    <div className='w-full min-w-0'>
      <title>{`${pitch > 0 ? `Pitch ${pitch} · ` : ''}Topo editor | ${meta.title}`}</title>
      <SvgEdit
        key={JSON.stringify(data)}
        {...data}
        mediaRegion={data.mediaRegion ?? undefined}
        sections={data.sections ?? []}
        onSave={save}
        saving={saving}
        onCancel={() => navigate(`/problem/${problemId}`)}
        onUpdateMediaRegion={setCustomMediaRegion}
      />
    </div>
  );
};

type Props = EditableSvg & {
  onSave: (
    updated: Required<Pick<EditableSvg, 'path' | 'hasAnchor' | 'anchors' | 'tradBelayStations' | 'texts'>>,
  ) => void;
  saving: boolean;
  onCancel: () => void;
  onUpdateMediaRegion: (customMediaRegion: MediaRegion | null) => void;
};

const black = '#000000';
const strokeColor = '#FFFFFF';
/** Dashed guide lines only — handles use hollow circles + bold black stroke (no group opacity). */
const curveGuideOpacity = 0.92;

export const SvgEdit = ({
  saving,
  onSave,
  onCancel,
  onUpdateMediaRegion,
  problemId: _pId,
  pitch: _pi,
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
  const [customMediaRegion, setCustomMediaRegion] = useState<MediaRegion | undefined>(mediaRegion);
  const w = (mediaRegion ?? customMediaRegion)?.width || mediaWidth;
  const h = (mediaRegion ?? customMediaRegion)?.height || mediaHeight;
  /** Crop / region offsets are for multi-pitch strips on tall photos — not for normal single-pitch images */
  const showMultiPitchCropUi = _pi > 0;
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
  const [mode, setMode] = useState<'points' | 'add-anchor' | 'add-text' | 'add-trad-belay'>('points');

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

  const getMouseCoords = useCallback(
    (e: React.MouseEvent, snap: boolean): Coords => {
      const dim = imageRef.current?.getBoundingClientRect();
      if (!dim) return { x: 0, y: 0 };
      const x = Math.round((e.clientX - dim.left) * (w / dim.width));
      const y = Math.round((e.clientY - dim.top) * (h / dim.height));
      let p = { x, y };
      if (snap) {
        const found = readOnlyPointsRef.current.find((p2) => Math.hypot(p.x - p2.x, p.y - p2.y) < 20);
        if (found) p = { x: found.x, y: found.y };
      }
      return p;
    },
    [w, h],
  );

  const handleOnClick: MouseEventHandler = (e) => {
    if (mode === 'points') {
      if (shift.current) {
        const coords = getMouseCoords(e, true);
        dispatch({ action: 'add-point', ...coords });
      }
      dispatch({ action: 'mouse-up' });
    } else {
      const coords = getMouseCoords(e, mode !== 'add-text');
      if (mode === 'add-text') {
        const txt = prompt('Enter text', '');
        if (txt) setTexts([...texts, { txt, ...coords }]);
        setMode('points');
      } else if (mode === 'add-anchor') {
        setAnchors([...anchors, coords]);
        setMode('points');
      } else if (mode === 'add-trad-belay') {
        setTradBelayStations([...tradBelayStations, coords]);
        setMode('points');
      } else {
        neverGuard(mode as never, null);
      }
    }
  };

  const toolBtn = cn(
    'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors disabled:pointer-events-none disabled:opacity-35',
    designContract.typography.uiCompact,
  );
  /** Active modes — cool / warm cues: text (brand), anchors (amber), trad (orange), path anchor (brand ring). */
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

  return (
    <div className='w-full min-w-0' onMouseUp={() => dispatch({ action: 'idle' })}>
      <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
        <div className='divide-y divide-white/6'>
          <div className='p-3 sm:p-5'>
            <div className='mb-4 flex min-w-0 flex-nowrap items-start gap-x-2'>
              <span className='sr-only'>Topo editor</span>
              <div className='mr-auto flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-1.5'>
                <button
                  type='button'
                  className={cn(toolBtn, mode === 'add-text' ? toolBtnOnText : toolBtnOff)}
                  onClick={() => setMode(mode === 'add-text' ? 'points' : 'add-text')}
                >
                  <Type size={14} strokeWidth={2} className={mode === 'add-text' ? 'text-brand' : undefined} /> Text
                </button>
                <button
                  type='button'
                  className={cn(toolBtn, mode === 'add-anchor' ? toolBtnOnAnchor : toolBtnOff)}
                  onClick={() => setMode(mode === 'add-anchor' ? 'points' : 'add-anchor')}
                >
                  <Anchor size={14} strokeWidth={2} className={mode === 'add-anchor' ? 'text-amber-300' : undefined} />{' '}
                  Anchors
                </button>
                <button
                  type='button'
                  className={cn(toolBtn, mode === 'add-trad-belay' ? toolBtnOnTrad : toolBtnOff)}
                  onClick={() => setMode(mode === 'add-trad-belay' ? 'points' : 'add-trad-belay')}
                >
                  <Triangle
                    size={14}
                    strokeWidth={2}
                    className={mode === 'add-trad-belay' ? 'text-orange-300' : undefined}
                  />{' '}
                  Trad
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
                    dispatch({ action: 'reset' });
                  }}
                >
                  <RotateCcw size={14} strokeWidth={2} /> Reset
                </button>
              </div>
              <div className='flex shrink-0 flex-nowrap items-center gap-1.5 self-start pt-0.5'>
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

            <p className={cn(designContract.typography.meta, 'mb-3 text-slate-500')}>
              Shift+click adds a point on the path.
            </p>

            <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2'>
              {activePoint !== 0 && (
                <div className='flex min-w-0 items-center gap-2'>
                  <span className={cn(designContract.typography.label, 'shrink-0 text-slate-500')}>Segment</span>
                  <select
                    className={cn(fieldClass, 'min-w-0')}
                    value={isCubicPoint(points[activePoint]) ? 'C' : 'L'}
                    onChange={(e) => dispatch({ action: 'set-type', type: e.target.value === 'C' ? 'curve' : 'line' })}
                  >
                    <option value='L'>Line</option>
                    <option value='C'>Curve</option>
                  </select>
                </div>
              )}
              <button
                type='button'
                title='Remove selected point'
                aria-label='Remove selected point'
                className={cn(
                  toolBtn,
                  'bg-surface-nav border-white/10 text-slate-400 hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-200',
                  'w-auto shrink-0',
                )}
                disabled={points.length === 0}
                onClick={() => dispatch({ action: 'remove-point' })}
              >
                <Trash2 size={14} strokeWidth={2} />
                <span className='whitespace-nowrap'>Remove</span>
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
                    className={cn(toolBtn, toolBtnOff, 'bg-surface-raised border-white/10')}
                    onClick={() => onUpdateMediaRegion(customMediaRegion ?? null)}
                  >
                    <RefreshCw size={12} strokeWidth={2} /> Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className='border-surface-border relative w-full min-w-0 cursor-crosshair overflow-hidden bg-black select-none'>
            <svg
              viewBox={`0 0 ${w} ${h}`}
              onClick={handleOnClick}
              onMouseMove={(e) => dispatch({ action: 'mouse-move', ...getMouseCoords(e, true) })}
              className='block h-auto w-full'
            >
              <image
                ref={imageRef}
                xlinkHref={getMediaFileUrl(mediaId, versionStamp, false, { mediaRegion })}
                width='100%'
                height='100%'
              />
              {parseReadOnlySvgs(readOnlySvgs, w, h, 1000)}
              <path d={path} fill='none' stroke={black} strokeWidth={0.003 * w} />
              <path d={path} fill='none' stroke='#FF0000' strokeWidth={0.002 * w} />

              {(() => {
                /** Large enough to grab easily; hollow + stroke keeps the photo visible inside. */
                const cubicHandleR = 0.004 * w;
                const cubicHandleStrokeW = 0.00155 * w;
                const cubicGuideStrokeW = 0.0014 * w;
                const cubicDash = Math.max(4, 0.004 * w);

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
                      />
                      {/*
                        fill=transparent (not none): SVG only hit-tests stroke on fill=none — too hard to grab.
                        Vertex circle is drawn *below* this group so handles stay on top for picking.
                      */}
                      <circle
                        cx={p.c[0].x}
                        cy={p.c[0].y}
                        r={cubicHandleR}
                        fill='transparent'
                        stroke={black}
                        strokeWidth={cubicHandleStrokeW}
                        strokeLinejoin='round'
                        className='cursor-grab'
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dispatch({ action: 'drag-cubic', index: i, c: 0 });
                        }}
                      />
                      <circle
                        cx={p.c[1].x}
                        cy={p.c[1].y}
                        r={cubicHandleR}
                        fill='transparent'
                        stroke={black}
                        strokeWidth={cubicHandleStrokeW}
                        strokeLinejoin='round'
                        className='cursor-grab'
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dispatch({ action: 'drag-cubic', index: i, c: 1 });
                        }}
                      />
                    </g>
                  );
                  return (
                    <g key={`${p.x}-${p.y}-${i}`}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={0.005 * w}
                        fill={activePoint === i ? '#00FF00' : '#FF0000'}
                        stroke={black}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dispatch({ action: 'drag-point', index: i });
                        }}
                      />
                      {handles}
                    </g>
                  );
                });
              })()}

              {anchors.map((a, i) => (
                <circle key={`anchor-${i}`} cx={a.x} cy={a.y} r={0.006 * w} fill='#E2011A' />
              ))}
              {tradBelayStations.map((a, i) => (
                <polygon
                  key={`trad-${i}`}
                  fill='#E2011A'
                  points={`${a.x},${a.y - 0.006 * w} ${a.x - 0.006 * w},${a.y + 0.006 * w} ${a.x + 0.006 * w},${a.y + 0.006 * w}`}
                />
              ))}
              {texts.map((t, i) => (
                <text key={`text-${i}`} x={t.x} y={t.y} fontSize={0.03 * w} fill='red' fontWeight='bold'>
                  {t.txt}
                </text>
              ))}
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
