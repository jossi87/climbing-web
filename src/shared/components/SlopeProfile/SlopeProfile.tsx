import type { Slope } from '../../../@types/buldreinfo';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import { getDistanceWithUnit } from '../Leaflet/geo-utils';
import { SLOPE_APPROACH_COLOR, SLOPE_DESCENT_COLOR } from '../../slopePolylineColors';
import { Download, Clock, Database, ArrowUpRight, ArrowDownRight, Ruler } from 'lucide-react';
import { useState, useLayoutEffect, useRef, useId } from 'react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type Props = {
  areaName?: string | null;
  sectorName?: string | null;
  slope: Slope;
  /** Shallow chart + stats strip (problem / sector map tab); parent grid is full width below sm, half-width columns from sm. */
  compact?: boolean;
  /** Shown inside the widget header (e.g. Approach / Descent). */
  title?: string;
  /** Matches Leaflet polyline hue: green approach, violet descent. */
  variant?: 'approach' | 'descent';
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

export const SlopeProfile = ({
  areaName = '',
  sectorName = '',
  slope,
  compact = false,
  title,
  variant,
  className,
}: Props) => {
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
  const statText = compact ? 'text-[12px] leading-snug' : 'text-[13px] leading-snug';
  const lineColor =
    variant === 'approach' ? SLOPE_APPROACH_COLOR : variant === 'descent' ? SLOPE_DESCENT_COLOR : '#c9ac62';
  const chartStroke = lineColor;
  const chartFillTop = lineColor;
  const chartFillBot = lineColor;

  const statsInner = (
    <>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <Ruler size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
        <span>{getDistanceWithUnit(slope)}</span>
      </span>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <ArrowUpRight size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
        <span className='tabular-nums'>{slope.elevationGain ?? 0}m</span>
      </span>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <ArrowDownRight size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
        <span className='tabular-nums'>{slope.elevationLoss ?? 0}m</span>
      </span>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <Clock size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
        <span className='tabular-nums'>{slope.calculatedDurationInMinutes ?? 0} min</span>
      </span>
      {sources ? (
        <>
          <span className='inline-flex max-w-full min-w-0 items-center gap-1 font-medium text-slate-100'>
            <Database size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
            <span className='min-w-0 truncate' title={sources}>
              {sources}
            </span>
          </span>
        </>
      ) : null}
      <button
        type='button'
        onClick={() => downloadGpxFile(areaName ?? '', sectorName ?? '', slope.coordinates ?? [])}
        className={cn(
          'group inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold transition-[background-color,border-color,color] focus-visible:ring-2 focus-visible:outline-none',
          'border-brand-border/55 bg-brand/12 text-brand hover:border-brand-border hover:bg-brand/22 hover:text-brand',
          'focus-visible:ring-brand-border/60 light:border-brand-border light:bg-brand light:text-[color:var(--color-brand-foreground)] light:hover:bg-[#d8bb70] light:hover:text-[color:var(--color-brand-foreground)]',
        )}
      >
        <Download size={icon} className='shrink-0 text-inherit transition-colors' aria-hidden />
        GPX
      </button>
    </>
  );

  return (
    <div
      className={cn(
        'bg-surface-card overflow-hidden',
        compact
          ? 'max-sm:border-surface-border/70 sm:border-surface-border max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:shadow-none sm:rounded-xl sm:shadow-sm'
          : 'border-surface-border rounded-xl border shadow-sm',
        !compact && 'max-w-2xl',
        className,
      )}
    >
      {title ? (
        <div
          className={cn(
            'bg-surface-raised border-surface-border/50 border-b py-1.5',
            compact ? 'px-2.5 sm:px-3.5' : 'px-3 sm:px-3.5',
          )}
        >
          <span
            className={cn(designContract.typography.micro, 'font-semibold tracking-[0.12em] text-slate-200 uppercase')}
          >
            {title}
          </span>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className={cn(
          'from-surface-card via-surface-raised to-surface-card relative w-full overflow-hidden bg-gradient-to-b',
          /** Compact: short strip — mobile follows full width below; from sm each card sits in one grid column (~half main). */
          compact ? 'aspect-[12/2.5] sm:aspect-[20/2.5]' : 'aspect-[5/2] min-h-[4.75rem] p-0.5 sm:min-h-[5.25rem]',
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
                  <div className='bg-surface-card ring-surface-border/50 rounded-lg px-2.5 py-1.5 shadow-lg ring-1'>
                    <div className='flex gap-3 font-mono text-[11px] text-slate-300'>
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
          'border-surface-border/80 bg-surface-raised border-t py-2 text-slate-200',
          compact ? 'px-2.5 sm:px-3' : 'px-2.5 sm:px-3',
          statText,
        )}
      >
        <div className='flex flex-wrap items-center gap-x-1.5 gap-y-1'>{statsInner}</div>
      </div>
    </div>
  );
};
