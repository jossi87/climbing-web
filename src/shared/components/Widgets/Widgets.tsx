import { Video, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { Badge, SunOnWall, SunriseSunset, WallDirection } from './ClimbingWidgets';
import { YrLink } from './WeatherWidgets';
import type { components } from '../../../@types/buldreinfo/swagger';

export { Loading } from '../../ui/StatusWidgets';
export { Stars, LockSymbol } from '../../ui/Indicators';
export { Badge, SunOnWall, SunriseSunset, WallDirection } from './ClimbingWidgets';
export { YrLink, WeatherIcon } from './WeatherWidgets';

type Sector = components['schemas']['Sector'];
type ExternalLinkItem = components['schemas']['ExternalLink'];

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
    <div className='flex flex-wrap items-center gap-2'>
      <WallDirection wallDirectionCalculated={wallDirectionCalculated} wallDirectionManual={wallDirectionManual} />
      <SunOnWall sunFromHour={sunFromHour} sunToHour={sunToHour} />
      <SunriseSunset lat={lat} lng={lng} />
      <YrLink lat={lat} lng={lng} />
      <a href={`/webcams/${JSON.stringify({ lat, lng, label })}`} target='_blank' rel='noreferrer'>
        <Badge icon={Video} className='hover:bg-surface-border transition-colors'>
          Webcams
        </Badge>
      </a>
      <a href={`https://www.suncalc.org/#/${lat},${lng},17/${date}/${time}/1/0`} target='_blank' rel='noreferrer'>
        <Badge icon={ExternalLink} className='hover:bg-surface-border transition-colors'>
          SunCalc{' '}
          <span className='ml-1 font-medium text-slate-600'>
            {date}-{time}
          </span>
        </Badge>
      </a>
    </div>
  );
}

export function ExternalLinkLabels({ externalLinks = [] }: { externalLinks?: ExternalLinkItem[] }) {
  if (!externalLinks || externalLinks.length === 0) return null;
  return (
    <div className='flex flex-wrap gap-2'>
      {externalLinks.map((l) => (
        <a key={l.id} href={l.url ?? '#'} target='_blank' rel='noreferrer'>
          <Badge icon={LinkIcon} className='hover:bg-surface-border transition-colors'>
            {l.title}
            {l.url?.includes('page=') && (
              <span className='ml-1 text-slate-600 lowercase'>Page {l.url.split('page=')[1]}</span>
            )}
          </Badge>
        </a>
      ))}
    </div>
  );
}

export function NoDogsAllowed() {
  return (
    <div className='bg-brand/5 border-brand/10 flex items-center gap-4 rounded-md border p-4 text-left'>
      <img src='/svg/no-animals.svg' alt='' className='h-9 w-9 opacity-80' />
      <div>
        <h5 className='text-brand text-xs font-bold tracking-widest uppercase'>No dogs allowed</h5>
        <p className='text-xs text-slate-500'>Landowner request.</p>
      </div>
    </div>
  );
}
