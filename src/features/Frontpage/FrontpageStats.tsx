import { Link } from 'react-router-dom';
import { Database, CheckCircle, Globe, Map, type LucideIcon } from 'lucide-react';
import { numberWithCommas } from '../../api';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';
import { Card, SectionLabel } from '../../shared/ui';

/** Matches activity filter chips: frosted hover, slate/white type, no gradient or brand tint. */
const statTileClass =
  'border-white/10 bg-surface-nav/50 group relative flex min-h-[5rem] w-full flex-col items-center justify-center border p-3 text-center transition-colors duration-200 sm:min-h-[5.75rem] sm:p-4 ' +
  'hover:border-white/14 hover:bg-surface-nav';

type StatItemProps = {
  to?: string;
  icon: LucideIcon | React.ElementType;
  label: string;
  value?: number | string;
  loading?: boolean;
};

const StatItem = ({ to, icon: Icon, label, value, loading }: StatItemProps) => {
  const content = (
    <div className={statTileClass}>
      <div
        className={cn(
          'relative z-[1] mb-1.5 text-slate-500 transition-colors sm:mb-2',
          'group-hover:text-slate-300',
          loading && 'animate-pulse',
        )}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className='relative z-[1] flex min-w-0 flex-col items-center justify-center gap-0.5'>
        {loading ? (
          <>
            <div className='mb-1 flex h-7 items-center justify-center'>
              <div className='bg-surface-hover h-3.5 w-11 animate-pulse rounded sm:w-14' />
            </div>
            <div className='flex h-3 items-center justify-center'>
              <SectionLabel className='!text-[9px] !tracking-[0.06em] text-slate-400 sm:!text-[10px] sm:!tracking-[0.1em]'>
                {label}
              </SectionLabel>
            </div>
          </>
        ) : value !== undefined && value !== '' ? (
          <>
            <div className='flex min-h-[1.5rem] items-center justify-center'>
              <span className='text-base font-semibold tracking-tight text-slate-100 tabular-nums transition-colors sm:text-lg'>
                {value}
              </span>
            </div>
            <div className='flex h-3 items-center justify-center pt-0.5'>
              <SectionLabel className='!text-[9px] !tracking-[0.06em] text-slate-400 transition-colors group-hover:text-slate-300 sm:!text-[10px] sm:!tracking-[0.1em]'>
                {label}
              </SectionLabel>
            </div>
          </>
        ) : (
          <>
            <div className='mb-1 flex h-6 items-center justify-center' />
            <div className='flex h-3 items-center justify-center'>
              <SectionLabel className='!text-[9px] !tracking-[0.06em] text-slate-400 transition-colors group-hover:text-slate-300 sm:!text-[10px] sm:!tracking-[0.1em]'>
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
  stats?: components['schemas']['FrontpageStats'];
  /** e.g. `/regions/bouldering` — must match `Regions` tab slugs. */
  regionsTo: string;
  /** From meta.sites (count of sites in the active group), not from stats API. */
  numRegions: number;
  regionsLoading: boolean;
  statsLoading: boolean;
  isBouldering?: boolean;
  /**
   * `top` — full-width strip (`lg:hidden`): one row of four through tablet/iPad.
   * `sidebar` — aside column (`lg+`): 2×2 so cells stay readable.
   */
  placement: 'top' | 'sidebar';
};

export const FrontpageStats = ({
  stats,
  regionsTo,
  numRegions,
  regionsLoading,
  statsLoading,
  isBouldering,
  placement,
}: FrontpageStatsProps) => {
  return (
    <Card flush className='border-0 sm:border'>
      <div
        className={cn(
          'bg-surface-card grid gap-px overflow-hidden',
          placement === 'top' ? 'grid-cols-4' : 'grid-cols-2',
        )}
      >
        <StatItem
          to={regionsTo}
          icon={Globe}
          label='Regions'
          value={regionsLoading ? undefined : numberWithCommas(numRegions)}
          loading={regionsLoading}
        />
        <StatItem
          to='/areas'
          icon={Map}
          label='Areas'
          value={stats ? numberWithCommas(stats.areas ?? 0) : undefined}
          loading={statsLoading}
        />
        <StatItem
          to='/problems'
          icon={Database}
          label={isBouldering ? 'Problems' : 'Routes'}
          value={stats ? numberWithCommas(stats.problems ?? 0) : undefined}
          loading={statsLoading}
        />
        <StatItem
          to='/ticks/1'
          icon={CheckCircle}
          label='Ticks'
          value={stats ? numberWithCommas(stats.ticks ?? 0) : undefined}
          loading={statsLoading}
        />
      </div>
    </Card>
  );
};
