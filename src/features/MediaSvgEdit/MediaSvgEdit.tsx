import { useState, useEffect, useRef, useCallback, type JSX } from 'react';
import {
  getMediaFileUrl,
  invalidateAllAreaQueries,
  invalidateAllProblemQueries,
  invalidateAllSectorQueries,
  invalidateMediaQueries,
  useMediaSvg,
} from '../../api';
import { Rappel } from '../../utils/svg-utils';
import { parseReadOnlySvgs, type ParsedEntry, type SvgType, isQuadraticPoint, isArc } from '../../utils/svg-helpers';

import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Card } from '../../shared/ui';
import { useMeta } from '../../shared/components/Meta';
import { RotateCcw, Save, X, Spline, Anchor, Triangle, ZoomIn } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Coords = { x: number; y: number };

type EditableSvg = SvgType & {
  points?: ParsedEntry[];
  id?: number;
  rappelX?: number;
  rappelY?: number;
};

type EditorTab = 'descent' | 'bolted' | 'trad';

/** Same roundels as Problem / SvgEdit (`h-8 w-8`). */
const pageActionIconBtn =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-40';
const pageActionIconBtnGlass =
  'border-white/12 bg-surface-raised text-slate-300 hover:border-white/18 hover:bg-surface-raised-hover';
const pageActionIconBtnGreen =
  'border-green-600/50 bg-green-600/15 text-green-300 hover:bg-green-600/25 light:border-green-600 light:bg-green-600 light:text-white light:hover:bg-green-700';

/** Pointer movement (CSS px) that counts as a drag rather than a tap. */
const DRAG_THRESHOLD_PX = 6;

const MediaSvgEdit = () => {
  const meta = useMeta();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mediaId } = useParams();
  const { outerWidth, outerHeight } = window;
  const mediaIdNum = Number(mediaId ?? 0);
  const { media: data, isLoading, save: newSave } = useMediaSvg(mediaIdNum) as ReturnType<typeof useMediaSvg>;

  const [, setForceUpdate] = useState(0);
  const [activeTab, setActiveTab] = useState<EditorTab>('descent');
  const [activePoint, setActivePoint] = useState<number>(0);
  const [zoomMode, setZoomMode] = useState(false);
  const imageRef = useRef<SVGImageElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingPointRef = useRef(false);
  const isDraggingRappelRef = useRef(false);
  const draggingRappelRef = useRef<{ kind: 'bolted' | 'trad'; index: number } | null>(null);
  /** Drag-miss guard: true when the current press moved far enough to count as a drag, even if no point was hit. */
  const didDragRef = useRef(false);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClickRef = useRef(false);
  const dimsRef = useRef({ w: 0, h: 0 });
  const activePointRef = useRef(0);

  const getMouseCoordsFromClient = useCallback((clientX: number, clientY: number): Coords => {
    const dim = imageRef.current?.getBoundingClientRect();
    if (!dim) return { x: 0, y: 0 };
    const { w, h } = dimsRef.current;
    const dx = w / dim.width;
    const dy = h / dim.height;
    const x = Math.round((clientX - dim.left) * dx);
    const y = Math.round((clientY - dim.top) * dy);
    return { x, y };
  }, []);

  // handleImageInteraction is a useCallback so it can be a dependency of the pointer event useEffect
  const handleImageInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const svgs = (data?.mediaSvgs ?? []) as EditableSvg[];
      const coords = getMouseCoordsFromClient(clientX, clientY);

      if (activeTab === 'descent') {
        let cur = svgs.find((s) => s.t === 'PATH') as EditableSvg | undefined;
        if (!cur) {
          cur = {
            t: 'PATH',
            id: -1,
            path: '',
            anchors: [],
            nr: -1,
            pitch: 0,
            hasAnchor: false,
            points: [],
          };
          svgs.push(cur);
        }
        cur.points = cur.points ?? [];
        const points = cur.points as ParsedEntry[];
        points.push(coords);
        cur.path = generatePath(points);
        setActivePoint(points.length - 1);
        setForceUpdate((v) => v + 1);
      } else if (activeTab === 'bolted') {
        const cur: EditableSvg = {
          t: 'RAPPEL_BOLTED',
          id: -1,
          path: '',
          anchors: [],
          nr: -1,
          pitch: 0,
          hasAnchor: false,
          rappelX: coords.x,
          rappelY: coords.y,
        };
        svgs.push(cur);
        setForceUpdate((v) => v + 1);
      } else if (activeTab === 'trad') {
        const cur: EditableSvg = {
          t: 'RAPPEL_NOT_BOLTED',
          id: -1,
          path: '',
          anchors: [],
          nr: -1,
          pitch: 0,
          hasAnchor: false,
          rappelX: coords.x,
          rappelY: coords.y,
        };
        svgs.push(cur);
        setForceUpdate((v) => v + 1);
      }
    },
    [activeTab, data, getMouseCoordsFromClient],
  );

  // Pointer events for point drag — works on desktop (mouse) and mobile (touch/pen).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (!data) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      didDragRef.current = false;
      if (isDraggingPointRef.current || isDraggingRappelRef.current) return;
      if ((e.target as Element)?.closest?.('[data-overlay-handle]')) return;

      let el = e.target as Element | null;
      while (el && el !== svg) {
        // Check for descent point
        const pointIndex = el.getAttribute('data-point-index');
        if (pointIndex !== null) {
          const i = parseInt(pointIndex, 10);
          activePointRef.current = i;
          setActivePoint(i);
          isDraggingPointRef.current = true;
          return;
        }
        // Check for rappel hit area
        const rappelKind = el.getAttribute('data-rappel-kind');
        if (rappelKind !== null) {
          const rappelIndex = parseInt(el.getAttribute('data-rappel-index') ?? '0', 10);
          draggingRappelRef.current = { kind: rappelKind as 'bolted' | 'trad', index: rappelIndex };
          isDraggingRappelRef.current = true;
          return;
        }
        el = el.parentElement;
      }
    };

    const getMediaSvgs = () => (data.mediaSvgs ?? []) as EditableSvg[];

    const setPointCoords = (coords: { x: number; y: number }) => {
      const svgs = getMediaSvgs();
      const cur = svgs.find((s) => s.t === 'PATH') as EditableSvg | undefined;
      if (!cur) return;
      const points = (cur.points ?? []) as ParsedEntry[];
      const idx = activePointRef.current;
      if (idx >= points.length) return;
      points[idx].x = coords.x;
      points[idx].y = coords.y;
      cur.path = generatePath(points);
      setForceUpdate((v) => v + 1);
    };

    const moveRappel = (kind: 'bolted' | 'trad', index: number, coords: Coords) => {
      const svgs = getMediaSvgs();
      const t = kind === 'bolted' ? 'RAPPEL_BOLTED' : 'RAPPEL_NOT_BOLTED';
      let count = 0;
      for (const svg of svgs) {
        if (svg.t === t) {
          if (count === index) {
            const s = svg as EditableSvg;
            s.rappelX = coords.x;
            s.rappelY = coords.y;
            setForceUpdate((v) => v + 1);
            return;
          }
          count++;
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingPointRef.current) {
        const coords = getMouseCoordsFromClient(e.clientX, e.clientY);
        setPointCoords(coords);
      } else if (isDraggingRappelRef.current && draggingRappelRef.current) {
        const coords = getMouseCoordsFromClient(e.clientX, e.clientY);
        moveRappel(draggingRappelRef.current.kind, draggingRappelRef.current.index, coords);
      } else {
        // A press that moves beyond a small threshold counts as a drag even if it missed
        // a point — releasing it must never create a new point/overlay.
        const down = pointerDownPosRef.current;
        if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) >= DRAG_THRESHOLD_PX) {
          didDragRef.current = true;
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const wasPressed = pointerDownPosRef.current !== null;
      const dragged = didDragRef.current;
      pointerDownPosRef.current = null;
      didDragRef.current = false;
      if (isDraggingPointRef.current) {
        isDraggingPointRef.current = false;
        suppressNextClickRef.current = true;
        return;
      }
      if (isDraggingRappelRef.current) {
        isDraggingRappelRef.current = false;
        draggingRappelRef.current = null;
        suppressNextClickRef.current = true;
        return;
      }
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        return;
      }
      // Never add anything after a drag gesture — e.g. the user tried to grab an
      // existing point but missed it.
      if (wasPressed && dragged) {
        suppressNextClickRef.current = true;
        return;
      }
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target?.closest?.('[data-overlay-handle]')) return;
      handleImageInteraction(e.clientX, e.clientY);
      suppressNextClickRef.current = true;
    };

    svg.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('pointermove', onPointerMove);
    svg.addEventListener('pointerup', onPointerUp);
    return () => {
      svg.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      svg.removeEventListener('pointerup', onPointerUp);
    };
  }, [getMouseCoordsFromClient, handleImageInteraction, data]);

  // Non-passive touchstart to prevent browser scroll/pan when touching a point or rappel
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onTouchStart = (e: TouchEvent) => {
      let el = e.target as Element | null;
      while (el && el !== svg) {
        if (el.getAttribute('data-point-index') !== null || el.getAttribute('data-rappel-kind') !== null) {
          e.preventDefault();
          return;
        }
        el = el.parentElement;
      }
    };

    svg.addEventListener('touchstart', onTouchStart as EventListener, { passive: false });
    return () => svg.removeEventListener('touchstart', onTouchStart as EventListener);
  }, []);

  if (!data || isLoading) {
    return <Loading />;
  }

  const w = data.width ?? 0;
  const h = data.height ?? 0;
  dimsRef.current = { w, h };

  const getMediaSvgs = () => (data.mediaSvgs = data.mediaSvgs ?? []) as EditableSvg[];

  function handleSave() {
    void newSave(data).then(async () => {
      await invalidateMediaQueries(queryClient, mediaIdNum);
      await invalidateAllProblemQueries(queryClient);
      // Refetch every sector query: the image may be shown on a sector page even when it is only connected via a
      // problem (media_problem), which the media payload's `sectors[]` does not reflect. Refetching all sectors
      // guarantees the sector page the user came from shows the freshly drawn SVG elements.
      await invalidateAllSectorQueries(queryClient);
      // Refetch every area query. The area page's query key is `['/areas/:id', { id }]`, so a per-id predicate on
      // `key[0] === '/areas'` never matches it. Like sectors, the image may be shown on an area page even when it is
      // only connected via a problem, so refetching all areas guarantees the area page shows the freshly drawn SVG.
      await invalidateAllAreaQueries(queryClient);
      navigate(-1);
    });
  }

  function generatePath(points: ParsedEntry[]) {
    let d = '';
    points.forEach((p, i) => {
      if (i === 0) d += 'M ';
      else if (isQuadraticPoint(p)) d += `Q ${p.q.x} ${p.q.y} `;
      else if (isArc(p)) d += `A ${p.a.rx} ${p.a.ry} ${p.a.rot} ${p.a.laf} ${p.a.sf} `;
      else d += 'L ';
      d += `${p.x} ${p.y} `;
    });
    return d;
  }

  function removePointAtIndex(index: number) {
    const svgs = getMediaSvgs();
    const cur = svgs.find((s) => s.t === 'PATH') as EditableSvg | undefined;
    if (!cur) return;
    const points = (cur.points ?? []) as ParsedEntry[];
    if (points.length <= 1) {
      // Remove the entire PATH if this is the last point
      const idx = svgs.indexOf(cur);
      if (idx >= 0) svgs.splice(idx, 1);
      setActivePoint(0);
      activePointRef.current = 0;
      setForceUpdate((v) => v + 1);
      return;
    }
    points.splice(index, 1);
    cur.path = generatePath(points);
    const newActive = Math.min(index, points.length - 1);
    setActivePoint(newActive);
    activePointRef.current = newActive;
    setForceUpdate((v) => v + 1);
  }

  function removeRappel(kind: 'bolted' | 'trad', index: number) {
    const svgs = getMediaSvgs();
    const t = kind === 'bolted' ? 'RAPPEL_BOLTED' : 'RAPPEL_NOT_BOLTED';
    let foundIdx = -1;
    let count = 0;
    for (let i = 0; i < svgs.length; i++) {
      if (svgs[i].t === t) {
        if (count === index) {
          foundIdx = i;
          break;
        }
        count++;
      }
    }
    if (foundIdx >= 0) {
      svgs.splice(foundIdx, 1);
    }
    setForceUpdate((v) => v + 1);
  }

  function resetDescent() {
    const svgs = getMediaSvgs();
    const idx = svgs.findIndex((s) => s.t === 'PATH');
    if (idx >= 0) svgs.splice(idx, 1);
    setActivePoint(0);
    setForceUpdate((v) => v + 1);
  }

  function resetBolted() {
    const svgs = getMediaSvgs();
    for (let i = svgs.length - 1; i >= 0; i--) {
      if (svgs[i].t === 'RAPPEL_BOLTED') svgs.splice(i, 1);
    }
    setForceUpdate((v) => v + 1);
  }

  function resetTrad() {
    const svgs = getMediaSvgs();
    for (let i = svgs.length - 1; i >= 0; i--) {
      if (svgs[i].t === 'RAPPEL_NOT_BOLTED') svgs.splice(i, 1);
    }
    setForceUpdate((v) => v + 1);
  }

  const mediaSvgs = (data.mediaSvgs = data.mediaSvgs ?? []) as EditableSvg[];
  const descentSvg = mediaSvgs.find((s) => s.t === 'PATH') as EditableSvg | undefined;
  const boltedSvgs = mediaSvgs.filter((s) => s.t === 'RAPPEL_BOLTED') as EditableSvg[];
  const tradSvgs = mediaSvgs.filter((s) => s.t === 'RAPPEL_NOT_BOLTED') as EditableSvg[];
  const descentPoints = (descentSvg?.points ?? []) as ParsedEntry[];

  let scale = 1;
  if ((data.width ?? 0) > outerWidth || (data.height ?? 0) > outerHeight) {
    scale = Math.max(
      Math.max(data.width ?? 0, window.outerWidth) / 1920,
      Math.max(data.height ?? 0, window.outerHeight) / 1080,
    );
  }

  /** Only the active tab's elements are interactive; others are read-only. */
  const pointerEventsFor = (kind: EditorTab): 'auto' | 'none' => (activeTab === kind ? 'auto' : 'none');

  const circles = (() => {
    if (activeTab !== 'descent') return null;
    if (!descentSvg || !descentPoints.length) return null;
    return descentPoints.map((p, i) => {
      const fill = activePoint === i ? '#00FF00' : '#FF0000';
      return (
        <circle
          key={'point-' + i}
          className='cursor-pointer'
          fill={fill}
          cx={p.x}
          cy={p.y}
          r={0.005 * w}
          data-point-index={i}
          style={{ pointerEvents: pointerEventsFor('descent') }}
        />
      );
    });
  })();

  // Trash icon SVG path data (reusable)
  const trashIconPath = (
    <g fill='none' stroke='#F87171' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' pointerEvents='none'>
      <path d='M3 6h18' />
      <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
      <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
      <line x1='10' y1='11' x2='10' y2='17' />
      <line x1='14' y1='11' x2='14' y2='17' />
    </g>
  );

  // Delete toolbar size (same for all types)
  const delBtnH = 0.02 * w;
  const delBtnW = 0.03 * w;

  // Descent point delete toolbar — only shown when descent tab is active
  const descentDeleteToolbars = (() => {
    if (activeTab !== 'descent') return null;
    if (!descentSvg || !descentPoints.length) return null;
    return descentPoints.map((p, i) => {
      const gapX = 0.008 * w;
      let toolbarX = p.x + gapX;
      if (toolbarX + delBtnW > w) {
        toolbarX = p.x - gapX - delBtnW;
      }
      if (toolbarX < 0) {
        toolbarX = Math.max(0, p.x - delBtnW / 2);
      }
      const toolbarY = p.y - delBtnH / 2;
      return (
        <g key={'del-' + i}>
          <rect
            x={toolbarX}
            y={toolbarY}
            width={delBtnW}
            height={delBtnH}
            rx={delBtnH / 2}
            fill='rgba(0,0,0,0.7)'
            stroke='rgba(255,255,255,0.15)'
            strokeWidth={0.001 * w}
            pointerEvents='none'
          />
          <g
            style={{ cursor: 'pointer' }}
            data-overlay-handle
            onClick={(e) => {
              e.stopPropagation();
              removePointAtIndex(i);
            }}
          >
            <rect x={toolbarX} y={toolbarY} width={delBtnW} height={delBtnH} fill='transparent' />
            <g
              transform={`translate(${toolbarX + delBtnW / 2}, ${toolbarY + delBtnH / 2}) scale(${delBtnH * 0.028}) translate(-12, -12)`}
            >
              {trashIconPath}
            </g>
          </g>
        </g>
      );
    });
  })();

  // Rappel elements — each has a visible Rappel icon, a transparent hit area for dragging,
  // and a trash button to the right
  const rappelElements = (() => {
    const elements: JSX.Element[] = [];
    // Hit area must be rendered ON TOP of the Rappel icon to capture pointer events.
    // We render Rappel first, then the transparent rect on top.
    // Hit area sized to match the Rappel icon (r ≈ 6 * scale * 0.55 ≈ 3.3 * scale)
    const hitSize = 0.025 * w; // just enough to cover the icon comfortably

    boltedSvgs.forEach((s, i) => {
      if (s.rappelX != null && s.rappelY != null) {
        const btnX = s.rappelX + 0.012 * w;
        const btnY = s.rappelY - delBtnH / 2;
        elements.push(
          <g key={`bolted-${i}`}>
            <Rappel
              backgroundColor={'black'}
              bolted={true}
              color={activeTab === 'bolted' ? '#FF0000' : 'white'}
              scale={0.00072 * w}
              thumb={false}
              x={s.rappelX}
              y={s.rappelY}
            />
            {/* Transparent hit area ON TOP of Rappel icon for dragging */}
            <rect
              x={s.rappelX - hitSize / 2}
              y={s.rappelY - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill='transparent'
              data-rappel-kind='bolted'
              data-rappel-index={i}
              style={{ cursor: 'grab', pointerEvents: pointerEventsFor('bolted') }}
            />
            {activeTab === 'bolted' && (
              <g
                style={{ cursor: 'pointer' }}
                data-overlay-handle
                onClick={(e) => {
                  e.stopPropagation();
                  removeRappel('bolted', i);
                }}
              >
                <rect
                  x={btnX}
                  y={btnY}
                  width={delBtnW}
                  height={delBtnH}
                  rx={delBtnH / 2}
                  fill='rgba(0,0,0,0.7)'
                  stroke='rgba(255,255,255,0.15)'
                  strokeWidth={0.001 * w}
                />
                <g
                  transform={`translate(${btnX + delBtnW / 2}, ${btnY + delBtnH / 2}) scale(${delBtnH * 0.028}) translate(-12, -12)`}
                >
                  {trashIconPath}
                </g>
              </g>
            )}
          </g>,
        );
      }
    });
    tradSvgs.forEach((s, i) => {
      if (s.rappelX != null && s.rappelY != null) {
        const btnX = s.rappelX + 0.012 * w;
        const btnY = s.rappelY - delBtnH / 2;
        elements.push(
          <g key={`trad-${i}`}>
            <Rappel
              backgroundColor={'black'}
              bolted={false}
              color={activeTab === 'trad' ? '#FF0000' : 'white'}
              scale={0.00072 * w}
              thumb={false}
              x={s.rappelX}
              y={s.rappelY}
            />
            {/* Transparent hit area ON TOP of Rappel icon for dragging */}
            <rect
              x={s.rappelX - hitSize / 2}
              y={s.rappelY - hitSize / 2}
              width={hitSize}
              height={hitSize}
              fill='transparent'
              data-rappel-kind='trad'
              data-rappel-index={i}
              style={{ cursor: 'grab', pointerEvents: pointerEventsFor('trad') }}
            />
            {activeTab === 'trad' && (
              <g
                style={{ cursor: 'pointer' }}
                data-overlay-handle
                onClick={(e) => {
                  e.stopPropagation();
                  removeRappel('trad', i);
                }}
              >
                <rect
                  x={btnX}
                  y={btnY}
                  width={delBtnW}
                  height={delBtnH}
                  rx={delBtnH / 2}
                  fill='rgba(0,0,0,0.7)'
                  stroke='rgba(255,255,255,0.15)'
                  strokeWidth={0.001 * w}
                />
                <g
                  transform={`translate(${btnX + delBtnW / 2}, ${btnY + delBtnH / 2}) scale(${delBtnH * 0.028}) translate(-12, -12)`}
                >
                  {trashIconPath}
                </g>
              </g>
            )}
          </g>,
        );
      }
    });
    return elements;
  })();

  // Handle click on SVG — only used to suppress after pointer drag
  const handleSvgClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
    }
  };

  // Midpoint arrows for descent path direction — one per segment, at center of line
  const descentArrows = (() => {
    if (!descentSvg || descentPoints.length < 2) return null;
    const arrowSize = 0.015 * w; // length of arrow from tip to base center
    const halfW = arrowSize * 0.5; // half-width of arrow base
    const arrows: JSX.Element[] = [];
    for (let i = 0; i < descentPoints.length - 1; i++) {
      const p1 = descentPoints[i];
      const p2 = descentPoints[i + 1];
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;
      const ux = dx / len;
      const uy = dy / len;
      // Arrow tip at midpoint, pointing in direction of segment
      const tipX = mx + ux * arrowSize;
      const tipY = my + uy * arrowSize;
      const leftX = mx - uy * halfW;
      const leftY = my + ux * halfW;
      const rightX = mx + uy * halfW;
      const rightY = my - ux * halfW;
      arrows.push(
        <polygon
          key={`arrow-${i}`}
          points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={activeTab === 'descent' ? '#FF0000' : '#FFFFFF'}
          pointerEvents='none'
        />,
      );
    }
    return arrows;
  })();

  return (
    <div className='w-full min-w-0 select-none'>
      <title>{`Draw on image · #${mediaIdNum} | ${meta.title}`}</title>
      <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
        <div className='divide-y divide-white/6'>
          <div className='p-2 sm:p-3'>
            <div className='flex min-w-0 flex-col gap-2'>
              <span className='sr-only'>Media topo editor</span>
              <div className='flex min-w-0 flex-row items-start justify-between gap-3'>
                <div
                  className='flex min-w-0 flex-1 flex-wrap items-center gap-1'
                  role='tablist'
                  aria-label='Topo editor sections'
                >
                  {/* Descent tab */}
                  <div
                    role='tab'
                    aria-selected={activeTab === 'descent'}
                    className={cn(
                      'inline-flex min-h-9 shrink-0 items-center overflow-hidden rounded-md border transition-colors',
                      activeTab === 'descent'
                        ? 'border-brand bg-brand/20 shadow-sm'
                        : 'bg-surface-raised border-white/12',
                    )}
                  >
                    <button
                      type='button'
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 font-medium transition-colors',
                        designContract.typography.uiCompact,
                        activeTab === 'descent' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-200',
                      )}
                      onClick={() => setActiveTab('descent')}
                    >
                      <Spline size={14} strokeWidth={2} /> Descent
                    </button>
                    {descentSvg && (
                      <>
                        <div className='h-5 w-px bg-white/12' />
                        <button
                          type='button'
                          title='Reset descent path'
                          aria-label='Reset descent path'
                          className='inline-flex items-center px-2 py-1.5 text-red-400 hover:text-red-300'
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            resetDescent();
                          }}
                        >
                          <RotateCcw size={12} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Bolts tab */}
                  <div
                    role='tab'
                    aria-selected={activeTab === 'bolted'}
                    className={cn(
                      'inline-flex min-h-9 shrink-0 items-center overflow-hidden rounded-md border transition-colors',
                      activeTab === 'bolted'
                        ? 'border-brand bg-brand/20 shadow-sm'
                        : 'bg-surface-raised border-white/12',
                    )}
                  >
                    <button
                      type='button'
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 font-medium transition-colors',
                        designContract.typography.uiCompact,
                        activeTab === 'bolted' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-200',
                      )}
                      onClick={() => setActiveTab('bolted')}
                    >
                      <Anchor size={14} strokeWidth={2} /> Bolts
                    </button>
                    {boltedSvgs.length > 0 && (
                      <>
                        <div className='h-5 w-px bg-white/12' />
                        <button
                          type='button'
                          title='Reset all bolted rappels'
                          aria-label='Reset all bolted rappels'
                          className='inline-flex items-center px-2 py-1.5 text-red-400 hover:text-red-300'
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            resetBolted();
                          }}
                        >
                          <RotateCcw size={12} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Trad tab */}
                  <div
                    role='tab'
                    aria-selected={activeTab === 'trad'}
                    className={cn(
                      'inline-flex min-h-9 shrink-0 items-center overflow-hidden rounded-md border transition-colors',
                      activeTab === 'trad' ? 'border-brand bg-brand/20 shadow-sm' : 'bg-surface-raised border-white/12',
                    )}
                  >
                    <button
                      type='button'
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 font-medium transition-colors',
                        designContract.typography.uiCompact,
                        activeTab === 'trad' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-200',
                      )}
                      onClick={() => setActiveTab('trad')}
                    >
                      <Triangle size={14} strokeWidth={2} /> Trad
                    </button>
                    {tradSvgs.length > 0 && (
                      <>
                        <div className='h-5 w-px bg-white/12' />
                        <button
                          type='button'
                          title='Reset all trad rappels'
                          aria-label='Reset all trad rappels'
                          className='inline-flex items-center px-2 py-1.5 text-red-400 hover:text-red-300'
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            resetTrad();
                          }}
                        >
                          <RotateCcw size={12} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className='flex shrink-0 flex-nowrap items-center gap-1.5 self-start pt-0.5 sm:pt-0'>
                  <button
                    type='button'
                    title={zoomMode ? 'Fit to screen' : 'Zoom and pan'}
                    aria-label={zoomMode ? 'Fit to screen' : 'Zoom and pan'}
                    className={cn(
                      pageActionIconBtn,
                      zoomMode ? 'border-brand bg-brand/20 text-brand shadow-sm' : pageActionIconBtnGlass,
                    )}
                    onClick={() => setZoomMode(!zoomMode)}
                  >
                    <ZoomIn size={14} strokeWidth={2.25} />
                  </button>
                  <button
                    type='button'
                    title='Cancel'
                    aria-label='Cancel and go back'
                    className={cn(pageActionIconBtn, pageActionIconBtnGlass)}
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
            </div>
          </div>

          <div
            ref={containerRef}
            className={cn(
              'border-surface-border relative w-full min-w-0 cursor-crosshair bg-black select-none',
              zoomMode ? 'overflow-auto' : 'overflow-hidden',
            )}
            style={zoomMode ? { maxHeight: '100dvh' } : undefined}
          >
            <svg
              ref={svgRef}
              viewBox={'0 0 ' + w + ' ' + h}
              onClick={handleSvgClick}
              className={cn('block select-none', zoomMode ? 'h-auto' : 'h-auto w-full')}
              style={{
                touchAction: 'auto',
                ...(zoomMode ? { width: 'min(1920px, 150vw)', maxWidth: 'none' } : undefined),
              }}
            >
              <image
                ref={imageRef}
                xlinkHref={getMediaFileUrl(data.identity?.id ?? 0, Number(data.identity?.versionStamp ?? 0), false)}
                width='100%'
                height='100%'
              />
              {descentSvg && (
                <path
                  className='pointer-events-none'
                  style={{ fill: 'none', stroke: activeTab === 'descent' ? '#FF0000' : '#FFFFFF' }}
                  d={descentSvg.path}
                  strokeWidth={0.002 * w}
                />
              )}
              {descentArrows}
              {circles}
              {descentDeleteToolbars}
              {rappelElements}

              {mediaSvgs &&
                parseReadOnlySvgs(
                  mediaSvgs.filter(
                    (s) =>
                      (s.t !== 'PATH' || s !== descentSvg) && s.t !== 'RAPPEL_BOLTED' && s.t !== 'RAPPEL_NOT_BOLTED',
                  ) as SvgType[],
                  w,
                  h,
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
