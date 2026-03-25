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
  const { data: numMedia } = useData<Success<'getFrontpageNumMedia'>>(`/frontpage/num_media`);
  const { data: numProblems } = useData<Success<'getFrontpageNumProblems'>>(`/frontpage/num_problems`);
  const { data: numTicks } = useData<Success<'getFrontpageNumTicks'>>(`/frontpage/num_ticks`);
  const { data: randomMedia } = useData<Success<'getFrontpageRandomMedia'>>(`/frontpage/random_media`);

  useEffect(() => {
    const update = () => setIsTallEnough(window.innerHeight >= 900);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const type = meta.isBouldering ? 'bouldering problems' : 'climbing routes';
  const description = `${numProblems?.numProblems ?? 0} ${type}, ${numTicks?.numTicks ?? 0} public ascents, ${numMedia?.numImages ?? 0} images, ${numMedia?.numMovies ?? 0} videos.`;

  return (
    <>
      <title>{meta?.title}</title>
      {numMedia && numProblems && numTicks && <meta name='description' content={description} />}

      <div className={`${designContract.layout.pageSection} -mt-6 sm:mt-0`}>
        <div className='lg:hidden'>
          <FrontpageStats
            numMedia={numMedia}
            numProblems={numProblems}
            numTicks={numTicks}
            isBouldering={meta.isBouldering}
            isClimbing={meta.isClimbing}
          />
        </div>

        <div className={designContract.layout.frontpageGrid}>
          <aside className='order-1 lg:col-span-4 xl:col-span-3'>
            <div className={isTallEnough ? designContract.layout.asideStack : 'space-y-4 self-start sm:space-y-6'}>
              <div className='hidden lg:block'>
                <FrontpageStats
                  numMedia={numMedia}
                  numProblems={numProblems}
                  numTicks={numTicks}
                  isBouldering={meta.isBouldering}
                  isClimbing={meta.isClimbing}
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
