import { Suspense, lazy } from 'react';
import { useMeta } from '../../shared/components/Meta/context';
import { ActivityFrontpageSuspenseFallback } from '../../shared/components/Activity/ActivitySkeleton';
import { designContract } from '../../design/contract';

const ActivityFeed = lazy(() => import('../../shared/components/Activity/Activity'));

/** Standalone Activity page (`/activity`) — reuses the global feed component (`idArea = idSector = 0`). */
const Activity = () => {
  const meta = useMeta();
  const title = meta?.title ? `Activity | ${meta.title}` : 'Activity';

  return (
    <>
      <title>{title}</title>
      <meta name='description' content='Latest first ascents, ticks, comments and media across the site.' />

      <div className={designContract.layout.pageSection}>
        <Suspense fallback={<ActivityFrontpageSuspenseFallback />}>
          <ActivityFeed idArea={0} idSector={0} />
        </Suspense>
      </div>
    </>
  );
};

export default Activity;
