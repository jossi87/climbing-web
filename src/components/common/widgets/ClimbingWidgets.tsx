import SunCalc from 'suncalc';
import { Compass, Sun, Eye, type LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { type ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  title?: string;
  className?: string;
  icon?: LucideIcon;
};

export const Badge = ({ children, title, className, icon: Icon }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-hover border border-surface-border text-[10px] text-slate-400 uppercase font-bold tracking-wider',
      className,
    )}
    title={title}
  >
    {Icon && <Icon size={12} className='text-brand' />}
    {children}
  </span>
);

export const SunOnWall = ({
  sunFromHour,
  sunToHour,
}: {
  sunFromHour: number;
  sunToHour: number;
}) => {
  if (
    sunFromHour <= 0 ||
    sunToHour >= 24 ||
    sunFromHour >= sunToHour ||
    isNaN(sunFromHour) ||
    isNaN(sunToHour)
  )
    return null;
  return (
    <Badge icon={Sun} title='Sun on wall'>
      {`${String(sunFromHour).padStart(2, '0')}:00 - ${String(sunToHour).padStart(2, '0')}:00`}
    </Badge>
  );
};

export const SunriseSunset = ({ lat, lng, date }: { lat: number; lng: number; date?: Date }) => {
  const { sunrise, sunset } = SunCalc.getTimes(date ?? new Date(), lat, lng);
  if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) return null;
  const format = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return (
    <Badge icon={Eye} title='Sunrise and sunset'>
      {`${format(sunrise)} - ${format(sunset)}`}
    </Badge>
  );
};

type WallDirectionProps = {
  wallDirectionCalculated?: { direction?: string };
  wallDirectionManual?: { direction?: string };
};

export const WallDirection = ({
  wallDirectionCalculated,
  wallDirectionManual,
}: WallDirectionProps) => {
  const direction = wallDirectionManual?.direction ?? wallDirectionCalculated?.direction;
  if (!direction) return null;
  return (
    <Badge icon={Compass} title={wallDirectionManual ? 'Manual' : 'Calculated'}>
      {direction}
    </Badge>
  );
};
