import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol } from '../../ui/Indicators';
import { useProfileTodo } from '../../../api';
import { Loading } from '../../ui/StatusWidgets';
import ProblemList from '../ProblemList';
import { useMeta } from '../Meta';
import {
  profileRowRootClass,
  tickCragLinkArea,
  tickCragLinkSector,
  tickFlags,
  tickProblemLink,
  tickWhenGrade,
} from './profileRowTypography';
import { cn } from '../../../lib/utils';
import { ProfileRowTextSep } from './ProfileRowTextSep';
import type { MarkerDef } from '../Leaflet/markers';
import { designContract } from '../../../design/contract';
import type { components } from '../../../@types/buldreinfo/swagger';

type ProfileTodoProps = {
  userId: number;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
};

type TodoPartner = {
  id: number;
  name?: string;
};

type TodoItem = {
  id: number;
  todoId: number;
  nr: number | null;
  areaId: number;
  areaName: string;
  areaLockedAdmin: boolean;
  areaLockedSuperadmin: boolean;
  sectorId: number;
  sectorName: string;
  sectorLockedAdmin: boolean;
  sectorLockedSuperadmin: boolean;
  problemName: string;
  grade: string;
  gradeWeight: number;
  coordinates?: { latitude: number; longitude: number };
  problemLockedAdmin: boolean;
  problemLockedSuperadmin: boolean;
  partners: TodoPartner[];
};

const TodoListItem = ({ item }: { item: TodoItem }) => (
  <div className={cn(profileRowRootClass, 'text-pretty [overflow-wrap:anywhere]')}>
    <Link to={`/area/${item.areaId}`} className={tickCragLinkArea}>
      {item.areaName}
    </Link>
    <LockSymbol lockedAdmin={item.areaLockedAdmin} lockedSuperadmin={item.areaLockedSuperadmin} />
    {item.areaLockedAdmin || item.areaLockedSuperadmin ? ' ' : <ProfileRowTextSep />}
    <Link to={`/sector/${item.sectorId}`} className={tickCragLinkSector}>
      {item.sectorName}
    </Link>
    <LockSymbol lockedAdmin={item.sectorLockedAdmin} lockedSuperadmin={item.sectorLockedSuperadmin} />
    {item.sectorLockedAdmin || item.sectorLockedSuperadmin ? ' ' : <ProfileRowTextSep />}
    <Link to={`/problem/${item.id}`} className={tickProblemLink}>
      {item.problemName}
    </Link>
    {item.grade ? (
      <>
        {' '}
        <span className={cn(tickWhenGrade, 'whitespace-nowrap tabular-nums')}>{item.grade}</span>
      </>
    ) : null}
    <LockSymbol lockedAdmin={item.problemLockedAdmin} lockedSuperadmin={item.problemLockedSuperadmin} />
    {item.partners.length > 0 ? (
      <>
        {item.problemLockedAdmin || item.problemLockedSuperadmin ? ' ' : <ProfileRowTextSep />}
        <span className='inline-flex min-w-0 flex-wrap content-start items-center gap-x-2 gap-y-1'>
          {item.partners.map((p) => (
            <Link
              key={p.id}
              to={`/user/${p.id}/todo`}
              className={cn(tickFlags, 'hover:text-status-todo transition-colors')}
            >
              {p.name}
            </Link>
          ))}
        </span>
      </>
    ) : null}
  </div>
);

/**
 * Compute a single marker per area, placed at the centroid of all problems in that area.
 * Clicking the marker shows a popup listing all problems grouped by sector.
 */
function computeAreaMarkers(areas: components['schemas']['ProfileTodoArea'][]): MarkerDef[] {
  return areas
    .map((area) => {
      const sectors = area.sectors ?? [];
      // Collect all problems with coordinates in this area
      const problemsWithCoords = sectors.flatMap((sector) =>
        (sector.problems ?? []).filter((p) => p.coordinates?.latitude != null && p.coordinates?.longitude != null),
      );

      if (problemsWithCoords.length === 0) return null;

      // Compute centroid
      const sumLat = problemsWithCoords.reduce((sum, p) => sum + (p.coordinates?.latitude ?? 0), 0);
      const sumLng = problemsWithCoords.reduce((sum, p) => sum + (p.coordinates?.longitude ?? 0), 0);
      const centerLat = sumLat / problemsWithCoords.length;
      const centerLng = sumLng / problemsWithCoords.length;

      // Build popup content: problems grouped by sector
      const popupContent = (
        <div className='max-h-[280px] min-w-48 space-y-3 overflow-y-auto py-1'>
          {sectors
            .filter((s) => (s.problems ?? []).some((p) => p.coordinates?.latitude != null))
            .map((sector) => {
              const sectorProblems = (sector.problems ?? []).filter((p) => p.coordinates?.latitude != null);
              return (
                <div key={sector.id} className='space-y-1'>
                  <div className='flex items-center gap-1'>
                    <Link
                      to={`/sector/${sector.id}`}
                      className={cn(
                        designContract.typography.meta,
                        'font-medium underline-offset-2 transition-colors hover:underline',
                        'text-slate-400 hover:text-slate-200',
                      )}
                    >
                      {sector.name}
                    </Link>
                    <LockSymbol lockedAdmin={sector.lockedAdmin} lockedSuperadmin={sector.lockedSuperadmin} />
                  </div>
                  <div className='flex flex-col gap-0.5'>
                    {sectorProblems.map((problem) => (
                      <div key={problem.id} className='flex items-center gap-1.5 pl-2'>
                        <Link
                          to={`/problem/${problem.id}`}
                          className={cn(
                            designContract.typography.body,
                            'buldreinfo-popup-primary-link font-medium underline-offset-2 transition-colors hover:underline',
                          )}
                        >
                          {problem.nr != null ? `#${problem.nr} ` : ''}
                          {problem.name}
                        </Link>
                        {problem.grade ? (
                          <span className='text-[11px] font-medium whitespace-nowrap text-slate-500 tabular-nums'>
                            {problem.grade}
                          </span>
                        ) : null}
                        <LockSymbol lockedAdmin={problem.lockedAdmin} lockedSuperadmin={problem.lockedSuperadmin} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      );

      return {
        id: area.id ?? 0,
        coordinates: {
          latitude: centerLat,
          longitude: centerLng,
        },
        label: `${area.name ?? ''} [${problemsWithCoords.length}]`,
        html: popupContent,
      } as MarkerDef;
    })
    .filter((m): m is MarkerDef => m !== null);
}

const ProfileTodo = ({ userId, defaultCenter, defaultZoom }: ProfileTodoProps) => {
  const { data } = useProfileTodo(userId);
  const { grades } = useMeta();

  const gradeToId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of grades) {
      if (g.grade) map[g.grade] = g.id;
    }
    return map;
  }, [grades]);

  const resolveGradeId = useCallback(
    (gradeLabel: string) => {
      if (gradeToId[gradeLabel] !== undefined) return gradeToId[gradeLabel];
      const normalized = gradeLabel.trim().toLowerCase();
      const normalizedNoSpaces = normalized.replace(/\s+/g, '');
      for (const g of grades) {
        const candidate = (g.grade ?? '').toLowerCase();
        if (!candidate) continue;
        if (candidate === normalized) return g.id;
        if (candidate.includes(`(${normalized})`)) return g.id;
        if (candidate.replace(/\s+/g, '') === normalizedNoSpaces) return g.id;
        if (candidate.replace(/\s+/g, '').includes(`(${normalizedNoSpaces})`)) return g.id;
      }
      return 0;
    },
    [gradeToId, grades],
  );

  const areas = useMemo(() => data?.areas ?? [], [data?.areas]);

  const items = useMemo<TodoItem[]>(
    () =>
      areas.flatMap((area) =>
        (area.sectors ?? []).flatMap((sector) =>
          (sector.problems ?? []).map((problem) => ({
            id: problem.id ?? 0,
            todoId: problem.todoId ?? 0,
            nr: problem.nr ?? null,
            areaId: area.id ?? 0,
            areaName: area.name ?? '',
            areaLockedAdmin: !!area.lockedAdmin,
            areaLockedSuperadmin: !!area.lockedSuperadmin,
            sectorId: sector.id ?? 0,
            sectorName: sector.name ?? '',
            sectorLockedAdmin: !!sector.lockedAdmin,
            sectorLockedSuperadmin: !!sector.lockedSuperadmin,
            problemName: problem.name ?? '',
            grade: problem.grade ?? '',
            gradeWeight: resolveGradeId(problem.grade ?? 'n/a'),
            coordinates:
              problem.coordinates?.latitude != null && problem.coordinates?.longitude != null
                ? {
                    latitude: problem.coordinates.latitude,
                    longitude: problem.coordinates.longitude,
                  }
                : undefined,
            problemLockedAdmin: !!problem.lockedAdmin,
            problemLockedSuperadmin: !!problem.lockedSuperadmin,
            partners: (problem.partners ?? []).map((p) => ({
              id: p.id ?? 0,
              name: p.name,
            })),
          })),
        ),
      ),
    [areas, resolveGradeId],
  );

  // Compute area-level markers for the map
  const areaMarkers = useMemo<MarkerDef[]>(() => computeAreaMarkers(areas), [areas]);

  if (!data) {
    return <Loading inline />;
  }

  if (items.length === 0) {
    return <div className='py-10 text-center text-slate-500'>Empty list.</div>;
  }

  return (
    <>
      <div className='space-y-4'>
        <ProblemList
          key={`user/${userId}/todo`}
          storageKey={`user/${userId}/todo`}
          mode='user'
          defaultOrder='name'
          excludedSortOptions={['date']}
          contentBeforeList={(filteredRows) => {
            // When filtering is active, show individual problem markers on the map
            // When no filter is active, show area-level markers
            const isFiltered = filteredRows.length < items.length;
            const markers = isFiltered ? filteredRows.flatMap((row) => (row.marker ? [row.marker] : [])) : areaMarkers;
            if (markers.length === 0) return null;
            return (
              <div className='-mx-4 mb-3 h-[35vh] w-[calc(100%+2rem)] min-w-0 overflow-hidden sm:-mx-6 sm:w-[calc(100%+3rem)]'>
                <Leaflet
                  key={'todo-inline=' + userId + (isFiltered ? '-filtered' : '-areas')}
                  autoZoom={true}
                  height='100%'
                  markers={markers}
                  defaultCenter={defaultCenter}
                  defaultZoom={defaultZoom}
                  showSatelliteImage={false}
                  clusterMarkers={!isFiltered}
                  flyToId={null}
                />
              </div>
            );
          }}
          rows={items.map((item) => ({
            element: <TodoListItem key={`todo-${item.id}-${item.nr ?? 'n'}`} item={item} />,
            areaName: item.areaName,
            sectorName: item.sectorName,
            name: item.problemName,
            nr: item.nr,
            gradeWeight: item.gradeWeight,
            stars: 0,
            numTicks: 0,
            ticked: false,
            rock: '',
            subType: '',
            num: item.todoId,
            fa: false,
            faDate: null,
            marker: item.coordinates
              ? {
                  coordinates: item.coordinates,
                  label: item.problemName,
                  url: '/problem/' + item.id,
                }
              : undefined,
          }))}
        />
      </div>
    </>
  );
};

export default ProfileTodo;
