import { Link } from 'react-router-dom';
import {
  Database,
  CheckCircle,
  Image as ImageIcon,
  MapPin,
  Camera,
  Film,
  Heart,
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
};

const StatItem = ({ to, icon: Icon, label, value }: StatItemProps) => {
  const isDonate = label === 'Donate';

  const content = (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center transition-all duration-200 border-surface-border bg-surface-card group p-2.5 sm:p-4 h-full w-full sm:rounded-xl sm:border border-b border-r last:border-r-0 sm:last:border-r',
        isDonate && 'hover:shadow-brand/10 shadow-sm',
      )}
    >
      <div
        className={cn('transition-colors duration-200 text-slate-500 group-hover:text-brand mb-1')}
      >
        <Icon size={isDonate ? 18 : 14} />
      </div>
      <div className='flex flex-col relative z-10 text-center'>
        {value !== undefined && value !== '' ? (
          <>
            <span className='text-sm sm:text-lg font-black text-slate-200 leading-tight tabular-nums tracking-tight'>
              {value}
            </span>
            <span className='text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-0.5'>
              {label}
            </span>
          </>
        ) : (
          <span className='text-[9px] uppercase tracking-widest text-slate-500 font-bold'>
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
    <div className='grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-px sm:gap-3 bg-surface-border sm:bg-transparent border-t border-l border-surface-border sm:border-0 mb-6'>
      <StatItem
        to='/problems'
        icon={Database}
        label={isBouldering ? 'Problems' : 'Routes'}
        value={numberWithCommas(numProblems?.numProblems ?? 0)}
      />
      <StatItem
        to='/ticks/1'
        icon={CheckCircle}
        label='Ticks'
        value={numberWithCommas(numTicks?.numTicks ?? 0)}
      />
      <StatItem
        icon={isClimbing ? ImageIcon : MapPin}
        label={isClimbing ? 'Topo' : 'Coords'}
        value={numberWithCommas(
          isClimbing
            ? (numProblems?.numProblemsWithTopo ?? 0)
            : (numProblems?.numProblemsWithCoordinates ?? 0),
        )}
      />
      <StatItem icon={Camera} label='Images' value={numberWithCommas(numMedia?.numImages ?? 0)} />
      <StatItem icon={Film} label='Videos' value={numberWithCommas(numMedia?.numMovies ?? 0)} />
      <StatItem to='/donations' icon={Heart} label='Donate' />
    </div>
  );
};
