import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  MouseEventHandler,
  useReducer,
} from "react";
import {
  Container,
  Button,
  Segment,
  Dropdown,
  Input,
  Icon,
  Divider,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useMeta } from "../common/meta";
import {
  EditableSvg,
  getImageUrl,
  postProblemSvg,
  useAccessToken,
  useSvgEdit,
} from "../../api";
import {
  parseReadOnlySvgs,
  parsePath,
  isCubicPoint,
} from "../../utils/svg-utils";
import { Loading } from "../common/widgets/widgets";
import { useNavigate, useParams } from "react-router-dom";
import { captureException } from "@sentry/react";
import { generatePath, reducer } from "./state";
import { neverGuard } from "../../utils/neverGuard";
import { MediaRegion } from "../../utils/svg-scaler";

const useIds = (): {
  problemId: number;
  problemSectionId: number;
  mediaId: number;
} => {
  const { problemId, problemSectionId, mediaId } = useParams();
  if (!problemId) {
    throw new Error("Missing problemId param");
  }
  if (!problemSectionId) {
    throw new Error("Missing problemSectionId param");
  }
  if (!mediaId) {
    throw new Error("Missing mediaId param");
  }
  return {
    problemId: +problemId,
    problemSectionId: +problemSectionId,
    mediaId: +mediaId,
  };
};

const SvgEditLoader = () => {
  const { problemId, problemSectionId, mediaId } = useIds();
  const [customMediaRegion, setCustomMediaRegion] = useState<MediaRegion>(null);
  const data = useSvgEdit(
    problemId,
    problemSectionId,
    mediaId,
    customMediaRegion,
  );
  const accessToken = useAccessToken();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const save: Props["onSave"] = useCallback(
    ({ path, hasAnchor, anchors, tradBelayStations, texts }) => {
      setSaving(true);

      const correctPoints = parsePath(path ?? "", data.mediaRegion);
      const correctPathTxt = generatePath(correctPoints);

      return postProblemSvg(
        accessToken,
        problemId,
        problemSectionId,
        mediaId,
        correctPoints.length < 2,
        data?.svgId ?? 0,
        correctPathTxt,
        hasAnchor,
        JSON.stringify(anchors),
        JSON.stringify(tradBelayStations),
        JSON.stringify(texts),
      )
        .then(() => {
          navigate(`/problem/${problemId}`);
        })
        .catch((error) => {
          console.warn(error);
          captureException(error, {
            extra: {
              updated: { path, hasAnchor, anchors, tradBelayStations, texts },
            },
          });
        })
        .finally(() => {
          setSaving(false);
        });
    },
    [
      accessToken,
      problemId,
      problemSectionId,
      mediaId,
      data?.svgId,
      data?.mediaRegion,
      navigate,
    ],
  );

  const onCancel = useCallback(() => {
    navigate(`/problem/${problemId}`);
  }, [navigate, problemId]);

  const onUpdateMediaRegion = (mediaRegion) => {
    setCustomMediaRegion(mediaRegion);
  };

  if (!data) {
    return <Loading />;
  }

  return (
    <SvgEdit
      key={JSON.stringify(data)}
      {...data}
      sections={data.sections}
      onSave={save}
      saving={saving}
      onCancel={onCancel}
      onUpdateMediaRegion={onUpdateMediaRegion}
    />
  );
};

type Props = Pick<
  EditableSvg,
  | "svgId"
  | "problemId"
  | "problemSectionId"
  | "mediaId"
  | "mediaWidth"
  | "mediaHeight"
  | "mediaRegion"
  | "sections"
  | "crc32"
  | "anchors"
  | "hasAnchor"
  | "nr"
  | "path"
  | "texts"
  | "tradBelayStations"
  | "readOnlySvgs"
> & {
  onSave: (
    updated: Required<
      Pick<
        EditableSvg,
        "path" | "hasAnchor" | "anchors" | "tradBelayStations" | "texts"
      >
    >,
  ) => void;
  saving: boolean;
  onCancel: () => void;
  onUpdateMediaRegion: (customMediaRegion: MediaRegion) => void;
};

const black = "#000000";
const stroke = "#FFFFFF";

type Coords = { x: number; y: number };

const useMinWindowScale = () => {
  const [minWindowScale, setMinWindowScale] = useState(
    Math.min(window.outerWidth, window.outerHeight),
  );

  useEffect(() => {
    const onResize = () => {
      const min = Math.min(window.outerWidth, window.outerHeight);
      setMinWindowScale(min);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return minWindowScale;
};

export const SvgEdit = ({
  saving,
  onSave,
  onCancel,
  onUpdateMediaRegion,
  problemId,
  problemSectionId,
  mediaId,
  crc32,
  mediaWidth,
  mediaHeight,
  mediaRegion,
  sections,
  path: initialPath,
  readOnlySvgs,
  tradBelayStations: initialTradBelayStations,
  anchors: initialAnchors,
  texts: initialTexts,
  hasAnchor: initialHasAnchor,
}: Props) => {
  const [customMediaRegion, setCustomMediaRegion] =
    useState<MediaRegion>(mediaRegion);
  const w = mediaRegion?.width || mediaWidth;
  const h = mediaRegion?.height || mediaHeight;
  const navigate = useNavigate();
  const shift = useRef(false);

  const refresh = (
    problemId: number,
    problemSectionId: number,
    mediaId: number,
  ) => {
    onUpdateMediaRegion(null);
    navigate(`/problem/svg-edit/${problemId}/${problemSectionId}/${mediaId}`);
  };

  const readOnlyPointsRef = useRef(
    readOnlySvgs
      .map((svg) => parsePath(svg.path).map((p, ix) => ({ ...p, ix })))
      .flat(),
  );

  const [{ path, points, activePoint }, dispatch] = useReducer(
    reducer,
    {
      mode: "idle",
      activePoint: 0,
      points: [],
      path: initialPath,
      otherPoints: readOnlyPointsRef.current.reduce(
        (acc, p) => ({ ...acc, [`${p.x}x${p.y}`]: p }),
        {},
      ),
    },
    ({ path, ...rest }) => {
      const points = parsePath(path);
      return {
        ...rest,
        path,
        points,
        activePoint: Math.max(0, points.length - 1),
      };
    },
  );

  const [anchors, setAnchors] =
    useState<EditableSvg["anchors"]>(initialAnchors);
  const [tradBelayStations, setTradBelayStations] = useState<
    EditableSvg["tradBelayStations"]
  >(initialTradBelayStations);
  const [texts, setTexts] = useState<EditableSvg["texts"]>(initialTexts);

  const [hasAnchor, setHasAnchor] = useState(initialHasAnchor);
  const [mode, setMode] = useState<
    "points" | "add-anchor" | "add-text" | "add-trad-belay"
  >("points");
  const imageRef = useRef<SVGImageElement>(null);

  const minWindowScale = useMinWindowScale();

  const meta = useMeta();

  const save: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      onSave({
        anchors,
        hasAnchor,
        path,
        tradBelayStations,
        texts,
      });
    },
    [anchors, hasAnchor, onSave, path, texts, tradBelayStations],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      shift.current = e.shiftKey;
    };

    document.addEventListener("keydown", handleKey);
    document.addEventListener("keyup", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("keyup", handleKey);
    };
  }, []);

  const cancelDragging = useCallback(() => {
    dispatch({ action: "idle" });
  }, []);

  const getMouseCoords = useCallback(
    (
      e: Pick<MouseEvent, "clientX" | "clientY">,
      snapToClosePoint: boolean,
    ): Coords => {
      const dim = imageRef.current?.getBoundingClientRect();
      if (!dim) {
        return { x: 0, y: 0 };
      }

      const dx = w / dim.width;
      const dy = h / dim.height;
      const x = Math.round((e.clientX - dim.left) * dx);
      const y = Math.round((e.clientY - dim.top) * dy);
      let p = { x, y };

      const readOnlyPoints = readOnlyPointsRef.current;
      if (snapToClosePoint) {
        const foundPoint = readOnlyPoints?.find(
          (p2) => Math.hypot(p.x - p2.x, p.y - p2.y) < 20,
        );
        if (foundPoint) {
          p = { x: foundPoint.x, y: foundPoint.y };
        }
      }

      return p;
    },
    [w, h],
  );

  const handleOnClick: MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      switch (mode) {
        case "points": {
          if (shift.current) {
            const { x, y } = getMouseCoords(e, true);
            dispatch({ action: "add-point", x, y });
          }
          dispatch({ action: "mouse-up" });
          break;
        }

        case "add-text": {
          const coords = getMouseCoords(e, false);
          const txt = prompt("Enter text", "");
          if (txt) {
            texts.push({ txt, x: coords.x, y: coords.y });
            setTexts(texts);
          }
          setMode("points");
          break;
        }

        case "add-anchor": {
          const coords = getMouseCoords(e, true);
          anchors.push(coords);
          setAnchors(anchors);
          setMode("points");
          break;
        }

        case "add-trad-belay": {
          const coords = getMouseCoords(e, true);
          tradBelayStations.push(coords);
          setTradBelayStations(tradBelayStations);
          setMode("points");
          break;
        }

        default: {
          return neverGuard(mode, null);
        }
      }
    },
    [anchors, getMouseCoords, mode, texts, tradBelayStations],
  );

  const handleMouseMove: MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      const { x, y } = getMouseCoords(e, true);
      dispatch({ action: "mouse-move", x, y });
    },
    [getMouseCoords],
  );

  const handleMouseUp: MouseEventHandler = useCallback((e) => {
    // Remove selection caused by shift-button used to create new points
    document.getSelection()?.removeAllRanges();
    e.preventDefault();
    dispatch({ action: "mouse-up" });
    return false;
  }, []);

  const setPointType = useCallback((pointType: string) => {
    dispatch({
      action: "set-type",
      type: pointType === "C" ? "curve" : "line",
    });
  }, []);

  const removeActivePoint = useCallback(() => {
    dispatch({ action: "remove-point" });
  }, []);

  const reset = useCallback(() => {
    shift.current = false;
    dispatch({ action: "reset" });
    setMode("points");
    setAnchors([]);
    setTradBelayStations([]);
    setTexts([]);
    setHasAnchor(true);
  }, []);

  const circles = points.map((p, i, a) => {
    const handle: React.ReactNode = isCubicPoint(p) ? (
      <g className="buldreinfo-svg-edit-opacity">
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
          onMouseDown={() => dispatch({ action: "drag-cubic", index: i, c: 0 })}
        />
        <circle
          className={"buldreinfo-svg-pointer"}
          fill={black}
          cx={p.c[1].x}
          cy={p.c[1].y}
          r={0.003 * w}
          onMouseDown={() => dispatch({ action: "drag-cubic", index: i, c: 1 })}
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
          onMouseDown={() => dispatch({ action: "drag-cubic", index: i, c: 0 })}
        />
        <circle
          className={"buldreinfo-svg-pointer"}
          fill={stroke}
          cx={p.c[1].x}
          cy={p.c[1].y}
          r={0.002 * w}
          onMouseDown={() => dispatch({ action: "drag-cubic", index: i, c: 1 })}
        />
      </g>
    ) : null;

    const fill = activePoint === i ? "#00FF00" : "#FF0000";
    return (
      <g key={[p.x, p.y, i].join("x")}>
        {handle}
        <circle
          className={"buldreinfo-svg-pointer"}
          fill={fill}
          stroke={black}
          strokeWidth={Math.min(1, 0.001 * w)}
          cx={p.x}
          cy={p.y}
          r={0.005 * w}
          onMouseDown={() => dispatch({ action: "drag-point", index: i })}
        />
      </g>
    );
  });

  return (
    <Container onMouseUp={cancelDragging} onMouseLeave={cancelDragging}>
      <Segment size="mini">
        <Button.Group size="mini" floated="right">
          <Button
            primary
            as={Link}
            to="/mp4/20230718_SvgEditExample.mp4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Example-video
          </Button>
          <Button.Or />
          <Button
            negative
            disabled={
              points.length === 0 &&
              anchors.length === 0 &&
              tradBelayStations.map((a) => {
                const r = 0.006 * w;
                return (
                  <polygon
                    points={`${a.x},${a.y - r}, ${a.x - r},${a.y + r}, ${a.x + r},${a.y + r}`}
                    key={[a.x, a.y].join("x")}
                    fill="#E2011A"
                  />
                );
              }).length === 0 &&
              texts.map((text) => (
                <text
                  key={[text.x, text.y].join("x")}
                  x={text.x}
                  y={text.y}
                  fontSize="5em"
                  fill={"red"}
                >
                  {text.txt}
                </text>
              )).length === 0
            }
            onClick={reset}
          >
            Reset
          </Button>
          <Button.Or />
          <Button onClick={onCancel}>Cancel</Button>
          <Button.Or />
          <Button positive loading={saving} onClick={save}>
            Save
          </Button>
        </Button.Group>
        <Button.Group size="mini">
          <Button
            onClick={() =>
              setMode((val) => (val === "add-text" ? "points" : "add-text"))
            }
            toggle
            active={mode === "add-text"}
          >
            Text
          </Button>
          <Button.Or />
          <Button
            icon="trash"
            negative={
              texts.map((text) => (
                <text
                  key={[text.x, text.y].join("x")}
                  x={text.x}
                  y={text.y}
                  fontSize="5em"
                  fill={"red"}
                >
                  {text.txt}
                </text>
              )).length !== 0
            }
            disabled={
              texts.map((text) => (
                <text
                  key={[text.x, text.y].join("x")}
                  x={text.x}
                  y={text.y}
                  fontSize="5em"
                  fill={"red"}
                >
                  {text.txt}
                </text>
              )).length === 0
            }
            onClick={() => setTexts([])}
          />
        </Button.Group>
        {meta.isClimbing && (
          <>
            {" "}
            <Button.Group size="mini">
              <Button
                onClick={() =>
                  setMode((val) =>
                    val === "add-anchor" ? "points" : "add-anchor",
                  )
                }
                toggle
                active={mode === "add-anchor"}
              >
                Extra anchors
              </Button>
              <Button.Or />
              <Button
                icon="trash"
                negative={anchors.length !== 0}
                disabled={anchors.length === 0}
                onClick={() => setAnchors([])}
              />
            </Button.Group>{" "}
            <Button.Group size="mini">
              <Button
                onClick={() =>
                  setMode((val) =>
                    val === "add-trad-belay" ? "points" : "add-trad-belay",
                  )
                }
                toggle
                active={mode === "add-trad-belay"}
              >
                Trad belay stations
              </Button>
              <Button.Or />
              <Button
                icon="trash"
                negative={tradBelayStations.length !== 0}
                disabled={tradBelayStations.length === 0}
                onClick={() => setTradBelayStations([])}
              />
            </Button.Group>{" "}
            <Button
              icon
              labelPosition="left"
              size="mini"
              onClick={() => setHasAnchor(!hasAnchor)}
              disabled={points.length === 0}
            >
              <Icon
                name={hasAnchor ? "check square outline" : "square outline"}
              />
              Anchor
            </Button>
            {meta.isClimbing && sections?.length > 1 && (
              <Dropdown
                selection
                value={problemSectionId}
                onChange={(_, { value }) => {
                  const problemSectionId = +value;
                  refresh(problemId, problemSectionId, mediaId);
                }}
                options={[
                  { key: -1, value: 0, text: "Entire route" },
                  ...sections.map((s, i) => ({
                    key: i,
                    value: s.id,
                    text: "Pitch " + s.nr,
                  })),
                ]}
              />
            )}
          </>
        )}
        <br />
        <strong>SHIFT + CLICK</strong> to add a point | <strong>CLICK</strong>{" "}
        to select a point | <strong>CLICK AND DRAG</strong> to move a point
        <br />
        {activePoint !== 0 && (
          <Dropdown
            selection
            value={isCubicPoint(points[activePoint]) ? "C" : "L"}
            onChange={(_, { value }) =>
              setPointType(value ? String(value) : "")
            }
            options={[
              { key: 1, value: "L", text: "Selected point: Line to" },
              { key: 2, value: "C", text: "Selected point: Curve to" },
            ]}
          />
        )}
        <Button
          size="mini"
          disabled={!points || points.length === 0}
          onClick={removeActivePoint}
        >
          Remove this point
        </Button>
        {problemSectionId != 0 && (
          <>
            <Divider horizontal>Image region</Divider>
            <Input
              size="mini"
              label="x"
              value={customMediaRegion?.x}
              onChange={(_, { value }) =>
                setCustomMediaRegion((prevState) => ({
                  ...prevState,
                  x: Math.min(+value || 0, mediaWidth - 1920),
                }))
              }
            />
            <Input
              size="mini"
              label="y"
              value={customMediaRegion?.y}
              onChange={(_, { value }) =>
                setCustomMediaRegion((prevState) => ({
                  ...prevState,
                  y: Math.min(+value || 0, mediaHeight - 1080),
                }))
              }
            />
            <Input
              size="mini"
              label="width"
              value={customMediaRegion?.width}
              onChange={(_, { value }) =>
                setCustomMediaRegion((prevState) => ({
                  ...prevState,
                  width: Math.min(
                    +value || 1920,
                    mediaWidth - (prevState.x || 0),
                    3000,
                  ),
                }))
              }
            />
            <Input
              size="mini"
              label="height"
              value={customMediaRegion?.height}
              onChange={(_, { value }) =>
                setCustomMediaRegion((prevState) => ({
                  ...prevState,
                  height: Math.min(
                    +value || 1080,
                    mediaHeight - (prevState.y || 0),
                    4000,
                  ),
                }))
              }
            />
            {customMediaRegion && customMediaRegion !== mediaRegion && (
              <>
                {" "}
                <Button
                  size="mini"
                  positive
                  circular
                  icon
                  onClick={() => onUpdateMediaRegion(customMediaRegion)}
                >
                  <Icon name="refresh" />
                </Button>
              </>
            )}
          </>
        )}
      </Segment>

      <svg
        viewBox={"0 0 " + w + " " + h}
        onClick={handleOnClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        width="100%"
        height="100%"
      >
        <image
          ref={imageRef}
          xlinkHref={getImageUrl(mediaId, crc32, undefined, mediaRegion)}
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
        {anchors.map((a) => (
          <circle
            key={[a.x, a.y].join("x")}
            fill="#E2011A"
            cx={a.x}
            cy={a.y}
            r={0.006 * w}
          />
        ))}
        {texts.map((text) => (
          <text
            key={[text.x, text.y].join("x")}
            x={text.x}
            y={text.y}
            fontSize="5em"
            fill={"red"}
          >
            {text.txt}
          </text>
        ))}
        {tradBelayStations.map((a) => {
          const r = 0.006 * w;
          return (
            <polygon
              points={`${a.x},${a.y - r}, ${a.x - r},${a.y + r}, ${a.x + r},${a.y + r}`}
              key={[a.x, a.y].join("x")}
              fill="#E2011A"
            />
          );
        })}
      </svg>
      <br />
      <Input
        label="SVG Path:"
        fluid
        placeholder="SVG Path"
        value={path || ""}
        onChange={(_, { value }) => {
          dispatch({ action: "update-path", path: value ?? "" });
        }}
      />
    </Container>
  );
};

export default SvgEditLoader;
