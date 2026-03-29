import type { ReactNode } from 'react';
import { MousePointerClick, Video, ExternalLink } from 'lucide-react';
import { Badge, SunOnWall, SunriseSunset, WallDirection } from './ClimbingWidgets';
import { YrLink } from './WeatherWidgets';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import type { components } from '../../../@types/buldreinfo/swagger';

type Sector = components['schemas']['Sector'];

const flowSep = (
  <span className='text-slate-600 select-none' aria-hidden>
    {' · '}
  </span>
);

function intersperseFlow(nodes: ReactNode[]) {
  const filtered = nodes.filter((n) => n != null && n !== false);
  const out: ReactNode[] = [];
  filtered.forEach((n, i) => {
    if (i > 0) out.push(flowSep);
    out.push(<span key={i}>{n}</span>);
  });
  return out;
}

type ConditionLabelsProps = {
  /** When missing or zero, weather/sun links are omitted; page views still render if provided */
  lat?: number | null;
  lng?: number | null;
  label: string;
  wallDirectionCalculated?: Sector['wallDirectionCalculated'];
  wallDirectionManual?: Sector['wallDirectionManual'];
  sunFromHour: number;
  sunToHour: number;
  /** Page views chip, placed after wall direction and before sun-on-wall */
  pageViews?: string | number | null;
  /** `flow`: one wrapping line with middots (less visual noise on small screens). `chips`: badge row (default). */
  layout?: 'chips' | 'flow';
  className?: string;
};

export function ConditionLabels({
  lat,
  lng,
  label,
  wallDirectionCalculated,
  wallDirectionManual,
  sunFromHour,
  sunToHour,
  pageViews,
  layout = 'chips',
  className,
}: ConditionLabelsProps) {
  const hasCoords = lat != null && lng != null && lat !== 0 && lng !== 0;
  const d = new Date();
  const date = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  const viewsChip =
    pageViews != null && String(pageViews).length > 0 ? (
      <Badge icon={MousePointerClick} title='Approximate page views (visits)'>
        Views <span className='ml-1 text-slate-500 tabular-nums'>{pageViews}</span>
      </Badge>
    ) : null;

  const viewsInline =
    pageViews != null && String(pageViews).length > 0 ? (
      <span
        className={cn(designContract.typography.menuItem, 'inline-flex max-w-full items-center gap-1 text-slate-300')}
        title='Approximate page views (visits)'
      >
        <MousePointerClick size={11} strokeWidth={2} className='shrink-0 text-slate-500' />
        <span>
          Views <span className='text-slate-500 tabular-nums'>{pageViews}</span>
        </span>
      </span>
    ) : null;

  if (layout === 'flow') {
    const flowNodes: ReactNode[] = [];
    if (hasCoords) {
      flowNodes.push(
        <WallDirection
          key='wd'
          wallDirectionCalculated={wallDirectionCalculated}
          wallDirectionManual={wallDirectionManual}
          variant='inline'
        />,
      );
      flowNodes.push(viewsInline);
      flowNodes.push(<SunOnWall key='sun' sunFromHour={sunFromHour} sunToHour={sunToHour} variant='inline' />);
      flowNodes.push(<SunriseSunset key='rise' lat={lat!} lng={lng!} variant='inline' />);
      flowNodes.push(<YrLink key='yr' lat={lat!} lng={lng!} />);
      flowNodes.push(
        <a key='cam' href={`/webcams/${JSON.stringify({ lat, lng, label })}`} target='_blank' rel='noreferrer'>
          <span
            className={cn(
              designContract.typography.menuItem,
              'inline-flex max-w-full items-center gap-1 text-slate-300 transition-colors hover:text-slate-100',
            )}
          >
            <Video size={11} strokeWidth={2} className='shrink-0 text-slate-500' />
            Webcams
          </span>
        </a>,
      );
      flowNodes.push(
        <a
          key='sc'
          href={`https://www.suncalc.org/#/${lat},${lng},17/${date}/${time}/1/0`}
          target='_blank'
          rel='noreferrer'
          title={`SunCalc · ${date} · ${time}`}
        >
          <span
            className={cn(
              designContract.typography.menuItem,
              'inline-flex max-w-full flex-wrap items-center gap-x-1 gap-y-0.5 text-slate-300 transition-colors hover:text-slate-100',
            )}
          >
            <ExternalLink size={11} strokeWidth={2} className='shrink-0 text-slate-500' />
            <span>SunCalc</span>
            <span className='hidden text-slate-500 tabular-nums sm:inline'>
              {date} · {time}
            </span>
          </span>
        </a>,
      );
    } else if (viewsInline) {
      flowNodes.push(viewsInline);
    }

    const parts = intersperseFlow(flowNodes.filter(Boolean));
    if (parts.length === 0) return null;

    return <div className={cn('contents min-w-0', className)}>{parts}</div>;
  }

  if (!hasCoords) {
    return viewsChip ?? null;
  }

  return (
    <>
      <WallDirection wallDirectionCalculated={wallDirectionCalculated} wallDirectionManual={wallDirectionManual} />
      {viewsChip}
      <SunOnWall sunFromHour={sunFromHour} sunToHour={sunToHour} />
      <SunriseSunset lat={lat} lng={lng} />
      <YrLink lat={lat} lng={lng} />
      <a href={`/webcams/${JSON.stringify({ lat, lng, label })}`} target='_blank' rel='noreferrer'>
        <Badge icon={Video} className='hover:bg-white/[0.08] hover:text-slate-300 hover:ring-white/[0.1]'>
          Webcams
        </Badge>
      </a>
      <a href={`https://www.suncalc.org/#/${lat},${lng},17/${date}/${time}/1/0`} target='_blank' rel='noreferrer'>
        <Badge icon={ExternalLink} className='hover:bg-white/[0.08] hover:text-slate-300 hover:ring-white/[0.1]'>
          SunCalc <span className='ml-1 text-slate-500 tabular-nums'>{date + ' · ' + time}</span>
        </Badge>
      </a>
    </>
  );
}
