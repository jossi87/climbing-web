import { BarChart3 } from 'lucide-react';
import { Loading } from './ui/StatusWidgets';
import { useData } from '../api';
import { useMeta } from './common/meta/context';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import type { Success } from '../@types/buldreinfo';

const Graph = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getGraph'>>(`/graph`);

  if (!data) return <Loading />;

  const description = meta.isBouldering ? 'Problems grouped by grade' : 'Routes grouped by grade';

  return (
    <div className='max-w-container mx-auto px-4 py-8'>
      <title>{`Graph | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <div className='flex flex-col gap-1 mb-8 text-left'>
        <div className='flex items-center gap-3'>
          <BarChart3 className='text-slate-400' size={24} />
          <h1 className='text-2xl font-bold text-white tracking-tight'>Grade Distribution</h1>
        </div>
        <p className='text-slate-400 text-xs ml-9 font-bold uppercase tracking-widest italic'>
          {description}
        </p>
      </div>

      <div className='bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm'>
        <ChartGradeDistribution data={data} />
      </div>
    </div>
  );
};

export default Graph;
