import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Chart from '../Chart/Chart';
import ProblemList from '../ProblemList';
import Leaflet from '../Leaflet/Leaflet';
import { Loading, LockSymbol, Stars } from '../Widgets/Widgets';
import { numberWithCommas, downloadUsersTicks, useAccessToken, useProfileStatistics } from '../../../api';
import { useMeta } from '../Meta';
import * as Sentry from '@sentry/react';
import type { components } from '../../../@types/buldreinfo/swagger';
import {
  BarChart3,
  Map as MapIcon,
  Save,
  Check,
  Camera,
  Video,
  Globe,
  Loader2,
  Mail,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

type TickListItemProps = {
  tick: NonNullable<components['schemas']['ProfileStatistics']['ticks']>[number];
};

const TickListItem = ({ tick }: TickListItemProps) => (
  <div className='border-surface-border border-b py-3 last:border-0'>
    <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
      <span className='font-mono text-[10px] tracking-wider text-slate-500 uppercase'>{tick.dateHr}</span>
      <span className='flex items-center gap-1 text-[10px] text-slate-500'>
        {tick.areaName}
        <LockSymbol lockedAdmin={!!tick.areaLockedAdmin} lockedSuperadmin={!!tick.areaLockedSuperadmin} />
        <span className='mx-0.5'>/</span>
        {tick.sectorName}
        <LockSymbol lockedAdmin={!!tick.sectorLockedAdmin} lockedSuperadmin={!!tick.sectorLockedSuperadmin} />
      </span>
    </div>
    <div className='mt-0.5 flex flex-wrap items-center gap-2'>
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

      {tick.fa && <span className='rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-black uppercase'>FA</span>}
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
  emails: string[];
  lastActivity: string;
  canDownload: boolean;
};

const ProfileStatistics = ({ userId, emails, lastActivity, canDownload }: ProfileStatisticsProps) => {
  const { defaultCenter, defaultZoom } = useMeta();
  const accessToken = useAccessToken();
  const { data, isLoading, error } = useProfileStatistics(userId);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'map'>('stats');

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

  if (isLoading) return <Loading />;

  if (error || !data || !stats) {
    Sentry.captureException(error, { extra: { userId } });
    return (
      <div className='bg-surface-card border-surface-border rounded-2xl border p-12 text-center'>
        <AlertCircle size={48} className='mx-auto mb-4 text-red-500' />
        <h3 className='type-h2 mb-2'>Error</h3>
        <p className='text-slate-400'>Unable to load profile statistics.</p>
      </div>
    );
  }

  const badgeClass = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all';

  return (
    <div className='space-y-6'>
      {/* Tabs */}
      <div className='border-surface-border flex border-b'>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all',
            activeTab === 'stats' ? 'border-brand bg-brand/5' : 'border-transparent opacity-70 hover:opacity-100',
          )}
        >
          <BarChart3 size={18} /> Statistics
        </button>
        {stats.markers.length > 0 && (
          <button
            onClick={() => setActiveTab('map')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all',
              activeTab === 'map' ? 'border-brand bg-brand/5' : 'border-transparent opacity-70 hover:opacity-100',
            )}
          >
            <MapIcon size={18} /> Map
          </button>
        )}
      </div>

      <div className='bg-surface-card border-surface-border rounded-xl border p-6'>
        {activeTab === 'stats' ? (
          <div className='space-y-6'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div className='flex flex-wrap gap-2'>
                {(stats.numTicks > 0 || stats.numFas > 0) && (
                  <div className={cn(badgeClass, 'border-orange-500/20 bg-orange-500/10 text-orange-500')}>
                    <Check size={14} />
                    <span>{numberWithCommas(stats.numTicks + stats.numFas)} Ascents</span>
                    {stats.numFas > 0 && <span className='text-[10px] opacity-70'>({stats.numFas} FAs)</span>}
                  </div>
                )}
                {stats.numTickRepeats > 0 && (
                  <div className={cn(badgeClass, 'border-lime-500/20 bg-lime-500/10 text-lime-500')}>
                    <Check size={14} />
                    <span>{numberWithCommas(stats.numTickRepeats)} Repeats</span>
                  </div>
                )}
                {(data.numImageTags ?? 0) > 0 && (
                  <div className={cn(badgeClass, 'border-green-500/20 bg-green-500/10 text-green-500')}>
                    <Camera size={14} />
                    <span>{numberWithCommas(data.numImageTags ?? 0)} Tags</span>
                  </div>
                )}
                {(data.numImagesCreated ?? 0) > 0 && (
                  <div className={cn(badgeClass, 'border-teal-500/20 bg-teal-500/10 text-teal-500')}>
                    <Camera size={14} />
                    <span>{numberWithCommas(data.numImagesCreated ?? 0)} Captured</span>
                  </div>
                )}
                {(data.numVideoTags ?? 0) > 0 && (
                  <div className={cn(badgeClass, 'border-blue-500/20 bg-blue-500/10 text-blue-500')}>
                    <Video size={14} />
                    <span>{numberWithCommas(data.numVideoTags ?? 0)} Video Tags</span>
                  </div>
                )}
                {stats.regions.length > 0 && (
                  <div className={cn(badgeClass, 'border-stone-500/20 bg-stone-500/10 text-stone-400')}>
                    <Globe size={14} />
                    <span>{stats.regions.join(', ')}</span>
                  </div>
                )}
                {emails?.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className={cn(
                      badgeClass,
                      'border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20',
                    )}
                  >
                    <Mail size={14} /> {email}
                  </a>
                ))}
                {lastActivity && (
                  <div className={cn(badgeClass, 'border-pink-500/20 bg-pink-500/10 text-pink-400')}>
                    <Clock size={14} /> Active {lastActivity}
                  </div>
                )}
              </div>

              {canDownload && (
                <button
                  onClick={() => {
                    setIsSaving(true);
                    downloadUsersTicks(accessToken).finally(() => setIsSaving(false));
                  }}
                  className='bg-surface-nav border-surface-border hover:bg-brand group rounded-full border p-3 shadow-lg transition-all'
                  title='Download ticks'
                >
                  {isSaving ? (
                    <Loader2 className='animate-spin' size={20} />
                  ) : (
                    <Save size={20} className='transition-transform group-hover:scale-110' />
                  )}
                </button>
              )}
            </div>

            {data.ticks?.length ? (
              <div className='border-surface-border border-t pt-6'>
                <Chart ticks={data.ticks as components['schemas']['ProfileStatisticsTick'][]} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className='border-surface-border h-[40vh] overflow-hidden rounded-xl border'>
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
        )}
      </div>

      {data.ticks?.length ? (
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
      ) : null}
    </div>
  );
};

export default ProfileStatistics;
