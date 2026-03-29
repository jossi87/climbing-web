import type { Slope } from '../../../@types/buldreinfo';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import { getDistanceWithUnit } from '../Leaflet/geo-utils';
import { Download, Clock, Activity, Map, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState, useLayoutEffect, useRef } from 'react';
import { cn } from '../../../lib/utils';

type Props = {
  areaName?: string | null;
  sectorName?: string | null;
  slope: Slope;
  /** Smaller chart + badges (e.g. problem page terrain strip). */
  compact?: boolean;
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

export const SlopeProfile = ({ areaName = '', sectorName = '', slope, compact = false, className }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-2', compact ? 'gap-1.5' : 'max-w-2xl', className)}>
      <div
        ref={containerRef}
        className={cn(
          'bg-surface-nav/10 border-surface-border/30 relative w-full overflow-hidden rounded-lg border',
          compact ? 'aspect-6/1 min-h-11 p-0.5 sm:min-h-12' : 'aspect-4/1 min-h-20 p-1',
        )}
      >
        {dims && (
          <AreaChart
            width={dims.width}
            height={dims.height}
            data={slope.coordinates ?? []}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id='colorSlope' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.2} />
                <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey='elevation'
              stroke='#3b82f6'
              strokeWidth={compact ? 1.25 : 1.5}
              fill='url(#colorSlope)'
              isAnimationActive={false}
              dot={false}
            />
            <XAxis dataKey='distance' hide type='number' scale='linear' />
            <YAxis dataKey='elevation' hide type='number' domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className='rounded border border-white/10 bg-black/90 px-2 py-1 shadow-xl backdrop-blur-sm'>
                    <div className='flex gap-3 font-mono text-[10px]'>
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

      <div className={cn('flex flex-wrap', compact ? 'gap-1' : 'gap-1.5')}>
        <div
          className={cn(
            'bg-surface-nav border-surface-border inline-flex items-center gap-1.5 rounded-md border font-bold text-slate-300',
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'gap-2 rounded-lg px-2.5 py-1 text-[10px]',
          )}
        >
          <Activity size={compact ? 10 : 12} className='text-brand' />
          <span>{getDistanceWithUnit(slope)}</span>
        </div>

        <div
          className={cn(
            'bg-surface-nav border-surface-border inline-flex items-center gap-2 rounded-md border font-bold text-slate-300',
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'rounded-lg px-2.5 py-1 text-[10px]',
          )}
        >
          <div className='flex items-center gap-0.5'>
            <ArrowUpRight size={compact ? 10 : 12} className='text-green-500' />
            <span>{slope.elevationGain ?? 0}m</span>
          </div>
          <div className={cn('bg-surface-border w-px', compact ? 'mx-0.5 h-2.5' : 'mx-1 h-3')} />
          <div className='flex items-center gap-0.5'>
            <ArrowDownRight size={compact ? 10 : 12} className='text-red-500' />
            <span>{slope.elevationLoss ?? 0}m</span>
          </div>
        </div>

        <div
          className={cn(
            'bg-surface-nav border-surface-border inline-flex items-center gap-1.5 rounded-md border font-bold text-slate-300',
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'gap-2 rounded-lg px-2.5 py-1 text-[10px]',
          )}
        >
          <Clock size={compact ? 10 : 12} className='text-blue-400' />
          <span>{slope.calculatedDurationInMinutes ?? 0} min</span>
        </div>

        {sources && (
          <div
            className={cn(
              'bg-surface-nav border-surface-border inline-flex items-center gap-1.5 rounded-md border font-bold text-slate-300',
              compact ? 'px-1.5 py-0.5 text-[9px]' : 'gap-2 rounded-lg px-2.5 py-1 text-[10px]',
            )}
          >
            <Map size={compact ? 10 : 12} className='text-slate-500' />
            <span>{sources}</span>
          </div>
        )}

        <button
          type='button'
          onClick={() => downloadGpxFile(areaName ?? '', sectorName ?? '', slope.coordinates ?? [])}
          className={cn(
            'bg-surface-nav border-surface-border hover:border-brand/50 inline-flex items-center font-black uppercase opacity-80 transition-all hover:opacity-100',
            compact
              ? 'gap-1 rounded-md border px-1.5 py-0.5 text-[8px]'
              : 'gap-2 rounded-lg border px-2.5 py-1 text-[10px]',
          )}
        >
          <Download size={compact ? 10 : 12} /> GPX
        </button>
      </div>
    </div>
  );
};
