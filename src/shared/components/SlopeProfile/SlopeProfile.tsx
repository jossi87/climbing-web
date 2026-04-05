import type { Slope } from '../../../@types/buldreinfo';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import { getDistanceWithUnit } from '../Leaflet/geo-utils';
import { Download, Clock, Database, ArrowUpRight, ArrowDownRight, Ruler } from 'lucide-react';
import { useState, useLayoutEffect, useRef, useId } from 'react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type Props = {
  areaName?: string | null;
  sectorName?: string | null;
  slope: Slope;
  /** Smaller chart + stats strip (problem / sector map); on small screens matches the flush map card (no inset corners). */
  compact?: boolean;
  /** Shown inside the widget header (e.g. Approach / Descent). */
  title?: string;
  className?: string;
};

const createXmlString = (
  areaName: string,
  sectorName: string,
  coordinates: components['schemas']['Coordinates'][],
): string => {
  let result = '<?xml version="1.0" encoding="UTF-8"?>\r\n';
  result +=
    '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="BratteLinjer/Buldreinfo">\r\n';
  result += '<trk>\r\n';
  result += `\t<name>${areaName} - ${sectorName}</name>\r\n`;
  result += '\t<type>Running</type>\r\n';
  result += '\t<trkseg>\r\n';
  result += coordinates.reduce((accum, curr) => {
    const segmentTag = `\t\t<trkpt lat="${curr.latitude}" lon="${curr.longitude}"><ele>${curr.elevation}</ele></trkpt>\r\n`;
    return accum + segmentTag;
  }, '');
  result += '\t</trkseg>\r\n';
  result += '</trk>\r\n';
  result += '</gpx>';
  return result;
};

const downloadGpxFile = (areaName: string, sectorName: string, coordinates: components['schemas']['Coordinates'][]) => {
  const xml = createXmlString(areaName, sectorName, coordinates);
  const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(xml);
  const link = document.createElement('a');
  link.download = `${areaName}_${sectorName}`.replace(/[^a-z0-9]/gi, '_') + '_Slope.gpx';
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const SlopeProfile = ({ areaName = '', sectorName = '', slope, compact = false, title, className }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientId = useId().replace(/:/g, '');
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
  const sources = Array.from(new Set((slope.coordinates ?? []).map((a) => a.elevationSource))).join(', ');

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDims({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const icon = compact ? 10 : 12;
  const statText = compact ? 'text-[11px] leading-snug' : 'text-[12px] leading-snug';
  /** Brand gold — stroke strong enough to read on light + dark chart backgrounds. */
  const chartStroke = '#c6a15b';
  const chartFillTop = '#c6a15b';
  const chartFillBot = '#c6a15b';

  const sep = (
    <span className='text-slate-600 select-none' aria-hidden>
      ·
    </span>
  );

  const statsInner = (
    <>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <Ruler size={icon} className='text-brand/90 shrink-0' aria-hidden />
        <span>{getDistanceWithUnit(slope)}</span>
      </span>
      {sep}
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <ArrowUpRight size={icon} className='shrink-0 text-emerald-400/90' aria-hidden />
        <span className='tabular-nums'>{slope.elevationGain ?? 0}m</span>
      </span>
      {sep}
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <ArrowDownRight size={icon} className='shrink-0 text-rose-400/85' aria-hidden />
        <span className='tabular-nums'>{slope.elevationLoss ?? 0}m</span>
      </span>
      {sep}
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <Clock size={icon} className='shrink-0 text-sky-400/80' aria-hidden />
        <span className='tabular-nums'>{slope.calculatedDurationInMinutes ?? 0} min</span>
      </span>
      {sources ? (
        <>
          {sep}
          <span className='inline-flex max-w-full min-w-0 items-center gap-1 font-medium text-slate-500'>
            <Database size={icon} className='shrink-0 text-slate-500' aria-hidden />
            <span className='min-w-0 truncate' title={sources}>
              {sources}
            </span>
          </span>
        </>
      ) : null}
      {sep}
      <button
        type='button'
        onClick={() => downloadGpxFile(areaName ?? '', sectorName ?? '', slope.coordinates ?? [])}
        className='group text-brand/95 hover:bg-brand/12 hover:ring-brand/35 focus-visible:ring-brand/50 -mx-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold transition-colors hover:text-slate-100 hover:ring-1 focus-visible:ring-2 focus-visible:outline-none'
      >
        <Download
          size={icon}
          className='text-brand/95 shrink-0 transition-colors group-hover:text-slate-100'
          aria-hidden
        />
        GPX
      </button>
    </>
  );

  return (
    <div
      className={cn(
        'bg-surface-card overflow-hidden',
        compact
          ? 'max-sm:border-surface-border/70 max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:shadow-none sm:rounded-xl sm:border sm:border-white/[0.09] sm:shadow-sm sm:ring-1 sm:ring-white/[0.04]'
          : 'rounded-xl border border-white/[0.09] shadow-sm ring-1 ring-white/[0.04]',
        !compact && 'max-w-2xl',
        className,
      )}
    >
      {title ? (
        <div
          className={cn(
            'bg-surface-nav/40 border-b border-white/[0.07] py-1.5',
            compact ? 'px-2.5 sm:px-3.5' : 'px-3 sm:px-3.5',
          )}
        >
          <span
            className={cn(designContract.typography.micro, 'font-semibold tracking-[0.12em] text-slate-100 uppercase')}
          >
            {title}
          </span>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className={cn(
          'from-surface-nav/70 via-surface-card to-surface-nav/90 relative w-full overflow-hidden bg-gradient-to-b',
          compact ? 'aspect-[8/1] min-h-[2.75rem] sm:min-h-[3rem]' : 'aspect-[4/1] min-h-20 p-0.5',
        )}
      >
        {dims && (
          <AreaChart
            width={dims.width}
            height={dims.height}
            data={slope.coordinates ?? []}
            margin={{ top: 4, right: 0, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id={`slopeFill-${gradientId}`} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={chartFillTop} stopOpacity={0.2} />
                <stop offset='100%' stopColor={chartFillBot} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <Area
              dataKey='elevation'
              stroke={chartStroke}
              strokeWidth={compact ? 2 : 2.35}
              strokeOpacity={0.92}
              fill={`url(#slopeFill-${gradientId})`}
              isAnimationActive={false}
              dot={false}
            />
            <XAxis
              dataKey='distance'
              hide
              type='number'
              scale='linear'
              domain={['dataMin', 'dataMax']}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis dataKey='elevation' hide type='number' domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className='bg-surface-card/95 rounded-lg px-2.5 py-1.5 shadow-lg ring-1 ring-white/10 backdrop-blur-sm'>
                    <div className='flex gap-3 font-mono text-[10px] text-slate-300'>
                      <span>D: {parseInt(String(label ?? '0'))}m</span>
                      <span>E: {parseInt(String(payload[0].value ?? '0'))}m</span>
                    </div>
                  </div>
                );
              }}
            />
          </AreaChart>
        )}
      </div>

      <div
        className={cn(
          'border-surface-border/80 bg-surface-nav/35 border-t py-2 text-slate-200',
          compact ? 'px-2.5 sm:px-3' : 'px-2.5 sm:px-3',
          statText,
        )}
      >
        <div className='flex flex-wrap items-center gap-x-1.5 gap-y-1'>{statsInner}</div>
      </div>
    </div>
  );
};
