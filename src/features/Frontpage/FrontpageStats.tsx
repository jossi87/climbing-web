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
  const isDonate = label === 'Donate';

  const content = (
    <div
      className={cn(
        'bg-surface-card group relative flex h-full w-full flex-col items-center justify-center p-4 text-center transition-colors hover:bg-white/3',
        isDonate && 'hover:bg-brand/5',
      )}
    >
      <div
        className={cn(
          'mb-2 text-slate-500 transition-colors',
          isDonate ? 'group-hover:text-brand' : 'group-hover:text-brand/80',
          loading && 'animate-pulse',
        )}
      >
        <Icon size={isDonate ? 16 : 18} strokeWidth={isDonate ? 2.5 : 2} />
      </div>
      <div className='flex min-w-0 flex-col items-center'>
        {loading ? (
          <>
            <div className='bg-surface-hover mb-1 h-3 w-10 animate-pulse rounded sm:w-12' />
            <SectionLabel className='text-slate-600'>{label}</SectionLabel>
          </>
        ) : value !== undefined && value !== '' ? (
          <>
            <span className={cn(designContract.typography.subtitle, 'leading-none tabular-nums transition-colors')}>
              {value}
            </span>
            <SectionLabel className='mt-1 transition-colors group-hover:text-slate-400'>{label}</SectionLabel>
          </>
        ) : (
          <SectionLabel
            className={cn('transition-colors', isDonate ? 'group-hover:text-brand text-slate-400' : 'text-slate-500')}
          >
            {label}
          </SectionLabel>
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
          'grid grid-cols-3 overflow-hidden lg:grid-cols-1 xl:grid-cols-2',
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
            label='With topo'
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
