import React from 'react';
import { parseSVG, makeAbsolute } from 'svg-path-parser';
import { getImageUrl } from '../../../api';
import { useHistory } from 'react-router-dom';
import { Descent, Rappel } from '../../../utils/svg-utils';

const Svg = ({ style, close, m, thumb, optProblemId }) => {
  const { outerWidth, outerHeight } = window;
  let history = useHistory();
  const minWindowScale = Math.min(outerWidth, outerHeight);
  const scale = Math.max(m.width, m.height, minWindowScale);

  function generateShapes(svgs, w, h) {
    return svgs.map((svg, key) => {
      const path: any = parseSVG(svg.path);
      makeAbsolute(path); // Note: mutates the commands in place!

      var gClassName = "buldreinfo-svg-pointer";
      if (optProblemId) {
        if (svg.problemId!=optProblemId) {
          gClassName += " buldreinfo-svg-opacity-low";
        } else {
          gClassName += " buldreinfo-svg-opacity-high";
        }
      }
      let strokeDasharray = null;
      if (svg.primary) {
        let x = thumb? 0.013 : 0.006;
        strokeDasharray = x*scale;
      }
      let groupColor;
      switch(svg.problemGradeGroup) {
        case 0: groupColor='#FFFFFF'; break;
        case 1: groupColor='#00FF00'; break;
        case 2: groupColor='#0000FF'; break;
        case 3: groupColor='#FFFF00'; break;
        case 4: groupColor='#FF0000'; break;
        case 5: groupColor='#FF00FF'; break;
        default: groupColor='#000000'; break;
      }
      let textColor = "#FFFFFF";
      if (svg.isTicked) {
        textColor = "#21ba45";
      } else if (svg.isTodo) {
        textColor = "#659DBD";
      } else if (svg.isDangerous) {
        textColor = "#FF0000";
      }

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
      const r = 0.01*scale*(thumb? 2 : 1);
      if (x < r) x = r;
      if (x > (w-r)) x = w-r;
      if (y < r) y = r;
      if (y > (h-r)) y = h-r;
      let anchors = [];
      if (svg.hasAnchor) {
        anchors.push(<circle key={key+"_1"} fill={"#000000"} cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.005*scale*(thumb? 4 : 1)}/>);
        anchors.push(<circle key={key+"_2"} fill={groupColor} cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.004*scale*(thumb? 4 : 1)}/>);
      }
      if (svg.anchors) {
        JSON.parse(svg.anchors).map((a, i) => {
          anchors.push(<circle key={i+"_1"} fill={"#000000"} cx={a.x} cy={a.y} r={0.005*scale*(thumb? 4 : 1)} />);
          anchors.push(<circle key={i+"_2"} fill={groupColor} cx={a.x} cy={a.y} r={0.004*scale*(thumb? 4 : 1)} />);
        });
      }
      let texts = svg.texts && JSON.parse(svg.texts).map((t, i) => (<text key={i} x={t.x} y={t.y} fontSize="5em" fill="red">{t.txt}</text>));
      return (
        <g className={gClassName} key={key} style={style} onClick={() => {
          if (close) {
            history.push("/problem/" + svg.problemId + "?idMedia=" + m.id);
          }
        }}>
          <path d={svg.path} style={{fill: "none", stroke: "#000000"}} strokeWidth={0.003*scale*(thumb? 4 : 1)} strokeDasharray={strokeDasharray} strokeLinecap="round"/>
          <path d={svg.path} style={{fill: "none", stroke: groupColor}} strokeWidth={0.0015*scale*(thumb? 4 : 1)} strokeDasharray={strokeDasharray} strokeLinecap="round"/>
          <rect fill="#000000" x={x-r} y={y-r} width={r*2} height={r*1.9} rx={r/3}/>
          <text dominantBaseline="central" textAnchor="middle" fontSize={0.015*scale*(thumb? 2 : 1)} fontWeight="bolder" fill={textColor} x={x} y={y}>{svg.nr}</text>
          {anchors}
          {texts}
        </g>
      );
    });
  }

  function generateMediaSvgShapes(mediaSvgs) {
    let res = [];
    if (mediaSvgs && mediaSvgs.length>0) {
      res = mediaSvgs.map((svg, key) => {
        if (svg.t==='PATH') {
          return Descent({path: svg.path, whiteNotBlack: true, scale, thumb, key});
        } else if (svg.t==='RAPPEL_BOLTED') {
          return Rappel({x: svg.rappelX, y: svg.rappelY, bolted: true, scale, thumb, stroke: "white", key});
        } else if (svg.t==='RAPPEL_NOT_BOLTED') {
          return Rappel({x: svg.rappelX, y: svg.rappelY, bolted: false, scale, thumb, stroke: "white", key});
        }
      });
    }
    return res;
  }
  
  let info;
  if (!thumb && optProblemId && optProblemId>0 && m.svgs.filter(x => x.problemId===optProblemId).length===1) {
    let svg = m.svgs.filter(x => x.problemId===optProblemId)[0];
    let text = `#${svg.nr} - ${svg.problemName} [${svg.problemGrade}]`;
    if (svg.problemSubtype) {
      text += " - " + svg.problemSubtype;
    }
    if (svg.isTicked) {
      text += " - Ticked";
    } else if (svg.isTodo) {
      text += " - In TODO-list";
    }
    if (svg.isDangerous) {
      text += " - Flagged as dangerous";
    }
    info = <text xmlSpace="preserve" dominantBaseline="text-before-edge" filter="url(#solid)" fontSize={0.02*scale} fontWeight="bolder" fill="white"> {text} </text>;
  }

  return (
    <>
      <canvas className="buldreinfo-svg-canvas" width={m.width} height={m.height} style={style}></canvas>
      <svg overflow="visible" className="buldreinfo-svg" viewBox={"0 0 " + m.width + " " + m.height} preserveAspectRatio="xMidYMid meet" onClick={(e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target instanceof SVGSVGElement && close) {
          close();
        }
      }}>
        <defs>
          <filter id="solid" x="0" y="0" width="1" height="1">
            <feFlood floodColor="#000000"/>
            <feComposite in="SourceGraphic"/>
          </filter>
        </defs>
        <image xlinkHref={getImageUrl(m.id, m.embedUrl)} width="100%" height="100%"/>
        {generateMediaSvgShapes(m.mediaSvgs)}
        {m.svgs &&
          <g key={optProblemId} className={thumb? "" : "buldreinfo-svg-sibling-fade"}>
            {generateShapes(m.svgs, m.width, m.height)}
          </g>
        }
        {info}
      </svg>
    </>
  )
}

export default Svg
