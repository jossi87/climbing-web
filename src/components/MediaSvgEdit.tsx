import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Label, Icon, Segment, Dropdown } from 'semantic-ui-react';
import { getImageUrl, useMediaSvg } from '../api';
import { Rappel } from '../utils/svg-utils';
import {
  parseReadOnlySvgs,
  parsePath,
  ParsedEntry,
  SvgType,
  isCubicPoint,
  isQuadraticPoint,
  isArc,
  isPoint,
} from '../utils/svg-helpers';
import { Loading } from './common/widgets/widgets';
import { useNavigate, useParams } from 'react-router-dom';
import { Success } from '../@types/buldreinfo';

// These string literals are used directly where needed.

const MediaSvgEdit = () => {
  const navigate = useNavigate();
  const { mediaId } = useParams();
  const { outerWidth, outerHeight } = window;
  const { media: data, status, isLoading, save: newSave } = useMediaSvg(+mediaId);

  const [modifiedData, setData] = useState<Success<'getMedia'> | undefined | null>(null);

  type EditableSvg = SvgType & {
    points?: ParsedEntry[];
    id?: number;
    rappelX?: number;
    rappelY?: number;
  };

  // helper to always return the live mediaSvgs array (creates if missing)
  const getMediaSvgs = () => (data.mediaSvgs = data.mediaSvgs ?? []) as EditableSvg[];

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

  const [forceUpdate, setForceUpdate] = useState(0);
  const [saving, setSaving] = useState(false);
  const [activeElementIndex, setActiveElementIndex] = useState(-1);
  const shift = useRef<boolean>(false);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [draggedPoint, setDraggedPoint] = useState<boolean>(false);
  const [draggedCubic, setDraggedCubic] = useState(false);
  const imageRef = useRef<SVGImageElement | null>(null);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  function handleKeyDown(e) {
    if (e.shiftKey) {
      shift.current = true;
    }
  }

  function handleKeyUp(e) {
    if (!e.shiftKey) {
      shift.current = false;
    }
  }

  function save(event) {
    event.preventDefault();
    setSaving(true);
    newSave(modifiedData).then(() => navigate(-1));
  }

  function cancelDragging() {
    setDraggedPoint(false);
    setDraggedCubic(false);
  }

  function getMouseCoords(e) {
    const dim = imageRef.current?.getBoundingClientRect();
    if (!dim) {
      return { x: 0, y: 0 };
    }
    const dx = data.width / dim.width;
    const dy = data.height / dim.height;
    const x = Math.round((e.clientX - dim.left) * dx);
    const y = Math.round((e.clientY - dim.top) * dy);
    return { x, y };
  }

  function handleOnClick(e) {
    if (
      shift.current &&
      activeElementIndex != -1 &&
      getMediaSvgs()[activeElementIndex] &&
      getMediaSvgs()[activeElementIndex].points
    ) {
      const coords = getMouseCoords(e);
      const points = getMediaSvgs()[activeElementIndex].points;
      points.push(coords);
      const p = generatePath(points);
      getMediaSvgs()[activeElementIndex].path = p;
      getMediaSvgs()[activeElementIndex].points = points;
      setData(data);
      setActivePoint(points.length - 1);
      setForceUpdate(forceUpdate + 1);
    } else if (
      activeElementIndex != -1 &&
      getMediaSvgs()[activeElementIndex] &&
      (getMediaSvgs()[activeElementIndex].t === 'RAPPEL_BOLTED' ||
        getMediaSvgs()[activeElementIndex].t === 'RAPPEL_NOT_BOLTED')
    ) {
      const coords = getMouseCoords(e);
      getMediaSvgs()[activeElementIndex].rappelX = coords.x;
      getMediaSvgs()[activeElementIndex].rappelY = coords.y;
      setData(data);
      setForceUpdate(forceUpdate + 1);
    }
  }

  function generatePath(points) {
    let d = '';
    points.forEach((p, i) => {
      if (i === 0) {
        // first point
        d += 'M ';
      } else if (isQuadraticPoint(p)) {
        // quadratic
        d += `Q ${p.q.x} ${p.q.y} `;
      } else if (isCubicPoint(p)) {
        // cubic
        d += `C ${p.c[0].x} ${p.c[0].y} ${p.c[1].x} ${p.c[1].y} `;
      } else if (isArc(p)) {
        // arc
        d += `A ${p.a.rx} ${p.a.ry} ${p.a.rot} ${p.a.laf} ${p.a.sf} `;
      } else if (isPoint(p)) {
        d += 'L ';
      } else {
        d += 'L ';
      }
      d += `${p.x} ${p.y} `;
    });
    return d;
  }

  function handleMouseMove(e) {
    e.preventDefault();
    if (!shift.current) {
      if (draggedPoint) {
        setPointCoords(getMouseCoords(e));
      } else if (draggedCubic !== false) {
        setCubicCoords(getMouseCoords(e), draggedCubic);
      }
    }
    return false;
  }

  function setPointCoords(coords) {
    const active = activePoint;
    const points = (data.mediaSvgs[activeElementIndex] as EditableSvg).points!;
    points[active].x = coords.x;
    points[active].y = coords.y;
    const p = generatePath(points);
    (data.mediaSvgs[activeElementIndex] as EditableSvg).path = p;
    (data.mediaSvgs[activeElementIndex] as EditableSvg).points = points;
    setData(data);
    setForceUpdate(forceUpdate + 1);
  }

  function setCubicCoords(coords, anchor) {
    const active = activePoint;
    const points = (data.mediaSvgs[activeElementIndex] as EditableSvg).points!;
    if (!isCubicPoint(points[active])) {
      return;
    }
    points[active].c[anchor].x = coords.x;
    points[active].c[anchor].y = coords.y;
    const p = generatePath(points);
    (data.mediaSvgs[activeElementIndex] as EditableSvg).path = p;
    (data.mediaSvgs[activeElementIndex] as EditableSvg).points = points;
    setData(data);
    setForceUpdate(forceUpdate + 1);
  }

  function setCurrDraggedPoint(index) {
    if (!shift.current) {
      setActivePoint(index);
      setDraggedPoint(true);
    }
  }

  function setCurrDraggedCubic(index, anchor) {
    if (!shift.current) {
      setActivePoint(index);
      setDraggedCubic(anchor);
    }
  }

  function setPointType(e, { value }) {
    const active = activePoint;
    const points = (data.mediaSvgs[activeElementIndex] as EditableSvg).points!;
    if (active !== 0) {
      // not the first point
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
      const p = generatePath(points);
      (data.mediaSvgs[activeElementIndex] as EditableSvg).path = p;
      (data.mediaSvgs[activeElementIndex] as EditableSvg).points = points;
      setData(data);
      setForceUpdate(forceUpdate + 1);
    }
  }

  function removeActivePoint() {
    const active = activePoint;
    const points = (data.mediaSvgs[activeElementIndex] as EditableSvg).points!;
    if (points.length > 1 && active !== 0) {
      points.splice(active, 1);
      const p = generatePath(points);
      (data.mediaSvgs[activeElementIndex] as EditableSvg).path = p;
      (data.mediaSvgs[activeElementIndex] as EditableSvg).points = points;
      setActivePoint((data.mediaSvgs[activeElementIndex] as EditableSvg).points!.length - 1);
      setData(data);
    }
  }

  function reset() {
    data.mediaSvgs = [];
    setData(data);
    setActiveElementIndex(-1);
    shift.current = false;
    setActivePoint(0);
    setDraggedPoint(false);
    setDraggedCubic(false);
    setForceUpdate(forceUpdate + 1);
  }

  if (!data || isLoading) {
    return <Loading />;
  }

  // Ensure we have a typed reference to the mediaSvgs array so TS understands
  // it may have editing-specific fields like `points`.
  const mediaSvgs = (data.mediaSvgs = data.mediaSvgs ?? []) as EditableSvg[];

  let scale = 1;
  if (data.width > outerWidth || data.height > outerHeight) {
    scale = Math.max(
      Math.max(data.width, window.outerWidth) / 1920,
      Math.max(data.height, window.outerHeight) / 1080,
    );
  }

  const circles =
    activeElementIndex >= 0 &&
    mediaSvgs[activeElementIndex] &&
    mediaSvgs[activeElementIndex].t === 'PATH' &&
    mediaSvgs[activeElementIndex].points.map((p, i, a) => {
      const anchors: React.JSX.Element[] = [];
      if (isCubicPoint(p)) {
        anchors.push(
          <g key={anchors.length} className='buldreinfo-svg-edit-opacity'>
            <line
              className={'buldreinfo-svg-pointer'}
              style={{ fill: 'none', stroke: '#E2011A' }}
              x1={a[i - 1].x}
              y1={a[i - 1].y}
              x2={p.c[0].x}
              y2={p.c[0].y}
              strokeWidth={0.0026 * data.width}
              strokeDasharray={0.003 * data.width}
            />
            <line
              className={'buldreinfo-svg-pointer'}
              style={{ fill: 'none', stroke: '#E2011A' }}
              x1={p.x}
              y1={p.y}
              x2={p.c[1].x}
              y2={p.c[1].y}
              strokeWidth={0.0026 * data.width}
              strokeDasharray={0.003 * data.width}
            />
            <circle
              className={'buldreinfo-svg-pointer'}
              fill='#E2011A'
              cx={p.c[0].x}
              cy={p.c[0].y}
              r={0.003 * data.width}
              onMouseDown={() => setCurrDraggedCubic(i, 0)}
            />
            <circle
              className={'buldreinfo-svg-pointer'}
              fill='#E2011A'
              cx={p.c[1].x}
              cy={p.c[1].y}
              r={0.003 * data.width}
              onMouseDown={() => setCurrDraggedCubic(i, 1)}
            />
          </g>,
        );
      }
      const fill = activePoint === i ? '#00FF00' : '#FF0000';
      return (
        <g key={[p.x ?? 'x', p.y ?? 'y']?.join('x')}>
          {anchors}
          <circle
            className={'buldreinfo-svg-pointer'}
            fill={fill}
            cx={p.x}
            cy={p.y}
            r={0.003 * data.width}
            onMouseDown={() => setCurrDraggedPoint(i)}
          />
        </g>
      );
    });

  let activeRappel: React.JSX.Element | null = null;
  if (
    activeElementIndex >= 0 &&
    mediaSvgs[activeElementIndex] &&
    (mediaSvgs[activeElementIndex].t === 'RAPPEL_BOLTED' ||
      mediaSvgs[activeElementIndex].t === 'RAPPEL_NOT_BOLTED')
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
    <Container onMouseUp={cancelDragging} onMouseLeave={cancelDragging}>
      <Segment style={{ minHeight: '130px' }}>
        <Button.Group floated='right'>
          <Button negative disabled={!mediaSvgs || mediaSvgs.length === 0} onClick={reset}>
            Reset
          </Button>
          <Button.Or />
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save}>
            Save
          </Button>
        </Button.Group>
        <Button.Group size='mini'>
          <Button
            size='mini'
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
              if (!data.mediaSvgs) {
                data.mediaSvgs = [];
              }
              mediaSvgs.push(element);
              setData(data);
              setActiveElementIndex(mediaSvgs.length - 1);
              setActivePoint(0);
              setDraggedPoint(false);
              setDraggedCubic(false);
              setForceUpdate(forceUpdate + 1);
            }}
          >
            Add descent
          </Button>
          <Button.Or />
          <Button
            size='mini'
            onClick={() => {
              const element: EditableSvg = {
                t: 'RAPPEL_BOLTED',
                id: -1,
                path: '',
                anchors: [],
                nr: -1,
                pitch: 0,
                hasAnchor: false,
                rappelX: data.width / 2,
                rappelY: data.height / 2,
              };
              if (!data.mediaSvgs) {
                data.mediaSvgs = [];
              }
              mediaSvgs.push(element);
              setData(data);
              setActiveElementIndex(mediaSvgs.length - 1);
              setActivePoint(0);
              setDraggedPoint(false);
              setDraggedCubic(false);
              setForceUpdate(forceUpdate + 1);
            }}
          >
            Add rappel (bolted)
          </Button>
          <Button.Or />
          <Button
            size='mini'
            onClick={() => {
              const element: EditableSvg = {
                t: 'RAPPEL_NOT_BOLTED',
                id: -1,
                path: '',
                anchors: [],
                nr: -1,
                pitch: 0,
                hasAnchor: false,
                rappelX: data.width / 2,
                rappelY: data.height / 2,
              };
              if (!data.mediaSvgs) {
                data.mediaSvgs = [];
              }
              mediaSvgs.push(element);
              setData(data);
              setActiveElementIndex(mediaSvgs.length - 1);
              setActivePoint(0);
              setDraggedPoint(false);
              setDraggedCubic(false);
              setForceUpdate(forceUpdate + 1);
            }}
          >
            Add rappel (not bolted)
          </Button>
        </Button.Group>
        <Label.Group>
          {mediaSvgs &&
            mediaSvgs.map((svg, index) => (
              <Label
                as='a'
                image
                key={[svg.t, svg.id]?.join('x')}
                color={activeElementIndex === index ? 'green' : 'grey'}
                onClick={() => {
                  if (svg.t === 'PATH' && mediaSvgs[index] && !mediaSvgs[index].points) {
                    mediaSvgs[index].points = parsePath(mediaSvgs[index].path);
                    setData(data);
                  }
                  setActiveElementIndex(index);
                  setActivePoint(0);
                  setDraggedPoint(false);
                  setDraggedCubic(false);
                }}
              >
                {svg.t} #{index}
                <Icon
                  name='delete'
                  onClick={() => {
                    mediaSvgs.splice(index, 1);
                    setData(data);
                    setActiveElementIndex(-1);
                    setActivePoint(0);
                    setDraggedPoint(false);
                    setDraggedCubic(false);
                    setForceUpdate(forceUpdate + 1);
                  }}
                />
              </Label>
            ))}
        </Label.Group>
        <br />
        {activeElementIndex >= 0 &&
          mediaSvgs[activeElementIndex] &&
          mediaSvgs[activeElementIndex].t === 'PATH' && (
            <>
              <strong>SHIFT + CLICK</strong> to add a point | <strong>CLICK</strong> to select a
              point | <strong>CLICK AND DRAG</strong> to move a point
              <br />
              {activePoint !== 0 && (
                <Dropdown
                  selection
                  value={
                    mediaSvgs[activeElementIndex]?.points?.[activePoint] &&
                    isCubicPoint(mediaSvgs[activeElementIndex].points[activePoint])
                      ? 'C'
                      : 'L'
                  }
                  onChange={(...args) => {
                    // @ts-expect-error - I don't know why this works right now.
                    return setPointType(...args);
                  }}
                  options={[
                    { key: 1, value: 'L', text: 'Selected point: Line to' },
                    { key: 2, value: 'C', text: 'Selected point: Curve to' },
                  ]}
                />
              )}
              {activePoint !== 0 && (
                <Button disabled={activePoint === 0} onClick={removeActivePoint}>
                  Remove this point
                </Button>
              )}
            </>
          )}
        {activeElementIndex >= 0 &&
          mediaSvgs[activeElementIndex] &&
          (mediaSvgs[activeElementIndex].t === 'RAPPEL_BOLTED' ||
            mediaSvgs[activeElementIndex].t === 'RAPPEL_NOT_BOLTED') && (
            <>
              <strong>CLICK</strong> to move anchor
            </>
          )}
      </Segment>
      <svg
        viewBox={'0 0 ' + data.width + ' ' + data.height}
        onClick={handleOnClick}
        onMouseMove={handleMouseMove}
        width='100%'
        height='100%'
      >
        <image
          ref={imageRef}
          xlinkHref={getImageUrl(data.id, data.crc32)}
          width='100%'
          height='100%'
        />
        {activeElementIndex >= 0 && mediaSvgs[activeElementIndex] && (
          <path
            style={{ fill: 'none', stroke: '#FF0000' }}
            d={mediaSvgs[activeElementIndex].path}
            strokeWidth={0.002 * data.width}
          />
        )}
        {circles}
        {activeRappel}
        {mediaSvgs &&
          parseReadOnlySvgs(
            mediaSvgs.filter((svg, index) => index != activeElementIndex) as SvgType[],
            data.width,
            data.height,
            scale,
          )}
      </svg>
    </Container>
  );
};

export default MediaSvgEdit;
