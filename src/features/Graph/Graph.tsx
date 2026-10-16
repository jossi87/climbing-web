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
    <>
      <title>{t('meta.pageTitle', { page: t('graph.title'), site: meta.title })}</title>
      <meta name='description' content={description} />
      <ChartGradeDistribution
        data={data}
        header={<SectionHeader title={t('graph.title')} icon={BarChart3} subheader={t('graph.clickBarForDetails')} />}
      />
    </>
  );
};

export default Graph;
