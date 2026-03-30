import { useMeta } from '../../shared/components/Meta/context';
import { useData } from '../../api';
import Activity from '../../shared/components/Activity/Activity';
import type { Success } from '../../@types/buldreinfo';
import { FrontpageStats } from './FrontpageStats';
import { RandomMediaCard } from './RandomMediaCard';
import { designContract } from '../../design/contract';

const Frontpage = () => {
  const meta = useMeta();
  const { data: stats, isPending: statsPending } = useData<Success<'getFrontpageStats'>>(`/frontpage/stats`);
  const { data: randomMedia } = useData<Success<'getFrontpageRandomMedia'>>(`/frontpage/random_media`);

  const type = meta.isBouldering ? 'bouldering problems' : 'climbing routes';
  /** Entries in meta.sites for the active site’s group (header region list scope). */
  const activeSite = meta.sites?.find((s) => s.active);
  const numRegions = activeSite ? (meta.sites?.filter((s) => s.group === activeSite.group).length ?? 0) : 0;
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
            stats={stats}
            regionsTo={regionsTo}
            numRegions={numRegions}
            regionsLoading={!meta.title}
            statsLoading={statsPending}
            isBouldering={meta.isBouldering}
          />
        </div>

        <div className={designContract.layout.frontpageGrid}>
          <aside className='order-1 w-full md:col-span-4'>
            <div className={designContract.layout.asideStack}>
              <div className='hidden md:block'>
                <FrontpageStats
                  placement='sidebar'
                  stats={stats}
                  regionsTo={regionsTo}
                  numRegions={numRegions}
                  regionsLoading={!meta.title}
                  statsLoading={statsPending}
                  isBouldering={meta.isBouldering}
                />
              </div>
              <RandomMediaCard randomMedia={randomMedia} />
            </div>
          </aside>

          <main className='order-2 md:col-span-8 md:pl-1'>
            <Activity idArea={0} idSector={0} layoutDensity='frontpage' />
          </main>
        </div>
      </div>
    </>
  );
};

export default Frontpage;
