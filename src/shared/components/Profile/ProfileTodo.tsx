import { Fragment, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol } from '../../ui/Indicators';
import { useProfileTodo } from '../../../api';
import { ChevronRight } from 'lucide-react';
import { Loading } from '../../ui/StatusWidgets';
import ProblemList from '../ProblemList';
import { useMeta } from '../Meta';

type ProfileTodoProps = {
  userId: number;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
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
  partners: Array<{ id: number; name: string }>;
};

const TodoListItem = ({ item }: { item: TodoItem }) => (
  <div className='py-1.5 text-[11px] leading-relaxed break-words text-slate-300 sm:text-[12px]'>
    <Link to={`/area/${item.areaId}`} className='hover:text-brand text-slate-300 transition-colors'>
      {item.areaName}
    </Link>
    <LockSymbol lockedAdmin={item.areaLockedAdmin} lockedSuperadmin={item.areaLockedSuperadmin} />
    <span className='text-slate-500'> · </span>
    <Link to={`/sector/${item.sectorId}`} className='hover:text-brand text-slate-300 transition-colors'>
      {item.sectorName}
    </Link>
    <LockSymbol lockedAdmin={item.sectorLockedAdmin} lockedSuperadmin={item.sectorLockedSuperadmin} />
    <span className='text-slate-500'> · </span>
    {item.nr !== null ? <span>#{item.nr} </span> : null}
    <Link to={`/problem/${item.id}`} className='hover:text-brand text-slate-100 transition-colors'>
      {item.problemName}
    </Link>
    <span className='ml-1 text-slate-300'>{item.grade}</span>
    <LockSymbol lockedAdmin={item.problemLockedAdmin} lockedSuperadmin={item.problemLockedSuperadmin} />
    {item.partners.length > 0 && (
      <div className='mt-0.5 text-[10px] leading-snug text-slate-500 sm:text-[11px]'>
        <ChevronRight size={10} className='mr-0.5 inline-block opacity-25' />
        Other users:{' '}
        {item.partners.map((u, i) => (
          <Fragment key={u.id}>
            <Link to={`/user/${u.id}/todo`} className='hover:text-brand text-slate-500 transition-colors'>
              {u.name}
            </Link>
            {i < item.partners.length - 1 ? <span className='opacity-30'>, </span> : null}
          </Fragment>
        ))}
      </div>
    )}
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
            partners: (problem.partners ?? []).map((p) => ({ id: p.id ?? 0, name: p.name ?? '' })),
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
              <div className='-mx-4 mb-3 h-[35vh] w-[calc(100%+2rem)] min-w-0 overflow-hidden sm:-mx-5 sm:w-[calc(100%+2.5rem)]'>
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
