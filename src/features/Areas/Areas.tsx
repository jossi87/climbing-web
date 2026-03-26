import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import { Loading } from '../../shared/ui/StatusWidgets';
import { LockSymbol } from '../../shared/ui/Indicators';
import { SunOnWall } from '../../shared/components/Widgets/ClimbingWidgets';
import { useAreas } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import { Markdown } from '../../shared/components/Markdown/Markdown';
import { ChevronRight, Layers, Plus, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

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
          <div className='min-w-footer-stack flex max-w-[320px] flex-col gap-2 p-1'>
            <div className='border-surface-border/50 flex items-start justify-between gap-4 border-b pb-2'>
              <div className='flex items-center gap-2'>
                <Link to={'/area/' + (a.id ?? 0)} className='type-h2 hover:text-brand transition-colors'>
                  {a.name}
                </Link>
                <LockSymbol lockedAdmin={!!a.lockedAdmin} lockedSuperadmin={!!a.lockedSuperadmin} />
              </div>
              <a
                href={'/area/' + (a.id ?? 0)}
                target='_blank'
                rel='noreferrer noopener'
                className='bg-surface-nav hover:bg-surface-hover shrink-0 rounded-md p-1.5 opacity-70 transition-all hover:opacity-100'
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <div className='type-small italic'>
              {a.numSectors ?? 0} sectors, {a.numProblems ?? 0} {typeDescription}
            </div>
            {(a.numProblems ?? 0) > 0 && (
              <div className='bg-surface-nav/30 border-surface-border/50 mt-2 rounded-lg border p-2'>
                <ChartGradeDistribution idArea={a.id ?? 0} />
              </div>
            )}
            {a.comment && (
              <div className='type-body mt-2'>
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
      className='border-surface-border relative z-0 h-[60vh] w-full overflow-hidden rounded-2xl border shadow-sm md:h-[75vh]'
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
    <div className={designContract.layout.pageShell}>
      <title>{`Areas | ${meta?.title}`}</title>
      <meta name='description' content={`${data.length} areas for climbing.`} />

      <div className={designContract.layout.pageHeaderRow}>
        <nav className={designContract.layout.breadcrumb}>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='type-small flex items-center gap-1.5'>
            <Layers size={14} className='text-brand' />
            <span className='uppercase'>Areas</span>
            <span className='font-mono text-slate-500 normal-case'>({filteredData.length})</span>
          </div>
        </nav>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='bg-surface-nav border-surface-border flex rounded-lg border p-1'>
            <button
              type='button'
              onClick={() => setShowForDevelopers(false)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase transition-all',
                !showForDevelopers ? 'bg-brand shadow-brand/20 shadow-md' : 'opacity-60 hover:opacity-100',
              )}
            >
              Developed areas
            </button>
            <button
              type='button'
              onClick={() => setShowForDevelopers(true)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase transition-all',
                showForDevelopers ? 'bg-brand shadow-brand/20 shadow-md' : 'opacity-60 hover:opacity-100',
              )}
            >
              For developers
            </button>
          </div>
          {meta.isAdmin && (
            <Link
              to={`/area/edit/-1`}
              className='type-label flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-green-500 transition-colors hover:bg-green-500/20'
            >
              <Plus size={14} /> Add
            </Link>
          )}
        </div>
      </div>

      <div className='space-y-6'>
        <div className='bg-surface-nav/30 border-surface-border/50 flex flex-wrap gap-1.5 rounded-xl border p-3'>
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
              className='bg-surface-nav border-surface-border hover:border-brand/50 type-label flex items-center gap-1.5 rounded-lg border px-2.5 py-1 opacity-70 transition-all hover:opacity-100'
            >
              {area.name}
              <LockSymbol lockedAdmin={!!area.lockedAdmin} lockedSuperadmin={!!area.lockedSuperadmin} />
            </button>
          ))}
        </div>

        {map}

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {filteredData.map((area) => (
            <Link
              key={area.id}
              to={`/area/${area.id}`}
              className='bg-surface-card border-surface-border hover:border-brand/50 hover:bg-surface-nav/30 group flex flex-col gap-3 rounded-xl border p-5 transition-all'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <h3 className='type-h2 group-hover:text-brand m-0 transition-colors'>{area.name}</h3>
                  <LockSymbol lockedAdmin={!!area.lockedAdmin} lockedSuperadmin={!!area.lockedSuperadmin} />
                </div>
                <div className='mt-1 shrink-0'>
                  <SunOnWall sunFromHour={area.sunFromHour ?? 0} sunToHour={area.sunToHour ?? 0} />
                </div>
              </div>

              <div className='type-small font-mono'>
                {area.numSectors ?? 0} sectors, {area.numProblems ?? 0} {typeDescription}, {area.pageViews ?? 0} views
              </div>

              {area.comment && (
                <div className='type-body mt-1 line-clamp-3'>
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
