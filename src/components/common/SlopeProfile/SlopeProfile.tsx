import type { Slope } from '../../../@types/buldreinfo';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import { getDistanceWithUnit } from '../leaflet/geo-utils';
import { Download, Clock, Activity, Map, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState, useLayoutEffect, useRef } from 'react';

type Props = {
  areaName?: string | null;
  sectorName?: string | null;
  slope: Slope;
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

const downloadGpxFile = (
  areaName: string,
  sectorName: string,
  coordinates: components['schemas']['Coordinates'][],
) => {
  const xml = createXmlString(areaName, sectorName, coordinates);
  const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(xml);
  const link = document.createElement('a');
  link.download = `${areaName}_${sectorName}`.replace(/[^a-z0-9]/gi, '_') + '_Slope.gpx';
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const SlopeProfile = ({ areaName = '', sectorName = '', slope }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
  const sources = Array.from(new Set((slope.coordinates ?? []).map((a) => a.elevationSource))).join(
    ', ',
  );

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
    <div className='flex flex-col gap-2 w-full max-w-2xl'>
      <div
        ref={containerRef}
        className='bg-surface-nav/10 rounded-lg p-1 border border-surface-border/30 w-full aspect-4/1 min-h-20 relative overflow-hidden'
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
              strokeWidth={1.5}
              fill='url(#colorSlope)'
              isAnimationActive={false}
              dot={false}
            />
            <XAxis dataKey='distance' hide type='number' scale='linear' />
            <YAxis
              dataKey='elevation'
              hide
              type='number'
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className='bg-black/90 border border-white/10 rounded px-2 py-1 backdrop-blur-sm shadow-xl'>
                    <div className='text-[10px] text-white font-mono flex gap-3'>
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

      <div className='flex flex-wrap gap-1.5'>
        <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-300'>
          <Activity size={12} className='text-brand' />
          <span>{getDistanceWithUnit(slope)}</span>
        </div>

        <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-300'>
          <div className='flex gap-1 items-center'>
            <ArrowUpRight size={12} className='text-green-500' />
            <span className='text-white'>{slope.elevationGain ?? 0}m</span>
          </div>
          <div className='w-px h-3 bg-surface-border mx-1' />
          <div className='flex gap-1 items-center'>
            <ArrowDownRight size={12} className='text-red-500' />
            <span className='text-white'>{slope.elevationLoss ?? 0}m</span>
          </div>
        </div>

        <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-300'>
          <Clock size={12} className='text-blue-400' />
          <span>{slope.calculatedDurationInMinutes ?? 0} min</span>
        </div>

        {sources && (
          <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-300'>
            <Map size={12} className='text-slate-500' />
            <span>{sources}</span>
          </div>
        )}

        <button
          type='button'
          onClick={() => downloadGpxFile(areaName ?? '', sectorName ?? '', slope.coordinates ?? [])}
          className='inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-nav border border-surface-border text-[10px] font-black uppercase text-slate-400 hover:text-white hover:border-brand/50 transition-all'
        >
          <Download size={12} /> GPX
        </button>
      </div>
    </div>
  );
};
