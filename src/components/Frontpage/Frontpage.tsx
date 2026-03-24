import { useMeta } from '../common/meta/context';
import { useData } from '../../api';
import Activity from '../common/activity/activity';
import type { Success } from '../../@types/buldreinfo';
import { FrontpageStats } from './FrontpageStats';
import { RandomMediaCard } from './RandomMediaCard';

const Frontpage = () => {
  const meta = useMeta();
  const { data: numMedia } = useData<Success<'getFrontpageNumMedia'>>(`/frontpage/num_media`);
  const { data: numProblems } =
    useData<Success<'getFrontpageNumProblems'>>(`/frontpage/num_problems`);
  const { data: numTicks } = useData<Success<'getFrontpageNumTicks'>>(`/frontpage/num_ticks`);
  const { data: randomMedia } =
    useData<Success<'getFrontpageRandomMedia'>>(`/frontpage/random_media`);

  const type = meta.isBouldering ? 'bouldering problems' : 'climbing routes';
  const description = `${numProblems?.numProblems ?? 0} ${type}, ${numTicks?.numTicks ?? 0} public ascents, ${numMedia?.numImages ?? 0} images, ${numMedia?.numMovies ?? 0} videos.`;

  return (
    <>
      <title>{meta?.title}</title>
      {numMedia && numProblems && numTicks && <meta name='description' content={description} />}

      <div className='w-full pt-0 pb-6 sm:py-8 px-4'>
        {/* Removed the mb-6 entirely to keep it flush */}
        <div className='lg:hidden'>
          <FrontpageStats
            numMedia={numMedia}
            numProblems={numProblems}
            numTicks={numTicks}
            isBouldering={meta.isBouldering}
            isClimbing={meta.isClimbing}
          />
        </div>

        {/* Changed gap-y-6 back to gap-y-0 on mobile */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-y-0 sm:gap-6 lg:gap-10'>
          <aside className='lg:col-span-4 xl:col-span-3 order-1'>
            {/* Added space-y-0 on mobile so the image doesn't get pushed down */}
            <div className='space-y-0 sm:space-y-6 self-start max-lg:relative lg:[@media(min-height:900px)]:sticky lg:[@media(min-height:900px)]:top-20'>
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

          <main className='lg:col-span-8 xl:col-span-9 order-2'>
            <Activity idArea={0} idSector={0} />
          </main>
        </div>
      </div>
    </>
  );
};

export default Frontpage;
