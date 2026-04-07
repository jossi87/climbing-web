import { BarChart3 } from 'lucide-react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useData } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import type { Success } from '../../@types/buldreinfo';
import { SectionHeader } from '../../shared/ui';

const Graph = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getGraph'>>(`/graph`);

  if (!data) {
    return <Loading />;
  }

  const description = meta.isBouldering ? 'Problems grouped by grade' : 'Routes grouped by grade';

  return (
    <>
      <title>{`Graph | ${meta?.title}`}</title>
      <meta name='description' content={description} />
      <ChartGradeDistribution
        data={data}
        header={<SectionHeader title='Grade Distribution' icon={BarChart3} subheader='Click bar for details' />}
      />
    </>
  );
};

export default Graph;
