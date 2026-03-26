import { useState, useEffect, useRef, type FormEvent, type MouseEvent, type JSX } from 'react';
import { getMediaFileUrl, useMediaSvg } from '../../api';
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

import { Loading } from '../../shared/ui/StatusWidgets';
import { useNavigate, useParams } from 'react-router-dom';
import type { Success } from '../../@types/buldreinfo';
import { RotateCcw, Save, X, Plus, Anchor, Trash2, Info, MinusCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

type EditableSvg = SvgType & {
  points?: ParsedEntry[];
  id?: number;
  rappelX?: number;
  rappelY?: number;
};

const MediaSvgEdit = () => {
  const navigate = useNavigate();
  const { mediaId } = useParams();
  const { outerWidth, outerHeight } = window;
  const mediaIdNum = Number(mediaId ?? 0);
  const { media: data, status, isLoading, save: newSave } = useMediaSvg(mediaIdNum) as ReturnType<typeof useMediaSvg>;

  const [modifiedData, setData] = useState<Success<'getMedia'> | undefined | null>(null);
  const [, setForceUpdate] = useState(0);
  const [activeElementIndex, setActiveElementIndex] = useState(-1);
  const shift = useRef<boolean>(false);
  const [activePoint, setActivePoint] = useState<number>(0);
  const [draggedPoint, setDraggedPoint] = useState<boolean>(false);
  const [draggedCubic, setDraggedCubic] = useState<number | false>(false);
  const imageRef = useRef<SVGImageElement | null>(null);

  useEffect(() => {
    switch (status) {
      case 'success': {
        setData(data);
        break;
      }
      case 'pending': {
        setData(undefined);
        break;
      }
    }
  }, [data, status]);

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

  function save(event: FormEvent) {
    event.preventDefault();
    newSave(modifiedData).then(() => navigate(-1));
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
      setData(data);
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
      setData(data);
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
    setData(data);
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
    setData(data);
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
      setData(data);
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
      setData(data);
      setForceUpdate((v) => v + 1);
    }
  }

  function reset() {
    if (!data) return;
    const svgs = getMediaSvgs();
    svgs.length = 0;
    setData(data);
    setActiveElementIndex(-1);
    shift.current = false;
    setActivePoint(0);
    setDraggedPoint(false);
    setDraggedCubic(false);
    setForceUpdate((v) => v + 1);
  }

  const mediaSvgs = (data.mediaSvgs = data.mediaSvgs ?? []) as EditableSvg[];

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
          {anchors}
          <circle
            className='cursor-pointer'
            fill={fill}
            cx={p.x}
            cy={p.y}
            r={0.003 * (data.width ?? 1)}
            onMouseDown={() => setCurrDraggedPoint(i)}
          />
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
    <div
      className='max-w-container mx-auto space-y-4 px-4 py-6 select-none'
      onMouseUp={cancelDragging}
      onMouseLeave={cancelDragging}
    >
      <div className='bg-surface-card border-surface-border space-y-6 rounded-xl border p-6 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-wrap gap-2'>
            <button
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
                setData(data);
                setActiveElementIndex(mediaSvgs.length - 1);
                setActivePoint(0);
                setForceUpdate((v) => v + 1);
              }}
              className='bg-surface-nav border-surface-border flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-black tracking-wider uppercase opacity-85 transition-colors hover:opacity-100'
            >
              <Plus size={14} /> Add descent
            </button>
            <button
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
                setData(data);
                setActiveElementIndex(mediaSvgs.length - 1);
                setActivePoint(0);
                setForceUpdate((v) => v + 1);
              }}
              className='bg-surface-nav border-surface-border flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-black tracking-wider uppercase opacity-85 transition-colors hover:opacity-100'
            >
              <Anchor size={14} /> Rappel (Bolted)
            </button>
            <button
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
                setData(data);
                setActiveElementIndex(mediaSvgs.length - 1);
                setActivePoint(0);
                setForceUpdate((v) => v + 1);
              }}
              className='bg-surface-nav border-surface-border flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-black tracking-wider uppercase opacity-85 transition-colors hover:opacity-100'
            >
              <Anchor size={14} /> Rappel (No Bolt)
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={reset}
              disabled={!mediaSvgs?.length}
              className='flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-black tracking-wider text-red-500 uppercase hover:bg-red-500/20 disabled:pointer-events-none disabled:opacity-30'
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={() => navigate(-1)}
              className='bg-surface-nav border-surface-border flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-black tracking-wider uppercase opacity-75 hover:opacity-100'
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={save}
              className='bg-brand shadow-brand/20 flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[10px] font-black tracking-wider uppercase shadow-md'
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          {mediaSvgs.map((svg, index) => (
            <div
              key={index}
              className={cn(
                'group flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase transition-all',
                activeElementIndex === index
                  ? 'bg-brand/10 border-brand text-brand'
                  : 'bg-surface-nav border-surface-border text-slate-400 hover:text-slate-200',
              )}
              onClick={() => {
                if (svg.t === 'PATH' && !mediaSvgs[index].points) {
                  mediaSvgs[index].points = parsePath(mediaSvgs[index].path);
                }
                setActiveElementIndex(index);
                setActivePoint(0);
              }}
            >
              <span>
                {svg.t} #{index}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  mediaSvgs.splice(index, 1);
                  setData(data);
                  setActiveElementIndex(-1);
                  setForceUpdate((v) => v + 1);
                }}
                className='hover:text-red-500'
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {activeElementIndex >= 0 && (
          <div className='border-surface-border/50 border-t pt-4'>
            <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
              <div className='flex items-start gap-3'>
                <Info size={16} className='mt-0.5 shrink-0 text-slate-500' />
                <div className='text-[10px] leading-relaxed font-bold tracking-wide text-slate-400 uppercase'>
                  {mediaSvgs[activeElementIndex].t === 'PATH' ? (
                    <>
                      <span>Shift + Click</span> to add point | <span>Click</span> to select | <span>Drag</span> to move
                    </>
                  ) : (
                    <>
                      <span>Click</span> to move anchor
                    </>
                  )}
                </div>
              </div>

              {activeElementIndex >= 0 && mediaSvgs[activeElementIndex].t === 'PATH' && activePoint !== 0 && (
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <select
                      className='bg-surface-nav border-surface-border focus:border-brand appearance-none rounded-lg border px-3 py-1.5 pr-8 text-[10px] font-black tracking-wider uppercase opacity-85 focus:outline-none'
                      value={isCubicPoint(mediaSvgs[activeElementIndex].points![activePoint]) ? 'C' : 'L'}
                      onChange={(e) => setPointType(e.target.value)}
                    >
                      <option value='L'>Line to</option>
                      <option value='C'>Curve to</option>
                    </select>
                    <ChevronDown
                      size={12}
                      className='pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-500'
                    />
                  </div>
                  <button
                    onClick={removeActivePoint}
                    className='flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-black tracking-wider text-red-500 uppercase hover:bg-red-500/20'
                  >
                    <MinusCircle size={14} /> Remove point
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className='border-surface-border relative cursor-crosshair overflow-hidden rounded-xl border bg-black shadow-2xl'>
        <svg
          viewBox={'0 0 ' + data.width + ' ' + data.height}
          onClick={handleOnClick}
          onMouseMove={handleMouseMove}
          className='block h-auto w-full'
        >
          <image
            ref={imageRef}
            xlinkHref={getMediaFileUrl(data.id ?? 0, data.versionStamp ?? 0, false)}
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
  );
};

export default MediaSvgEdit;
