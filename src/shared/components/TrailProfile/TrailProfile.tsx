import type { components } from '../../../@types/buldreinfo/swagger';
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Download,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Ruler,
  MapPin,
  ImageIcon,
  Database,
  Share2,
} from 'lucide-react';
import { shareCoordinates } from '../../../utils/shareCoordinates';
import { googleMapsSearchUrl } from '../../../utils/googleMaps';
import { useState, useLayoutEffect, useRef, useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { Markdown } from '../Markdown/Markdown';
import { useMeta } from '../Meta/context';
import Media from '../Media/Media';
import { getTrailColor } from '../../slopePolylineColors';
import { getDistanceWithUnit } from '../Leaflet/geo-utils';

type Trail = components['schemas']['Trail'];

type Props = {
  areaName?: string | null;
  sectorName?: string | null;
  sectorId?: number;
  trail: Trail;
  /** Shallow chart + stats strip (problem / sector map tab); parent grid is full width below sm, half-width columns from sm. */
  compact?: boolean;
  /** Whether this trail is a descent (affects color). */
  isDescent?: boolean;
  /** Zero-based index among all descent trails (for color differentiation). */
  descentIndex?: number;
  className?: string;
};

const createXmlString = (
  areaName: string,
  sectorName: string,
  title: string,
  coordinates: components['schemas']['Coordinates'][],
): string => {
  let result = '<?xml version="1.0" encoding="UTF-8"?>\r\n';
  result +=
    '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="BratteLinjer/Buldreinfo">\r\n';
  result += '<trk>\r\n';
  result += `\t<name>${areaName} - ${sectorName} - ${title}</name>\r\n`;
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
  title: string,
  coordinates: components['schemas']['Coordinates'][],
) => {
  const xml = createXmlString(areaName, sectorName, title, coordinates);
  const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(xml);
  const link = document.createElement('a');
  link.download = `${areaName}_${sectorName}_${title}`.replace(/[^a-z0-9]/gi, '_') + '_Trail.gpx';
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const TrailProfile = ({
  areaName = '',
  sectorName = '',
  trail,
  compact = false,
  isDescent = false,
  descentIndex = 0,
  className,
}: Props) => {
  const meta = useMeta();
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientId = useId().replace(/:/g, '');
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
  const sources = Array.from(new Set((trail.path ?? []).map((a) => a.elevationSource)))
    .filter(Boolean)
    .join(', ');

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

  const icon = compact ? 9 : 10;
  const lineColor = getTrailColor(!!isDescent, descentIndex ?? 0);
  const chartStroke = lineColor;
  const chartFillTop = lineColor;
  const chartFillBot = lineColor;

  const hasDescription = (trail.description ?? '').trim().length > 0;
  const hasMarkers = (trail.markers ?? []).length > 0;
  const hasMedia = (trail.media ?? []).length > 0;

  const statsInner = (
    <>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <Ruler size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
        <span>{getDistanceWithUnit(trail)}</span>
      </span>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <ArrowUpRight size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
        <span className='tabular-nums'>{trail.elevationGain ?? 0}m</span>
      </span>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <ArrowDownRight size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
        <span className='tabular-nums'>{trail.elevationLoss ?? 0}m</span>
      </span>
      <span className='inline-flex items-center gap-1 font-medium text-slate-100'>
        <Clock size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
        <span className='tabular-nums'>{trail.calculatedDurationInMinutes ?? 0} min</span>
      </span>
      {sources ? (
        <span className='inline-flex max-w-full min-w-0 items-center gap-1 font-medium text-slate-100'>
          <Database size={icon} className='light:text-slate-600 shrink-0 text-slate-300' aria-hidden />
          <span className='min-w-0 truncate' title='Elevation source'>
            {sources}
          </span>
        </span>
      ) : null}

      <button
        type='button'
        onClick={() => downloadGpxFile(areaName ?? '', sectorName ?? '', trail.title ?? '', trail.path ?? [])}
        className={cn(
          'group inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold transition-[background-color,border-color,color] focus-visible:ring-2 focus-visible:outline-none max-sm:px-1.5 max-sm:py-0 max-sm:text-[10px]',
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
      {trail.title ? (
        <div
          className={cn(
            'bg-surface-raised border-surface-border/50 relative border-b',
            compact ? 'px-2.5 max-sm:p-3 sm:px-3.5' : 'px-3 max-sm:p-3 sm:px-3.5',
          )}
        >
          <div className='flex items-start justify-between gap-2'>
            <span
              className={cn(designContract.typography.micro, 'font-semibold tracking-[0.12em] uppercase')}
              style={{ color: lineColor }}
            >
              {trail.title}
            </span>
            {meta?.isAdmin && trail.id && (
              <Link
                to={`/media/add?type=trail&trailId=${trail.id}`}
                title='Add media to trail'
                aria-label='Add media to trail'
                className='hover:bg-surface-raised-hover -mt-0.5 -mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-200'
              >
                <ImageIcon size={12} strokeWidth={2.5} />
              </Link>
            )}
          </div>
          {hasDescription && (
            <div className='mt-1 text-[12px] text-slate-300'>
              <Markdown content={trail.description ?? ''} />
            </div>
          )}
          {hasMarkers && (
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {(trail.markers ?? []).map((m, i) => {
                const lat = m.coordinates?.latitude;
                const lng = m.coordinates?.longitude;
                const hasCoords = lat != null && lng != null;
                const mapsUrl = hasCoords ? googleMapsSearchUrl(lat, lng) : null;
                const markerColor = getTrailColor(!!isDescent, descentIndex ?? 0);
                const coordStr = hasCoords
                  ? `(${lat!.toFixed(3)}${lat! >= 0 ? 'N' : 'S'},${lng!.toFixed(3)}${lng! >= 0 ? 'E' : 'W'})`
                  : null;
                const inner = (
                  <>
                    <MapPin size={11} className='shrink-0' aria-hidden style={{ color: markerColor }} />
                    <span className='text-[12px] font-medium'>{m.label}</span>
                    {coordStr && <span className='font-mono text-[11px] text-slate-500 tabular-nums'>{coordStr}</span>}
                  </>
                );
                return (
                  <div key={i} className='inline-flex items-center gap-1'>
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='type-on-accent hover:type-on-accent inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/6 px-1.5 py-0.5 text-[11px] transition-colors hover:border-white/22 hover:bg-white/12 max-sm:text-[10px]'
                        title='Open in maps app'
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className='inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] text-slate-400 max-sm:text-[10px]'>
                        {inner}
                      </div>
                    )}
                    {hasCoords && (
                      <button
                        type='button'
                        onClick={() => shareCoordinates(lat!, lng!, m.label ?? 'Marker')}
                        className='type-on-accent hover:type-on-accent inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/6 px-1.5 py-0.5 text-[11px] transition-colors hover:border-white/22 hover:bg-white/12 max-sm:text-[10px]'
                        title='Share coordinates'
                      >
                        <Share2 size={11} className='shrink-0' aria-hidden />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {hasMedia && (
            <div className='mt-2'>
              <Media
                media={trail.media ?? []}
                orderableMedia={trail.media ?? []}
                carouselMedia={trail.media ?? []}
                optProblemId={null}
                showLocation={false}
                compactTiles
              />
            </div>
          )}
        </div>
      ) : null}

      {hasDescription && hasMedia ? (
        <>
          <div className='pt-3' />
          <hr className='border-surface-border/60 mx-0' />
          <div className='bg-surface-raised/60 px-2.5 py-1 max-sm:px-2'>
            <span className='text-[11px] font-semibold tracking-wide text-slate-400 uppercase'>Hike profile:</span>
          </div>
        </>
      ) : null}
      <div
        ref={containerRef}
        className={cn(
          'from-surface-card via-surface-raised to-surface-card relative w-full overflow-hidden bg-gradient-to-b',
          compact
            ? 'aspect-[12/2.5] max-sm:h-16 sm:aspect-[20/2.5]'
            : 'aspect-[5/2] min-h-[4.75rem] p-0.5 max-sm:h-16 sm:min-h-[5.25rem]',
        )}
      >
        {dims && (
          <AreaChart
            width={dims.width}
            height={dims.height}
            data={trail.path?.map((p, i) => ({ ...p, _index: i })) ?? []}
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
              connectNulls
            />
            <XAxis
              dataKey='_index'
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
                      <span>#{parseInt(String(label ?? '0')) + 1}</span>
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
          'border-surface-border/80 bg-surface-raised border-t text-slate-200',
          compact ? 'px-2.5 sm:px-3' : 'px-2.5 sm:px-3',
          'px-2.5 py-1.5 text-[11px] leading-snug max-sm:px-2 max-sm:py-1 max-sm:text-[10px] max-sm:leading-tight',
        )}
      >
        <div className='flex flex-wrap items-center gap-x-1.5 gap-y-1 max-sm:gap-x-2 max-sm:gap-y-0.5 max-sm:[&_svg]:h-3 max-sm:[&_svg]:w-3 max-sm:[&_svg]:self-center'>
          {statsInner}
        </div>
      </div>
    </div>
  );
};
