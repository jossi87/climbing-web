import { useEffect, useState } from 'react';
import { useMeta } from '../../shared/components/Meta/context';
import { useData } from '../../api';
import Activity from '../../shared/components/Activity/Activity';
import type { Success } from '../../@types/buldreinfo';
import { FrontpageStats } from './FrontpageStats';
import { RandomMediaCard } from './RandomMediaCard';
import { designContract } from '../../design/contract';

const Frontpage = () => {
  const meta = useMeta();
  const [isTallEnough, setIsTallEnough] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight >= 900 : true,
  );
  const { data: stats, isPending: statsPending } = useData<Success<'getFrontpageStats'>>(`/frontpage/stats`);
  const { data: randomMedia } = useData<Success<'getFrontpageRandomMedia'>>(`/frontpage/random_media`);

  useEffect(() => {
    const update = () => setIsTallEnough(window.innerHeight >= 900);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

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
        <div className='lg:hidden'>
          <FrontpageStats
            stats={stats}
            regionsTo={regionsTo}
            numRegions={numRegions}
            regionsLoading={!meta.title}
            statsLoading={statsPending}
            isBouldering={meta.isBouldering}
          />
        </div>

        <div className={designContract.layout.frontpageGrid}>
          <aside className='order-1 w-full lg:col-span-4 xl:col-span-3'>
            <div
              className={
                isTallEnough
                  ? designContract.layout.asideStack
                  : 'w-full space-y-4 self-start sm:space-y-6 lg:static lg:top-auto'
              }
            >
              <div className='hidden lg:block'>
                <FrontpageStats
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

          <main className='order-2 lg:col-span-8 lg:pl-1 xl:col-span-9 xl:pl-2'>
            <Activity idArea={0} idSector={0} />
          </main>
        </div>
      </div>
    </>
  );
};

export default Frontpage;
