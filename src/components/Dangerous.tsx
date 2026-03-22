import { Loading } from './common/widgets/widgets';
import { useMeta } from './common/meta/context';
import { useData } from '../api';
import TableOfContents from './common/TableOfContents';
import type { Success } from '../@types/buldreinfo';
import type { components } from '../@types/buldreinfo/swagger';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const Dangerous = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getDangerous'>>(`/dangerous`);

  if (!data) {
    return <Loading />;
  }

  const safeData = data ?? [];
  const numAreas = safeData.length;
  const [numSectors, numProblems] = safeData.reduce(
    ([sectors, problems], area) => [
      sectors + (area.sectors?.length ?? 0),
      problems +
        (area.sectors ?? []).reduce((acc, sector) => acc + (sector.problems?.length ?? 0), 0),
    ],
    [0, 0],
  );

  const description = `${numProblems} ${
    meta.isClimbing ? 'routes' : 'boulders'
  } flagged as dangerous (located in ${numAreas} areas, ${numSectors} sectors)`;

  const areas = safeData.map((area) => ({
    id: area.id ?? 0,
    lockedAdmin: !!area.lockedAdmin,
    lockedSuperadmin: !!area.lockedSuperadmin,
    sunFromHour: area.sunFromHour ?? 0,
    sunToHour: area.sunToHour ?? 0,
    name: area.name ?? '',
    sectors: (area.sectors ?? []).map((sector) => ({
      id: sector.id ?? 0,
      lockedAdmin: !!sector.lockedAdmin,
      lockedSuperadmin: !!sector.lockedSuperadmin,
      polygonCoords: '',
      wallDirectionCalculated:
        sector.wallDirectionCalculated ?? ({} as components['schemas']['CompassDirection']),
      wallDirectionManual:
        sector.wallDirectionManual ?? ({} as components['schemas']['CompassDirection']),
      name: sector.name ?? '',
      sunFromHour: sector.sunFromHour ?? 0,
      sunToHour: sector.sunToHour ?? 0,
      problems: (sector.problems ?? []).map((problem) => ({
        id: problem.id ?? 0,
        broken: problem.broken,
        lockedAdmin: !!problem.lockedAdmin,
        lockedSuperadmin: !!problem.lockedSuperadmin,
        name: problem.name ?? '',
        nr: problem.nr ?? 0,
        grade: problem.grade ?? '',
        text: problem.postTxt,
        subText: '(' + problem.postWhen + ' - ' + problem.postBy + ')',
      })),
    })),
  }));

  return (
    <div className='max-w-container mx-auto px-4 py-6 space-y-6 text-left'>
      <title>{`Dangerous | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500'>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <AlertTriangle size={14} className='text-red-500' />
            <span className='uppercase'>Dangerous</span>
            <span className='text-slate-500 font-mono normal-case'>({description})</span>
          </div>
        </nav>
      </div>

      <div className='bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm p-6'>
        <TableOfContents areas={areas} />
      </div>
    </div>
  );
};

export default Dangerous;
