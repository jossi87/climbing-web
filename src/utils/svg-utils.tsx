import React from 'react';
import { parseSVG, makeAbsolute } from 'svg-path-parser';
import { svgPathProperties } from "svg-path-properties";

export function Descent({path, whiteNotBlack, scale, thumb, key}) {
  const properties = new svgPathProperties(path);
  const deltaPercent = (scale/properties.getTotalLength())*(thumb? 3 : 2);
  let texts = [];
  for (var i = 0; i <= 100; i+=deltaPercent) {
    texts.push(<textPath xlinkHref={"#descent" + key} startOffset={i+"%"}>➤</textPath>);
  }
  const fontSize = 0.012*scale*(thumb? 2 : 1);
  return (
    <g opacity={0.9} key={key}>
      <path id={"descent" + key} style={{fill: "none"}} strokeWidth={0} d={path}/>
      <text fontSize={fontSize} fontWeight="bolder" style={{ fill: whiteNotBlack? 'black' : 'white', dominantBaseline: 'central'}}>{texts}</text>
      <text fontSize={fontSize} style={{ fill: whiteNotBlack? 'white' : 'black', dominantBaseline: 'central'}}>{texts}</text>
    </g>
  )
}

export function Rappel({x, y, bolted, scale, thumb, stroke, key}) {
  const strokeWidth = 0.0015*scale*(thumb? 2 : 1);
  const r = 0.005*scale*(thumb? 2 : 1);
  return (
    <g opacity={0.9} key={key}>
      {bolted?
        <circle strokeLinecap="round" cx={x} cy={y} r={r} fill="none" strokeWidth={strokeWidth} stroke={stroke} />
      :
        <>
          <line strokeLinecap="round" x1={x-r} y1={y-r} x2={x+r} y2={y-r} strokeWidth={strokeWidth} stroke={stroke} />
          <line strokeLinecap="round" x1={x-r} y1={y-r} x2={x} y2={y+(r*0.8)} strokeWidth={strokeWidth} stroke={stroke} />
          <line strokeLinecap="round" x1={x+r} y1={y-r} x2={x} y2={y+(r*0.8)} strokeWidth={strokeWidth} stroke={stroke} />
        </>
      }
      <line strokeLinecap="round" x1={x} y1={y+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke={stroke} />
      <line strokeLinecap="round" x1={x-r} y1={y+r+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke={stroke} />
      <line strokeLinecap="round" x1={x+r} y1={y+r+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke={stroke} />
    </g>
  );
}

function generateSvgNrAndAnchor(path, nr, hasAnchor, w, h) {
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
  if (hasAnchor === true) {
    anchor = <circle fill="#E2011A" cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.006*w}/>
  }
  return (
    <g className="buldreinfo-svg-edit-opacity">
      {nr &&
        <>
          <rect fill="#000000" x={x-r} y={y-r} width={r*2} height={r*1.9} rx={r/3}/>
          <text dominantBaseline="central" textAnchor="middle" fontSize={0.015*w} fontWeight="bolder" fill="#FFFFFF" x={x} y={y}>{nr}</text>
        </>
      }
      {hasAnchor && (
        <circle fill={"#000000"} cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.005*w}/>
      )}
    </g>
  );
}

export function parsePath(d) {
  if (d) {
    const commands: any = parseSVG(d);
    makeAbsolute(commands); // Note: mutates the commands in place!
    return commands.map(c => {
      switch (c.code) {
        case "L": case "M": return { x: Math.round(c.x), y: Math.round(c.y) };
        case "C": return { x: Math.round(c.x), y: Math.round(c.y), c: [{x: Math.round(c.x1), y: Math.round(c.y1)}, {x: Math.round(c.x2), y: Math.round(c.y2)}] };
        case "S": return { x: Math.round(c.x), y: Math.round(c.y), c: [{x: Math.round(c.x0), y: Math.round(c.y0)}, {x: Math.round(c.x2), y: Math.round(c.y2)}] };
      }
    });
  }
  return [];
}

export function parseReadOnlySvgs(readOnlySvgs, w, h, minWindowScale) {
  const shapes = [];
  const stroke = "white";
  const scale = Math.max(w, h, minWindowScale);
  for (let svg of readOnlySvgs) {
    if (svg.t==='PATH') {
      shapes.push(Descent({path: svg.path, whiteNotBlack: true, scale, thumb: false, key: shapes.length}));
    } else if (svg.t==="RAPPEL_BOLTED" || svg.t==='RAPPEL_NOT_BOLTED') {
      shapes.push(Rappel({x: svg.rappelX, y: svg.rappelY, bolted: svg.t==='RAPPEL_BOLTED', scale, thumb: false, stroke, key: shapes.length}));
    } else {
      shapes.push(<path key={shapes.length} d={svg.path} className={"buldreinfo-svg-edit-opacity"} style={{fill: "none", stroke: "#000000"}} strokeWidth={0.003*w} strokeDasharray={0.006*w}/>);
      const commands = parseSVG(svg.path);
      makeAbsolute(commands); // Note: mutates the commands in place!
      shapes.push(generateSvgNrAndAnchor(commands, svg.nr, svg.hasAnchor, w, h));
      svg.anchors.map((a, i) => {
        shapes.push(<circle key={i} className="buldreinfo-svg-edit-opacity" fill="#000000" cx={a.x} cy={a.y} r={0.006*w} />);
      });
    }
  }
  return shapes;
}
