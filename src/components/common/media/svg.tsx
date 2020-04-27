import React from 'react';
import { parseSVG, makeAbsolute } from 'svg-path-parser';
import { getImageUrl } from '../../../api';
import { useHistory } from 'react-router-dom';

const Svg = ({ style, close, m, thumb, useBlueNotRed }) => {
  let history = useHistory();

  function generateShapes(svgs, svgProblemId, w, h) {
    return svgs.map((svg, key) => {
      const imgMax = Math.max(w, h);
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
      const r = 0.012*imgMax;
      if (x < r) x = r;
      if (x > (w-r)) x = w-r;
      if (y < r) y = r;
      if (y > (h-r)) y = h-r;
      let anchors = [];
      if (svg.hasAnchor) {
        anchors.push(<circle key={key} className={useBlueNotRed? "buldreinfo-svg-ring-blue" : "buldreinfo-svg-ring-red"} cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.006*imgMax}/>);
      }
      if (svg.anchors) {
        JSON.parse(svg.anchors).map((a, i) => {
          anchors.push(<circle key={i} className={useBlueNotRed? "buldreinfo-svg-ring-blue" : "buldreinfo-svg-ring-red"} cx={a.x} cy={a.y} r={0.006*imgMax} />);
        });
      }
      let texts = svg.texts && JSON.parse(svg.texts).map((t, i) => (<text key={i} x={t.x} y={t.y} fontSize="5em" fill={useBlueNotRed? "blue" : "red"}>{t.txt}</text>));
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
          <path d={svg.path} className={useBlueNotRed? "buldreinfo-svg-route-blue" : "buldreinfo-svg-route-red"} strokeWidth={0.003*imgMax*factor} strokeDasharray={factor>1? null : 0.006*imgMax}/>
          <circle className={useBlueNotRed? "buldreinfo-svg-ring-blue" : "buldreinfo-svg-ring-red"} cx={x} cy={y} r={r}/>
          <text className="buldreinfo-svg-routenr" x={x} y={y} fontSize={0.02*imgMax} dy=".3em">{svg.nr}</text>
          {anchors}
          {texts}
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

export default Svg
