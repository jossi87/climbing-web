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
        'relative flex flex-col items-center justify-center text-center transition-all duration-300 bg-surface-card group p-3 sm:p-5 h-full w-full hover:bg-white/3',
        isDonate && 'hover:bg-brand/5',
      )}
    >
      <div
        className={cn(
          'transition-colors duration-300 text-slate-500 mb-1 sm:mb-2',
          isDonate ? 'group-hover:text-brand' : 'group-hover:text-brand/80',
          loading && 'animate-pulse',
        )}
      >
        <Icon size={isDonate ? 16 : 18} strokeWidth={isDonate ? 2.5 : 2} />
      </div>
      <div className='flex flex-col items-center min-w-0'>
        {loading ? (
          <>
            <div className='h-3 w-10 sm:h-4 sm:w-12 bg-surface-hover rounded animate-pulse mb-1' />
            <span className='text-[7px] sm:text-[9px] uppercase tracking-widest text-slate-600 font-bold'>
              {label}
            </span>
          </>
        ) : value !== undefined && value !== '' ? (
          <>
            <span className='text-sm sm:text-xl font-black text-slate-100 leading-none tabular-nums tracking-tight group-hover:text-white transition-colors'>
              {value}
            </span>
            <span className='text-[7px] sm:text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1 group-hover:text-slate-400 transition-colors'>
              {label}
            </span>
          </>
        ) : (
          <span
            className={cn(
              'text-[8px] sm:text-[10px] uppercase tracking-widest font-black transition-colors duration-300',
              isDonate ? 'text-slate-400 group-hover:text-brand' : 'text-slate-500',
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
    <div className='app-card grid grid-cols-3 lg:grid-cols-1 xl:grid-cols-2 gap-px bg-surface-border/50 overflow-hidden border-0 sm:border shadow-xl'>
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
