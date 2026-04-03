import { Link } from 'react-router-dom';
import { Database, CheckCircle, Globe, Map, type LucideIcon } from 'lucide-react';
import { numberWithCommas } from '../../api';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';
import { Card, SectionLabel } from '../../shared/ui';

/**
 * Frosted tiles; hover highlights with a brand border (copy stays slate).
 * Fixed height (not min-h): loaded content is taller than the old 5rem minimum, which caused a visible jump when skeletons resolved.
 */
const statTileClass =
  'border border-white/10 bg-surface-nav/50 group relative flex h-[6rem] w-full shrink-0 flex-col items-center justify-center overflow-hidden p-3 text-center transition-[background-color,border-color] duration-200 sm:h-[6.875rem] sm:p-4 ' +
  'hover:border-brand/50 hover:bg-surface-nav';

type StatItemProps = {
  to?: string;
  icon: LucideIcon | React.ElementType;
  label: string;
  value?: number | string;
  loading?: boolean;
};

/**
 * Fixed pixel box for the stat value — skeleton and digits are stacked in the same absolute layer
 * so swapping loading → loaded cannot change row height (major CLS fix).
 */
const statValueShellClass = 'relative h-8 w-full shrink-0 sm:h-9';

const StatItem = ({ to, icon: Icon, label, value, loading }: StatItemProps) => {
  const content = (
    <div className={statTileClass}>
      <div
        className={cn(
          'relative z-[1] mb-1.5 shrink-0 text-slate-400 transition-colors sm:mb-2',
          'group-hover:text-slate-200',
          loading && 'animate-pulse',
        )}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className='relative z-[1] flex min-w-0 flex-col items-center justify-center gap-0.5'>
        <div className={statValueShellClass}>
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              !loading && 'pointer-events-none opacity-0',
            )}
            aria-hidden={!loading}
          >
            <div className='bg-surface-hover h-4 w-12 animate-pulse rounded-md sm:w-14' />
          </div>
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              loading && 'pointer-events-none opacity-0',
              (value === undefined || value === '') && !loading && 'opacity-0',
            )}
          >
            {value !== undefined && value !== '' ? (
              <span className='text-base leading-none font-semibold tracking-tight whitespace-nowrap text-slate-100 tabular-nums sm:text-lg'>
                {value}
              </span>
            ) : null}
          </div>
        </div>
        <div className='flex h-4 shrink-0 items-center justify-center'>
          <SectionLabel
            className={cn(
              '!text-[9px] !leading-none !tracking-[0.06em] text-slate-400 sm:!text-[10px] sm:!tracking-[0.1em]',
              !loading && 'transition-colors group-hover:text-slate-300',
            )}
          >
            {label}
          </SectionLabel>
        </div>
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
          placement === 'top'
            ? 'min-h-[6rem] grid-cols-4 sm:min-h-[6.875rem]'
            : 'min-h-[calc(6.875rem*2+1px)] grid-cols-2',
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
