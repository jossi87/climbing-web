import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Chart from '../Chart/Chart';
import ProblemList from '../ProblemList';
import { rowListTypeKey } from '../ProblemList/types';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol, Stars } from '../../ui/Indicators';
import { Loading } from '../../ui/StatusWidgets';
import { numberWithCommas, useProfileAscents } from '../../../api';
import { useMeta } from '../Meta';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AlertCircle, Check, Plus, Camera, Video, Repeat, type LucideIcon } from 'lucide-react';
import { NoPersonalGradeBadge } from '../../ui/NoPersonalGradeBadge';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { twInk } from '../../../design/twInk';
import { TradGearMarker } from '../../ui/TradGearMarker';
import {
  climbingRouteUsesPassiveGear,
  formatPassiveGearMarkerLine,
  formatRouteTypeLabel,
} from '../../../utils/routeTradGear';
import { ProfileRowTextSep } from './ProfileRowTextSep';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickCrag,
  tickCragLinkArea,
  tickCragLinkSector,
  tickFa,
  tickFlags,
  tickProblemLink,
  tickWhenGrade,
} from './profileRowTypography';
import { captureSentryException } from '../../../utils/sentry';
import type { MarkerDef } from '../Leaflet/markers';

type TickListItemProps = {
  tick: components['schemas']['ProfileAscent'];
};

const TickListItem = ({ tick }: TickListItemProps) => <TickListItemInner tick={tick} />;

const TickListItemInner = ({ tick }: TickListItemProps) => {
  const { isClimbing } = useMeta();
  const areaId = tick.areaId;
  const sectorId = tick.sectorId;
  const hasSector =
    (sectorId != null && sectorId > 0) || (typeof tick.sectorName === 'string' && tick.sectorName.trim() !== '');
  const pitchCount = tick.numPitches ?? 0;
  const multiPitch = pitchCount > 1;
  const routeTypeLabel = formatRouteTypeLabel(undefined, tick.subType);
  const showPassiveGear = routeTypeLabel !== '' && climbingRouteUsesPassiveGear(routeTypeLabel);
  const passiveGearLine = showPassiveGear ? formatPassiveGearMarkerLine(routeTypeLabel, tick.numPitches) : '';

  return (
    <div className={profileRowRootClass}>
      {tick.dateHr ? (
        <>
          <span className={cn(tickFlags, 'tabular-nums')}>{tick.dateHr}</span>{' '}
        </>
      ) : null}
      {areaId ? (
        <Link to={`/area/${areaId}`} className={tickCragLinkArea}>
          {tick.areaName}
        </Link>
      ) : (
        <span className={tickCrag}>{tick.areaName}</span>
      )}
      <LockSymbol lockedAdmin={!!tick.areaLockedAdmin} lockedSuperadmin={!!tick.areaLockedSuperadmin} />
      {hasSector ? (
        <>
          <ProfileRowTextSep />
          {sectorId ? (
            <Link to={`/sector/${sectorId}`} className={tickCragLinkSector}>
              {tick.sectorName}
            </Link>
          ) : (
            <span className={tickCrag}>{tick.sectorName}</span>
          )}
          <LockSymbol lockedAdmin={!!tick.sectorLockedAdmin} lockedSuperadmin={!!tick.sectorLockedSuperadmin} />
        </>
      ) : null}
      <ProfileRowTextSep />
      <Link to={`/problem/${tick.idProblem}`} className={tickProblemLink}>
        {tick.name}
      </Link>{' '}
      <span className={cn(tickWhenGrade, 'whitespace-nowrap tabular-nums')}>{tick.grade}</span>
      {showPassiveGear ? <TradGearMarker line={passiveGearLine} /> : null}
      <LockSymbol lockedAdmin={!!tick.lockedAdmin} lockedSuperadmin={!!tick.lockedSuperadmin} />{' '}
      <span className='inline-flex align-middle'>
        <Stars muted numStars={tick.stars ?? 0} size={12} />
      </span>
      {tick.fa ? (
        <>
          {' '}
          <span className={tickFa}>FA</span>
        </>
      ) : null}
      {isClimbing && tick.idTickRepeat ? (
        <>
          {' '}
          <span className={tickFlags}>repeat</span>
        </>
      ) : null}
      {tick.noPersonalGrade ? (
        <>
          {' '}
          <NoPersonalGradeBadge variant='dense' />
        </>
      ) : null}
      {!showPassiveGear && multiPitch ? (
        <>
          {' '}
          <span className={tickFlags}>{pitchCount}p</span>
        </>
      ) : null}
      {tick.comment ? (
        <>
          {' '}
          <span className={tickCommentSmall}>{tick.comment}</span>
        </>
      ) : null}
    </div>
  );
};

type ProfileStatisticsProps = {
  userId: number;
  view: 'overview' | 'map' | 'ascents';
  gradeDistribution?: components['schemas']['ProfileGradeDistribution'][];
  kpis?: components['schemas']['ProfileKpis'];
};

type OverviewStatItemProps = {
  icon: LucideIcon;
  label: string;
  value: number;
};

/** Neutrals only: `text-slate-*` remaps under `html[data-theme="light"]` for ink on white cards. */
const OverviewStatItem = ({ icon: Icon, label, value }: OverviewStatItemProps) => (
  <div className='bg-surface-card group relative flex h-full w-full min-w-0 flex-col items-center justify-center overflow-hidden border border-transparent p-2 text-center transition-all duration-300 sm:p-3'>
    <div className='light:text-slate-600 mb-1 text-slate-300 sm:mb-2'>
      <Icon size={14} strokeWidth={2.25} aria-hidden />
    </div>
    <div className='mb-1 flex h-5 items-center justify-center'>
      <span className='text-[14px] leading-none font-semibold text-slate-100 tabular-nums sm:text-[15px]'>
        {numberWithCommas(value)}
      </span>
    </div>
    <div className='type-small h-3 text-slate-400'>{label}</div>
  </div>
);

/** Overview sub-component — only uses gradeDistribution and kpis, no extra API calls. */
const ProfileOverview = ({
  gradeDistribution,
  kpis,
  isClimbing,
}: {
  gradeDistribution: components['schemas']['ProfileGradeDistribution'][];
  kpis?: components['schemas']['ProfileKpis'];
  isClimbing: boolean;
}) => {
  const totalAscents = gradeDistribution.reduce((sum, g) => sum + (g.fa ?? 0) + (g.tick ?? 0), 0);
  const totalFas = gradeDistribution.reduce((sum, g) => sum + (g.fa ?? 0), 0);
  const totalRepeats = gradeDistribution.reduce((sum, g) => sum + (g.repeat ?? 0), 0);

  return (
    <div className='space-y-4'>
      <div
        className={cn(
          'bg-surface-border grid gap-px overflow-hidden rounded-xl',
          isClimbing ? 'grid-cols-7' : 'grid-cols-6',
        )}
      >
        <OverviewStatItem icon={Check} label='Ascents' value={totalAscents} />
        <OverviewStatItem icon={Plus} label='FAs' value={totalFas} />
        {isClimbing ? <OverviewStatItem icon={Repeat} label='Repeats' value={totalRepeats} /> : null}
        <OverviewStatItem icon={Camera} label='Tags' value={kpis?.numImageTags ?? 0} />
        <OverviewStatItem icon={Camera} label='Captured' value={kpis?.numImagesCreated ?? 0} />
        <OverviewStatItem icon={Video} label='Tags' value={kpis?.numVideoTags ?? 0} />
        <OverviewStatItem icon={Video} label='Captured' value={kpis?.numVideosCreated ?? 0} />
      </div>
      <div className='overflow-hidden rounded-xl'>
        <Chart gradeDistribution={gradeDistribution} />
      </div>
    </div>
  );
};

/** Ascents sub-component — fetches /profile/ascents only when this view is active. */
const ProfileAscentsView = ({ userId }: { userId: number }) => {
  const { defaultCenter, defaultZoom } = useMeta();
  const { data: ascents, isLoading, error } = useProfileAscents(userId);

  // Compute area-level markers from all ascents (must be before early returns for hooks consistency)
  const areaMarkers = useMemo<MarkerDef[]>(() => {
    if (!ascents) return [];
    // Group ascents by area
    const areaMap = new Map<
      number,
      {
        name: string;
        lockedAdmin: boolean;
        lockedSuperadmin: boolean;
        ascents: components['schemas']['ProfileAscent'][];
      }
    >();

    for (const ascent of ascents) {
      const areaId = ascent.areaId ?? 0;
      if (!areaId) continue;
      const existing = areaMap.get(areaId);
      if (existing) {
        existing.ascents.push(ascent);
      } else {
        areaMap.set(areaId, {
          name: ascent.areaName ?? '',
          lockedAdmin: !!ascent.areaLockedAdmin,
          lockedSuperadmin: !!ascent.areaLockedSuperadmin,
          ascents: [ascent],
        });
      }
    }

    const markers: MarkerDef[] = [];

    for (const [areaId, area] of areaMap.entries()) {
      // Collect ascents with coordinates
      const ascentsWithCoords = area.ascents.filter(
        (a) => a.coordinates?.latitude != null && a.coordinates?.longitude != null,
      );

      if (ascentsWithCoords.length === 0) continue;

      // Compute centroid
      const sumLat = ascentsWithCoords.reduce((sum, a) => sum + (a.coordinates?.latitude ?? 0), 0);
      const sumLng = ascentsWithCoords.reduce((sum, a) => sum + (a.coordinates?.longitude ?? 0), 0);
      const centerLat = sumLat / ascentsWithCoords.length;
      const centerLng = sumLng / ascentsWithCoords.length;

      // Group ascents by sector for the popup
      const sectorGroups = new Map<
        number,
        {
          name: string;
          lockedAdmin: boolean;
          lockedSuperadmin: boolean;
          ascents: components['schemas']['ProfileAscent'][];
        }
      >();

      for (const a of ascentsWithCoords) {
        const sectorId = a.sectorId ?? 0;
        const existing = sectorGroups.get(sectorId);
        if (existing) {
          existing.ascents.push(a);
        } else {
          sectorGroups.set(sectorId, {
            name: a.sectorName ?? '',
            lockedAdmin: !!a.sectorLockedAdmin,
            lockedSuperadmin: !!a.sectorLockedSuperadmin,
            ascents: [a],
          });
        }
      }

      const popupContent = (
        <div className='max-h-[280px] min-w-48 space-y-3 overflow-y-auto py-1'>
          {Array.from(sectorGroups.entries()).map(([sectorId, group]) => (
            <div key={sectorId} className='space-y-1'>
              <div className='flex items-center gap-1'>
                <Link
                  to={`/sector/${sectorId}`}
                  className={cn(
                    designContract.typography.meta,
                    'font-medium underline-offset-2 transition-colors hover:underline',
                    'text-slate-400 hover:text-slate-200',
                  )}
                >
                  {group.name}
                </Link>
                <LockSymbol lockedAdmin={group.lockedAdmin} lockedSuperadmin={group.lockedSuperadmin} />
              </div>
              <div className='flex flex-col gap-0.5'>
                {group.ascents.map((ascent) => (
                  <div
                    key={`${ascent.idProblem}-${ascent.idTickRepeat ?? '0'}`}
                    className='flex items-center gap-1.5 pl-2'
                  >
                    {ascent.dateHr ? (
                      <span className='text-[11px] text-slate-500 tabular-nums'>{ascent.dateHr}</span>
                    ) : null}
                    <Link
                      to={`/problem/${ascent.idProblem}`}
                      className={cn(
                        designContract.typography.body,
                        'buldreinfo-popup-primary-link font-medium underline-offset-2 transition-colors hover:underline',
                      )}
                    >
                      {ascent.name}
                    </Link>
                    {ascent.grade ? (
                      <span className='text-[11px] font-medium whitespace-nowrap text-slate-500 tabular-nums'>
                        {ascent.grade}
                      </span>
                    ) : null}
                    {ascent.fa ? <span className={cn(tickFa, 'text-[11px]')}>FA</span> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

      markers.push({
        id: areaId,
        coordinates: { latitude: centerLat, longitude: centerLng },
        label: `${area.name} [${ascentsWithCoords.length}]`,
        html: popupContent,
      } as MarkerDef);
    }

    return markers;
  }, [ascents]);

  if (isLoading) return <Loading inline />;

  if (error || !ascents) {
    captureSentryException(error, { userId });
    return (
      <div className='py-12 text-center'>
        <AlertCircle size={48} className='mx-auto mb-4 text-red-500' />
        <h3 className='type-h2 mb-2'>Error</h3>
        <p className='text-slate-400'>Unable to load profile statistics.</p>
      </div>
    );
  }

  if (!ascents.length) {
    return <div className='py-10 text-center text-slate-400'>No ascents yet.</div>;
  }

  return (
    <>
      <ProblemList
        key={`user/${userId}/ascents`}
        storageKey={`user/${userId}`}
        mode='user'
        defaultOrder='date'
        leadingBottomClassName='mb-2 sm:mb-2.5'
        contentBeforeList={(filteredRows) => {
          type TypeBucket = { count: number; numFa: number };
          const buckets = new Map<string, TypeBucket>();
          for (const row of filteredRows) {
            const key = rowListTypeKey(row);
            const prev = buckets.get(key) ?? { count: 0, numFa: 0 };
            prev.count += 1;
            if (row.fa) prev.numFa += 1;
            buckets.set(key, prev);
          }
          const ascentTypeSummaries = [...buckets.entries()]
            .map(([header, { count, numFa }]) => ({ key: header, header, count, numFa }))
            .filter((s) => s.count > 0)
            .sort((a, b) => a.header.localeCompare(b.header, undefined, { sensitivity: 'base' }));

          const typeSummaryBlock =
            ascentTypeSummaries.length > 1 ? (
              <div
                className='min-w-0'
                role='status'
                aria-label={ascentTypeSummaries
                  .map((s) =>
                    s.numFa > 0 ? `${s.header}: ${s.count} ascents (${s.numFa} FA)` : `${s.header}: ${s.count} ascents`,
                  )
                  .join('. ')}
              >
                <div className='flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[13px] leading-snug sm:gap-x-6 sm:text-sm'>
                  {ascentTypeSummaries.map((s, i) => (
                    <div
                      key={s.key}
                      className={cn(
                        'inline-flex max-w-full min-w-0 items-center gap-x-2 sm:whitespace-nowrap',
                        i > 0 && 'border-surface-border border-l pl-3 sm:pl-4',
                      )}
                      title={
                        s.numFa > 0
                          ? `${s.header}: ${s.count} ascents (${s.numFa} FA)`
                          : `${s.header}: ${s.count} ascents`
                      }
                    >
                      <span className={cn('font-semibold text-slate-200', twInk.lightTextSlate800)}>{s.header}:</span>
                      <span className={cn('text-slate-300 tabular-nums', twInk.lightTextSlate700)}>{s.count}</span>
                      {s.numFa > 0 ? (
                        <span className={cn('font-normal tabular-nums', designContract.ascentStatus.ticked)}>
                          ({s.numFa} FA)
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null;

          // Show area-level markers when unfiltered, individual markers when filtered
          const isFiltered = filteredRows.length < ascents.length;
          const markers = isFiltered ? filteredRows.flatMap((row) => (row.marker ? [row.marker] : [])) : areaMarkers;

          const mapBlock =
            markers.length > 0 ? (
              <div className='-mx-4 mb-2 h-[35vh] w-[calc(100%+2rem)] min-w-0 overflow-hidden sm:-mx-6 sm:w-[calc(100%+3rem)]'>
                <Leaflet
                  key={'ticked-inline=' + userId + (isFiltered ? '-filtered' : '-areas')}
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
            ) : null;

          if (!typeSummaryBlock && !mapBlock) return null;
          return (
            <>
              {mapBlock}
              {typeSummaryBlock ? <div className='min-w-0'>{typeSummaryBlock}</div> : null}
            </>
          );
        }}
        rows={ascents.map((t) => ({
          element: <TickListItem key={`${t.idProblem}-${t.idTickRepeat ?? '0'}-${t.dateHr ?? ''}`} tick={t} />,
          areaName: t.areaName ?? '',
          sectorName: t.sectorName ?? '',
          name: t.name ?? '',
          nr: null,
          gradeWeight: t.gradeWeight ?? 0,
          stars: t.stars ?? 0,
          numTicks: 0,
          ticked: false,
          rock: '',
          subType: t.subType ?? '',
          num: t.num ?? 0,
          fa: t.fa ?? false,
          faDate: null,
          marker:
            t.coordinates?.latitude != null && t.coordinates?.longitude != null
              ? {
                  coordinates: {
                    latitude: t.coordinates.latitude,
                    longitude: t.coordinates.longitude,
                  },
                  label: t.name ?? '',
                  url: '/problem/' + t.idProblem,
                }
              : undefined,
        }))}
      />
    </>
  );
};

const ProfileStatistics = ({ userId, view, gradeDistribution, kpis }: ProfileStatisticsProps) => {
  const { isClimbing } = useMeta();

  if (view === 'overview') {
    return <ProfileOverview gradeDistribution={gradeDistribution ?? []} kpis={kpis} isClimbing={isClimbing} />;
  }

  if (view === 'ascents') {
    return <ProfileAscentsView userId={userId} />;
  }

  return null;
};

export default ProfileStatistics;
