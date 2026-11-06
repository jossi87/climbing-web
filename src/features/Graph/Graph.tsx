import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useData } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import type { Success } from '../../@types/buldreinfo';
import { Card, SectionHeader } from '../../shared/ui';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

const Graph = () => {
  const { t } = useTranslation();
  const meta = useMeta();
  const { data } = useData<Success<'getGraph'>>(`/graph`);

  if (!data) {
    return <Loading />;
  }

  const description = t(meta.isBouldering ? 'graph.descriptionProblems' : 'graph.descriptionRoutes');

  return (
    <div className='w-full min-w-0'>
      <title>{t('meta.pageTitle', { page: t('graph.title'), site: meta.title })}</title>
      <meta name='description' content={description} />

      <Card flush className='min-w-0 border-0'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <SectionHeader
            title={t('graph.title')}
            icon={BarChart3}
            subheader={t('graph.clickBarForDetails')}
            className='mb-4 sm:mb-5'
          />
        </div>
        {/*
          One chart per grade system: a grade label only means something inside its own system ('3', '4', … exist in
          several systems and every system has 'n/a'), so the systems must not share an axis. The API sends the site's
          own systems first, then the systems of the regions the user follows.
        */}
        <div className='space-y-10 p-4 sm:p-5'>
          {data.map((graph) => (
            <section key={graph.gradeSystemId}>
              <div className='border-surface-border mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b-2 pb-2'>
                <h2 className={cn(designContract.typography.subtitle, 'text-slate-100')}>{graph.gradeSystem}</h2>
                <span className={cn(designContract.typography.meta, 'text-slate-500 tabular-nums')}>
                  {t(meta.isBouldering ? 'counts.boulders' : 'counts.routes', { count: graph.num ?? 0 })}
                </span>
              </div>
              <ChartGradeDistribution data={graph.gradeDistribution ?? []} embedded />
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Graph;
