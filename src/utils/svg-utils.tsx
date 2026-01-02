import { SVGProps, JSX } from 'react';
import { svgPathProperties } from 'svg-path-properties';

type DescentProps = {
  path: SVGProps<SVGPathElement>['d'];
  whiteNotBlack: boolean;
  scale: number;
  thumb: boolean;
};

export function Descent({ path, whiteNotBlack, scale, thumb }: DescentProps) {
  if (!path || typeof path !== 'string' || path.trim().length === 0) {
    return null;
  }

  try {
    const properties = new svgPathProperties(path);
    const totalLength = properties.getTotalLength();

    if (!totalLength || !isFinite(totalLength)) {
      return null;
    }

    const descentKey = path.replace(/\s/g, ''); // Key cannot contains spaces
    const deltaPercent = ((scale * 1000) / totalLength) * (thumb ? 6 : 3);
    const texts: JSX.Element[] = [];
    for (let i = 0; i <= 100; i += deltaPercent) {
      texts.push(
        <textPath key={i} xlinkHref={'#descent' + descentKey} startOffset={i + '%'}>
          ➤
        </textPath>,
      );
    }
    const fontSize = 20 * scale * (thumb ? 2 : 1);
    return (
      <g opacity={0.9} key={path}>
        <path id={'descent' + descentKey} style={{ fill: 'none' }} strokeWidth={0} d={path} />
        <text
          fontSize={fontSize}
          fontWeight='bolder'
          style={{
            fill: whiteNotBlack ? 'black' : 'white',
            dominantBaseline: 'central',
          }}
        >
          {texts}
        </text>
        <text
          fontSize={fontSize}
          style={{
            fill: whiteNotBlack ? 'white' : 'black',
            dominantBaseline: 'central',
          }}
        >
          {texts}
        </text>
      </g>
    );
  } catch (error) {
    // Invalid SVG path data, return null to prevent crash
    console.warn('Invalid SVG path data:', path, error);
    return null;
  }
}

type AnchorProps = Pick<SVGProps<SVGCircleElement>, 'strokeWidth' | 'stroke'> & {
  bolted: boolean;
  r: number;
  x: number;
  y: number;
};

function Anchor({ strokeWidth, r, x, y, bolted, stroke }: AnchorProps) {
  return (
    <g opacity={0.9}>
      {bolted ? (
        <circle
          strokeLinecap='round'
          cx={x}
          cy={y}
          r={r}
          fill='none'
          strokeWidth={strokeWidth}
          stroke={stroke}
        />
      ) : (
        <>
          <line
            strokeLinecap='round'
            x1={x - r}
            y1={y - r}
            x2={x + r}
            y2={y - r}
            strokeWidth={strokeWidth}
            stroke={stroke}
          />
          <line
            strokeLinecap='round'
            x1={x - r}
            y1={y - r}
            x2={x}
            y2={y + r * 0.8}
            strokeWidth={strokeWidth}
            stroke={stroke}
          />
          <line
            strokeLinecap='round'
            x1={x + r}
            y1={y - r}
            x2={x}
            y2={y + r * 0.8}
            strokeWidth={strokeWidth}
            stroke={stroke}
          />
        </>
      )}
      <line
        strokeLinecap='round'
        x1={x}
        y1={y + r}
        x2={x}
        y2={y + r + r + r}
        strokeWidth={strokeWidth}
        stroke={stroke}
      />
      <line
        strokeLinecap='round'
        x1={x - r}
        y1={y + r + r}
        x2={x}
        y2={y + r + r + r}
        strokeWidth={strokeWidth}
        stroke={stroke}
      />
      <line
        strokeLinecap='round'
        x1={x + r}
        y1={y + r + r}
        x2={x}
        y2={y + r + r + r}
        strokeWidth={strokeWidth}
        stroke={stroke}
      />
    </g>
  );
}

type RappelProps = Omit<AnchorProps, 'r'> & {
  scale: number;
  backgroundColor: string;
  thumb: boolean;
  color: string;
};

export function Rappel({ x, y, bolted, scale, thumb, backgroundColor, color }: RappelProps) {
  const strokeWidth = 3 * scale * (thumb ? 3 : 1);
  const r = 6 * scale * (thumb ? 3 : 1);
  return (
    <g key={[x, y, bolted].join('/')}>
      {Anchor({
        strokeWidth: strokeWidth * 2,
        r,
        x,
        y,
        bolted,
        stroke: backgroundColor,
      })}
      {Anchor({ strokeWidth, r, x, y, bolted, stroke: color })}
    </g>
  );
}
// This file now only contains React components (Descent, Anchor, Rappel)
