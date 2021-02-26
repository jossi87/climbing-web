import React from 'react';
import { parseSVG, makeAbsolute } from 'svg-path-parser';

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
      <rect fill="#000000" x={x-r} y={y-r} width={r*2} height={r*1.9} rx={r/3}/>
      <text dominantBaseline="central" textAnchor="middle" fontSize={0.015*w} fontWeight="bolder" fill="#FFFFFF" x={x} y={y}>{nr}</text>
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

export function parseReadOnlySvgs(readOnlySvgs, w, h) {
  const shapes = [];
  for (let svg of readOnlySvgs) {
    shapes.push(<path key={shapes.length} d={svg.path} className={"buldreinfo-svg-edit-opacity"} style={{fill: "none", stroke: "#000000"}} strokeWidth={0.003*w} strokeDasharray={0.006*w}/>);
    const commands = parseSVG(svg.path);
    makeAbsolute(commands); // Note: mutates the commands in place!
    shapes.push(generateSvgNrAndAnchor(commands, svg.nr, svg.hasAnchor, w, h));
    svg.anchors.map((a, i) => {
      shapes.push(<circle key={i} className="buldreinfo-svg-edit-opacity" fill="#000000" cx={a.x} cy={a.y} r={0.006*w} />);
    });
  }
  return shapes;
}
