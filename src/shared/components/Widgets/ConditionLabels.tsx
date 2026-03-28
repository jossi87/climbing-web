import { Video, ExternalLink } from 'lucide-react';
import { Badge, SunOnWall, SunriseSunset, WallDirection } from './ClimbingWidgets';
import { YrLink } from './WeatherWidgets';
import type { components } from '../../../@types/buldreinfo/swagger';

type Sector = components['schemas']['Sector'];

type ConditionLabelsProps = {
  lat: number;
  lng: number;
  label: string;
  wallDirectionCalculated?: Sector['wallDirectionCalculated'];
  wallDirectionManual?: Sector['wallDirectionManual'];
  sunFromHour: number;
  sunToHour: number;
};

export function ConditionLabels({
  lat,
  lng,
  label,
  wallDirectionCalculated,
  wallDirectionManual,
  sunFromHour,
  sunToHour,
}: ConditionLabelsProps) {
  if (!lat || !lng) return null;
  const d = new Date();
  const date = `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  return (
    <>
      <WallDirection wallDirectionCalculated={wallDirectionCalculated} wallDirectionManual={wallDirectionManual} />
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
