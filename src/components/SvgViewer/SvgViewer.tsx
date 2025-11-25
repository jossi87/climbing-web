import { getImageUrl } from '../../api';
import { SvgRoute } from './SvgRoute';
import { Descent, Rappel } from '../../utils/svg-utils';
import { components } from '../../@types/buldreinfo/swagger';
import { CSSProperties } from 'react';
import {
  calculateMediaRegion,
  isPathVisible,
  scalePath,
  scalePoint,
  MediaRegion,
} from '../../utils/svg-scaler';
import './SvgViewer.css';

type SvgProps = {
  style?: CSSProperties;
  close?: (() => void) | null;
  m: components['schemas']['Media'];
  pitch?: number | null;
  thumb: boolean;
  optProblemId?: number | null;
  showText: boolean;
  problemIdHovered?: number | null;
  setProblemIdHovered?: (problemId: number | null) => void;
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
  let imgW = m.width ?? 0;
  let imgH = m.height ?? 0;
  let mediaRegion: MediaRegion | null = null;
  let svgs = m.svgs ?? [];
  const pitchNum = pitch ?? 0;
  const optProblemIdNum = optProblemId ?? 0;
  if (
    pitchNum > 0 &&
    (m.svgs?.length ?? 0) > 0 &&
    (m.svgs ?? []).some((x) => x.problemId == optProblemIdNum && x.pitch === pitchNum)
  ) {
    const pitchSvg = (m.svgs ?? []).filter(
      (x) => x.problemId == optProblemIdNum && x.pitch === pitchNum,
    )[0]!;
    mediaRegion = calculateMediaRegion(pitchSvg.path ?? '', m.width ?? 0, m.height ?? 0);
    const regionForScale: MediaRegion = mediaRegion ?? {
      x: 0,
      y: 0,
      width: m.width ?? 0,
      height: m.height ?? 0,
    };
    svgs = (m.svgs ?? [])
      .filter(
        (x) =>
          x === pitchSvg || (mediaRegion ? isPathVisible(x.path ?? '', regionForScale) : false),
      )
      .map((x) => ({ ...x, path: scalePath(x.path ?? '', regionForScale) }));
    if (mediaRegion) {
      imgW = mediaRegion.width;
      imgH = mediaRegion.height;
    }
  }

  const scale = Math.max(imgW / 1920, imgH / 1440);
  const regionForScaleAll: MediaRegion = mediaRegion ?? { x: 0, y: 0, width: imgW, height: imgH };
  const mediaSvgs = (m.mediaSvgs ?? [])
    .filter(
      (svg) => !svg.path || (mediaRegion ? isPathVisible(svg.path ?? '', regionForScaleAll) : true),
    )
    .map((svg) => {
      switch (svg.t) {
        case 'PATH': {
          return (
            <Descent
              key={[m.id ?? 0, thumb, svg.path].join('x')}
              path={scalePath(svg.path ?? '', regionForScaleAll)}
              whiteNotBlack={true}
              scale={scale}
              thumb={thumb}
            />
          );
        }
        case 'RAPPEL_BOLTED': {
          const { x, y } = scalePoint(svg.rappelX ?? 0, svg.rappelY ?? 0, regionForScaleAll);
          return (
            <Rappel
              key={[m.id ?? 0, thumb, svg.rappelX ?? 0, svg.rappelY ?? 0].join('x')}
              x={x}
              y={y}
              bolted={true}
              scale={scale}
              thumb={thumb}
              backgroundColor='black'
              color='white'
            />
          );
        }
        case 'RAPPEL_NOT_BOLTED': {
          const { x, y } = scalePoint(svg.rappelX ?? 0, svg.rappelY ?? 0, regionForScaleAll);
          return (
            <Rappel
              key={[m.id ?? 0, thumb, svg.rappelX ?? 0, svg.rappelY ?? 0].join('x')}
              x={x}
              y={y}
              bolted={false}
              scale={scale}
              thumb={thumb}
              backgroundColor='black'
              color='white'
            />
          );
        }
      }
    });
  const problemIdHoveredNum = problemIdHovered ?? 0;

  const routes =
    svgs.length > 0 &&
    svgs
      .sort((a, b) => {
        if ((a.pitch ?? 0) < (b.pitch ?? 0)) {
          return -1;
        } else if ((a.pitch ?? 0) > (b.pitch ?? 0)) {
          return 1;
        } else if (problemIdHoveredNum > 0 && a.problemId === problemIdHoveredNum) {
          return 1;
        } else if (problemIdHoveredNum > 0 && b.problemId === problemIdHoveredNum) {
          return -1;
        } else if (optProblemIdNum > 0 && a.problemId === optProblemIdNum) {
          return 1;
        } else if (optProblemIdNum > 0 && b.problemId === optProblemIdNum) {
          return -1;
        }
        return (b.nr ?? 0) - (a.nr ?? 0);
      })
      .map((svg) => (
        <SvgRoute
          key={[m.id, svg.problemId, svg.pitch, thumb].join('-')}
          thumbnail={thumb}
          showText={showText}
          scale={scale}
          mediaId={m.id ?? 0}
          mediaHeight={imgH}
          mediaWidth={imgW}
          svg={svg}
          optProblemId={optProblemIdNum}
          problemIdHovered={problemIdHoveredNum}
          setProblemIdHovered={setProblemIdHovered}
          pitch={pitchNum}
        />
      ));

  return (
    <>
      <canvas className='buldreinfo-svg-canvas' width={imgW} height={imgH} style={style} />
      <svg
        xmlns='http://www.w3.org/2000/svg'
        overflow='visible'
        className='buldreinfo-svg'
        viewBox={'0 0 ' + imgW + ' ' + imgH}
        preserveAspectRatio='xMidYMid meet'
        onClick={(e: React.MouseEvent<SVGSVGElement>) => {
          if (e.target instanceof SVGSVGElement && close) {
            close();
          }
        }}
        onMouseLeave={() => setProblemIdHovered && setProblemIdHovered(null)}
      >
        <image
          xlinkHref={getImageUrl(m.id ?? 0, m.crc32 ?? 0, {
            mediaRegion: mediaRegion ?? undefined,
          })}
          width='100%'
          height='100%'
        />
        {mediaSvgs}
        {routes && <g className={thumb ? undefined : 'buldreinfo-svg-sibling-fade'}>{routes}</g>}
      </svg>
    </>
  );
};
