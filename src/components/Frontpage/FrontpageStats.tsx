import { Link } from 'react-router-dom';
import {
  Database,
  CheckCircle,
  Camera,
  Film,
  Heart,
  MapPin,
  Spline,
  type LucideIcon,
} from 'lucide-react';
import { numberWithCommas } from '../../api';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';

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
        'relative flex flex-col items-center justify-center transition-all duration-300 bg-surface-card group p-2.5 sm:p-4 h-full w-full hover:bg-white/3',
        isDonate && 'hover:bg-brand/4',
      )}
    >
      <div
        className={cn(
          'transition-colors duration-300 mb-1.5 text-slate-500',
          isDonate ? 'group-hover:text-brand' : 'group-hover:text-slate-300',
          loading && 'animate-pulse',
        )}
      >
        <Icon size={isDonate ? 16 : 14} strokeWidth={isDonate ? 2.5 : 2} />
      </div>
      <div className='flex flex-col relative z-10 text-center items-center'>
        {loading ? (
          <>
            <div className='h-4 sm:h-5 w-12 bg-surface-hover rounded animate-pulse mb-1' />
            <span className='text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-slate-600 font-bold mt-1'>
              {label}
            </span>
          </>
        ) : value !== undefined && value !== '' ? (
          <>
            <span className='text-sm sm:text-lg font-black text-slate-200 leading-none tabular-nums tracking-tight animate-in fade-in duration-300'>
              {value}
            </span>
            <span className='text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-slate-500 font-bold mt-1 group-hover:text-slate-400 transition-colors'>
              {label}
            </span>
          </>
        ) : (
          <span
            className={cn(
              'text-[9px] uppercase tracking-[0.15em] font-black transition-colors duration-300',
              isDonate ? 'text-slate-500 group-hover:text-brand' : 'text-slate-500',
            )}
          >
            {label}
          </span>
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

export const FrontpageStats = ({
  numMedia,
  numProblems,
  numTicks,
  isBouldering,
  isClimbing,
}: FrontpageStatsProps) => {
  return (
    <div className='app-card grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-px mb-6 bg-surface-border/30 overflow-hidden border-0 sm:border'>
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
          value={
            numProblems ? numberWithCommas(numProblems.numProblemsWithCoordinates ?? 0) : undefined
          }
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
  );
};
