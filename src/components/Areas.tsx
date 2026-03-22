import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import { Loading, LockSymbol, SunOnWall } from './common/widgets/widgets';
import { useAreas } from '../api';
import { useMeta } from './common/meta/context';
import { Markdown } from './Markdown/Markdown';
import { ChevronRight, Layers, Plus, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

const Areas = () => {
  const { data } = useAreas();
  const meta = useMeta();
  const [flyToId, setFlyToId] = useState<number | null>(null);
  const [showForDevelopers, setShowForDevelopers] = useState(false);
  const leafletRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  if (!data) {
    return <Loading />;
  }

  const typeDescription = meta.isBouldering ? 'problems' : 'routes';

  const filteredData = data.filter((a) => a.forDevelopers === showForDevelopers);

  const markers = data
    .filter((a) => a.forDevelopers === showForDevelopers && a.coordinates)
    .map((a) => {
      return {
        id: a.id ?? 0,
        coordinates: {
          latitude: a.coordinates?.latitude ?? 0,
          longitude: a.coordinates?.longitude ?? 0,
        },
        label: a.name ?? '',
        url: '/area/' + (a.id ?? 0),
        html: (
          <div className='flex flex-col gap-2 min-w-70 max-w-[320px] p-1'>
            <div className='flex items-start justify-between gap-4 border-b border-surface-border/50 pb-2'>
              <div className='flex items-center gap-2'>
                <Link
                  to={'/area/' + (a.id ?? 0)}
                  className='text-lg font-black uppercase text-white hover:text-brand transition-colors tracking-tight'
                >
                  {a.name}
                </Link>
                <LockSymbol lockedAdmin={!!a.lockedAdmin} lockedSuperadmin={!!a.lockedSuperadmin} />
              </div>
              <a
                href={'/area/' + (a.id ?? 0)}
                target='_blank'
                rel='noreferrer noopener'
                className='p-1.5 rounded-md bg-surface-nav text-slate-400 hover:text-white hover:bg-surface-hover transition-colors shrink-0'
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <div className='text-xs text-slate-400 italic'>
              {a.numSectors ?? 0} sectors, {a.numProblems ?? 0} {typeDescription}
            </div>
            {(a.numProblems ?? 0) > 0 && (
              <div className='mt-2 bg-surface-nav/30 rounded-lg p-2 border border-surface-border/50'>
                <ChartGradeDistribution idArea={a.id ?? 0} />
              </div>
            )}
            {a.comment && (
              <div className='mt-2 text-sm text-slate-300'>
                <Markdown content={a.comment} />
              </div>
            )}
          </div>
        ),
      };
    });

  const map = markers.length > 0 && (
    <div
      ref={leafletRef}
      className='h-[60vh] md:h-[75vh] w-full rounded-2xl overflow-hidden border border-surface-border relative z-0 shadow-sm'
    >
      <Leaflet
        autoZoom={true}
        height='100%'
        markers={markers}
        defaultCenter={meta.defaultCenter}
        defaultZoom={meta.defaultZoom}
        showSatelliteImage={false}
        clusterMarkers={!showForDevelopers}
        flyToId={flyToId}
      />
    </div>
  );

  return (
    <div className='max-w-container mx-auto px-4 py-6 space-y-6 text-left'>
      <title>{`Areas | ${meta?.title}`}</title>
      <meta name='description' content={`${data.length} areas for climbing.`} />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500'>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <Layers size={14} className='text-brand' />
            <span className='uppercase'>Areas</span>
            <span className='text-slate-500 font-mono normal-case'>({filteredData.length})</span>
          </div>
        </nav>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex bg-surface-nav rounded-lg p-1 border border-surface-border'>
            <button
              type='button'
              onClick={() => setShowForDevelopers(false)}
              className={cn(
                'px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all',
                !showForDevelopers
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              Developed areas
            </button>
            <button
              type='button'
              onClick={() => setShowForDevelopers(true)}
              className={cn(
                'px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all',
                showForDevelopers
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              For developers
            </button>
          </div>
          {meta.isAdmin && (
            <Link
              to={`/area/edit/-1`}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-colors text-[10px] font-black uppercase tracking-wider'
            >
              <Plus size={14} /> Add
            </Link>
          )}
        </div>
      </div>

      <div className='space-y-6'>
        <div className='flex flex-wrap gap-1.5 p-3 bg-surface-nav/30 rounded-xl border border-surface-border/50'>
          {filteredData.map((area) => (
            <button
              key={area.id}
              type='button'
              onClick={() => {
                if (area.coordinates) {
                  setFlyToId(area.id ?? null);
                  leafletRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  navigate('/area/' + (area.id ?? 0));
                }
              }}
              className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-nav border border-surface-border text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-brand/50 transition-all'
            >
              {area.name}
              <LockSymbol
                lockedAdmin={!!area.lockedAdmin}
                lockedSuperadmin={!!area.lockedSuperadmin}
              />
            </button>
          ))}
        </div>

        {map}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {filteredData.map((area) => (
            <Link
              key={area.id}
              to={`/area/${area.id}`}
              className='flex flex-col gap-3 p-5 bg-surface-card border border-surface-border rounded-xl hover:border-brand/50 hover:bg-surface-nav/30 transition-all group'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <h3 className='text-lg font-black uppercase tracking-tight text-white group-hover:text-brand transition-colors m-0'>
                    {area.name}
                  </h3>
                  <LockSymbol
                    lockedAdmin={!!area.lockedAdmin}
                    lockedSuperadmin={!!area.lockedSuperadmin}
                  />
                </div>
                <div className='shrink-0 mt-1'>
                  <SunOnWall sunFromHour={area.sunFromHour ?? 0} sunToHour={area.sunToHour ?? 0} />
                </div>
              </div>

              <div className='text-xs text-slate-400 font-mono'>
                {area.numSectors ?? 0} sectors, {area.numProblems ?? 0} {typeDescription},{' '}
                {area.pageViews ?? 0} views
              </div>

              {area.comment && (
                <div className='text-sm text-slate-300 mt-1 line-clamp-3'>
                  <Markdown content={area.comment} />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Areas;
