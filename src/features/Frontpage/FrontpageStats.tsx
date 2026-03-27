import { Link } from 'react-router-dom';
import { Database, CheckCircle, Camera, Film, Heart, MapPin, Spline, type LucideIcon } from 'lucide-react';
import { numberWithCommas } from '../../api';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';
import { Card, SectionLabel } from '../../shared/ui';
import { designContract } from '../../design/contract';

type StatItemProps = {
  to?: string;
  icon: LucideIcon | React.ElementType;
  label: string;
  value?: number | string;
  loading?: boolean;
};

const StatItem = ({ to, icon: Icon, label, value, loading }: StatItemProps) => {
  const content = (
    <div className='bg-surface-card/90 group hover:bg-brand/8 hover:border-brand/20 relative flex h-full w-full flex-col items-center justify-center border border-transparent p-2 text-center transition-all duration-300 sm:p-4'>
      <div
        className={cn(
          'mb-1 text-slate-400 transition-colors sm:mb-2',
          'group-hover:text-brand',
          loading && 'animate-pulse',
        )}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className='flex min-w-0 flex-col items-center justify-center'>
        {loading ? (
          <>
            <div className='mb-1 flex h-6 items-center justify-center'>
              <div className='bg-surface-hover h-3 w-10 animate-pulse rounded sm:w-12' />
            </div>
            <div className='flex h-3 items-center justify-center'>
              <SectionLabel className='!text-[9px] !tracking-[0.06em] text-slate-400 sm:!text-[10px] sm:!tracking-[0.1em]'>
                {label}
              </SectionLabel>
            </div>
          </>
        ) : value !== undefined && value !== '' ? (
          <>
            <div className='mb-1 flex h-6 items-center justify-center'>
              <span className={cn(designContract.typography.subtitle, 'leading-none tabular-nums transition-opacity')}>
                {value}
              </span>
            </div>
            <div className='flex h-3 items-center justify-center'>
              <SectionLabel className='!text-[9px] !tracking-[0.06em] text-slate-300 transition-colors group-hover:text-slate-200 sm:!text-[10px] sm:!tracking-[0.1em]'>
                {label}
              </SectionLabel>
            </div>
          </>
        ) : (
          <>
            <div className='mb-1 flex h-6 items-center justify-center' />
            <div className='flex h-3 items-center justify-center'>
              <SectionLabel className='group-hover:text-brand !text-[9px] !tracking-[0.06em] text-slate-300 transition-colors sm:!text-[10px] sm:!tracking-[0.1em]'>
                {label}
              </SectionLabel>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className='block h-full w-full'>
      {content}
    </Link>
  ) : (
    <div className='h-full w-full'>{content}</div>
  );
};

type FrontpageStatsProps = {
  numMedia?: components['schemas']['FrontpageNumMedia'];
  numProblems?: components['schemas']['FrontpageNumProblems'];
  numTicks?: components['schemas']['FrontpageNumTicks'];
  isBouldering?: boolean;
  isClimbing?: boolean;
};

export const FrontpageStats = ({ numMedia, numProblems, numTicks, isBouldering, isClimbing }: FrontpageStatsProps) => {
  return (
    <Card flush className='border-0 sm:border'>
      <div
        className={cn(
          'grid grid-cols-6 overflow-hidden lg:grid-cols-1 xl:grid-cols-2',
          designContract.surfaces.gridDivider,
        )}
      >
        <StatItem
          to='/problems'
          icon={Database}
          label={isBouldering ? 'Problems' : 'Routes'}
          value={numProblems ? numberWithCommas(numProblems.numProblems ?? 0) : undefined}
          loading={!numProblems}
        />
        {isClimbing ? (
          <StatItem
            icon={Spline}
            label='Topos'
            value={numProblems ? numberWithCommas(numProblems.numProblemsWithTopo ?? 0) : undefined}
            loading={!numProblems}
          />
        ) : (
          <StatItem
            icon={MapPin}
            label='Coordinates'
            value={numProblems ? numberWithCommas(numProblems.numProblemsWithCoordinates ?? 0) : undefined}
            loading={!numProblems}
          />
        )}
        <StatItem
          to='/ticks/1'
          icon={CheckCircle}
          label='Ticks'
          value={numTicks ? numberWithCommas(numTicks.numTicks ?? 0) : undefined}
          loading={!numTicks}
        />
        <StatItem
          icon={Camera}
          label='Images'
          value={numMedia ? numberWithCommas(numMedia.numImages ?? 0) : undefined}
          loading={!numMedia}
        />
        <StatItem
          icon={Film}
          label='Videos'
          value={numMedia ? numberWithCommas(numMedia.numMovies ?? 0) : undefined}
          loading={!numMedia}
        />
        <StatItem to='/donations' icon={Heart} label='Donate' />
      </div>
    </Card>
  );
};
