import { useMeta } from '../../shared/components/Meta/context';
import { useData } from '../../api';
import type { Success } from '../../@types/buldreinfo';
import { FrontpageStats } from './FrontpageStats';
import { RandomMediaCard } from './RandomMediaCard';
import { FrontpageActivityPanels } from './FrontpageActivityPanels';
import { designContract } from '../../design/contract';

/**
 * **Single `/frontpage` request** drives the entire page (stats, random media, four activity buckets). The endpoint
 * was split into three (`/frontpage/stats`, `/frontpage/random_media`, `/frontpage/activity`) up until the latest
 * Swagger update — now consolidated to keep payloads coherent (one cache entry, one loading state, one network
 * round-trip). Frontpage-only consumers should keep using this aggregate; deep links into `/areas`, `/problems`,
 * `/ticks/1` still hit their own endpoints.
 */
const Frontpage = () => {
  const meta = useMeta();
  const { data: frontpage, isPending: frontpagePending } = useData<Success<'getFrontpage'>>(`/frontpage`);

  const metaReady = Boolean(meta?.title);
  /** Single loading flag now — no more staggered CLS between stats / featured media / activity panels. */
  const isLoading = !metaReady || frontpagePending;
  const regionsLoading = !metaReady;

  const stats = frontpage?.stats;
  const randomMedia = frontpage?.randomMedia;

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
            stats={isLoading ? undefined : stats}
            regionsTo={regionsTo}
            numRegions={numRegions}
            regionsLoading={regionsLoading}
            statsLoading={isLoading}
            isBouldering={meta.isBouldering}
          />
        </div>

        <div className={designContract.layout.frontpageGrid}>
          <aside className='order-1 w-full md:col-span-3'>
            <div className={designContract.layout.asideStack}>
              <div className='hidden md:block'>
                <FrontpageStats
                  placement='sidebar'
                  stats={isLoading ? undefined : stats}
                  regionsTo={regionsTo}
                  numRegions={numRegions}
                  regionsLoading={regionsLoading}
                  statsLoading={isLoading}
                  isBouldering={meta.isBouldering}
                />
              </div>
              <RandomMediaCard randomMedia={randomMedia} isLoading={isLoading} />
            </div>
          </aside>

          <div className='order-2 md:col-span-9 md:pl-1'>
            <FrontpageActivityPanels frontpage={frontpage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Frontpage;
