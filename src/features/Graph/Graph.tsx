import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useData } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import type { Success } from '../../@types/buldreinfo';
import { SectionHeader } from '../../shared/ui';

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

      {/*
        One card per grade system, each headed by the system's own name: a grade label only means something inside its
        own system ('3', '4', … exist in several systems and every system has 'n/a'), so the systems never share an
        axis. The API sends the site's own systems first, then the systems of the regions the user follows.

        Gaps only from `sm`: below that `.app-card` is edge-to-edge, and a gap between two stacked cards would show the
        page canvas as a band between them (same reason the frontpage panels stack flush on phones).
      */}
      <div className='space-y-0 sm:space-y-4'>
        {data.map((graph) => (
          <ChartGradeDistribution
            key={graph.gradeSystemId}
            data={graph.gradeDistribution ?? []}
            header={
              <SectionHeader
                title={graph.gradeSystem ?? ''}
                icon={BarChart3}
                subheader={t('graph.cardSubheader', {
                  // Total of the chart below: the sum of every bar (`GradeGraph.num`), so it always matches the axis.
                  problems: t(meta.isBouldering ? 'counts.boulders' : 'counts.routes', { count: graph.num ?? 0 }),
                  hint: t('graph.clickBarForDetails'),
                })}
              />
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Graph;
