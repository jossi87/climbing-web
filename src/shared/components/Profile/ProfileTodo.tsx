import { type ComponentProps, Fragment, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol } from '../../ui/Indicators';
import { useProfileTodo } from '../../../api';
import { ChevronRight, Map as MapIcon } from 'lucide-react';
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
  problemLockedAdmin: boolean;
  problemLockedSuperadmin: boolean;
  partners: Array<{ id: number; name: string }>;
};

const TodoListItem = ({ item }: { item: TodoItem }) => (
  <div className='py-1.5 text-[11px] leading-relaxed break-words text-slate-300'>
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
      <div className='mt-0.5 text-[10px] leading-snug text-slate-500'>
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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
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

  const markers = useMemo<NonNullable<ComponentProps<typeof Leaflet>['markers']>>(
    () =>
      areas.flatMap((a) =>
        (a.sectors ?? []).flatMap((s) =>
          (s.problems ?? []).flatMap((p) =>
            p.coordinates
              ? [
                  {
                    coordinates: p.coordinates,
                    label: p.name ?? '',
                    url: '/problem/' + p.id,
                  },
                ]
              : [],
          ),
        ),
      ),
    [areas],
  );

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
          toolbarAction={
            <button
              type='button'
              onClick={() => setIsMapModalOpen(true)}
              className='bg-surface-nav/25 hover:bg-surface-nav/40 inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-white/10 px-2.5 text-[11px] leading-none font-semibold text-slate-300 transition-colors hover:text-slate-200'
            >
              <MapIcon size={11} />
              Map
            </button>
          }
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
          }))}
        />
      </div>
      {isMapModalOpen &&
        createPortal(
          <div className='fixed inset-0 z-[120]'>
            <div className='bg-surface-dark/95 absolute inset-0' onClick={() => setIsMapModalOpen(false)} />
            <div className='absolute inset-0'>
              <Leaflet
                key={'todo-modal=' + userId}
                autoZoom={true}
                height='100%'
                markers={markers}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                showSatelliteImage={false}
                clusterMarkers={true}
                flyToId={null}
              />
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
    </>
  );
};

export default ProfileTodo;
