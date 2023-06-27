import React, { useState, useEffect, useRef } from "react";
import { Container, Button, Segment, Dropdown, Input } from "semantic-ui-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useMeta } from "./common/meta";
import { getSvgEdit, getImageUrl, postProblemSvg } from "../api";
import { parseReadOnlySvgs, parsePath } from "../utils/svg-utils";
import { Loading, InsufficientPrivileges } from "./common/widgets/widgets";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const SvgEdit = () => {
  const client = useQueryClient();
  const {
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [mediaId, setMediaId] = useState<any>(null);
  const [crc32, setCrc32] = useState<any>(null);
  const [w, setW] = useState<any>(null);
  const [h, setH] = useState<any>(null);
  const [shift, setShift] = useState(false);
  const [svgId, setSvgId] = useState<any>(null);
  const [path, setPath] = useState<any>(null);
  const [pathTxt, setPathTxt] = useState<any>(null);
  const [points, setPoints] = useState<any>(null);
  const [anchors, setAnchors] = useState<any>(null);
  const [texts, setTexts] = useState<any>(null);
  const [readOnlySvgs, setReadOnlySvgs] = useState<any>(null);
  const [readOnlyPoints, setReadOnlyPoints] = useState<any[]>([]);
  const [activePoint, setActivePoint] = useState<any>(null);
  const [draggedPoint, setDraggedPoint] = useState<any>(null);
  const [draggedCubic, setDraggedCubic] = useState(false);
  const [hasAnchor, setHasAnchor] = useState(true);
  const [id, setId] = useState<any>(null);
  const [addAnchor, setAddAnchor] = useState(false);
  const [addText, setAddText] = useState(false);
  const imageRef = useRef<SVGImageElement>(null);
  const { problemIdMediaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { outerWidth, outerHeight } = window;
  const minWindowScale = Math.min(outerWidth, outerHeight);
  const black = "#000000";
  const meta = useMeta();
  useEffect(() => {
    if (problemIdMediaId && isAuthenticated) {
      getAccessTokenSilently().then((accessToken) => {
        getSvgEdit(accessToken, problemIdMediaId).then((data) => {
          setMediaId(data.mediaId);
          setCrc32(data.crc32);
          setW(data.w);
          setH(data.h);
          setShift(data.shift);
          setSvgId(data.svgId);
          const correctPoints = parsePath(data.path);
          const correctPathTxt = generatePath(correctPoints);
          setPath(correctPathTxt);
          setPathTxt(correctPathTxt);
          setPoints(correctPoints);
          setAnchors(data.anchors);
          setTexts(data.texts);
          setReadOnlySvgs(data.readOnlySvgs);
          setReadOnlyPoints(
            data.readOnlySvgs?.map((svg) => parsePath(svg.path)).flat()
          );
          setActivePoint(data.activePoint);
          setDraggedPoint(data.draggedPoint);
          setDraggedCubic(data.draggedCubic);
          setHasAnchor(data.hasAnchor);
          setId(data.id);
        });
      });
    }
  }, [isAuthenticated, problemIdMediaId]);
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function handleKeyDown(e) {
    if (e.shiftKey) setShift(true);
  }

  function handleKeyUp(e) {
    if (!e.shiftKey) setShift(false);
  }

  function onAddAnchor() {
    setAddAnchor(!addAnchor);
    setAddText(false);
  }

  function onAddText() {
    setAddAnchor(false);
    setAddText(!addText);
  }

  function save(event) {
    event.preventDefault();
    getAccessTokenSilently().then((accessToken) => {
      postProblemSvg(
        accessToken,
        id,
        mediaId,
        points.length < 2,
        svgId,
        path,
        hasAnchor,
        JSON.stringify(anchors),
        JSON.stringify(texts)
      )
        .then(async (res) => {
          // TODO: Remove this and use mutations instead.
          await client.invalidateQueries({
            predicate: (query) => {
              const [urlSuffix] = query.queryKey;
              if (!urlSuffix || !(typeof urlSuffix === "string")) {
                return false;
              }

              return urlSuffix.startsWith(`/problem?id=${id}`);
            },
          });
          navigate(`/problem/${id}`);
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  function cancelDragging() {
    setDraggedPoint(false);
    setDraggedCubic(false);
  }

  function getMouseCoords(e, convertToNearestPointOnImage) {
    const dim = imageRef.current?.getBoundingClientRect();
    if (!dim) {
      return { x: 0, y: 0 };
    }
    const dx = w / dim.width;
    const dy = h / dim.height;
    const x = Math.round((e.clientX - dim.left) * dx);
    const y = Math.round((e.clientY - dim.top) * dy);
    let p = { x, y };
    if (convertToNearestPointOnImage) {
      const foundPoint = readOnlyPoints?.find(
        (p2) => Math.hypot(p.x - p2.x, p.y - p2.y) < 20
      );
      if (foundPoint) {
        p = { x: foundPoint.x, y: foundPoint.y };
      }
    }
    return p;
  }

  function handleOnClick(e) {
    e.preventDefault();
    if (shift) {
      points.push(getMouseCoords(e, true));
      if (points.length > 1) {
        const a = points[points.length - 2];
        const b = points[points.length - 1];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > 130) {
          // Convert from 'Line to' to 'Curve to'
          const deltaX = Math.round((b.x - a.x) / 3);
          const deltaY = Math.round((b.y - a.y) / 3);
          // Update points
          points[points.length - 1] = {
            x: b.x,
            y: b.y,
            c: [
              {
                x: a.x + deltaX,
                y: a.y + deltaY,
              },
              {
                x: b.x - deltaX,
                y: b.y - deltaY,
              },
            ],
          };
        }
      }
      const p = generatePath(points);
      setPath(p);
      setPathTxt(p);
      setPoints([...points]);
      setActivePoint(points.length - 1);
    } else if (addText) {
      const coords = getMouseCoords(e, false);
      const txt = prompt("Enter text", "");
      texts.push({ txt: txt, x: coords.x, y: coords.y });
      setAddText(false);
      setTexts(texts);
    } else if (addAnchor) {
      const coords = getMouseCoords(e, true);
      anchors.push(coords);
      setAddAnchor(false);
      setAnchors(anchors);
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
    if (!shift && !addAnchor && !addText) {
      if (draggedPoint) {
        setPointCoords(getMouseCoords(e, true));
      } else if (draggedCubic !== false) {
        setCubicCoords(getMouseCoords(e, false), draggedCubic);
      }
    }
    return false;
  }

  function setPointCoords(coords) {
    const active = activePoint;
    points[active].x = coords.x;
    points[active].y = coords.y;
    const p = generatePath(points);
    setPath(p);
    setPathTxt(p);
    setPoints([...points]);
  }

  function setCubicCoords(coords, anchor) {
    const active = activePoint;
    points[active].c[anchor].x = coords.x;
    points[active].c[anchor].y = coords.y;
    const p = generatePath(points);
    setPath(p);
    setPathTxt(p);
    setPoints([...points]);
  }

  function setCurrDraggedPoint(index) {
    if (!shift && !addAnchor && !addText) {
      setActivePoint(index);
      setDraggedPoint(true);
    }
  }

  function setCurrDraggedCubic(index, anchor) {
    if (!shift && !addAnchor && !addText) {
      setActivePoint(index);
      setDraggedCubic(anchor);
    }
  }

  function setPointType(e, { value }) {
    const active = activePoint;
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
      setPath(p);
      setPathTxt(p);
      setPoints([...points]);
    }
  }

  function removeActivePoint() {
    const active = activePoint;
    if (points.length > 0) {
      points.splice(active, 1);
      if (points.length > 0 && points[0].c) {
        points[0].c = null;
      }
      const p = generatePath(points);
      setPath(p);
      setPathTxt(p);
      setPoints([...points]);
      if (activePoint == points.length && points.length > 0) {
        setActivePoint(activePoint - 1);
      }
    }
  }

  function reset() {
    setShift(false);
    setPath(null);
    setPathTxt(null);
    setPoints([]);
    setAnchors([]);
    setTexts([]);
    setActivePoint(0);
    setDraggedPoint(false);
    setDraggedCubic(false);
    setHasAnchor(true);
  }

  if (isLoading || (isAuthenticated && !mediaId)) {
    return <Loading />;
  } else if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
  } else if (!meta.isAdmin) {
    return <InsufficientPrivileges />;
  } else if (!id || !meta) {
    return <Loading />;
  } else {
    const circles = points.map((p, i, a) => {
      const anchors: JSX.Element[] = [];
      if (p.c) {
        const stroke = "#FFFFFF";
        anchors.push(
          <g key={anchors.length} className="buldreinfo-svg-edit-opacity">
            <line
              className={"buldreinfo-svg-pointer"}
              style={{ fill: "none", stroke: black }}
              x1={a[i - 1].x}
              y1={a[i - 1].y}
              x2={p.c[0].x}
              y2={p.c[0].y}
              strokeWidth={0.003 * w}
              strokeDasharray={0.003 * w}
            />
            <line
              className={"buldreinfo-svg-pointer"}
              style={{ fill: "none", stroke: black }}
              x1={p.x}
              y1={p.y}
              x2={p.c[1].x}
              y2={p.c[1].y}
              strokeWidth={0.003 * w}
              strokeDasharray={0.003 * w}
            />
            <circle
              className={"buldreinfo-svg-pointer"}
              fill={black}
              cx={p.c[0].x}
              cy={p.c[0].y}
              r={0.003 * w}
              onMouseDown={() => setCurrDraggedCubic(i, 0)}
            />
            <circle
              className={"buldreinfo-svg-pointer"}
              fill={black}
              cx={p.c[1].x}
              cy={p.c[1].y}
              r={0.003 * w}
              onMouseDown={() => setCurrDraggedCubic(i, 1)}
            />

            <line
              className={"buldreinfo-svg-pointer"}
              style={{ fill: "none", stroke: stroke }}
              x1={a[i - 1].x}
              y1={a[i - 1].y}
              x2={p.c[0].x}
              y2={p.c[0].y}
              strokeWidth={0.0015 * w}
              strokeDasharray={0.003 * w}
            />
            <line
              className={"buldreinfo-svg-pointer"}
              style={{ fill: "none", stroke: stroke }}
              x1={p.x}
              y1={p.y}
              x2={p.c[1].x}
              y2={p.c[1].y}
              strokeWidth={0.0015 * w}
              strokeDasharray={0.003 * w}
            />
            <circle
              className={"buldreinfo-svg-pointer"}
              fill={stroke}
              cx={p.c[0].x}
              cy={p.c[0].y}
              r={0.002 * w}
              onMouseDown={() => setCurrDraggedCubic(i, 0)}
            />
            <circle
              className={"buldreinfo-svg-pointer"}
              fill={stroke}
              cx={p.c[1].x}
              cy={p.c[1].y}
              r={0.002 * w}
              onMouseDown={() => setCurrDraggedCubic(i, 1)}
            />
          </g>
        );
      }
      const fill = activePoint === i ? "#00FF00" : "#FF0000";
      return (
        <g key={i}>
          {anchors}
          <circle
            className={"buldreinfo-svg-pointer"}
            fill={black}
            cx={p.x}
            cy={p.y}
            r={0.004 * w}
            onMouseDown={() => setCurrDraggedPoint(i)}
          />
          <circle
            className={"buldreinfo-svg-pointer"}
            fill={fill}
            cx={p.x}
            cy={p.y}
            r={0.003 * w}
            onMouseDown={() => setCurrDraggedPoint(i)}
          />
        </g>
      );
    });
    anchors.map((a, i) => {
      circles.push(
        <circle key={i} fill="#E2011A" cx={a.x} cy={a.y} r={0.006 * w} />
      );
    });
    const myTexts = texts.map((t, i) => (
      <text key={i} x={t.x} y={t.y} fontSize="5em" fill={"red"}>
        {t.txt}
      </text>
    ));
    return (
      <Container onMouseUp={cancelDragging} onMouseLeave={cancelDragging}>
        <Segment style={{ minHeight: "130px" }}>
          <Button.Group floated="right">
            <Button
              negative
              disabled={
                points.length === 0 &&
                anchors.length === 0 &&
                myTexts.length === 0
              }
              onClick={reset}
            >
              Reset
            </Button>
            <Button.Or />
            <Button
              onClick={() =>
                navigate(`/problem/${problemIdMediaId?.split("-")[0]}`)
              }
            >
              Cancel
            </Button>
            <Button.Or />
            <Button positive onClick={save}>
              Save
            </Button>
          </Button.Group>
          <Button.Group size="tiny">
            <Button onClick={onAddText}>
              {addText ? "Click on image to add text" : "Add text"}
            </Button>
            <Button.Or />
            <Button
              disabled={myTexts.length === 0}
              onClick={() => setTexts([])}
            >
              Remove all texts
            </Button>
          </Button.Group>
          {meta.isClimbing && (
            <>
              {" "}
              <Button.Group size="tiny">
                <Button onClick={onAddAnchor}>
                  {addAnchor
                    ? "Click on image to add extra anchor"
                    : "Add extra anchor"}
                </Button>
                <Button.Or />
                <Button
                  disabled={anchors.length === 0}
                  onClick={() => setAnchors([])}
                >
                  Remove all extra anchors
                </Button>
              </Button.Group>{" "}
              <Dropdown
                selection
                value={hasAnchor}
                disabled={points.length === 0}
                onChange={() => setHasAnchor(!hasAnchor)}
                options={[
                  { key: 1, value: false, text: "No anchor on route" },
                  { key: 2, value: true, text: "Route has anchor" },
                ]}
              />
            </>
          )}
          <br />
          <strong>SHIFT + CLICK</strong> to add a point | <strong>CLICK</strong>{" "}
          to select a point | <strong>CLICK AND DRAG</strong> to move a point
          <br />
          {activePoint !== 0 && (
            <Dropdown
              selection
              value={points[activePoint].c ? "C" : "L"}
              onChange={(...args) => {
                // @ts-expect-error - I don't know how to fix this right now.
                return setPointType(...args);
              }}
              options={[
                { key: 1, value: "L", text: "Selected point: Line to" },
                { key: 2, value: "C", text: "Selected point: Curve to" },
              ]}
            />
          )}
          <Button
            disabled={!points || points.length === 0}
            onClick={removeActivePoint}
          >
            Remove this point
          </Button>
        </Segment>
        <svg
          viewBox={"0 0 " + w + " " + h}
          onClick={handleOnClick}
          onMouseMove={handleMouseMove}
          width="100%"
          height="100%"
        >
          <image
            ref={imageRef}
            xlinkHref={getImageUrl(mediaId, crc32, undefined)}
            width="100%"
            height="100%"
          />
          {parseReadOnlySvgs(readOnlySvgs, w, h, minWindowScale)}
          <path
            style={{ fill: "none", stroke: black }}
            d={path}
            strokeWidth={0.003 * w}
          />
          <path
            style={{ fill: "none", stroke: "#FF0000" }}
            d={path}
            strokeWidth={0.002 * w}
          />
          {circles}
          {myTexts}
        </svg>
        <br />
        <Input
          label="SVG Path:"
          action={{
            labelPosition: "right",
            color: path === pathTxt ? "grey" : "blue",
            icon: "sync",
            content: "Update",
            onClick: () => {
              const correctPoints = parsePath(pathTxt);
              const correctPathTxt = generatePath(correctPoints);
              setPath(correctPathTxt);
              setPathTxt(correctPathTxt);
              setPoints(correctPoints);
            },
          }}
          fluid
          placeholder="SVG Path"
          value={pathTxt || ""}
          onChange={(e, { value }) => {
            setPathTxt(value);
          }}
        />
      </Container>
    );
  }
};

export default SvgEdit;
