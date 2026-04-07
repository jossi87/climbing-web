import { Link } from 'react-router-dom';
import { Database, CheckCircle, Globe, Map, type LucideIcon } from 'lucide-react';
import { numberWithCommas } from '../../api';
import { cn } from '../../lib/utils';
import type { components } from '../../@types/buldreinfo/swagger';
import { Card, SectionLabel } from '../../shared/ui';
import { designContract } from '../../design/contract';

/**
 * Outer corners must match the parent `Card` radius — otherwise `hover:border-brand-border` draws a square
 * and looks clipped / wrong vs the rounded shell (glow “missing” at corners).
 */
function statTileOuterRadius(placement: 'top' | 'sidebar', index: number): string {
  if (placement === 'top') {
    if (index === 0) return 'rounded-l-xl';
    if (index === 3) return 'rounded-r-xl';
    return '';
  }
  const corners: Record<number, string> = {
    0: 'rounded-tl-xl',
    1: 'rounded-tr-xl',
    2: 'rounded-bl-xl',
    3: 'rounded-br-xl',
  };
  return corners[index] ?? '';
}

/**
 * Fixed height (not min-h): loaded content is taller than the old 5rem minimum, which caused a visible jump when skeletons resolved.
 * Tiles sit on the same `surface-card` face as the shell (`panelStatCell`); hover lifts to `surface-raised` like list rows.
 */
const statTileBaseClass = cn(
  designContract.surfaces.panelStatCell,
  'group relative flex h-[6rem] w-full shrink-0 flex-col items-center justify-center overflow-hidden p-3 text-center sm:h-[6.875rem] sm:p-4',
);

type StatItemProps = {
  to?: string;
  icon: LucideIcon | React.ElementType;
  label: string;
  value?: number | string;
  loading?: boolean;
  /** Match parent card rounding so hover border follows the visible corners. */
  tileRadiusClass?: string;
};

/**
 * Fixed pixel box for the stat value — skeleton and digits are stacked in the same absolute layer
 * so swapping loading → loaded cannot change row height (major CLS fix).
 */
const statValueShellClass = 'relative h-8 w-full shrink-0 sm:h-9';

const StatItem = ({ to, icon: Icon, label, value, loading, tileRadiusClass }: StatItemProps) => {
  const content = (
    <div className={cn(statTileBaseClass, tileRadiusClass)}>
      <div
        className={cn(
          'relative z-[1] mb-1.5 shrink-0 text-slate-400 transition-colors sm:mb-2',
          'group-hover:text-slate-300',
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
            <div className='skeleton-bar h-4 w-12 animate-pulse rounded-md sm:w-14' />
          </div>
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              loading && 'pointer-events-none opacity-0',
              (value === undefined || value === '') && !loading && 'opacity-0',
            )}
          >
            {value !== undefined && value !== '' ? (
              <span className='text-base leading-none font-medium tracking-tight whitespace-nowrap text-slate-300 tabular-nums sm:text-lg'>
                {value}
              </span>
            ) : null}
          </div>
        </div>
        <div className='flex h-4 shrink-0 items-center justify-center'>
          <SectionLabel
            className={cn(
              '!text-[9px] !leading-none !tracking-[0.06em] text-slate-400 sm:!text-[10px] sm:!tracking-[0.1em]',
              !loading && 'transition-colors group-hover:text-slate-400',
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
    <Card flush className='border-0'>
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
          tileRadiusClass={statTileOuterRadius(placement, 0)}
        />
        <StatItem
          to='/areas'
          icon={Map}
          label='Areas'
          value={stats ? numberWithCommas(stats.areas ?? 0) : undefined}
          loading={statsLoading}
          tileRadiusClass={statTileOuterRadius(placement, 1)}
        />
        <StatItem
          to='/problems'
          icon={Database}
          label={isBouldering ? 'Problems' : 'Routes'}
          value={stats ? numberWithCommas(stats.problems ?? 0) : undefined}
          loading={statsLoading}
          tileRadiusClass={statTileOuterRadius(placement, 2)}
        />
        <StatItem
          to='/ticks/1'
          icon={CheckCircle}
          label='Ticks'
          value={stats ? numberWithCommas(stats.ticks ?? 0) : undefined}
          loading={statsLoading}
          tileRadiusClass={statTileOuterRadius(placement, 3)}
        />
      </div>
    </Card>
  );
};
