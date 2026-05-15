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
import type { Row } from '../ProblemList/types';
import { designContract } from '../../../design/contract';

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
 * Compute area-level markers from filtered ProblemList rows.
 * Groups rows by areaName, computes centroid from marker coordinates,
 * and builds a popup listing all problems in that area.
 */
function computeFilteredAreaMarkers(rows: Row[]): MarkerDef[] {
  // Group rows by area
  const areaGroups = new Map<string, { areaName: string; rows: Row[] }>();

  for (const row of rows) {
    if (!row.marker?.coordinates) continue;
    const key = row.areaName;
    const existing = areaGroups.get(key);
    if (existing) {
      existing.rows.push(row);
    } else {
      areaGroups.set(key, { areaName: key, rows: [row] });
    }
  }

  const markers: MarkerDef[] = [];

  for (const [, group] of areaGroups) {
    const rowsWithCoords = group.rows.filter((r) => r.marker?.coordinates);
    if (rowsWithCoords.length === 0) continue;

    // Compute centroid
    const sumLat = rowsWithCoords.reduce((sum, r) => sum + r.marker!.coordinates.latitude, 0);
    const sumLng = rowsWithCoords.reduce((sum, r) => sum + r.marker!.coordinates.longitude, 0);
    const centerLat = sumLat / rowsWithCoords.length;
    const centerLng = sumLng / rowsWithCoords.length;

    // Group by sector for the popup
    const sectorGroups = new Map<string, Row[]>();
    for (const row of rowsWithCoords) {
      const key = row.sectorName;
      const existing = sectorGroups.get(key);
      if (existing) {
        existing.push(row);
      } else {
        sectorGroups.set(key, [row]);
      }
    }

    const popupContent = (
      <div className='max-h-[280px] min-w-48 space-y-3 overflow-y-auto py-1'>
        {Array.from(sectorGroups.entries()).map(([sectorName, sectorRows]) => (
          <div key={sectorName} className='space-y-1'>
            <div className='flex items-center gap-1'>
              <span className={cn(designContract.typography.meta, 'font-medium text-slate-400')}>{sectorName}</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              {sectorRows.map((row, idx) => (
                <div key={`${row.name}-${idx}`} className='flex items-center gap-1.5 pl-2'>
                  <a
                    href={row.marker!.url}
                    className={cn(
                      designContract.typography.body,
                      'buldreinfo-popup-primary-link font-medium underline-offset-2 transition-colors hover:underline',
                    )}
                  >
                    {row.nr != null ? `#${row.nr} ` : ''}
                    {row.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );

    markers.push({
      id: group.areaName.charCodeAt(0) + markers.length,
      coordinates: { latitude: centerLat, longitude: centerLng },
      label: `${group.areaName} [${rowsWithCoords.length}]`,
      html: popupContent,
    } as MarkerDef);
  }

  return markers;
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
            // Compute area-level markers from the filtered rows so the map updates when filtering
            const filteredAreaMarkers = computeFilteredAreaMarkers(filteredRows);
            if (filteredAreaMarkers.length === 0) return null;
            return (
              <div className='-mx-4 mb-3 h-[35vh] w-[calc(100%+2rem)] min-w-0 overflow-hidden sm:-mx-6 sm:w-[calc(100%+3rem)]'>
                <Leaflet
                  key={'todo-inline=' + userId + '-areas'}
                  autoZoom={true}
                  height='100%'
                  markers={filteredAreaMarkers}
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
