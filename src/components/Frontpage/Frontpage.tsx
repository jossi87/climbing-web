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

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-y-0 sm:gap-6 lg:gap-8 py-0 sm:py-8'>
        <aside className='lg:col-span-3 space-y-0 sm:space-y-6'>
          <FrontpageStats
            numMedia={numMedia}
            numProblems={numProblems}
            numTicks={numTicks}
            isBouldering={meta.isBouldering}
            isClimbing={meta.isClimbing}
          />
          <RandomMediaCard randomMedia={randomMedia} />
        </aside>

        <main className='lg:col-span-9'>
          <Activity idArea={0} idSector={0} />
        </main>
      </div>
    </>
  );
};

export default Frontpage;
