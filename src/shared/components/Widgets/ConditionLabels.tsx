import { Activity, Video, ExternalLink } from 'lucide-react';
import { Badge, SunOnWall, SunriseSunset, WallDirection } from './ClimbingWidgets';
import { YrLink } from './WeatherWidgets';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type Sector = components['schemas']['Sector'];

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
}: ConditionLabelsProps) {
  const hasCoords = lat != null && lng != null && lat !== 0 && lng !== 0;
  const d = new Date();
  const date = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  const viewsChip =
    pageViews != null && String(pageViews).length > 0 ? (
      <span
        className={cn(
          designContract.surfaces.inlineChip,
          'gap-1 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase',
        )}
        title='Page views'
      >
        <Activity size={11} className='shrink-0 text-slate-500' strokeWidth={2.25} />
        {pageViews}
      </span>
    ) : null;

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
