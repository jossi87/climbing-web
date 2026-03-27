import { useMemo } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { useData, useToc } from '../../api';
import TableOfContents from '../../shared/components/TableOfContents';
import type { Success } from '../../@types/buldreinfo';
import type { components } from '../../@types/buldreinfo/swagger';
import { AlertTriangle } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';
import { ProblemsMap } from '../../shared/components/TableOfContents/ProblemsMap';

const Dangerous = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getDangerous'>>(`/dangerous`);
  const { data: tocData } = useToc();
  const safeData = useMemo(() => data ?? [], [data]);
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
        subText: [problem.postWhen, problem.postBy].filter(Boolean).join(' · '),
      })),
    })),
  }));

  const mapAreas = useMemo(() => {
    if (!tocData?.regions?.length) return [];

    const dangerousMetaById = new Map<number, { text?: string; subText?: string }>();
    for (const area of safeData) {
      for (const sector of area.sectors ?? []) {
        for (const problem of sector.problems ?? []) {
          const id = problem.id ?? 0;
          if (!id) continue;
          dangerousMetaById.set(id, {
            text: problem.postTxt,
            subText: [problem.postWhen, problem.postBy].filter(Boolean).join(' · '),
          });
        }
      }
    }

    return (
      tocData.regions?.flatMap((region) =>
        (region.areas ?? [])
          .map((area) => ({
            id: area.id ?? 0,
            lockedAdmin: !!area.lockedAdmin,
            lockedSuperadmin: !!area.lockedSuperadmin,
            sunFromHour: area.sunFromHour ?? 0,
            sunToHour: area.sunToHour ?? 0,
            name: area.name ?? '',
            lat: area.coordinates?.latitude,
            lng: area.coordinates?.longitude,
            sectors: (area.sectors ?? [])
              .map((sector) => ({
                id: sector.id ?? 0,
                lockedAdmin: !!sector.lockedAdmin,
                lockedSuperadmin: !!sector.lockedSuperadmin,
                name: sector.name ?? '',
                lat: sector.parking?.latitude,
                lng: sector.parking?.longitude,
                outline: sector.outline,
                wallDirectionCalculated:
                  sector.wallDirectionCalculated ?? ({} as components['schemas']['CompassDirection']),
                wallDirectionManual: sector.wallDirectionManual ?? ({} as components['schemas']['CompassDirection']),
                sunFromHour: sector.sunFromHour ?? 0,
                sunToHour: sector.sunToHour ?? 0,
                problems: (sector.problems ?? [])
                  .filter((problem) => dangerousMetaById.has(problem.id ?? 0))
                  .map((problem) => ({
                    id: problem.id ?? 0,
                    broken: problem.broken ?? '',
                    lockedAdmin: !!problem.lockedAdmin,
                    lockedSuperadmin: !!problem.lockedSuperadmin,
                    name: problem.name ?? '',
                    lat: problem.coordinates?.latitude,
                    lng: problem.coordinates?.longitude,
                    coordinates: problem.coordinates,
                    nr: problem.nr ?? 0,
                    grade: problem.grade ?? '',
                    stars: problem.stars,
                    ticked: problem.ticked,
                    todo: problem.todo,
                    text: dangerousMetaById.get(problem.id ?? 0)?.text,
                    subText: dangerousMetaById.get(problem.id ?? 0)?.subText,
                  })),
              }))
              .filter((sector) => sector.problems.length > 0),
          }))
          .filter((area) => area.sectors.length > 0),
      ) ?? []
    );
  }, [safeData, tocData]);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className='w-full min-w-0'>
      <title>{`Dangerous | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <SectionHeader title='Dangerous' icon={AlertTriangle} subheader={description} />
        </div>
        <div className='mb-2'>
          <ProblemsMap areas={mapAreas} />
        </div>
        <div className='p-4 sm:p-5'>
          <TableOfContents areas={areas} compact />
        </div>
      </Card>
    </div>
  );
};

export default Dangerous;
