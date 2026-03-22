import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Chart from '../chart/chart';
import ProblemList from '../problem-list';
import Leaflet from '../../common/leaflet/leaflet';
import { Loading, LockSymbol, Stars } from '../widgets/widgets';
import {
  numberWithCommas,
  downloadUsersTicks,
  useAccessToken,
  useProfileStatistics,
} from '../../../api';
import { useMeta } from '../meta';
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
  <div className='py-3 border-b border-surface-border last:border-0'>
    <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
      <span className='text-[10px] font-mono text-slate-500 uppercase tracking-wider'>
        {tick.dateHr}
      </span>
      <span className='text-[10px] text-slate-500 flex items-center gap-1'>
        {tick.areaName}
        <LockSymbol
          lockedAdmin={!!tick.areaLockedAdmin}
          lockedSuperadmin={!!tick.areaLockedSuperadmin}
        />
        <span className='mx-0.5'>/</span>
        {tick.sectorName}
        <LockSymbol
          lockedAdmin={!!tick.sectorLockedAdmin}
          lockedSuperadmin={!!tick.sectorLockedSuperadmin}
        />
      </span>
    </div>
    <div className='flex flex-wrap items-center gap-2 mt-0.5'>
      <Link
        to={`/problem/${tick.idProblem}`}
        className='text-sm font-bold text-white hover:text-brand transition-colors'
      >
        {tick.name}
      </Link>
      <span className='text-xs font-mono text-slate-400'>[{tick.grade}]</span>

      {tick.noPersonalGrade && (
        <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-nav border border-surface-border text-[9px] text-slate-400 font-bold uppercase'>
          <X size={10} /> No personal grade
        </span>
      )}

      <LockSymbol lockedAdmin={!!tick.lockedAdmin} lockedSuperadmin={!!tick.lockedSuperadmin} />
      <Stars numStars={tick.stars ?? 0} includeStarOutlines={true} />

      {tick.fa && (
        <span className='px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-black uppercase'>
          FA
        </span>
      )}
      {tick.idTickRepeat ? (
        <span className='px-1.5 py-0.5 rounded border border-surface-border text-[9px] text-slate-400 font-bold uppercase'>
          Repeat
        </span>
      ) : null}

      {tick.subType && (
        <span className='px-1.5 py-0.5 rounded bg-surface-nav border border-surface-border text-[9px] text-slate-400 font-bold uppercase'>
          {tick.subType}
          {(tick.numPitches ?? 0) > 1 && (
            <span className='ml-1 text-slate-500'>({tick.numPitches} pitches)</span>
          )}
        </span>
      )}
    </div>
    {tick.comment && (
      <p className='mt-1 text-xs text-slate-500 italic leading-relaxed'>"{tick.comment}"</p>
    )}
  </div>
);

type ProfileStatisticsProps = {
  userId: number;
  emails: string[];
  lastActivity: string;
  canDownload: boolean;
};

const ProfileStatistics = ({
  userId,
  emails,
  lastActivity,
  canDownload,
}: ProfileStatisticsProps) => {
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
      <div className='p-12 bg-surface-card border border-surface-border rounded-2xl text-center'>
        <AlertCircle size={48} className='mx-auto text-red-500 mb-4' />
        <h3 className='text-xl font-bold text-white mb-2'>Error</h3>
        <p className='text-slate-400'>Unable to load profile statistics.</p>
      </div>
    );
  }

  const badgeClass =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all';

  return (
    <div className='space-y-6'>
      {/* Tabs */}
      <div className='flex border-b border-surface-border'>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            'px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all',
            activeTab === 'stats'
              ? 'border-brand text-white bg-brand/5'
              : 'border-transparent text-slate-500 hover:text-slate-300',
          )}
        >
          <BarChart3 size={18} /> Statistics
        </button>
        {stats.markers.length > 0 && (
          <button
            onClick={() => setActiveTab('map')}
            className={cn(
              'px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all',
              activeTab === 'map'
                ? 'border-brand text-white bg-brand/5'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            <MapIcon size={18} /> Map
          </button>
        )}
      </div>

      <div className='bg-surface-card border border-surface-border rounded-xl p-6'>
        {activeTab === 'stats' ? (
          <div className='space-y-6'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div className='flex flex-wrap gap-2'>
                {(stats.numTicks > 0 || stats.numFas > 0) && (
                  <div
                    className={cn(
                      badgeClass,
                      'bg-orange-500/10 border-orange-500/20 text-orange-500',
                    )}
                  >
                    <Check size={14} />
                    <span>{numberWithCommas(stats.numTicks + stats.numFas)} Ascents</span>
                    {stats.numFas > 0 && (
                      <span className='text-[10px] opacity-70'>({stats.numFas} FAs)</span>
                    )}
                  </div>
                )}
                {stats.numTickRepeats > 0 && (
                  <div
                    className={cn(badgeClass, 'bg-lime-500/10 border-lime-500/20 text-lime-500')}
                  >
                    <Check size={14} />
                    <span>{numberWithCommas(stats.numTickRepeats)} Repeats</span>
                  </div>
                )}
                {(data.numImageTags ?? 0) > 0 && (
                  <div
                    className={cn(badgeClass, 'bg-green-500/10 border-green-500/20 text-green-500')}
                  >
                    <Camera size={14} />
                    <span>{numberWithCommas(data.numImageTags ?? 0)} Tags</span>
                  </div>
                )}
                {(data.numImagesCreated ?? 0) > 0 && (
                  <div
                    className={cn(badgeClass, 'bg-teal-500/10 border-teal-500/20 text-teal-500')}
                  >
                    <Camera size={14} />
                    <span>{numberWithCommas(data.numImagesCreated ?? 0)} Captured</span>
                  </div>
                )}
                {(data.numVideoTags ?? 0) > 0 && (
                  <div
                    className={cn(badgeClass, 'bg-blue-500/10 border-blue-500/20 text-blue-500')}
                  >
                    <Video size={14} />
                    <span>{numberWithCommas(data.numVideoTags ?? 0)} Video Tags</span>
                  </div>
                )}
                {stats.regions.length > 0 && (
                  <div
                    className={cn(badgeClass, 'bg-stone-500/10 border-stone-500/20 text-stone-400')}
                  >
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
                      'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20',
                    )}
                  >
                    <Mail size={14} /> {email}
                  </a>
                ))}
                {lastActivity && (
                  <div
                    className={cn(badgeClass, 'bg-pink-500/10 border-pink-500/20 text-pink-400')}
                  >
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
                  className='p-3 bg-surface-nav border border-surface-border rounded-full hover:bg-brand hover:text-white transition-all shadow-lg group'
                  title='Download ticks'
                >
                  {isSaving ? (
                    <Loader2 className='animate-spin' size={20} />
                  ) : (
                    <Save size={20} className='group-hover:scale-110 transition-transform' />
                  )}
                </button>
              )}
            </div>

            {data.ticks?.length ? (
              <div className='pt-6 border-t border-surface-border'>
                <Chart ticks={data.ticks as components['schemas']['ProfileStatisticsTick'][]} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className='h-[40vh] rounded-xl overflow-hidden border border-surface-border'>
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
