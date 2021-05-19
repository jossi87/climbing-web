import React from 'react';
import { svgPathProperties } from "svg-path-properties";

export function Descent({path, scale, thumb, key}) {
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
      <text fontSize={fontSize} fontWeight="bolder" style={{ fill: 'black', dominantBaseline: 'central'}}>{texts}</text>
      <text fontSize={fontSize} style={{ fill: 'white', dominantBaseline: 'central'}}>{texts}</text>
    </g>
  )
}

export function Rappel({x, y, bolted, scale, thumb, stroke, key}) {
  const strokeWidth = 0.0015*scale*(thumb? 2 : 1);
  const r = 0.005*scale*(thumb? 2 : 1);
  return (
    <g opacity={0.9} strokeLinecap="round" key={key}>
      <circle cx={x} cy={y} r={r} fill="none" strokeWidth={strokeWidth} stroke={stroke} />
      <line x1={x-r} y1={y} x2={x+r} y2={y} strokeWidth={strokeWidth} stroke={stroke} />
      {bolted && <line x1={x} y1={y-r} x2={x} y2={y+r} strokeWidth={strokeWidth} stroke={stroke} />}
      <line x1={x} y1={y+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke={stroke} />
      <line x1={x-r} y1={y+r+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke={stroke} />
      <line x1={x+r} y1={y+r+r} x2={x} y2={y+r+r+r} strokeWidth={strokeWidth} stroke={stroke} />
    </g>
  );
}