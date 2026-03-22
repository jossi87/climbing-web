import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MouseEventHandler,
  useReducer,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMeta } from '../common/meta';
import {
  type EditableSvg,
  getMediaFileUrl,
  postProblemSvg,
  useAccessToken,
  useSvgEdit,
} from '../../api';
import {
  parseReadOnlySvgs,
  parsePath,
  isCubicPoint,
  type ParsedEntry,
} from '../../utils/svg-helpers';
import { Loading } from '../common/widgets/widgets';
import { captureException } from '@sentry/react';
import { generatePath, reducer, type State } from './state';
import { neverGuard } from '../../utils/neverGuard';
import type { MediaRegion } from '../../utils/svg-scaler';
import {
  Video,
  RotateCcw,
  X,
  Save,
  Type,
  Anchor,
  Triangle,
  Square,
  CheckSquare,
  RefreshCw,
  Loader2,
  Settings2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type Coords = { x: number; y: number };

const useIds = (): { problemId: number; pitch: number; mediaId: number } => {
  const { problemId, pitch, mediaId } = useParams();
  if (!problemId || !pitch || !mediaId) throw new Error('Missing route parameters');
  return { problemId: +problemId, pitch: +pitch, mediaId: +mediaId };
};

export const SvgEditLoader = () => {
  const { problemId, pitch, mediaId } = useIds();
  const [customMediaRegion, setCustomMediaRegion] = useState<MediaRegion | null>(null);
  const data = useSvgEdit(problemId, pitch, mediaId, customMediaRegion);
  const accessToken = useAccessToken();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const save = useCallback(
    (
      updated: Required<
        Pick<EditableSvg, 'path' | 'hasAnchor' | 'anchors' | 'tradBelayStations' | 'texts'>
      >,
    ) => {
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

  if (!data) return <Loading />;

  return (
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
  );
};

type Props = EditableSvg & {
  onSave: (
    updated: Required<
      Pick<EditableSvg, 'path' | 'hasAnchor' | 'anchors' | 'tradBelayStations' | 'texts'>
    >,
  ) => void;
  saving: boolean;
  onCancel: () => void;
  onUpdateMediaRegion: (customMediaRegion: MediaRegion | null) => void;
};

const black = '#000000';
const strokeColor = '#FFFFFF';

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
  const meta = useMeta();
  const imageRef = useRef<SVGImageElement>(null);
  const shift = useRef(false);

  const readOnlyPointsRef = useRef(
    (readOnlySvgs ?? [])
      .map((svg) => parsePath(svg.path ?? '').map((p, ix) => ({ ...p, ix })))
      .flat(),
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
  const [tradBelayStations, setTradBelayStations] = useState<Coords[]>(
    initialTradBelayStations ?? [],
  );
  const [texts, setTexts] = useState<{ txt: string; x: number; y: number }[]>(initialTexts ?? []);
  const [hasAnchor, setHasAnchor] = useState(!!initialHasAnchor);
  const [mode, setMode] = useState<'points' | 'add-anchor' | 'add-text' | 'add-trad-belay'>(
    'points',
  );

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
        const found = readOnlyPointsRef.current.find(
          (p2) => Math.hypot(p.x - p2.x, p.y - p2.y) < 20,
        );
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

  const btnClass =
    'flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border disabled:opacity-30';
  const activeBtn = 'bg-brand border-brand text-white shadow-sm';
  const inactiveBtn = 'bg-surface-nav border-surface-border text-slate-400 hover:text-white';

  return (
    <div className='max-w-6xl mx-auto space-y-4 p-4' onMouseUp={() => dispatch({ action: 'idle' })}>
      <div className='bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm space-y-4'>
        <title>{`SvgEdit | ${meta.title}`}</title>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              className={cn(btnClass, mode === 'add-text' ? activeBtn : inactiveBtn)}
              onClick={() => setMode(mode === 'add-text' ? 'points' : 'add-text')}
            >
              <Type size={14} /> Text
            </button>
            <button
              type='button'
              className={cn(btnClass, mode === 'add-anchor' ? activeBtn : inactiveBtn)}
              onClick={() => setMode(mode === 'add-anchor' ? 'points' : 'add-anchor')}
            >
              <Anchor size={14} /> Anchors
            </button>
            <button
              type='button'
              className={cn(btnClass, mode === 'add-trad-belay' ? activeBtn : inactiveBtn)}
              onClick={() => setMode(mode === 'add-trad-belay' ? 'points' : 'add-trad-belay')}
            >
              <Triangle size={14} /> Trad Belay
            </button>
            <button
              type='button'
              className={cn(btnClass, inactiveBtn)}
              onClick={() => setHasAnchor(!hasAnchor)}
              disabled={points.length === 0}
            >
              {hasAnchor ? <CheckSquare size={14} className='text-brand' /> : <Square size={14} />}{' '}
              Anchor
            </button>
            <button
              type='button'
              className={cn(
                btnClass,
                'text-orange-500 border-orange-500/20 hover:bg-orange-500/10',
              )}
              onClick={() => {
                setTexts([]);
                setAnchors([]);
                setTradBelayStations([]);
                dispatch({ action: 'reset' });
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className='flex gap-2'>
            <Link
              to='/mp4/20230718_SvgEditExample.mp4'
              target='_blank'
              className={cn(
                btnClass,
                'bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600/20',
              )}
            >
              <Video size={14} /> Video
            </Link>
            <button
              type='button'
              className={cn(btnClass, 'bg-brand border-brand text-white shadow-lg shadow-brand/20')}
              disabled={saving}
              onClick={() => onSave({ anchors, hasAnchor, path, tradBelayStations, texts })}
            >
              {saving ? <Loader2 size={14} className='animate-spin' /> : <Save size={14} />} Save
            </button>
            <button
              type='button'
              className={cn(btnClass, 'bg-red-600/10 border-red-600/20 text-red-400')}
              onClick={onCancel}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-4 py-2 border-t border-surface-border'>
          {activePoint !== 0 && (
            <div className='flex items-center gap-2'>
              <span className='text-[10px] text-slate-500 font-black uppercase'>Segment Type:</span>
              <select
                className='bg-surface-nav border border-surface-border rounded px-2 py-1 text-[10px] text-white outline-none'
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
            className={cn(btnClass, 'py-1 px-2')}
            disabled={points.length === 0}
            onClick={() => dispatch({ action: 'remove-point' })}
          >
            Remove Selected Point
          </button>

          <div className='ml-auto flex items-center gap-2'>
            <Settings2 size={14} className='text-slate-500' />
            <input
              type='number'
              className='w-16 bg-surface-nav border border-surface-border rounded px-2 py-1 text-[10px] text-white'
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
              className='w-16 bg-surface-nav border border-surface-border rounded px-2 py-1 text-[10px] text-white'
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
              className={cn(btnClass, 'py-1 px-2')}
              onClick={() => onUpdateMediaRegion(customMediaRegion ?? null)}
            >
              <RefreshCw size={12} /> Crop
            </button>
          </div>
        </div>
      </div>

      <div className='relative rounded-xl overflow-hidden border border-surface-border bg-black select-none cursor-crosshair'>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          onClick={handleOnClick}
          onMouseMove={(e) => dispatch({ action: 'mouse-move', ...getMouseCoords(e, true) })}
          className='w-full h-auto block'
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

          {points.map((p, i) => {
            const handles = isCubicPoint(p) && (
              <g className='opacity-50'>
                <line
                  x1={points[i - 1].x}
                  y1={points[i - 1].y}
                  x2={p.c[0].x}
                  y2={p.c[0].y}
                  stroke={strokeColor}
                  strokeWidth={0.001 * w}
                  strokeDasharray='5,5'
                />
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={p.c[1].x}
                  y2={p.c[1].y}
                  stroke={strokeColor}
                  strokeWidth={0.001 * w}
                  strokeDasharray='5,5'
                />
                <circle
                  cx={p.c[0].x}
                  cy={p.c[0].y}
                  r={0.003 * w}
                  fill={strokeColor}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dispatch({ action: 'drag-cubic', index: i, c: 0 });
                  }}
                />
                <circle
                  cx={p.c[1].x}
                  cy={p.c[1].y}
                  r={0.003 * w}
                  fill={strokeColor}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dispatch({ action: 'drag-cubic', index: i, c: 1 });
                  }}
                />
              </g>
            );
            return (
              <g key={`${p.x}-${p.y}-${i}`}>
                {handles}
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
              </g>
            );
          })}

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
            <text
              key={`text-${i}`}
              x={t.x}
              y={t.y}
              fontSize={0.03 * w}
              fill='red'
              fontWeight='bold'
            >
              {t.txt}
            </text>
          ))}
        </svg>
      </div>

      <div className='bg-surface-card border border-surface-border rounded-xl p-4'>
        <input
          className='w-full bg-surface-nav border border-surface-border rounded-lg py-2 px-3 text-sm text-white font-mono'
          value={path || ''}
          onChange={(e) => dispatch({ action: 'update-path', path: e.target.value })}
        />
      </div>
    </div>
  );
};

export default SvgEditLoader;
