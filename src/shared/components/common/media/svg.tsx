import React from 'react';
import { parseSVG, makeAbsolute } from 'svg-path-parser';
import { getImageUrl } from '../../../api';
import { RouteComponentProps, withRouter } from 'react-router';

interface SvgProps extends RouteComponentProps<any> {
  style: any,
  close?: Function,
  m: any,
  thumb: boolean
}

function Svg({style, close, m, thumb, history}) {
  function generateShapes(svgs, svgProblemId, w, h) {
    return svgs.map((svg, key) => {
      const path: any = parseSVG(svg.path);
      makeAbsolute(path); // Note: mutates the commands in place!
      var ixNr;
      var maxY = 0;
      var ixAnchor;
      var minY = 99999999;
      for (var i=0, len=path.length; i < len; i++) {
        if (path[i].y > maxY) {
          ixNr = i;
          maxY = path[i].y;
        }
        if (path[i].y < minY) {
          ixAnchor = i;
          minY = path[i].y;
        }
      }
      var x = path[ixNr].x;
      var y = path[ixNr].y;
      const r = 0.012*w;
      if (x < r) x = r;
      if (x > (w-r)) x = w-r;
      if (y < r) y = r;
      if (y > (h-r)) y = h-r;
      var anchor = null;
      if (svg.hasAnchor) {
        anchor = <circle className="buldreinfo-svg-ring" cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.006*w}/>
      }
      var factor = 1;
      var gClassName = "buldreinfo-svg-pointer buldreinfo-svg-hover";
      if (!(svgProblemId===0 || svg.problemId===svgProblemId)) {
        gClassName += " buldreinfo-svg-opacity";
      } else if (thumb) {
        factor = 2;
      }
      return (
        <g className={gClassName} key={key} style={style} onClick={() => {
          if (close) {
            history.push("/problem/" + svg.problemId);
            close();
          }
        }}>
          <path d={svg.path} className="buldreinfo-svg-route" strokeWidth={0.003*w*factor} strokeDasharray={factor>1? null : 0.006*w}/>
          <circle className="buldreinfo-svg-ring" cx={x} cy={y} r={r}/>
          <text className="buldreinfo-svg-routenr" x={x} y={y} fontSize={0.02*w} dy=".3em">{svg.nr}</text>
          {anchor}
        </g>
      );
    });
  }

  return (
    <>
      <canvas className="buldreinfo-svg-canvas-ie-hack" width={m.width} height={m.height} style={style}></canvas>
      <svg className="buldreinfo-svg" viewBox={"0 0 " + m.width + " " + m.height} preserveAspectRatio="xMidYMid meet" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target instanceof SVGSVGElement) {
          close();
        }
      }}>
        <image xlinkHref={getImageUrl(m.id)} width="100%" height="100%"/>
        {generateShapes(m.svgs, m.svgProblemId, m.width, m.height)}
      </svg>
    </>
  )
}

// @ts-ignore TODO remove ignore when @types/React includes React 16.6
export default withRouter<SvgProps>(React.memo(Svg))
