import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Chart from '../Chart/Chart';
import ProblemList from '../ProblemList';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol, Stars } from '../../ui/Indicators';
import { Loading } from '../../ui/StatusWidgets';
import { numberWithCommas, useProfileStatistics } from '../../../api';
import { useMeta } from '../Meta';
import * as Sentry from '@sentry/react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AlertCircle, Check, Camera, Video, Plus, Repeat, X, Map as MapIcon, type LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

type TickListItemProps = {
  tick: NonNullable<components['schemas']['ProfileStatistics']['ticks']>[number];
};

const TickListItem = ({ tick }: TickListItemProps) => <TickListItemInner tick={tick} />;

const TickListItemInner = ({ tick }: TickListItemProps) => {
  const areaId = tick.areaId;
  const sectorId = tick.sectorId;

  return (
    <div className='py-1.5 text-[11px] leading-relaxed break-words text-slate-300'>
      {tick.dateHr ? <span className='text-slate-400'>{tick.dateHr} </span> : null}
      {areaId ? (
        <Link to={`/area/${areaId}`} className='hover:text-brand transition-colors'>
          {tick.areaName}
        </Link>
      ) : (
        <span>{tick.areaName}</span>
      )}
      <LockSymbol lockedAdmin={!!tick.areaLockedAdmin} lockedSuperadmin={!!tick.areaLockedSuperadmin} />
      <span className='text-slate-500'> · </span>
      {sectorId ? (
        <Link to={`/sector/${sectorId}`} className='hover:text-brand transition-colors'>
          {tick.sectorName}
        </Link>
      ) : (
        <span>{tick.sectorName}</span>
      )}
      <LockSymbol lockedAdmin={!!tick.sectorLockedAdmin} lockedSuperadmin={!!tick.sectorLockedSuperadmin} />
      <span className='text-slate-500'> · </span>
      <Link to={`/problem/${tick.idProblem}`} className='hover:text-brand font-medium text-slate-100'>
        {tick.name}
      </Link>
      <span className='ml-1 text-slate-300'>{tick.grade}</span>
      <LockSymbol lockedAdmin={!!tick.lockedAdmin} lockedSuperadmin={!!tick.lockedSuperadmin} />
      <span className='ml-1 inline-flex align-middle opacity-65'>
        <Stars numStars={tick.stars ?? 0} includeStarOutlines={true} size={12} />
      </span>
      {tick.fa ? <span className='badge-micro border-brand/40 bg-brand/10 text-brand ml-1'>FA</span> : null}
      {tick.idTickRepeat ? <span className='badge-micro ml-1'>Repeat</span> : null}
      {tick.noPersonalGrade ? (
        <span className='type-micro ml-1 inline-flex items-center gap-0.5 text-slate-400'>
          <X size={8} />
          No grade
        </span>
      ) : null}
      {tick.subType ? (
        <span className='badge-micro ml-1'>
          {tick.subType}
          {(tick.numPitches ?? 0) > 1 ? ` (${tick.numPitches}p)` : ''}
        </span>
      ) : null}
      {tick.comment ? <div className='mt-0.5 text-[10px] leading-snug text-slate-400/90'>{tick.comment}</div> : null}
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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
      <>
        <ProblemList
          storageKey={`user/${userId}`}
          mode='user'
          defaultOrder='date'
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

        {isMapModalOpen &&
          createPortal(
            <div className='fixed inset-0 z-[120]'>
              <div className='bg-surface-dark/95 absolute inset-0' onClick={() => setIsMapModalOpen(false)} />
              <div className='absolute inset-0'>
                <Leaflet
                  key={'ticked-modal=' + userId}
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
  }

  return (
    <div className='space-y-4'>
      <div className='bg-surface-nav/20 grid grid-cols-7 gap-px overflow-hidden rounded-xl'>
        <OverviewStatItem
          icon={Check}
          label='Ascents'
          value={stats.numTicks + stats.numFas}
          className='text-emerald-300'
        />
        <OverviewStatItem icon={Plus} label='FAs' value={stats.numFas} className='text-sky-300/85' />
        <OverviewStatItem icon={Repeat} label='Repeats' value={stats.numTickRepeats} className='text-amber-200/70' />
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
      <div className='overflow-hidden rounded-xl'>
        <Chart ticks={data.ticks as components['schemas']['ProfileStatisticsTick'][]} />
      </div>
    </div>
  );
};

export default ProfileStatistics;
