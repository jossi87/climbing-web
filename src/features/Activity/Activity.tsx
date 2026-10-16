import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useMeta } from '../../shared/components/Meta/context';
import { ActivityFrontpageSuspenseFallback } from '../../shared/components/Activity/ActivitySkeleton';
import { designContract } from '../../design/contract';

const ActivityFeed = lazy(() => import('../../shared/components/Activity/Activity'));

/** Standalone Activity page (`/activity`) — reuses the global feed component (`idArea = idSector = 0`). */
const Activity = () => {
  const { t } = useTranslation();
  const meta = useMeta();
  const title = meta?.title
    ? t('meta.pageTitle', { page: t('place.activity'), site: meta.title })
    : t('place.activity');

  return (
    <>
      <title>{title}</title>
      <meta name='description' content={t('activityFeed.metaDescription')} />

      <div className={designContract.layout.pageSection}>
        <Suspense fallback={<ActivityFrontpageSuspenseFallback />}>
          <ActivityFeed idArea={0} idSector={0} />
        </Suspense>
      </div>
    </>
  );
};

export default Activity;
