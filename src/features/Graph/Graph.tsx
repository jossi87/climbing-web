import { BarChart3 } from 'lucide-react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useData } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import type { Success } from '../../@types/buldreinfo';
import { designContract } from '../../design/contract';

const Graph = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getGraph'>>(`/graph`);

  if (!data) return <Loading />;

  const description = meta.isBouldering ? 'Problems grouped by grade' : 'Routes grouped by grade';

  return (
    <div className='max-w-container mx-auto px-4 py-6'>
      <title>{`Graph | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <div className='mb-6 flex flex-col gap-1 text-left'>
        <div className='flex items-center gap-3'>
          <BarChart3 className='text-slate-400' size={24} />
          <h1 className={designContract.typography.title}>Grade Distribution</h1>
        </div>
        <p className='ml-9 text-xs font-bold tracking-widest text-slate-400 uppercase italic'>{description}</p>
      </div>

      <div className='bg-surface-card border-surface-border rounded-xl border p-6 shadow-sm'>
        <ChartGradeDistribution data={data} />
      </div>
    </div>
  );
};

export default Graph;
