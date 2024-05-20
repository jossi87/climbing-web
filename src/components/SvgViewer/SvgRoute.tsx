import { CSSProperties } from "react";
import { components } from "../../@types/buldreinfo/swagger";
import { useNavigate } from "react-router-dom";
import { parseSVG, makeAbsolute } from "svg-path-parser";

type Props = {
  style?: CSSProperties;
  thumbnail: boolean;
  sidebarOpen: boolean;
  scale: number;
  mediaId: number;
  mediaHeight: number;
  mediaWidth: number;
  svg: components["schemas"]["Svg"];
  optProblemId: number;
  problemIdHovered: number;
  setProblemIdHovered?: (problemId: number) => void;
};

export const SvgRoute = ({
  style,
  thumbnail,
  sidebarOpen,
  scale,
  mediaId,
  mediaHeight,
  mediaWidth,
  svg,
  optProblemId,
  problemIdHovered,
  setProblemIdHovered,
}: Props) => {
  const navigate = useNavigate();
  const path = makeAbsolute(parseSVG(svg.path)); // Note: mutates the commands in place!

  let gClassName = "buldreinfo-svg-pointer";
  if (optProblemId || problemIdHovered) {
    if (svg.problemId != optProblemId && svg.problemId != problemIdHovered) {
      gClassName += " buldreinfo-svg-opacity-low";
    } else {
      gClassName += " buldreinfo-svg-opacity-high";
    }
  }
  let groupColor;
  switch (svg.problemGradeGroup) {
    case 0:
      groupColor = "#FFFFFF";
      break;
    case 1:
      groupColor = "#00FF00";
      break;
    case 2:
      groupColor = "#0000FF";
      break;
    case 3:
      groupColor = "#FFFF00";
      break;
    case 4:
      groupColor = "#FF0000";
      break;
    case 5:
      groupColor = "#FF00FF";
      break;
    default:
      groupColor = "#000000";
      break;
  }
  let textColor = "#FFFFFF";
  if (svg.ticked) {
    textColor = "#21ba45";
  } else if (svg.todo) {
    textColor = "#659DBD";
  } else if (svg.dangerous) {
    textColor = "#FF0000";
  }

  let ixNr;
  let maxY = 0;
  let ixAnchor;
  let minY = 99999999;
  for (let i = 0, len = path.length; i < len; i++) {
    if (path[i].y > maxY) {
      ixNr = i;
      maxY = path[i].y;
    }
    if (path[i].y < minY) {
      ixAnchor = i;
      minY = path[i].y;
    }
  }
  let x = path[ixNr].x;
  let y = path[ixNr].y;
  const border = 15 * scale * (thumbnail ? 3 : 1);
  if (x < border) x = border / 2;
  if (x > mediaWidth - border) x = mediaWidth - border;
  if (y < border) y = border;
  if (y > mediaHeight - border) y = mediaHeight - border;

  const isHoveredOrActive =
    optProblemId === svg.problemId || problemIdHovered == svg.problemId;
  const hoveredOrActiveScale = isHoveredOrActive ? 1.2 : 1;
  const pathIdentifier = `svg-route-path-${mediaId}-${svg.problemId}-${thumbnail}`;
  const extraAnchors =
    svg.anchors &&
    JSON.parse(svg.anchors).map((a) => (
      <circle
        key={[a.x, a.y].join("x")}
        fill={groupColor}
        stroke="black"
        strokeWidth={scale * 2 * hoveredOrActiveScale * (thumbnail ? 3 : 1)}
        cx={a.x}
        cy={a.y}
        r={8 * scale * hoveredOrActiveScale * (thumbnail ? 3 : 1)}
      />
    ));
  const extraTexts =
    svg.texts &&
    JSON.parse(svg.texts).map((t) => (
      <text
        stroke="white"
        strokeWidth={2 * scale}
        style={{
          paintOrder: "stroke fill",
          clipPath: "inset(-5px -5px -5px -5px round 10px)",
        }}
        key={[t.x, t.y].join("x")}
        x={t.x}
        y={t.y}
        fontSize={14 * scale}
        fill="red"
      >
        {t.txt}
      </text>
    ));
  let info;
  if (!sidebarOpen && !thumbnail && optProblemId === svg.problemId) {
    let text = `#${svg.nr} - ${svg.problemName} [${svg.problemGrade}]`;
    if (svg.problemSubtype) {
      text += " - " + svg.problemSubtype;
    }
    if (svg.ticked) {
      text += " - Ticked";
    } else if (svg.todo) {
      text += " - In TODO-list";
    }
    if (svg.dangerous) {
      text += " - Flagged as dangerous";
    }
    info = (
      <text
        stroke="black"
        strokeWidth={5 * scale}
        style={{
          paintOrder: "stroke fill",
          clipPath: "inset(-5px -5px -5px -5px round 10px)",
        }}
        fontSize={25 * scale}
        dominantBaseline="text-before-edge"
        fontWeight="bolder"
        fill="white"
      >
        {text}
      </text>
    );
  }

  return (
    <g
      className={gClassName}
      style={{
        ...style,
        filter: isHoveredOrActive ? "contrast(2)" : undefined,
      }}
      onClick={() => {
        if (close && !thumbnail) {
          navigate("/problem/" + svg.problemId + "?idMedia=" + mediaId);
        }
      }}
      onMouseEnter={() =>
        setProblemIdHovered && setProblemIdHovered(svg.problemId)
      }
      onMouseLeave={() => setProblemIdHovered && setProblemIdHovered(null)}
    >
      <defs>
        <path
          id={pathIdentifier}
          d={svg.path}
          strokeDasharray={
            svg.primary ? scale * 10 * (thumbnail ? 2 : 1) : undefined
          }
          strokeLinecap="round"
        />
      </defs>
      <use
        xlinkHref={`#${pathIdentifier}`}
        style={{ fill: "none", stroke: "black" }}
        strokeWidth={5 * scale * (thumbnail ? 3 : 1)}
      />
      <use
        xlinkHref={`#${pathIdentifier}`}
        style={{ fill: "none", stroke: groupColor }}
        strokeWidth={2 * scale * hoveredOrActiveScale * (thumbnail ? 3 : 1)}
      />
      <text
        fill={textColor}
        stroke="black"
        strokeWidth={5 * scale * hoveredOrActiveScale * (thumbnail ? 3 : 1)}
        style={{
          paintOrder: "stroke fill",
          clipPath: "inset(-5px -5px -5px -5px round 10px)",
        }}
        fontSize={25 * scale * hoveredOrActiveScale * (thumbnail ? 3 : 1)}
        fontWeight={isHoveredOrActive ? "bolder" : "normal"}
        textAnchor="middle"
        dominantBaseline="central"
        x={x}
        y={y}
      >
        {svg.nr}
      </text>
      {svg.hasAnchor && (
        <circle
          fill={groupColor}
          stroke="black"
          strokeWidth={scale * 2 * hoveredOrActiveScale * (thumbnail ? 3 : 1)}
          cx={path[ixAnchor].x}
          cy={path[ixAnchor].y}
          r={8 * scale * hoveredOrActiveScale * (thumbnail ? 3 : 1)}
        />
      )}
      {extraAnchors}
      {extraTexts}
      {info}
    </g>
  );
};
