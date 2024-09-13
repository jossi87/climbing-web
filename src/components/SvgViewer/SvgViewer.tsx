import { getImageUrl } from "../../api";
import { SvgRoute } from "./SvgRoute";
import { Descent, Rappel } from "../../utils/svg-utils";
import { components } from "../../@types/buldreinfo/swagger";
import { CSSProperties } from "react";
import {
  calculateMediaRegion,
  isPathVisible,
  scalePath,
  scalePoint,
} from "../../utils/svg-scaler";
import "./SvgViewer.css";

type SvgProps = {
  style?: CSSProperties;
  close: () => void;
  m: components["schemas"]["Media"];
  pitch: number;
  thumb: boolean;
  optProblemId: number;
  showText: boolean;
  problemIdHovered: number;
  setProblemIdHovered?: (problemId: number) => void;
};

export const SvgViewer = ({
  style,
  close,
  m,
  pitch,
  thumb,
  optProblemId,
  showText,
  problemIdHovered,
  setProblemIdHovered,
}: SvgProps) => {
  let imgW = m.width;
  let imgH = m.height;
  let mediaRegion;
  let svgs = m.svgs;
  if (pitch && m.svgs?.length > 0 && m.svgs.some((x) => x.nr === pitch)) {
    const pitchSvg = m.svgs.filter((x) => x.nr === pitch)[0];
    mediaRegion = calculateMediaRegion(pitchSvg.path, m.width, m.height);
    svgs = m.svgs
      .filter((x) => x === pitchSvg || isPathVisible(x.path, mediaRegion))
      .map((x) => ({ ...x, path: scalePath(x.path, mediaRegion) }));
    imgW = mediaRegion.width;
    imgH = mediaRegion.height;
  }

  const scale = Math.max(imgW / 1920, imgH / 1440);
  const mediaSvgs =
    m.mediaSvgs?.length > 0 &&
    m.mediaSvgs
      .filter((svg) => !svg.path || isPathVisible(svg.path, mediaRegion))
      .map((svg) => {
        switch (svg.t) {
          case "PATH": {
            return (
              <Descent
                key={[m.id, thumb, svg.path].join("x")}
                path={scalePath(svg.path, mediaRegion)}
                whiteNotBlack={true}
                scale={scale}
                thumb={thumb}
              />
            );
          }
          case "RAPPEL_BOLTED": {
            const { x, y } = scalePoint(svg.rappelX, svg.rappelY, mediaRegion);
            return (
              <Rappel
                key={[m.id, thumb, svg.rappelX, svg.rappelY].join("x")}
                x={x}
                y={y}
                bolted={true}
                scale={scale}
                thumb={thumb}
                backgroundColor="black"
                color="white"
              />
            );
          }
          case "RAPPEL_NOT_BOLTED": {
            const { x, y } = scalePoint(svg.rappelX, svg.rappelY, mediaRegion);
            return (
              <Rappel
                key={[m.id, thumb, svg.rappelX, svg.rappelY].join("x")}
                x={x}
                y={y}
                bolted={false}
                scale={scale}
                thumb={thumb}
                backgroundColor="black"
                color="white"
              />
            );
          }
        }
      });
  const routes =
    svgs?.length > 0 &&
    svgs
      .sort((a, b) => {
        if (a.pitch < b.pitch) {
          return -1;
        } else if (a.pitch > b.pitch) {
          return 1;
        } else if (problemIdHovered > 0 && a.problemId === problemIdHovered) {
          return 1;
        } else if (problemIdHovered > 0 && b.problemId === problemIdHovered) {
          return -1;
        } else if (optProblemId > 0 && a.problemId === optProblemId) {
          return 1;
        } else if (optProblemId > 0 && b.problemId === optProblemId) {
          return -1;
        }
        return b.nr - a.nr;
      })
      .map((svg) => (
        <SvgRoute
          key={[m.id, svg.problemId, svg.pitch, thumb].join("-")}
          thumbnail={thumb}
          showText={showText}
          scale={scale}
          mediaId={m.id}
          mediaHeight={imgH}
          mediaWidth={imgW}
          svg={svg}
          optProblemId={optProblemId}
          problemIdHovered={problemIdHovered}
          setProblemIdHovered={setProblemIdHovered}
          pitch={pitch}
        />
      ));

  return (
    <>
      <canvas
        className="buldreinfo-svg-canvas"
        width={imgW}
        height={imgH}
        style={style}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        className="buldreinfo-svg"
        viewBox={"0 0 " + imgW + " " + imgH}
        preserveAspectRatio="xMidYMid meet"
        onClick={(e: React.MouseEvent<SVGSVGElement>) => {
          if (e.target instanceof SVGSVGElement && close) {
            close();
          }
        }}
        onMouseLeave={() => setProblemIdHovered && setProblemIdHovered(null)}
      >
        <image
          xlinkHref={getImageUrl(m.id, m.crc32, null, mediaRegion)}
          width="100%"
          height="100%"
        />
        {mediaSvgs}
        {routes && (
          <g className={thumb ? undefined : "buldreinfo-svg-sibling-fade"}>
            {routes}
          </g>
        )}
      </svg>
    </>
  );
};
