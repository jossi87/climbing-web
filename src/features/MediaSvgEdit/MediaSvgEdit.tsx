import { useState, useEffect, useRef, type MouseEvent, type JSX } from 'react';
import { getMediaFileUrl, invalidateAllProblemQueries, invalidateMediaQueries, useMediaSvg } from '../../api';
import { Rappel } from '../../utils/svg-utils';
import {
  parseReadOnlySvgs,
  parsePath,
  type ParsedEntry,
  type SvgType,
  isCubicPoint,
  isQuadraticPoint,
  isArc,
} from '../../utils/svg-helpers';

import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Card } from '../../shared/ui';
import { useMeta } from '../../shared/components/Meta';
import { RotateCcw, Save, X, Spline, Anchor, Triangle, Trash2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type EditableSvg = SvgType & {
  points?: ParsedEntry[];
  id?: number;
  rappelX?: number;
  rappelY?: number;
};

/** Same roundels as Problem / SvgEdit (`h-8 w-8`). */
const pageActionIconBtn =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-40';
const pageActionIconBtnGreen = 'border-green-400/45 bg-green-500/20 text-green-300 hover:bg-green-500/28';
const pageActionIconBtnBrand = 'border-brand-border btn-brand-solid shadow-sm hover:border-brand-border';

const MediaSvgEdit = () => {
  const meta = useMeta();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mediaId } = useParams();
  const { outerWidth, outerHeight } = window;
  const mediaIdNum = Number(mediaId ?? 0);
  const { media: data, isLoading, save: newSave } = useMediaSvg(mediaIdNum) as ReturnType<typeof useMediaSvg>;

  const [, setForceUpdate] = useState(0);
  const [activeElementIndex, setActiveElementIndex] = useState(-1);
  const shift = useRef<boolean>(false);
  const [activePoint, setActivePoint] = useState<number>(0);
  const [draggedPoint, setDraggedPoint] = useState<boolean>(false);
  const [draggedCubic, setDraggedCubic] = useState<number | false>(false);
  const imageRef = useRef<SVGImageElement | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.shiftKey) shift.current = true;
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (!e.shiftKey) shift.current = false;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (!data || isLoading) {
    return <Loading />;
  }

  const getMediaSvgs = () => (data.mediaSvgs = data.mediaSvgs ?? []) as EditableSvg[];

  function handleSave() {
    void newSave(data).then(async () => {
      await invalidateMediaQueries(queryClient, mediaIdNum);
      await invalidateAllProblemQueries(queryClient);
      navigate(-1);
    });
  }

  function cancelDragging() {
    setDraggedPoint(false);
    setDraggedCubic(false);
  }

  function getMouseCoords(e: MouseEvent) {
    const dim = imageRef.current?.getBoundingClientRect();
    if (!dim) return { x: 0, y: 0 };
    const dx = data!.width! / dim.width;
    const dy = data!.height! / dim.height;
    const x = Math.round((e.clientX - dim.left) * dx);
    const y = Math.round((e.clientY - dim.top) * dy);
    return { x, y };
  }

  function generatePath(points: ParsedEntry[]) {
    let d = '';
    points.forEach((p, i) => {
      if (i === 0) d += 'M ';
      else if (isQuadraticPoint(p)) d += `Q ${p.q.x} ${p.q.y} `;
      else if (isCubicPoint(p)) d += `C ${p.c[0].x} ${p.c[0].y} ${p.c[1].x} ${p.c[1].y} `;
      else if (isArc(p)) d += `A ${p.a.rx} ${p.a.ry} ${p.a.rot} ${p.a.laf} ${p.a.sf} `;
      else d += 'L ';
      d += `${p.x} ${p.y} `;
    });
    return d;
  }

  function handleOnClick(e: MouseEvent<SVGSVGElement>) {
    if (shift.current && activeElementIndex !== -1 && getMediaSvgs()[activeElementIndex]?.points) {
      const coords = getMouseCoords(e);
      const svgs = getMediaSvgs();
      const cur = svgs[activeElementIndex];
      cur.points = cur.points ?? [];
      const points = cur.points as ParsedEntry[];
      points.push(coords);
      cur.path = generatePath(points);
      setActivePoint(points.length - 1);
      setForceUpdate((v) => v + 1);
    } else if (
      activeElementIndex !== -1 &&
      getMediaSvgs()[activeElementIndex] &&
      (getMediaSvgs()[activeElementIndex].t === 'RAPPEL_BOLTED' ||
        getMediaSvgs()[activeElementIndex].t === 'RAPPEL_NOT_BOLTED')
    ) {
      const coords = getMouseCoords(e);
      getMediaSvgs()[activeElementIndex].rappelX = coords.x;
      getMediaSvgs()[activeElementIndex].rappelY = coords.y;
      setForceUpdate((v) => v + 1);
    }
  }

  function setPointCoords(coords: { x: number; y: number }) {
    const active = activePoint;
    const svgs = getMediaSvgs();
    const cur = svgs[activeElementIndex];
    const points = (cur.points ?? []) as ParsedEntry[];
    points[active].x = coords.x;
    points[active].y = coords.y;
    cur.path = generatePath(points);
    setForceUpdate((v) => v + 1);
  }

  function setCubicCoords(coords: { x: number; y: number }, anchor: number) {
    const active = activePoint;
    const svgs = getMediaSvgs();
    const cur = svgs[activeElementIndex];
    const points = (cur.points ?? []) as ParsedEntry[];
    if (!isCubicPoint(points[active])) return;
    points[active].c[anchor].x = coords.x;
    points[active].c[anchor].y = coords.y;
    cur.path = generatePath(points);
    setForceUpdate((v) => v + 1);
  }

  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    e.preventDefault();
    if (!shift.current) {
      if (draggedPoint) setPointCoords(getMouseCoords(e));
      else if (draggedCubic !== false) setCubicCoords(getMouseCoords(e), draggedCubic);
    }
    return false;
  }

  function setCurrDraggedPoint(index: number) {
    if (!shift.current) {
      setActivePoint(index);
      setDraggedPoint(true);
    }
  }

  function setCurrDraggedCubic(index: number, anchor: number) {
    if (!shift.current) {
      setActivePoint(index);
      setDraggedCubic(anchor);
    }
  }

  function setPointType(value: string) {
    const active = activePoint;
    const svgs = getMediaSvgs();
    const cur = svgs[activeElementIndex];
    const points = (cur.points ?? []) as ParsedEntry[];
    if (active !== 0) {
      switch (value) {
        case 'L':
          points[active] = { x: points[active].x, y: points[active].y };
          break;
        case 'C':
          points[active] = {
            x: points[active].x,
            y: points[active].y,
            c: [
              {
                x: (points[active].x + points[active - 1].x - 50) / 2,
                y: (points[active].y + points[active - 1].y) / 2,
              },
              {
                x: (points[active].x + points[active - 1].x + 50) / 2,
                y: (points[active].y + points[active - 1].y) / 2,
              },
            ],
          };
          break;
      }
      cur.path = generatePath(points);
      setForceUpdate((v) => v + 1);
    }
  }

  function removeActivePoint() {
    const active = activePoint;
    const svgs = getMediaSvgs();
    const cur = svgs[activeElementIndex];
    const points = (cur.points ?? []) as ParsedEntry[];
    if (points.length > 1 && active !== 0) {
      points.splice(active, 1);
      cur.path = generatePath(points);
      setActivePoint(cur.points!.length - 1);
      setForceUpdate((v) => v + 1);
    }
  }

  function reset() {
    if (!data) return;
    const svgs = getMediaSvgs();
    svgs.length = 0;
    setActiveElementIndex(-1);
    shift.current = false;
    setActivePoint(0);
    setDraggedPoint(false);
    setDraggedCubic(false);
    setForceUpdate((v) => v + 1);
  }

  const mediaSvgs = (data.mediaSvgs = data.mediaSvgs ?? []) as EditableSvg[];

  const toolBtn = cn(
    'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors disabled:pointer-events-none disabled:opacity-35',
    designContract.typography.uiCompact,
  );
  const toolBtnOff = 'text-slate-500 hover:bg-surface-raised-hover hover:text-slate-200';
  const toolBtnReset = 'text-red-400/90 hover:bg-red-500/10 hover:text-red-200';

  const fieldClass = cn(
    'rounded-md border border-surface-border bg-surface-nav px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-border/60',
    designContract.typography.meta,
    'text-slate-200',
  );

  let scale = 1;
  if ((data.width ?? 0) > outerWidth || (data.height ?? 0) > outerHeight) {
    scale = Math.max(
      Math.max(data.width ?? 0, window.outerWidth) / 1920,
      Math.max(data.height ?? 0, window.outerHeight) / 1080,
    );
  }

  const circles = (() => {
    if (activeElementIndex < 0) return null;
    const cur = mediaSvgs[activeElementIndex];
    if (!cur || cur.t !== 'PATH' || !cur.points) return null;
    return cur.points.map((p, i, a) => {
      const anchors: JSX.Element[] = [];
      if (isCubicPoint(p)) {
        anchors.push(
          <g key={'anchor-' + i} className='opacity-70'>
            <line
              className='cursor-pointer'
              style={{ fill: 'none', stroke: '#E2011A' }}
              x1={a[i - 1].x}
              y1={a[i - 1].y}
              x2={p.c[0].x}
              y2={p.c[0].y}
              strokeWidth={0.0026 * (data.width ?? 1)}
              strokeDasharray={0.003 * (data.width ?? 1)}
            />
            <line
              className='cursor-pointer'
              style={{ fill: 'none', stroke: '#E2011A' }}
              x1={p.x}
              y1={p.y}
              x2={p.c[1].x}
              y2={p.c[1].y}
              strokeWidth={0.0026 * (data.width ?? 1)}
              strokeDasharray={0.003 * (data.width ?? 1)}
            />
            <circle
              className='cursor-pointer'
              fill='#E2011A'
              cx={p.c[0].x}
              cy={p.c[0].y}
              r={0.003 * (data.width ?? 1)}
              onMouseDown={() => setCurrDraggedCubic(i, 0)}
            />
            <circle
              className='cursor-pointer'
              fill='#E2011A'
              cx={p.c[1].x}
              cy={p.c[1].y}
              r={0.003 * (data.width ?? 1)}
              onMouseDown={() => setCurrDraggedCubic(i, 1)}
            />
          </g>,
        );
      }
      const fill = activePoint === i ? '#00FF00' : '#FF0000';
      return (
        <g key={'point-' + i}>
          <circle
            className='cursor-pointer'
            fill={fill}
            cx={p.x}
            cy={p.y}
            r={0.003 * (data.width ?? 1)}
            onMouseDown={() => setCurrDraggedPoint(i)}
          />
          {anchors}
        </g>
      );
    });
  })();

  let activeRappel: JSX.Element | null = null;
  if (
    activeElementIndex >= 0 &&
    mediaSvgs[activeElementIndex] &&
    (mediaSvgs[activeElementIndex].t === 'RAPPEL_BOLTED' || mediaSvgs[activeElementIndex].t === 'RAPPEL_NOT_BOLTED')
  ) {
    const x = mediaSvgs[activeElementIndex].rappelX;
    const y = mediaSvgs[activeElementIndex].rappelY;

    activeRappel = (
      <Rappel
        key={'ACTIVE_RAPPEL'}
        backgroundColor={'white'}
        bolted={mediaSvgs[activeElementIndex].t === 'RAPPEL_BOLTED'}
        color={'red'}
        scale={scale}
        thumb={false}
        x={x}
        y={y}
      />
    );
  }

  return (
    <div className='w-full min-w-0 select-none' onMouseUp={cancelDragging} onMouseLeave={cancelDragging}>
      <title>{`Media topo · #${mediaIdNum} | ${meta.title}`}</title>
      <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
        <div className='divide-y divide-white/6'>
          <div className='p-3 sm:p-5'>
            <div className='mb-4 flex min-w-0 flex-nowrap items-start gap-x-2'>
              <span className='sr-only'>Media topo editor</span>
              <div className='mr-auto flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-1.5'>
                <button
                  type='button'
                  title='Add descent path'
                  onClick={() => {
                    const element: EditableSvg = {
                      t: 'PATH',
                      id: -1,
                      path: '',
                      anchors: [],
                      nr: -1,
                      pitch: 0,
                      hasAnchor: false,
                      points: [],
                    };
                    mediaSvgs.push(element);
                    setActiveElementIndex(mediaSvgs.length - 1);
                    setActivePoint(0);
                    setForceUpdate((v) => v + 1);
                  }}
                  className={cn(toolBtn, toolBtnOff, 'hover:border-surface-border/60 border border-transparent')}
                >
                  <Spline size={14} strokeWidth={2} className='text-brand' /> Descent
                </button>
                <button
                  type='button'
                  title='Add bolted rappel'
                  onClick={() => {
                    const element: EditableSvg = {
                      t: 'RAPPEL_BOLTED',
                      id: -1,
                      path: '',
                      anchors: [],
                      nr: -1,
                      pitch: 0,
                      hasAnchor: false,
                      rappelX: (data.width ?? 0) / 2,
                      rappelY: (data.height ?? 0) / 2,
                    };
                    mediaSvgs.push(element);
                    setActiveElementIndex(mediaSvgs.length - 1);
                    setActivePoint(0);
                    setForceUpdate((v) => v + 1);
                  }}
                  className={cn(toolBtn, toolBtnOff, 'hover:border-surface-border/60 border border-transparent')}
                >
                  <Anchor size={14} strokeWidth={2} className='text-amber-400' /> Bolted
                </button>
                <button
                  type='button'
                  title='Add trad rappel'
                  onClick={() => {
                    const element: EditableSvg = {
                      t: 'RAPPEL_NOT_BOLTED',
                      id: -1,
                      path: '',
                      anchors: [],
                      nr: -1,
                      pitch: 0,
                      hasAnchor: false,
                      rappelX: (data.width ?? 0) / 2,
                      rappelY: (data.height ?? 0) / 2,
                    };
                    mediaSvgs.push(element);
                    setActiveElementIndex(mediaSvgs.length - 1);
                    setActivePoint(0);
                    setForceUpdate((v) => v + 1);
                  }}
                  className={cn(toolBtn, toolBtnOff, 'hover:border-surface-border/60 border border-transparent')}
                >
                  <Triangle size={14} strokeWidth={2} className='text-orange-400' /> Trad
                </button>
                <button
                  type='button'
                  title='Clear all overlays'
                  onClick={reset}
                  disabled={!mediaSvgs?.length}
                  className={cn(toolBtn, toolBtnReset, 'border border-transparent hover:border-red-500/15')}
                >
                  <RotateCcw size={14} strokeWidth={2} /> Reset
                </button>
              </div>
              <div className='flex shrink-0 flex-nowrap items-center gap-1.5 self-start pt-0.5'>
                <button
                  type='button'
                  title='Cancel'
                  aria-label='Cancel and go back'
                  className={cn(pageActionIconBtn, pageActionIconBtnBrand)}
                  onClick={() => navigate(-1)}
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
                <button
                  type='button'
                  title='Save'
                  aria-label='Save'
                  className={cn(pageActionIconBtn, pageActionIconBtnGreen)}
                  onClick={handleSave}
                >
                  <Save size={14} strokeWidth={2.25} />
                </button>
              </div>
            </div>

            <p className={cn(designContract.typography.meta, 'mb-3 text-slate-500')}>
              Shift+click adds a point on the path.
            </p>

            {mediaSvgs.length > 0 && (
              <div className='mb-3 flex min-w-0 flex-wrap gap-1.5'>
                {mediaSvgs.map((svg, index) => (
                  <div
                    key={index}
                    className={cn(
                      'inline-flex max-w-full min-w-0 items-stretch overflow-hidden rounded-lg transition-colors',
                      designContract.typography.uiCompact,
                      activeElementIndex === index
                        ? 'bg-surface-raised-hover ring-brand-border/45 text-slate-100 ring-1 ring-inset'
                        : 'bg-surface-raised ring-surface-border/50 hover:bg-surface-raised-hover text-slate-500 ring-1 ring-inset hover:text-slate-300',
                    )}
                  >
                    <button
                      type='button'
                      onClick={() => {
                        if (svg.t === 'PATH' && !mediaSvgs[index].points) {
                          mediaSvgs[index].points = parsePath(mediaSvgs[index].path);
                        }
                        setActiveElementIndex(index);
                        setActivePoint(0);
                      }}
                      className='min-w-0 flex-1 truncate px-2.5 py-1 text-left'
                    >
                      {svg.t === 'PATH' ? 'Descent' : svg.t === 'RAPPEL_BOLTED' ? 'Bolted' : 'Trad'}{' '}
                      <span className='tabular-nums opacity-70'>#{index}</span>
                    </button>
                    <button
                      type='button'
                      title='Remove layer'
                      aria-label='Remove layer'
                      onClick={() => {
                        mediaSvgs.splice(index, 1);
                        setActiveElementIndex(-1);
                        setForceUpdate((v) => v + 1);
                      }}
                      className='border-surface-border/50 shrink-0 border-l px-1.5 text-slate-500 hover:bg-red-950 hover:text-red-300'
                    >
                      <Trash2 size={12} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeElementIndex >= 0 && (
              <div className='border-t border-white/6 pt-3'>
                <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
                  <div className='flex min-w-0 items-start gap-2'>
                    <Info size={14} className='mt-0.5 shrink-0 text-slate-500' strokeWidth={2} />
                    <p className={cn(designContract.typography.meta, 'min-w-0 leading-relaxed text-slate-400')}>
                      {mediaSvgs[activeElementIndex].t === 'PATH' ? (
                        <>
                          <span className='text-slate-300'>Shift+click</span> add point ·{' '}
                          <span className='text-slate-300'>Drag</span> move · Select layer above
                        </>
                      ) : (
                        <>
                          <span className='text-slate-300'>Click</span> image to place rappel
                        </>
                      )}
                    </p>
                  </div>
                  {mediaSvgs[activeElementIndex].t === 'PATH' && activePoint !== 0 && (
                    <div className='flex min-w-0 flex-wrap items-center gap-2'>
                      <span className={cn(designContract.typography.label, 'shrink-0 text-slate-500')}>Segment</span>
                      <select
                        className={cn(fieldClass, 'min-w-0')}
                        value={isCubicPoint(mediaSvgs[activeElementIndex].points![activePoint]) ? 'C' : 'L'}
                        onChange={(e) => setPointType(e.target.value)}
                      >
                        <option value='L'>Line</option>
                        <option value='C'>Curve</option>
                      </select>
                      <button
                        type='button'
                        title='Remove selected point'
                        aria-label='Remove selected point'
                        className={cn(
                          toolBtn,
                          'bg-surface-nav w-auto shrink-0 border border-white/10 text-slate-400 hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-200',
                        )}
                        onClick={removeActivePoint}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                        <span className='whitespace-nowrap'>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className='border-surface-border relative w-full min-w-0 cursor-crosshair overflow-hidden bg-black'>
            <svg
              viewBox={'0 0 ' + data.width + ' ' + data.height}
              onClick={handleOnClick}
              onMouseMove={handleMouseMove}
              className='block h-auto w-full'
            >
              <image
                ref={imageRef}
                xlinkHref={getMediaFileUrl(data.identity?.id ?? 0, Number(data.identity?.versionStamp ?? 0), false)}
                width='100%'
                height='100%'
              />
              {activeElementIndex >= 0 && mediaSvgs[activeElementIndex] && (
                <path
                  className='pointer-events-none'
                  style={{ fill: 'none', stroke: '#FF0000' }}
                  d={mediaSvgs[activeElementIndex].path}
                  strokeWidth={0.002 * (data.width ?? 0)}
                />
              )}
              {circles}
              {activeRappel}
              {mediaSvgs &&
                parseReadOnlySvgs(
                  mediaSvgs.filter((_, index) => index !== activeElementIndex) as SvgType[],
                  data.width ?? 0,
                  data.height ?? 0,
                  scale,
                )}
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MediaSvgEdit;
