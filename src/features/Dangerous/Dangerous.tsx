import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { useData, useToc } from '../../api';
import TableOfContents from '../../shared/components/TableOfContents';
import type { Success } from '../../@types/buldreinfo';
import type { components } from '../../@types/buldreinfo/swagger';
import { AlertTriangle, Map as MapIcon } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';
import { ProblemsMap } from '../../shared/components/TableOfContents/ProblemsMap';

const Dangerous = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getDangerous'>>(`/dangerous`);
  const { data: tocData } = useToc();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
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
        <div className='flex flex-wrap items-start justify-between gap-2 p-4 sm:p-5'>
          <SectionHeader title='Dangerous' icon={AlertTriangle} subheader={description} />
          <button
            type='button'
            onClick={() => setIsMapModalOpen(true)}
            className='bg-surface-nav/25 hover:bg-surface-nav/40 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-2.5 text-[11px] leading-none font-medium text-slate-300 transition-colors hover:text-slate-200 sm:text-[12px]'
          >
            <MapIcon size={11} />
            Map
          </button>
        </div>
        <div className='p-4 sm:p-5'>
          <TableOfContents areas={areas} compact />
        </div>
      </Card>
      {isMapModalOpen &&
        createPortal(
          <div className='fixed inset-0 z-[120]'>
            <div className='bg-surface-dark/95 absolute inset-0' onClick={() => setIsMapModalOpen(false)} />
            <div className='absolute inset-0'>
              <ProblemsMap areas={mapAreas} fullHeight />
            </div>
            <button
              type='button'
              onClick={() => setIsMapModalOpen(false)}
              className='bg-brand/95 hover:bg-brand absolute top-0 right-0 z-[130] rounded-bl-md px-2.5 py-1.5 text-base leading-none font-semibold text-slate-950 shadow-lg transition-colors'
            >
              ✕
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Dangerous;
