import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { useData } from '../../api';
import TableOfContents from '../../shared/components/TableOfContents';
import type { Success } from '../../@types/buldreinfo';
import type { components } from '../../@types/buldreinfo/swagger';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

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
      problems + (area.sectors ?? []).reduce((acc, sector) => acc + (sector.problems?.length ?? 0), 0),
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
      wallDirectionCalculated: sector.wallDirectionCalculated ?? ({} as components['schemas']['CompassDirection']),
      wallDirectionManual: sector.wallDirectionManual ?? ({} as components['schemas']['CompassDirection']),
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
    <div className={designContract.layout.pageShell}>
      <title>{`Dangerous | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <div className={designContract.layout.pageHeaderRow}>
        <nav className={designContract.layout.breadcrumb}>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='type-small flex items-center gap-1.5'>
            <AlertTriangle size={14} className='text-red-500' />
            <span className='uppercase'>Dangerous</span>
            <span className='font-mono text-slate-500 normal-case'>({description})</span>
          </div>
        </nav>
      </div>

      <div className={cn(designContract.surfaces.card, 'overflow-hidden p-6')}>
        <TableOfContents areas={areas} />
      </div>
    </div>
  );
};

export default Dangerous;
