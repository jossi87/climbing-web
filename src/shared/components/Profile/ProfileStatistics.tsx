import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Chart from '../Chart/Chart';
import ProblemList from '../ProblemList';
import { rowListTypeKey } from '../ProblemList/types';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol, Stars } from '../../ui/Indicators';
import { Loading } from '../../ui/StatusWidgets';
import { numberWithCommas, useProfileStatistics } from '../../../api';
import { useMeta } from '../Meta';
import * as Sentry from '@sentry/react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AlertCircle, Check, Camera, Video, Plus, Repeat, X, type LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
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

type TickListItemProps = {
  tick: NonNullable<components['schemas']['ProfileStatistics']['ticks']>[number];
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
          <span className={cn(tickFlags, 'inline-flex items-center gap-0.5')} title='No personal grade'>
            <X size={8} strokeWidth={2.5} aria-hidden />
            no grade
          </span>
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

const ProfileStatistics = ({ userId, view }: ProfileStatisticsProps) => {
  const { defaultCenter, defaultZoom, isClimbing } = useMeta();
  const { data, isLoading, error } = useProfileStatistics(userId);

  const stats = useMemo(() => {
    if (!data?.ticks) return null;
    const regions = Array.from(new Set(data.ticks.map((t) => t.regionName))).sort();
    const numTicks = data.ticks.filter((t) => !t.fa && t.idTickRepeat === 0).length ?? 0;
    const numTickRepeats = data.ticks.filter((t) => !t.fa && t.idTickRepeat).length ?? 0;
    const numFas = data.ticks.filter((t) => t.fa).length ?? 0;

    const markers = data.ticks
      .filter((t) => t.coordinates)
      .map((t) => ({
        coordinates: t.coordinates!,
        label: t.name ?? '',
        url: '/problem/' + t.idProblem,
      }));

    return { regions, numTicks, numTickRepeats, numFas, markers };
  }, [data]);

  if (isLoading) return <Loading inline />;

  if (error || !data || !stats) {
    Sentry.captureException(error, { extra: { userId } });
    return (
      <div className='py-12 text-center'>
        <AlertCircle size={48} className='mx-auto mb-4 text-red-500' />
        <h3 className='type-h2 mb-2'>Error</h3>
        <p className='text-slate-400'>Unable to load profile statistics.</p>
      </div>
    );
  }

  if (view === 'map') {
    if (!stats.markers.length) {
      return <div className='py-10 text-center text-slate-400'>No map data available.</div>;
    }

    return (
      <div className='h-[35vh] w-full min-w-0 overflow-hidden'>
        <Leaflet
          key={'ticked=' + userId}
          autoZoom={true}
          height='100%'
          markers={stats.markers}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          showSatelliteImage={false}
          clusterMarkers={true}
          flyToId={null}
        />
      </div>
    );
  }

  if (view === 'ascents') {
    if (!data.ticks?.length) {
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
                      s.numFa > 0
                        ? `${s.header}: ${s.count} ascents (${s.numFa} FA)`
                        : `${s.header}: ${s.count} ascents`,
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
                        <span className='font-semibold text-slate-200'>{s.header}:</span>
                        <span className='text-slate-300 tabular-nums'>{s.count}</span>
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

            const filteredMarkers = filteredRows.flatMap((row) => (row.marker ? [row.marker] : []));
            const mapBlock =
              filteredMarkers.length > 0 ? (
                <div className='-mx-4 mb-2 h-[35vh] w-[calc(100%+2rem)] min-w-0 overflow-hidden sm:-mx-6 sm:w-[calc(100%+3rem)]'>
                  <Leaflet
                    key={'ticked-inline=' + userId}
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
              ) : null;

            if (!typeSummaryBlock && !mapBlock) return null;
            return (
              <>
                {mapBlock}
                {typeSummaryBlock ? <div className='min-w-0'>{typeSummaryBlock}</div> : null}
              </>
            );
          }}
          rows={data.ticks.map((t) => ({
            element: (
              <TickListItem
                key={`${t.idProblem}-${t.idTickRepeat ?? '0'}-${t.dateHr ?? ''}`}
                tick={t as components['schemas']['ProfileStatisticsTick']}
              />
            ),
            areaName: t.areaName ?? '',
            sectorName: t.sectorName ?? '',
            name: t.name ?? '',
            nr: null,
            gradeNumber: t.gradeNumber ?? 0,
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
  }

  return (
    <div className='space-y-4'>
      <div
        className={cn(
          'bg-surface-border grid gap-px overflow-hidden rounded-xl',
          isClimbing ? 'grid-cols-7' : 'grid-cols-6',
        )}
      >
        <OverviewStatItem icon={Check} label='Ascents' value={stats.numTicks + stats.numFas} />
        <OverviewStatItem icon={Plus} label='FAs' value={stats.numFas} />
        {isClimbing ? <OverviewStatItem icon={Repeat} label='Repeats' value={stats.numTickRepeats} /> : null}
        <OverviewStatItem icon={Camera} label='Tags' value={data.numImageTags ?? 0} />
        <OverviewStatItem icon={Camera} label='Captured' value={data.numImagesCreated ?? 0} />
        <OverviewStatItem icon={Video} label='Tags' value={data.numVideoTags ?? 0} />
        <OverviewStatItem icon={Video} label='Captured' value={data.numVideosCreated ?? 0} />
      </div>
      <div className='overflow-hidden rounded-xl'>
        <Chart ticks={data.ticks as components['schemas']['ProfileStatisticsTick'][]} />
      </div>
    </div>
  );
};

export default ProfileStatistics;
