import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol } from '../../ui/Indicators';
import { useProfileTodo } from '../../../api';
import { Loading } from '../../ui/StatusWidgets';
import ProblemList from '../ProblemList';
import { useMeta } from '../Meta';
import { ProfileRowAsterisk } from './ProfileRowAsterisk';
import { profileRowRootClass, tickCragLink, tickFlags, tickProblemLink, tickWhenGrade } from './profileRowTypography';
import { cn } from '../../../lib/utils';

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
  gradeNumber: number;
  coordinates?: { latitude: number; longitude: number };
  problemLockedAdmin: boolean;
  problemLockedSuperadmin: boolean;
  partners: TodoPartner[];
};

const TodoListItem = ({ item }: { item: TodoItem }) => (
  <div className={cn(profileRowRootClass, 'text-pretty [overflow-wrap:anywhere]')}>
    <Link to={`/area/${item.areaId}`} className={tickCragLink}>
      {item.areaName}
    </Link>
    <LockSymbol lockedAdmin={item.areaLockedAdmin} lockedSuperadmin={item.areaLockedSuperadmin} />
    <ProfileRowAsterisk />
    <Link to={`/sector/${item.sectorId}`} className={tickCragLink}>
      {item.sectorName}
    </Link>
    <LockSymbol lockedAdmin={item.sectorLockedAdmin} lockedSuperadmin={item.sectorLockedSuperadmin} />
    <ProfileRowAsterisk />
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
        {' '}
        <span className='inline-flex min-w-0 flex-wrap content-start items-center gap-x-2 gap-y-1'>
          {item.partners.map((p) => (
            <Link key={p.id} to={`/user/${p.id}/todo`} className={cn(tickFlags, 'hover:text-brand transition-colors')}>
              {p.name}
            </Link>
          ))}
        </span>
      </>
    ) : null}
  </div>
);

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
            gradeNumber: resolveGradeId(problem.grade ?? 'n/a'),
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
          storageKey={`user/${userId}/todo`}
          mode='user'
          defaultOrder='name'
          excludedSortOptions={['date']}
          contentBeforeList={(filteredRows) => {
            const filteredMarkers = filteredRows.flatMap((row) => (row.marker ? [row.marker] : []));
            if (filteredMarkers.length === 0) return null;
            return (
              <div className='-mx-4 mb-3 h-[35vh] w-[calc(100%+2rem)] min-w-0 overflow-hidden sm:-mx-6 sm:w-[calc(100%+3rem)]'>
                <Leaflet
                  key={'todo-inline=' + userId}
                  autoZoom={true}
                  height='100%'
                  markers={filteredMarkers}
                  defaultCenter={defaultCenter}
                  defaultZoom={defaultZoom}
                  showSatelliteImage={false}
                  clusterMarkers={true}
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
            gradeNumber: item.gradeNumber,
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
