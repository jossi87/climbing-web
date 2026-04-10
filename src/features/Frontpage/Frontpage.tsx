import { lazy, Suspense } from 'react';
import { useMeta } from '../../shared/components/Meta/context';
import { useData } from '../../api';
import { ActivityFrontpageSuspenseFallback } from '../../shared/components/Activity/ActivitySkeleton';
import type { Success } from '../../@types/buldreinfo';
import { FrontpageStats } from './FrontpageStats';
import { RandomMediaCard } from './RandomMediaCard';
import { designContract } from '../../design/contract';

const Activity = lazy(() => import('../../shared/components/Activity/Activity'));

const Frontpage = () => {
  const meta = useMeta();
  const { data: stats, isPending: statsPending } = useData<Success<'getFrontpageStats'>>(`/frontpage/stats`);
  const { data: randomMedia, isPending: randomMediaPending } =
    useData<Success<'getFrontpageRandomMedia'>>(`/frontpage/random_media`);

  const metaReady = Boolean(meta?.title);
  /** Stats tiles need the `/frontpage/stats` response; regions count comes from meta only. */
  const statsLoading = !metaReady || statsPending;
  const regionsLoading = !metaReady;
  /** Featured photo is often the LCP element — do not wait for `/frontpage/stats` (slower path). */
  const randomMediaLoading = !metaReady || randomMediaPending;

  const type = meta.isBouldering ? 'bouldering problems' : 'climbing routes';
  /** Entries in meta.regions for the active region’s group (header region list scope). */
  const activeRegion = meta.regions?.find((r) => r.active);
  const numRegions = activeRegion ? (meta.regions?.filter((r) => r.group === activeRegion.group).length ?? 0) : 0;
  /** Matches `/regions/:type` tabs in Regions.tsx (bouldering | climbing | ice). */
  const regionsTo = `/regions/${meta.isIce ? 'ice' : meta.isBouldering ? 'bouldering' : 'climbing'}`;
  const description = `${numRegions} regions, ${stats?.areas ?? 0} areas, ${stats?.problems ?? 0} ${type}, ${stats?.ticks ?? 0} public ascents.`;

  return (
    <>
      <title>{meta?.title}</title>
      {stats && <meta name='description' content={description} />}

      <div className={designContract.layout.pageSection}>
        <div className='md:hidden'>
          <FrontpageStats
            placement='top'
            stats={statsLoading ? undefined : stats}
            regionsTo={regionsTo}
            numRegions={numRegions}
            regionsLoading={regionsLoading}
            statsLoading={statsLoading}
            isBouldering={meta.isBouldering}
          />
        </div>

        <div className={designContract.layout.frontpageGrid}>
          <aside className='order-1 w-full [overflow-anchor:none] md:col-span-3 md:h-full md:min-h-0'>
            <div className={designContract.layout.asideStack}>
              <div className='hidden md:block'>
                <FrontpageStats
                  placement='sidebar'
                  stats={statsLoading ? undefined : stats}
                  regionsTo={regionsTo}
                  numRegions={numRegions}
                  regionsLoading={regionsLoading}
                  statsLoading={statsLoading}
                  isBouldering={meta.isBouldering}
                />
              </div>
              <RandomMediaCard randomMedia={randomMedia} isLoading={randomMediaLoading} />
            </div>
          </aside>

          <div className='order-2 md:col-span-9 md:pl-1'>
            <Suspense fallback={<ActivityFrontpageSuspenseFallback />}>
              <Activity idArea={0} idSector={0} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default Frontpage;
