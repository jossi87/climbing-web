import SunCalc from 'suncalc';
import { Compass, Sun, Sunrise, type LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { type ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  title?: string;
  className?: string;
  icon?: LucideIcon;
};

/** Unified meta chip: subtle, readable, works on area/sector/problem and condition rows */
export const Badge = ({ children, title, className, icon: Icon }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex max-w-full items-center gap-1 rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] leading-snug font-medium text-slate-300 ring-1 ring-white/[0.1] transition-colors duration-150 sm:text-[12px]',
      className,
    )}
    title={title}
  >
    {Icon && <Icon size={11} strokeWidth={2} className='shrink-0 text-slate-100' />}
    <span className='min-w-0 normal-case'>{children}</span>
  </span>
);

type SunOnWallProps = {
  sunFromHour: number;
  sunToHour: number;
  variant?: 'chip' | 'inline';
  className?: string;
};

export const SunOnWall = ({ sunFromHour, sunToHour, variant = 'chip', className }: SunOnWallProps) => {
  if (sunFromHour <= 0 || sunToHour >= 24 || sunFromHour >= sunToHour || isNaN(sunFromHour) || isNaN(sunToHour))
    return null;
  const label = `${String(sunFromHour).padStart(2, '0')}:00–${String(sunToHour).padStart(2, '0')}:00`;
  if (variant === 'inline') {
    return (
      <span
        className={cn(designContract.typography.menuItem, 'inline-flex items-center gap-1 text-slate-300', className)}
        title='Sun on wall'
      >
        <Sun size={11} strokeWidth={2} className='shrink-0 text-slate-100' />
        <span className='font-medium tabular-nums'>{label}</span>
      </span>
    );
  }
  return (
    <Badge icon={Sun} title='Sun on wall'>
      {label}
    </Badge>
  );
};

type SunriseSunsetProps = {
  lat: number;
  lng: number;
  date?: Date;
  variant?: 'chip' | 'inline';
  className?: string;
};

const sunriseSunsetTitle = 'Sunrise and sunset today (local times)';

export const SunriseSunset = ({ lat, lng, date, variant = 'chip', className }: SunriseSunsetProps) => {
  const { sunrise, sunset } = SunCalc.getTimes(date ?? new Date(), lat, lng);
  if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) return null;
  const format = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const times = (
    <>
      <span className='tabular-nums'>{format(sunrise)}</span>
      <span className='mx-px text-slate-500' aria-hidden>
        ·
      </span>
      <span className='tabular-nums'>{format(sunset)}</span>
    </>
  );
  if (variant === 'inline') {
    return (
      <span
        className={cn(
          designContract.typography.menuItem,
          'inline-flex max-w-full items-center gap-1.5 text-slate-300',
          className,
        )}
        title={sunriseSunsetTitle}
      >
        <Sunrise size={11} strokeWidth={2} className='shrink-0 text-slate-100' aria-hidden />
        <span className='inline-flex min-w-0 items-baseline gap-0 font-medium'>{times}</span>
      </span>
    );
  }
  return (
    <Badge icon={Sunrise} title={sunriseSunsetTitle}>
      <span className='inline-flex items-baseline gap-0 font-medium'>{times}</span>
    </Badge>
  );
};

type WallDirectionProps = {
  wallDirectionCalculated?: { direction?: string };
  wallDirectionManual?: { direction?: string };
  variant?: 'chip' | 'inline';
  className?: string;
};

export const WallDirection = ({
  wallDirectionCalculated,
  wallDirectionManual,
  variant = 'chip',
  className,
}: WallDirectionProps) => {
  const direction = wallDirectionManual?.direction ?? wallDirectionCalculated?.direction;
  if (!direction) return null;
  const title = wallDirectionManual ? 'Wall direction (manual)' : 'Wall direction (calculated)';
  if (variant === 'inline') {
    return (
      <span
        className={cn(
          designContract.typography.menuItem,
          'inline-flex max-w-full items-center gap-1 text-slate-300',
          className,
        )}
        title={title}
      >
        <Compass size={11} strokeWidth={2} className='shrink-0 text-slate-100' />
        <span className='min-w-0 font-medium'>{direction}</span>
      </span>
    );
  }
  return (
    <Badge icon={Compass} title={title}>
      {direction}
    </Badge>
  );
};
