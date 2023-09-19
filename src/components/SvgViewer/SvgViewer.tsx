import { getImageUrl } from "../../api";
import { SvgRoute } from "./SvgRoute";
import { Descent, Rappel } from "../../utils/svg-utils";
import { components } from "../../@types/buldreinfo/swagger";
import { CSSProperties } from "react";
import "./SvgViewer.css";

type SvgProps = {
  style?: CSSProperties;
  close: () => void;
  m: components["schemas"]["Media"];
  thumb: boolean;
  optProblemId: number;
  sidebarOpen: boolean;
  problemIdHovered: number;
  setProblemIdHovered?: (problemId: number) => void;
};

export const SvgViewer = ({
  style,
  close,
  m,
  thumb,
  optProblemId,
  sidebarOpen,
  problemIdHovered,
  setProblemIdHovered,
}: SvgProps) => {
  const { outerWidth, outerHeight } = window;
  let scale = 1;
  if (m.width > outerWidth || m.height > outerHeight) {
    scale = Math.max(
      Math.max(m.width, outerWidth) / 1920,
      Math.max(m.height, outerHeight) / 1080,
    );
  } else {
    scale = Math.max(m.width / 1920, m.height / 1080);
  }
  const mediaSvgs =
    m.mediaSvgs?.length > 0 &&
    m.mediaSvgs.map((svg) => {
      switch (svg.t) {
        case "PATH": {
          return (
            <Descent
              key={[m.id, thumb, svg.path].join("x")}
              path={svg.path}
              whiteNotBlack={true}
              scale={scale}
              thumb={thumb}
            />
          );
        }
        case "RAPPEL_BOLTED": {
          return (
            <Rappel
              key={[m.id, thumb, svg.rappelX, svg.rappelY].join("x")}
              x={svg.rappelX}
              y={svg.rappelY}
              bolted={true}
              scale={scale}
              thumb={thumb}
              backgroundColor="black"
              color="white"
            />
          );
        }
        case "RAPPEL_NOT_BOLTED": {
          return (
            <Rappel
              key={[m.id, thumb, svg.rappelX, svg.rappelY].join("x")}
              x={svg.rappelX}
              y={svg.rappelY}
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
    m.svgs?.length > 0 &&
    m.svgs
      .sort((a, b) => {
        if (problemIdHovered > 0 && a.problemId === problemIdHovered) {
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
          key={[m.id, svg.problemId, thumb].join("-")}
          thumbnail={thumb}
          sidebarOpen={sidebarOpen}
          scale={scale}
          mediaId={m.id}
          mediaHeight={m.height}
          mediaWidth={m.width}
          svg={svg}
          optProblemId={optProblemId}
          problemIdHovered={problemIdHovered}
          setProblemIdHovered={setProblemIdHovered}
        />
      ));

  return (
    <>
      <canvas
        className="buldreinfo-svg-canvas"
        width={m.width}
        height={m.height}
        style={style}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        className="buldreinfo-svg"
        viewBox={"0 0 " + m.width + " " + m.height}
        preserveAspectRatio="xMidYMid meet"
        onClick={(e: React.MouseEvent<SVGSVGElement>) => {
          if (e.target instanceof SVGSVGElement && close) {
            close();
          }
        }}
        onMouseLeave={() => setProblemIdHovered && setProblemIdHovered(null)}
      >
        <image
          xlinkHref={getImageUrl(m.id, m.crc32)}
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
