import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Button,
  Label,
  Icon,
  Segment,
  Dropdown,
} from "semantic-ui-react";
import { getImageUrl, useMediaSvg } from "../api";
import { Rappel, parseReadOnlySvgs, parsePath } from "../utils/svg-utils";
import { Loading } from "./common/widgets/widgets";
import { useNavigate, useParams } from "react-router-dom";

const TYPE_PATH = "PATH";
const TYPE_RAPPEL_BOLTED = "RAPPEL_BOLTED";
const TYPE_RAPPEL_NOT_BOLTED = "RAPPEL_NOT_BOLTED";

const MediaSvgEdit = () => {
  const navigate = useNavigate();
  const { mediaId } = useParams();
  const { outerWidth, outerHeight } = window;
  const {
    media: data,
    status,
    isLoading,
    save: newSave,
  } = useMediaSvg(+mediaId);

  const [modifiedData, setData] = useState<any>(null);

  useEffect(() => {
    switch (status) {
      case "success": {
        setData(data);
        break;
      }
      case "pending": {
        setData(undefined);
        break;
      }
    }
  }, [data, status]);

  const [forceUpdate, setForceUpdate] = useState(0);
  const [saving, setSaving] = useState(false);
  const [activeElementIndex, setActiveElementIndex] = useState(-1);
  const shift = useRef<boolean>(false);
  const [activePoint, setActivePoint] = useState<any>(null);
  const [draggedPoint, setDraggedPoint] = useState<any>(null);
  const [draggedCubic, setDraggedCubic] = useState(false);
  const imageRef = useRef<SVGImageElement | null>(null);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
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
      data.mediaSvgs[activeElementIndex] &&
      data.mediaSvgs[activeElementIndex].points
    ) {
      const coords = getMouseCoords(e);
      const points = data.mediaSvgs[activeElementIndex].points;
      points.push(coords);
      const p = generatePath(points);
      data.mediaSvgs[activeElementIndex].path = p;
      data.mediaSvgs[activeElementIndex].points = points;
      setData(data);
      setActivePoint(points.length - 1);
      setForceUpdate(forceUpdate + 1);
    } else if (
      activeElementIndex != -1 &&
      data.mediaSvgs[activeElementIndex] &&
      (data.mediaSvgs[activeElementIndex].t === TYPE_RAPPEL_BOLTED ||
        data.mediaSvgs[activeElementIndex].t === TYPE_RAPPEL_NOT_BOLTED)
    ) {
      const coords = getMouseCoords(e);
      data.mediaSvgs[activeElementIndex].rappelX = coords.x;
      data.mediaSvgs[activeElementIndex].rappelY = coords.y;
      setData(data);
      setForceUpdate(forceUpdate + 1);
    }
  }

  function generatePath(points) {
    let d = "";
    points.forEach((p, i) => {
      if (i === 0) {
        // first point
        d += "M ";
      } else if (p.q) {
        // quadratic
        d += `Q ${p.q.x} ${p.q.y} `;
      } else if (p.c) {
        // cubic
        d += `C ${p.c[0].x} ${p.c[0].y} ${p.c[1].x} ${p.c[1].y} `;
      } else if (p.a) {
        // arc
        d += `A ${p.a.rx} ${p.a.ry} ${p.a.rot} ${p.a.laf} ${p.a.sf} `;
      } else {
        d += "L ";
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
    const points = data.mediaSvgs[activeElementIndex].points;
    points[active].x = coords.x;
    points[active].y = coords.y;
    const p = generatePath(points);
    data.mediaSvgs[activeElementIndex].path = p;
    data.mediaSvgs[activeElementIndex].points = points;
    setData(data);
    setForceUpdate(forceUpdate + 1);
  }

  function setCubicCoords(coords, anchor) {
    const active = activePoint;
    const points = data.mediaSvgs[activeElementIndex].points;
    points[active].c[anchor].x = coords.x;
    points[active].c[anchor].y = coords.y;
    const p = generatePath(points);
    data.mediaSvgs[activeElementIndex].path = p;
    data.mediaSvgs[activeElementIndex].points = points;
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
    const points = data.mediaSvgs[activeElementIndex].points;
    if (active !== 0) {
      // not the first point
      switch (value) {
        case "L":
          points[active] = { x: points[active].x, y: points[active].y };
          break;
        case "C":
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
      data.mediaSvgs[activeElementIndex].path = p;
      data.mediaSvgs[activeElementIndex].points = points;
      setData(data);
      setForceUpdate(forceUpdate + 1);
    }
  }

  function removeActivePoint() {
    const active = activePoint;
    const points = data.mediaSvgs[activeElementIndex].points;
    if (points.length > 1 && active !== 0) {
      points.splice(active, 1);
      const p = generatePath(points);
      data.mediaSvgs[activeElementIndex].path = p;
      data.mediaSvgs[activeElementIndex].points = points;
      setActivePoint(data.mediaSvgs[activeElementIndex].points.length - 1);
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

  let scale = 1;
  if (data.width > outerWidth || data.height > outerHeight) {
    scale = Math.max(
      Math.max(data.width, window.outerWidth) / 1920,
      Math.max(data.height, window.outerHeight) / 1080,
    );
  }

  const circles =
    activeElementIndex >= 0 &&
    data.mediaSvgs[activeElementIndex] &&
    data.mediaSvgs[activeElementIndex].t === "PATH" &&
    data.mediaSvgs[activeElementIndex].points.map((p, i, a) => {
      const anchors: React.JSX.Element[] = [];
      if (p.c) {
        anchors.push(
          <g key={anchors.length} className="buldreinfo-svg-edit-opacity">
            <line
              className={"buldreinfo-svg-pointer"}
              style={{ fill: "none", stroke: "#E2011A" }}
              x1={a[i - 1].x}
              y1={a[i - 1].y}
              x2={p.c[0].x}
              y2={p.c[0].y}
              strokeWidth={0.0026 * data.width}
              strokeDasharray={0.003 * data.width}
            />
            <line
              className={"buldreinfo-svg-pointer"}
              style={{ fill: "none", stroke: "#E2011A" }}
              x1={p.x}
              y1={p.y}
              x2={p.c[1].x}
              y2={p.c[1].y}
              strokeWidth={0.0026 * data.width}
              strokeDasharray={0.003 * data.width}
            />
            <circle
              className={"buldreinfo-svg-pointer"}
              fill="#E2011A"
              cx={p.c[0].x}
              cy={p.c[0].y}
              r={0.003 * data.width}
              onMouseDown={() => setCurrDraggedCubic(i, 0)}
            />
            <circle
              className={"buldreinfo-svg-pointer"}
              fill="#E2011A"
              cx={p.c[1].x}
              cy={p.c[1].y}
              r={0.003 * data.width}
              onMouseDown={() => setCurrDraggedCubic(i, 1)}
            />
          </g>,
        );
      }
      const fill = activePoint === i ? "#00FF00" : "#FF0000";
      return (
        <g key={[p.x ?? "x", p.y ?? "y"]?.join("x")}>
          {anchors}
          <circle
            className={"buldreinfo-svg-pointer"}
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
    data.mediaSvgs[activeElementIndex] &&
    (data.mediaSvgs[activeElementIndex].t === TYPE_RAPPEL_BOLTED ||
      data.mediaSvgs[activeElementIndex].t === TYPE_RAPPEL_NOT_BOLTED)
  ) {
    const x = data.mediaSvgs[activeElementIndex].rappelX;
    const y = data.mediaSvgs[activeElementIndex].rappelY;

    activeRappel = (
      <Rappel
        key={"ACTIVE_RAPPEL"}
        backgroundColor={"white"}
        bolted={data.mediaSvgs[activeElementIndex].t === TYPE_RAPPEL_BOLTED}
        color={"red"}
        scale={scale}
        thumb={false}
        x={x}
        y={y}
      />
    );
  }

  return (
    <Container onMouseUp={cancelDragging} onMouseLeave={cancelDragging}>
      <Segment style={{ minHeight: "130px" }}>
        <Button.Group floated="right">
          <Button
            negative
            disabled={!data.mediaSvgs || data.mediaSvgs.length === 0}
            onClick={reset}
          >
            Reset
          </Button>
          <Button.Or />
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save}>
            Save
          </Button>
        </Button.Group>
        <Button.Group size="mini">
          <Button
            size="mini"
            onClick={() => {
              const element = { t: TYPE_PATH, id: -1, path: "", points: [] };
              if (!data.mediaSvgs) {
                data.mediaSvgs = [];
              }
              data.mediaSvgs.push(element);
              setData(data);
              setActiveElementIndex(data.mediaSvgs.length - 1);
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
            size="mini"
            onClick={() => {
              const element = {
                t: TYPE_RAPPEL_BOLTED,
                id: -1,
                rappelX: data.width / 2,
                rappelY: data.height / 2,
              };
              if (!data.mediaSvgs) {
                data.mediaSvgs = [];
              }
              data.mediaSvgs.push(element);
              setData(data);
              setActiveElementIndex(data.mediaSvgs.length - 1);
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
            size="mini"
            onClick={() => {
              const element = {
                t: TYPE_RAPPEL_NOT_BOLTED,
                id: -1,
                rappelX: data.width / 2,
                rappelY: data.height / 2,
              };
              if (!data.mediaSvgs) {
                data.mediaSvgs = [];
              }
              data.mediaSvgs.push(element);
              setData(data);
              setActiveElementIndex(data.mediaSvgs.length - 1);
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
          {data.mediaSvgs &&
            data.mediaSvgs.map((svg, index) => (
              <Label
                as="a"
                image
                key={[svg.t, svg.id]?.join("x")}
                color={activeElementIndex === index ? "green" : "grey"}
                onClick={() => {
                  if (
                    svg.t === "PATH" &&
                    data.mediaSvgs[index] &&
                    !data.mediaSvgs[index].points
                  ) {
                    data.mediaSvgs[index].points = parsePath(
                      data.mediaSvgs[index].path,
                    );
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
                  name="delete"
                  onClick={() => {
                    data.mediaSvgs.splice(index, 1);
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
          data.mediaSvgs[activeElementIndex] &&
          data.mediaSvgs[activeElementIndex].t === "PATH" && (
            <>
              <strong>SHIFT + CLICK</strong> to add a point |{" "}
              <strong>CLICK</strong> to select a point |{" "}
              <strong>CLICK AND DRAG</strong> to move a point
              <br />
              {activePoint !== 0 && (
                <Dropdown
                  selection
                  value={
                    data.mediaSvgs[activeElementIndex].points[activePoint].c
                      ? "C"
                      : "L"
                  }
                  onChange={(...args) => {
                    // @ts-expect-error - I don't know why this works right now.
                    return setPointType(...args);
                  }}
                  options={[
                    { key: 1, value: "L", text: "Selected point: Line to" },
                    { key: 2, value: "C", text: "Selected point: Curve to" },
                  ]}
                />
              )}
              {activePoint !== 0 && (
                <Button
                  disabled={activePoint === 0}
                  onClick={removeActivePoint}
                >
                  Remove this point
                </Button>
              )}
            </>
          )}
        {activeElementIndex >= 0 &&
          data.mediaSvgs[activeElementIndex] &&
          (data.mediaSvgs[activeElementIndex].t === TYPE_RAPPEL_BOLTED ||
            data.mediaSvgs[activeElementIndex].t ===
              TYPE_RAPPEL_NOT_BOLTED) && (
            <>
              <strong>CLICK</strong> to move anchor
            </>
          )}
      </Segment>
      <svg
        viewBox={"0 0 " + data.width + " " + data.height}
        onClick={handleOnClick}
        onMouseMove={handleMouseMove}
        width="100%"
        height="100%"
      >
        <image
          ref={imageRef}
          xlinkHref={getImageUrl(data.id, data.crc32)}
          width="100%"
          height="100%"
        />
        {activeElementIndex >= 0 && data.mediaSvgs[activeElementIndex] && (
          <path
            style={{ fill: "none", stroke: "#FF0000" }}
            d={data.mediaSvgs[activeElementIndex].path}
            strokeWidth={0.002 * data.width}
          />
        )}
        {circles}
        {activeRappel}
        {data.mediaSvgs &&
          parseReadOnlySvgs(
            data.mediaSvgs.filter((svg, index) => index != activeElementIndex),
            data.width,
            data.height,
            scale,
          )}
      </svg>
    </Container>
  );
};

export default MediaSvgEdit;
