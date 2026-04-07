import { getMediaFileUrl } from '../../../api';
import { SvgRoute } from './SvgRoute';
import { Descent, Rappel } from '../../../utils/svg-utils';
import type { components } from '../../../@types/buldreinfo/swagger';
import { type CSSProperties, type MouseEvent, useMemo } from 'react';
import {
  calculateMediaRegion,
  isPathVisible,
  scalePath,
  scalePoint,
  type MediaRegion,
} from '../../../utils/svg-scaler';
import './SvgViewer.css';
import { cn } from '../../../lib/utils';

type SvgProps = {
  className?: string;
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
  className,
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
  const pitchNum = pitch ?? 0;
  const optProblemIdNum = optProblemId ?? 0;
  const problemIdHoveredNum = problemIdHovered ?? 0;

  // Process dimensions and regions
  const processed = useMemo(() => {
    let imgW = m.width ?? 0;
    let imgH = m.height ?? 0;
    let mediaRegion: MediaRegion | null = null;
    let svgs: components['schemas']['Svg'][] = m.svgs ?? [];

    const hasSpecificPitch = svgs.some((x) => x.problemId === optProblemIdNum && x.pitch === pitchNum);

    if (pitchNum > 0 && svgs.length > 0 && hasSpecificPitch) {
      const pitchSvg = svgs.find((x) => x.problemId === optProblemIdNum && x.pitch === pitchNum)!;
      mediaRegion = calculateMediaRegion(pitchSvg.path ?? '', m.width ?? 0, m.height ?? 0);

      const regionForScale: MediaRegion = mediaRegion ?? {
        x: 0,
        y: 0,
        width: m.width ?? 0,
        height: m.height ?? 0,
      };

      svgs = svgs
        .filter((x) => x === pitchSvg || (mediaRegion ? isPathVisible(x.path ?? '', regionForScale) : false))
        .map((x) => ({ ...x, path: scalePath(x.path ?? '', regionForScale) }));

      if (mediaRegion) {
        imgW = mediaRegion.width;
        imgH = mediaRegion.height;
      }
    }

    const regionForScaleAll: MediaRegion = mediaRegion ?? { x: 0, y: 0, width: imgW, height: imgH };
    const scale = Math.max(imgW / 1920, imgH / 1440);

    return { imgW, imgH, mediaRegion, svgs, regionForScaleAll, scale };
  }, [m, pitchNum, optProblemIdNum]);

  const { imgW, imgH, mediaRegion, svgs, regionForScaleAll, scale } = processed;

  const mediaSvgs = ((m.mediaSvgs ?? []) as components['schemas']['MediaSvgElement'][])
    .filter((svg) => !svg.path || (mediaRegion ? isPathVisible(svg.path ?? '', regionForScaleAll) : true))
    .map((svg, idx) => {
      const keyPrefix = `${m.id}-${thumb}-${idx}`;
      switch (svg.t) {
        case 'PATH':
          return (
            <Descent
              key={`${keyPrefix}-descent`}
              path={scalePath(svg.path ?? '', regionForScaleAll)}
              whiteNotBlack={true}
              scale={scale}
              thumb={thumb}
            />
          );
        case 'RAPPEL_BOLTED':
        case 'RAPPEL_NOT_BOLTED': {
          const { x, y } = scalePoint(svg.rappelX ?? 0, svg.rappelY ?? 0, regionForScaleAll);
          return (
            <Rappel
              key={`${keyPrefix}-rappel`}
              x={x}
              y={y}
              bolted={svg.t === 'RAPPEL_BOLTED'}
              scale={scale}
              thumb={thumb}
              backgroundColor='black'
              color='white'
            />
          );
        }
        default:
          return null;
      }
    });

  const routes = useMemo(() => {
    if (svgs.length === 0) return null;

    return [...svgs]
      .sort((a, b) => {
        if ((a.pitch ?? 0) !== (b.pitch ?? 0)) return (a.pitch ?? 0) - (b.pitch ?? 0);
        if (problemIdHoveredNum > 0) {
          if (a.problemId === problemIdHoveredNum) return 1;
          if (b.problemId === problemIdHoveredNum) return -1;
        }
        if (optProblemIdNum > 0) {
          if (a.problemId === optProblemIdNum) return 1;
          if (b.problemId === optProblemIdNum) return -1;
        }
        return (b.nr ?? 0) - (a.nr ?? 0);
      })
      .map((svg) => (
        <SvgRoute
          key={`${m.id}-${svg.problemId}-${svg.pitch}-${thumb}`}
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
  }, [
    svgs,
    m.id,
    thumb,
    showText,
    scale,
    imgH,
    imgW,
    optProblemIdNum,
    problemIdHoveredNum,
    setProblemIdHovered,
    pitchNum,
  ]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden', !thumb && 'touch-pan-pinch', className)} style={style}>
      <canvas
        className='buldreinfo-svg-canvas pointer-events-none absolute inset-0 h-full w-full'
        width={imgW}
        height={imgH}
      />
      <svg
        xmlns='http://www.w3.org/2000/svg'
        overflow='visible'
        className={cn(
          'buldreinfo-svg absolute inset-0 h-full w-full select-none',
          thumb ? 'touch-none' : 'touch-pan-pinch',
        )}
        viewBox={`0 0 ${imgW} ${imgH}`}
        /** Thumbs: `meet` (like `object-contain`) so portrait SVG topos aren’t cropped; full view keeps `slice`. */
        preserveAspectRatio='xMidYMid meet'
        onClick={(e: MouseEvent<SVGSVGElement>) => {
          if (e.target === e.currentTarget && close) close();
        }}
        onMouseLeave={() => setProblemIdHovered?.(null)}
      >
        <image
          xlinkHref={getMediaFileUrl(m.id ?? 0, m.versionStamp ?? 0, false, {
            mediaRegion: mediaRegion ?? undefined,
          })}
          width='100%'
          height='100%'
        />
        {mediaSvgs}
        {routes && <g className={thumb ? undefined : 'buldreinfo-svg-sibling-fade'}>{routes}</g>}
      </svg>
    </div>
  );
};
