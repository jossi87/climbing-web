import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Chart from '../Chart/Chart';
import ProblemList from '../ProblemList';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol, Stars } from '../Widgets/Widgets';
import { Loading } from '../../ui/StatusWidgets';
import { numberWithCommas, useProfileStatistics } from '../../../api';
import { useMeta } from '../Meta';
import * as Sentry from '@sentry/react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AlertCircle, Check, Camera, Video, Flag, Repeat, X, type LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

type TickListItemProps = {
  tick: NonNullable<components['schemas']['ProfileStatistics']['ticks']>[number];
};

const TickListItem = ({ tick }: TickListItemProps) => (
  <div className='bg-surface-nav/18 border-surface-border/45 mb-2 rounded-lg border px-3 py-2.5 last:mb-0'>
    <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
      <span className='font-mono text-[10px] tracking-tight text-slate-500'>{tick.dateHr}</span>
      <span className='flex items-center gap-1 text-[10px] text-slate-400'>
        {tick.areaName}
        <LockSymbol lockedAdmin={!!tick.areaLockedAdmin} lockedSuperadmin={!!tick.areaLockedSuperadmin} />
        <span className='mx-0.5'>/</span>
        {tick.sectorName}
        <LockSymbol lockedAdmin={!!tick.sectorLockedAdmin} lockedSuperadmin={!!tick.sectorLockedSuperadmin} />
      </span>
    </div>
    <div className='mt-1 flex flex-wrap items-center gap-2'>
      <Link to={`/problem/${tick.idProblem}`} className='type-body hover:text-brand font-semibold transition-colors'>
        {tick.name}
      </Link>
      <span className='font-mono text-xs text-slate-400'>[{tick.grade}]</span>

      {tick.noPersonalGrade && (
        <span className='bg-surface-nav border-surface-border inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase'>
          <X size={10} /> No personal grade
        </span>
      )}

      <LockSymbol lockedAdmin={!!tick.lockedAdmin} lockedSuperadmin={!!tick.lockedSuperadmin} />
      <Stars numStars={tick.stars ?? 0} includeStarOutlines={true} />

      {tick.fa && (
        <span className='rounded bg-red-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950 uppercase'>FA</span>
      )}
      {tick.idTickRepeat ? (
        <span className='border-surface-border rounded border px-1.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase'>
          Repeat
        </span>
      ) : null}

      {tick.subType && (
        <span className='bg-surface-nav border-surface-border rounded border px-1.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase'>
          {tick.subType}
          {(tick.numPitches ?? 0) > 1 && <span className='ml-1 text-slate-500'>({tick.numPitches} pitches)</span>}
        </span>
      )}
    </div>
    {tick.comment && <p className='mt-1 text-xs leading-relaxed text-slate-500 italic'>"{tick.comment}"</p>}
  </div>
);

type ProfileStatisticsProps = {
  userId: number;
  view: 'overview' | 'map' | 'ascents';
};

type OverviewStatItemProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  className: string;
};

const OverviewStatItem = ({ icon: Icon, label, value, className }: OverviewStatItemProps) => (
  <div className='bg-surface-card/90 group relative flex h-full w-full min-w-0 flex-col items-center justify-center overflow-hidden border border-transparent p-2 text-center transition-all duration-300 sm:p-3'>
    <div className={cn('mb-1 transition-colors sm:mb-2', className)}>
      <Icon size={12} strokeWidth={2} />
    </div>
    <div className='mb-1 flex h-5 items-center justify-center'>
      <span className='text-[14px] leading-none font-semibold tabular-nums sm:text-[15px]'>
        {numberWithCommas(value)}
      </span>
    </div>
    <div className='type-small h-3 text-slate-300'>{label}</div>
  </div>
);

const ProfileStatistics = ({ userId, view }: ProfileStatisticsProps) => {
  const { defaultCenter, defaultZoom } = useMeta();
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
      return <div className='py-10 text-center text-slate-500'>No map data available.</div>;
    }

    return (
      <div className='h-[56vh] min-h-[320px] w-full min-w-0 overflow-hidden'>
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
      return <div className='py-10 text-center text-slate-500'>No ascents yet.</div>;
    }

    return (
      <ProblemList
        storageKey={`user/${userId}`}
        mode='user'
        defaultOrder='date'
        rows={data.ticks.map((t) => ({
          element: (
            <TickListItem
              key={[t.areaName, t.sectorName, t.name, t.idProblem, t.idTickRepeat].join('/')}
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
        }))}
      />
    );
  }

  return (
    <div className='space-y-4'>
      <div className='-mx-4 -mt-4 grid grid-cols-7 gap-px overflow-hidden border-y border-white/5 bg-white/5 sm:-mx-6 sm:-mt-6'>
        <OverviewStatItem
          icon={Check}
          label='Ascents'
          value={stats.numTicks + stats.numFas}
          className='text-emerald-300'
        />
        <OverviewStatItem icon={Flag} label='FAs' value={stats.numFas} className='text-amber-300' />
        <OverviewStatItem icon={Repeat} label='Repeats' value={stats.numTickRepeats} className='text-blue-300' />
        <OverviewStatItem icon={Camera} label='Tags' value={data.numImageTags ?? 0} className='text-red-300/85' />
        <OverviewStatItem
          icon={Camera}
          label='Captured'
          value={data.numImagesCreated ?? 0}
          className='text-red-300/85'
        />
        <OverviewStatItem icon={Video} label='Tags' value={data.numVideoTags ?? 0} className='text-fuchsia-300/90' />
        <OverviewStatItem
          icon={Video}
          label='Captured'
          value={data.numVideosCreated ?? 0}
          className='text-fuchsia-300/90'
        />
      </div>
      <div className='-mx-4 overflow-hidden sm:mx-0'>
        <Chart ticks={data.ticks as components['schemas']['ProfileStatisticsTick'][]} />
      </div>
    </div>
  );
};

export default ProfileStatistics;
