import React from 'react';
import { parseSVG, makeAbsolute } from 'svg-path-parser';
import { neverGuard } from './neverGuard';
import { MediaRegion } from './svg-scaler';
import { Descent, Rappel } from './svg-utils';

export type Point = {
  x: number;
  y: number;
};

export type CubicPoint = Point & {
  c: [Point, Point];
};

export type QuadraticPoint = Point & {
  q: Point;
};

export type Arc = Point & {
  a: {
    rx: number;
    ry: number;
    rot: number;
    laf: number;
    sf: number;
  };
};

export type ParsedEntry = Point | CubicPoint | QuadraticPoint | Arc;

export const isCubicPoint = (p: ParsedEntry): p is CubicPoint => {
  return !!(p as CubicPoint).c;
};

export const isQuadraticPoint = (p: ParsedEntry): p is QuadraticPoint => {
  return !!(p as QuadraticPoint).q;
};

export const isArc = (p: ParsedEntry): p is Arc => {
  return !!(p as Arc).a;
};

export const isPoint = (p: ParsedEntry): p is Point => {
  return !isCubicPoint(p) && !isQuadraticPoint(p) && !isArc(p);
};

export function parsePath(d: string, mediaRegion?: MediaRegion): ParsedEntry[] {
  if (!d) {
    return [];
  }
  const deltaX = mediaRegion?.x ?? 0;
  const deltaY = mediaRegion?.y ?? 0;

  const commands = makeAbsolute(parseSVG(d)); // Note: mutates the commands in place!
  const res = commands
    .map<ParsedEntry | undefined>((c) => {
      const { code } = c;
      switch (code) {
        case 'L':
        case 'M':
          return { x: Math.round(c.x + deltaX), y: Math.round(c.y + deltaY) };
        case 'C':
          return {
            x: Math.round(c.x + deltaX),
            y: Math.round(c.y + deltaY),
            c: [
              { x: Math.round(c.x1 + deltaX), y: Math.round(c.y1 + deltaY) },
              { x: Math.round(c.x2 + deltaX), y: Math.round(c.y2 + deltaY) },
            ],
          };
        case 'S':
          return {
            x: Math.round(c.x + deltaX),
            y: Math.round(c.y + deltaY),
            c: [
              { x: Math.round(c.x0 + deltaX), y: Math.round(c.y0 + deltaY) },
              { x: Math.round(c.x2 + deltaX), y: Math.round(c.y2 + deltaY) },
            ],
          };

        case 'Z':
        case 'A':
        case 'H':
        case 'Q':
        case 'T':
        case 'V': {
          return undefined;
        }

        default: {
          return neverGuard(code, undefined);
        }
      }
    })
    .filter((v): v is ParsedEntry => !!v);

  // Reverse path if drawn incorrect direction
  if (res.length < 2 || res[0].y >= res[res.length - 1].y) {
    return res;
  }

  const reversed: typeof res = [];
  for (let i = res.length - 1; i >= 0; i--) {
    const p = res[i];
    const prevP = i != res.length - 1 ? res[i + 1] : undefined;
    if (prevP && isCubicPoint(prevP)) {
      reversed.push({
        x: p.x,
        y: p.y,
        c: [
          { x: prevP.c[1].x, y: prevP.c[1].y },
          { x: prevP.c[0].x, y: prevP.c[0].y },
        ],
      });
    } else {
      reversed.push({ x: p.x, y: p.y });
    }
  }
  return reversed;
}

export type SvgType = {
  path: string;
  anchors: { x: number; y: number }[];
  nr: number;
  pitch: number;
  hasAnchor: boolean;
} & (
  | { t: 'PATH' }
  | (({ t: 'RAPPEL_BOLTED' } | { t: 'RAPPEL_NOT_BOLTED' }) & {
      rappelX: number;
      rappelY: number;
    })
  | { t: 'other' }
);

export function generateSvgNrAndAnchor(
  key: string,
  path: { x: number; y: number }[],
  nr: string | number,
  hasAnchor: boolean,
  w: number,
  h: number,
) {
  let ixNr: number | undefined = undefined;
  let maxY = 0;
  let ixAnchor: number | undefined = undefined;
  let minY = 99999999;
  for (let i = 0, len = path.length; i < len; i++) {
    if (path[i].y > maxY) {
      ixNr = i;
      maxY = path[i].y;
    }
    if (path[i].y < minY) {
      ixAnchor = i;
      minY = path[i].y;
    }
  }
  if (ixNr === undefined) {
    return null;
  }

  if (ixAnchor === undefined) {
    return null;
  }

  let x = path[ixNr].x;
  let y = path[ixNr].y;
  const r = 0.012 * w;
  if (x < r) x = r;
  if (x > w - r) x = w - r;
  if (y < r) y = r;
  if (y > h - r) y = h - r;
  let anchor: React.JSX.Element | null = null;
  if (hasAnchor === true) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    anchor = <circle fill='#E2011A' cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.006 * w} />;
  }
  return (
    <g key={key} className='buldreinfo-svg-edit-opacity'>
      {nr && (
        <>
          <rect fill='#000000' x={x - r} y={y - r} width={r * 2} height={r * 1.9} rx={r / 3} />
          <text
            dominantBaseline='central'
            textAnchor='middle'
            fontSize={0.015 * w}
            fontWeight='bolder'
            fill='#FFFFFF'
            x={x}
            y={y}
          >
            {nr}
          </text>
        </>
      )}
      {hasAnchor && (
        <circle fill={'#000000'} cx={path[ixAnchor].x} cy={path[ixAnchor].y} r={0.005 * w} />
      )}
    </g>
  );
}

export function parseReadOnlySvgs(readOnlySvgs: SvgType[], w: number, h: number, scale: number) {
  const backgroundColor = 'black';
  const color = 'white';
  const shapes = readOnlySvgs.reduce<React.ReactNode[]>((acc, svg) => {
    const { t } = svg;
    switch (t) {
      case 'PATH': {
        return [
          ...acc,
          <Descent
            key={svg.path}
            path={svg.path}
            whiteNotBlack={true}
            scale={scale}
            thumb={false}
          />,
        ];
      }
      case 'RAPPEL_BOLTED':
      case 'RAPPEL_NOT_BOLTED': {
        return [
          ...acc,
          <Rappel
            key={[svg.rappelX, svg.rappelY].join('x')}
            x={svg.rappelX}
            y={svg.rappelY}
            bolted={t === 'RAPPEL_BOLTED'}
            scale={scale}
            thumb={false}
            backgroundColor={backgroundColor}
            color={color}
          />,
        ];
      }
      default: {
        const commands = makeAbsolute(parseSVG(svg.path)); // Note: mutates the commands in place!
        return [
          ...acc,
          generateSvgNrAndAnchor(
            svg.nr + '_' + svg.pitch + '_path',
            commands as Parameters<typeof generateSvgNrAndAnchor>[1],
            svg.nr,
            svg.hasAnchor,
            w,
            h,
          ),
          <path
            key={svg.path}
            d={svg.path}
            className={'buldreinfo-svg-edit-opacity'}
            style={{ fill: 'none', stroke: '#000000' }}
            strokeWidth={0.003 * w}
            strokeDasharray={0.006 * w}
          />,
          ...svg.anchors.map((a) => (
            <circle
              key={`${a.x}x${a.y}`}
              className='buldreinfo-svg-edit-opacity'
              fill='#000000'
              cx={a.x}
              cy={a.y}
              r={0.006 * w}
            />
          )),
        ];
      }
    }
  }, []);
  return shapes;
}
